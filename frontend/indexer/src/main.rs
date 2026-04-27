mod types;
mod events;
mod db;

use ethers::prelude::*;
use std::sync::Arc;
use std::collections::HashSet;
use tokio::sync::RwLock;
use tracing::{info, warn, error};

const GRADUATION_SUPPLY: u128 = 800_000_000_000_000_000_000_000_000; // 800M tokens
const ETH_PRICE_USD: u64 = 2000;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv::dotenv().ok();
    tracing_subscriber::fmt::init();

    let db_url = std::env::var("DATABASE_URL")?;
    let rpc_url = std::env::var("ETH_RPC_URL")?;
    let factory_addr: Address = std::env::var("FACTORY_ADDRESS")?.parse()?;
    let start_block: u64 = std::env::var("START_BLOCK").unwrap_or("0".into()).parse().unwrap_or(0);

    let pool = db::connect(&db_url).await?;
    db::init_tables(&pool).await?;
    info!("Connected to database");

    // Track known token addresses
    let tokens: Arc<RwLock<HashSet<Address>>> = Arc::new(RwLock::new(HashSet::new()));

    // Load existing tokens from database
    let existing = db::get_all_token_addresses(&pool).await?;
    for addr in existing {
        if let Ok(a) = addr.parse::<Address>() {
            tokens.write().await.insert(a);
        }
    }
    info!("Loaded {} existing tokens", tokens.read().await.len());

    loop {
        match run_indexer(&pool, &rpc_url, factory_addr, start_block, tokens.clone()).await {
            Ok(_) => info!("Indexer completed"),
            Err(e) => {
                error!("Indexer error: {}. Reconnecting in 5s...", e);
                tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
            }
        }
    }
}

async fn run_indexer(
    pool: &sqlx::PgPool,
    rpc_url: &str,
    factory_addr: Address,
    start_block: u64,
    tokens: Arc<RwLock<HashSet<Address>>>,
) -> Result<(), Box<dyn std::error::Error>> {
    let provider = Provider::<Ws>::connect(rpc_url).await?;
    let client = Arc::new(provider);
    info!("Connected to Ethereum");

    // Get current block
    let current_block = client.get_block_number().await?.as_u64();
    let from_block = if start_block > 0 { start_block } else { current_block.saturating_sub(10000) };

    // Backfill historical events
    info!("Backfilling from block {} to {}", from_block, current_block);
    backfill_events(pool, client.clone(), factory_addr, from_block, current_block, tokens.clone()).await?;

    // Subscribe to new events
    info!("Subscribing to live events from block {}", current_block);

    // Factory filter for TokenCreated
    let factory_filter = Filter::new()
        .address(factory_addr)
        .from_block(BlockNumber::Latest);

    let mut factory_stream = client.subscribe_logs(&factory_filter).await?;

    // Token filter for Buy/Sell/Graduated - all tokens
    let token_filter = Filter::new()
        .from_block(BlockNumber::Latest);

    let mut token_stream = client.subscribe_logs(&token_filter).await?;

    loop {
        tokio::select! {
            Some(log) = factory_stream.next() => {
                if let Some(event) = events::parse_token_created(&log) {
                    info!("New token: {} ({}) at {:?}", event.name, event.symbol, event.token);
                    tokens.write().await.insert(event.token);
                    let token = types::Token {
                        address: format!("{:?}", event.token),
                        creator: format!("{:?}", event.creator),
                        name: event.name,
                        symbol: event.symbol,
                        metadata_uri: String::new(),
                        state: 0,
                        total_supply: "0".into(),
                        reserve: "0".into(),
                        market_cap: "0".into(),
                        created_at: chrono::Utc::now().timestamp(),
                        graduated_at: None,
                    };
                    if let Err(e) = db::insert_token(pool, &token).await {
                        error!("DB error inserting token: {}", e);
                    }
                }
            }
            Some(log) = token_stream.next() => {
                let log_addr = log.address;
                // Only process if it's one of our tokens
                if !tokens.read().await.contains(&log_addr) {
                    continue;
                }

                // Try parsing as Buy
                if let Some(buy) = events::parse_buy(&log, log_addr) {
                    info!("Buy on {:?}: {} ETH -> {} tokens", buy.token, buy.eth_in, buy.tokens_out);
                    let trade = types::Trade {
                        id: 0,
                        token: format!("{:?}", buy.token),
                        trader: format!("{:?}", buy.buyer),
                        is_buy: true,
                        eth_amount: buy.eth_in.to_string(),
                        token_amount: buy.tokens_out.to_string(),
                        new_supply: buy.new_supply.to_string(),
                        tx_hash: format!("{:?}", buy.tx_hash),
                        block_number: buy.block as i64,
                        timestamp: chrono::Utc::now().timestamp(),
                    };
                    if let Err(e) = db::insert_trade(pool, &trade).await {
                        error!("DB error inserting trade: {}", e);
                    }
                    // Update token state
                    update_token_from_supply(pool, &format!("{:?}", buy.token), buy.new_supply).await;
                    continue;
                }

                // Try parsing as Sell
                if let Some(sell) = events::parse_sell(&log, log_addr) {
                    info!("Sell on {:?}: {} tokens -> {} ETH", sell.token, sell.tokens_in, sell.eth_out);
                    let trade = types::Trade {
                        id: 0,
                        token: format!("{:?}", sell.token),
                        trader: format!("{:?}", sell.seller),
                        is_buy: false,
                        eth_amount: sell.eth_out.to_string(),
                        token_amount: sell.tokens_in.to_string(),
                        new_supply: sell.new_supply.to_string(),
                        tx_hash: format!("{:?}", sell.tx_hash),
                        block_number: sell.block as i64,
                        timestamp: chrono::Utc::now().timestamp(),
                    };
                    if let Err(e) = db::insert_trade(pool, &trade).await {
                        error!("DB error inserting trade: {}", e);
                    }
                    update_token_from_supply(pool, &format!("{:?}", sell.token), sell.new_supply).await;
                    continue;
                }

                // Try parsing as Graduated
                if let Some(grad) = events::parse_graduated(&log, log_addr) {
                    info!("Token graduated: {:?}", grad.token);
                    if let Err(e) = db::mark_graduated(pool, &format!("{:?}", grad.token)).await {
                        error!("DB error marking graduated: {}", e);
                    }
                }
            }
        }
    }
}

