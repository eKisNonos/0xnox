from pydantic import BaseModel
from typing import Optional, List

class Token(BaseModel):
    address: str
    creator: str
    name: str
    symbol: str
    metadata_uri: str
    state: int
    total_supply: str
    reserve: str
    market_cap: str
    created_at: int
    graduated_at: Optional[int] = None

class Trade(BaseModel):
    id: int
    token: str
    trader: str
    is_buy: bool
    eth_amount: str
    token_amount: str
    new_supply: str
    tx_hash: str
    block_number: int
    timestamp: int

class TokenCreate(BaseModel):
    name: str
    symbol: str
    metadata_uri: str

class TokenList(BaseModel):
    tokens: List[Token]
    total: int

class TradeList(BaseModel):
    trades: List[Trade]
    total: int

class PriceQuote(BaseModel):
    token: str
    amount: str
    price: str
    slippage: float

class Stats(BaseModel):
    total_tokens: int
    total_volume: str
    total_trades: int
    total_graduated: int
