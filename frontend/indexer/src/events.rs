use ethers::prelude::*;
use ethers::abi::RawLog;
use crate::types::*;

abigen!(
    FactoryEvents,
    r#"[
        event TokenCreated(address indexed token, address indexed creator, string name, string symbol)
    ]"#
);

abigen!(
    TokenEvents,
    r#"[
        event Buy(address indexed buyer, uint256 ethIn, uint256 tokensOut, uint256 newSupply)
        event Sell(address indexed seller, uint256 tokensIn, uint256 ethOut, uint256 newSupply)
        event Graduated(address indexed pool, uint256 ethLiq, uint256 tokenLiq)
    ]"#
);

pub fn parse_token_created(log: &Log) -> Option<TokenCreatedEvent> {
    let raw = RawLog { topics: log.topics.clone(), data: log.data.to_vec() };
    let event = FactoryEventsEvents::decode_log(&raw).ok()?;
    match event {
        FactoryEventsEvents::TokenCreatedFilter(e) => Some(TokenCreatedEvent {
            token: e.token,
            creator: e.creator,
            name: e.name,
            symbol: e.symbol,
        }),
    }
}

pub fn parse_buy(log: &Log, token: Address) -> Option<BuyEvent> {
    let raw = RawLog { topics: log.topics.clone(), data: log.data.to_vec() };
    let event = TokenEventsEvents::decode_log(&raw).ok()?;
    match event {
        TokenEventsEvents::BuyFilter(e) => Some(BuyEvent {
            token, buyer: e.buyer, eth_in: e.eth_in, tokens_out: e.tokens_out,
            new_supply: e.new_supply, tx_hash: log.transaction_hash?, block: log.block_number?.as_u64(),
        }),
        _ => None,
    }
}

pub fn parse_sell(log: &Log, token: Address) -> Option<SellEvent> {
    let raw = RawLog { topics: log.topics.clone(), data: log.data.to_vec() };
    let event = TokenEventsEvents::decode_log(&raw).ok()?;
    match event {
        TokenEventsEvents::SellFilter(e) => Some(SellEvent {
            token, seller: e.seller, tokens_in: e.tokens_in, eth_out: e.eth_out,
            new_supply: e.new_supply, tx_hash: log.transaction_hash?, block: log.block_number?.as_u64(),
        }),
        _ => None,
    }
}

pub fn parse_graduated(log: &Log, token: Address) -> Option<GraduatedEvent> {
    let raw = RawLog { topics: log.topics.clone(), data: log.data.to_vec() };
    let event = TokenEventsEvents::decode_log(&raw).ok()?;
    match event {
        TokenEventsEvents::GraduatedFilter(e) => Some(GraduatedEvent {
            token, pool: e.pool, eth_liq: e.eth_liq, token_liq: e.token_liq,
        }),
        _ => None,
    }
}