async fn backfill_events(
    pool: &sqlx::PgPool,
    client: Arc<Provider<Ws>>,
    factory_addr: Address,
    from_block: u64,
    to_block: u64,
    tokens: Arc<RwLock<HashSet<Address>>>,
) -> Result<(), Box<dyn std::error::Error>> {
    // Process in chunks of 2000 blocks
    let chunk_size = 2000u64;
    let mut current = from_block;

    while current < to_block {
        let end = std::cmp::min(current + chunk_size, to_block);

        // Get factory events (TokenCreated)
        let factory_filter = Filter::new()
            .address(factory_addr)
            .from_block(current)
            .to_block(end);

        let logs = client.get_logs(&factory_filter).await?;
        for log in logs {
            if let Some(event) = events::parse_token_created(&log) {
                let token_addr = event.token;
                let mut t = tokens.write().await;
                if !t.contains(&token_addr) {
                    info!("Backfill: new token {} ({})", event.name, event.symbol);
                    t.insert(token_addr);
                    let token = types::Token {
                        address: format!("{:?}", token_addr),
                        creator: format!("{:?}", event.creator),
                        name: event.name,
                        symbol: event.symbol,
                        metadata_uri: String::new(),
                        state: 1, // Bonding
                        total_supply: "0".into(),
                        reserve: "0".into(),
                        market_cap: "0".into(),
                        created_at: log.block_number.map(|b| b.as_u64() as i64).unwrap_or(0),
                        graduated_at: None,
                    };
                    if let Err(e) = db::insert_token(pool, &token).await {
                        warn!("Backfill token insert error: {}", e);
                    }
                }
            }
        }

        // Get all token events (Buy/Sell/Graduated)
        let token_addrs: Vec<Address> = tokens.read().await.iter().cloned().collect();
        if !token_addrs.is_empty() {
            let token_filter = Filter::new()
                .address(token_addrs)
                .from_block(current)
                .to_block(end);

            let logs = client.get_logs(&token_filter).await?;
            for log in logs {
                let log_addr = log.address;

                if let Some(buy) = events::parse_buy(&log, log_addr) {
                    let trade = types::Trade {
                        id: 0,
                        token: format!("{:?}", buy.token),
                        trader: format!("{:?}", buy.buyer),
                        is_buy: true,
                        eth_amount: buy.eth_in.to_string(),
                        token_amount: buy.tokens_out.to_string(),
                        new_supply: buy.new_supply.to_string(),
                        tx_hash: format!("{:?}", buy.tx_hash),
                        block_number: buy.block as i64,
                        timestamp: log.block_number.map(|b| b.as_u64() as i64).unwrap_or(0),
                    };
                    let _ = db::insert_trade(pool, &trade).await;
                    update_token_from_supply(pool, &format!("{:?}", buy.token), buy.new_supply).await;
                } else if let Some(sell) = events::parse_sell(&log, log_addr) {
                    let trade = types::Trade {
                        id: 0,
                        token: format!("{:?}", sell.token),
                        trader: format!("{:?}", sell.seller),
                        is_buy: false,
                        eth_amount: sell.eth_out.to_string(),
                        token_amount: sell.tokens_in.to_string(),
                        new_supply: sell.new_supply.to_string(),
                        tx_hash: format!("{:?}", sell.tx_hash),
                        block_number: sell.block as i64,
                        timestamp: log.block_number.map(|b| b.as_u64() as i64).unwrap_or(0),
                    };
                    let _ = db::insert_trade(pool, &trade).await;
                    update_token_from_supply(pool, &format!("{:?}", sell.token), sell.new_supply).await;
                } else if let Some(grad) = events::parse_graduated(&log, log_addr) {
                    let _ = db::mark_graduated(pool, &format!("{:?}", grad.token)).await;
                }
            }
        }

        current = end + 1;
        if current % 10000 == 0 {
            info!("Backfill progress: block {}/{}", current, to_block);
        }
    }

    info!("Backfill complete");
    Ok(())
}

async fn update_token_from_supply(pool: &sqlx::PgPool, addr: &str, supply: U256) {
    // Calculate reserve from bonding curve: reserve = k * supply^3 / 3
    // Using simplified market cap calculation
    let supply_u128 = supply.as_u128();
    let state = if supply_u128 >= GRADUATION_SUPPLY { 3 } else { 1 };

    // Market cap = price * supply, price derived from bonding curve
    // Simplified: mcap in wei = k * supply^2 where k is scaling factor
    let mcap_eth = (supply_u128 as f64 / 1e18).powi(2) * 0.0000000001; // Rough approximation
    let mcap_usd = (mcap_eth * ETH_PRICE_USD as f64 * 1e18) as u128;

    if let Err(e) = db::update_token_state(
        pool,
        addr,
        state,
        &supply.to_string(),
        "0", // Reserve needs contract call to get exact
        &mcap_usd.to_string(),
    ).await {
        warn!("Failed to update token state: {}", e);
    }
}
