use sqlx::{PgPool, postgres::PgPoolOptions, Row};
use crate::types::*;

pub async fn connect(url: &str) -> Result<PgPool, sqlx::Error> {
    PgPoolOptions::new().max_connections(10).connect(url).await
}

pub async fn init_tables(pool: &PgPool) -> Result<(), sqlx::Error> {
    // Tokens table
    sqlx::query(r#"
        CREATE TABLE IF NOT EXISTS tokens (
            address VARCHAR(42) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            symbol VARCHAR(10) NOT NULL,
            metadata_uri TEXT DEFAULT '',
            creator VARCHAR(42) NOT NULL,
            state SMALLINT DEFAULT 0,
            supply NUMERIC(78,0) DEFAULT 0,
            reserve NUMERIC(78,0) DEFAULT 0,
            market_cap NUMERIC(78,0) DEFAULT 0,
            block_number BIGINT DEFAULT 0,
            tx_hash VARCHAR(66) DEFAULT '',
            created_at TIMESTAMP DEFAULT NOW(),
            graduated_at TIMESTAMP
        )"#).execute(pool).await?;

    // Trades table
    sqlx::query(r#"
        CREATE TABLE IF NOT EXISTS trades (
            id SERIAL PRIMARY KEY,
            token_address VARCHAR(42),
            trader VARCHAR(42) NOT NULL,
            is_buy BOOLEAN NOT NULL,
            eth_amount NUMERIC(78,0) NOT NULL,
            token_amount NUMERIC(78,0) NOT NULL,
            new_supply NUMERIC(78,0) NOT NULL,
            block_number BIGINT NOT NULL,
            tx_hash VARCHAR(66) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )"#).execute(pool).await?;

    // Holders table
    sqlx::query(r#"
        CREATE TABLE IF NOT EXISTS holders (
            token_address VARCHAR(42),
            holder_address VARCHAR(42) NOT NULL,
            balance NUMERIC(78,0) NOT NULL DEFAULT 0,
            PRIMARY KEY (token_address, holder_address)
        )"#).execute(pool).await?;

    // Stats table
    sqlx::query(r#"
        CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY DEFAULT 1,
            total_tokens INTEGER DEFAULT 0,
            total_volume NUMERIC(78,0) DEFAULT 0,
            total_graduated INTEGER DEFAULT 0,
            total_burned NUMERIC(78,0) DEFAULT 0,
            updated_at TIMESTAMP DEFAULT NOW()
        )"#).execute(pool).await?;

    // Initialize stats
    sqlx::query("INSERT INTO stats (id) VALUES (1) ON CONFLICT DO NOTHING")
        .execute(pool).await?;

    // Indices
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_tokens_creator ON tokens(creator)").execute(pool).await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_tokens_state ON tokens(state)").execute(pool).await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_tokens_reserve ON tokens(reserve DESC)").execute(pool).await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_trades_token ON trades(token_address)").execute(pool).await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_trades_trader ON trades(trader)").execute(pool).await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_holders_holder ON holders(holder_address)").execute(pool).await?;

    Ok(())
}

pub async fn insert_token(pool: &PgPool, t: &Token) -> Result<(), sqlx::Error> {
    sqlx::query(r#"
        INSERT INTO tokens (address, name, symbol, metadata_uri, creator, state, supply, reserve, market_cap, block_number, tx_hash, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        ON CONFLICT (address) DO NOTHING"#)
        .bind(&t.address)
        .bind(&t.name)
        .bind(&t.symbol)
        .bind(&t.metadata_uri)
        .bind(&t.creator)
        .bind(t.state as i16)
        .bind(&t.total_supply)
        .bind(&t.reserve)
        .bind(&t.market_cap)
        .bind(t.created_at)
        .bind("")
        .execute(pool).await?;

    // Update stats
    sqlx::query("UPDATE stats SET total_tokens = total_tokens + 1, updated_at = NOW() WHERE id = 1")
        .execute(pool).await?;

    Ok(())
}

pub async fn insert_trade(pool: &PgPool, t: &Trade) -> Result<(), sqlx::Error> {
    sqlx::query(r#"
        INSERT INTO trades (token_address, trader, is_buy, eth_amount, token_amount, new_supply, block_number, tx_hash, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (tx_hash) DO NOTHING"#)
        .bind(&t.token)
        .bind(&t.trader)
        .bind(t.is_buy)
        .bind(&t.eth_amount)
        .bind(&t.token_amount)
        .bind(&t.new_supply)
        .bind(t.block_number)
        .bind(&t.tx_hash)
        .execute(pool).await?;

    // Update volume stats
    sqlx::query(r#"
        UPDATE stats SET
            total_volume = total_volume + $1::NUMERIC,
            updated_at = NOW()
        WHERE id = 1"#)
        .bind(&t.eth_amount)
        .execute(pool).await?;

    Ok(())
}

pub async fn update_token_state(pool: &PgPool, addr: &str, state: i32, supply: &str, reserve: &str, mcap: &str) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE tokens SET state = $1, supply = $2, reserve = $3, market_cap = $4 WHERE address = $5")
        .bind(state as i16)
        .bind(supply)
        .bind(reserve)
        .bind(mcap)
        .bind(addr)
        .execute(pool).await?;
    Ok(())
}

pub async fn mark_graduated(pool: &PgPool, addr: &str) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE tokens SET state = 3, graduated_at = NOW() WHERE address = $1")
        .bind(addr)
        .execute(pool).await?;

    sqlx::query("UPDATE stats SET total_graduated = total_graduated + 1, updated_at = NOW() WHERE id = 1")
        .execute(pool).await?;

    Ok(())
}

pub async fn get_all_token_addresses(pool: &PgPool) -> Result<Vec<String>, sqlx::Error> {
    let rows = sqlx::query("SELECT address FROM tokens")
        .fetch_all(pool).await?;
    Ok(rows.iter().map(|r| r.get("address")).collect())
}

pub async fn update_holder(pool: &PgPool, token: &str, holder: &str, balance: &str) -> Result<(), sqlx::Error> {
    sqlx::query(r#"
        INSERT INTO holders (token_address, holder_address, balance)
        VALUES ($1, $2, $3)
        ON CONFLICT (token_address, holder_address)
        DO UPDATE SET balance = $3"#)
        .bind(token)
        .bind(holder)
        .bind(balance)
        .execute(pool).await?;
    Ok(())
}
