use ethers::types::{Address, U256, H256};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Token {
    pub address: String,
    pub creator: String,
    pub name: String,
    pub symbol: String,
    pub metadata_uri: String,
    pub state: i32,
    pub total_supply: String,
    pub reserve: String,
    pub market_cap: String,
    pub created_at: i64,
    pub graduated_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Trade {
    pub id: i64,
    pub token: String,
    pub trader: String,
    pub is_buy: bool,
    pub eth_amount: String,
    pub token_amount: String,
    pub new_supply: String,
    pub tx_hash: String,
    pub block_number: i64,
    pub timestamp: i64,
}

#[derive(Debug, Clone)]
pub struct TokenCreatedEvent {
    pub token: Address,
    pub creator: Address,
    pub name: String,
    pub symbol: String,
}

#[derive(Debug, Clone)]
pub struct BuyEvent {
    pub token: Address,
    pub buyer: Address,
    pub eth_in: U256,
    pub tokens_out: U256,
    pub new_supply: U256,
    pub tx_hash: H256,
    pub block: u64,
}

#[derive(Debug, Clone)]
pub struct SellEvent {
    pub token: Address,
    pub seller: Address,
    pub tokens_in: U256,
    pub eth_out: U256,
    pub new_supply: U256,
    pub tx_hash: H256,
    pub block: u64,
}

#[derive(Debug, Clone)]
pub struct GraduatedEvent {
    pub token: Address,
    pub pool: Address,
    pub eth_liq: U256,
    pub token_liq: U256,
}
