SCHEMA = """
CREATE TABLE IF NOT EXISTS tokens (
    address TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    description TEXT,
    image TEXT,
    creator TEXT NOT NULL,
    market_cap REAL DEFAULT 0,
    volume_24h REAL DEFAULT 0,
    holders INTEGER DEFAULT 0,
    state TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_address TEXT NOT NULL,
    trader TEXT NOT NULL,
    trade_type TEXT NOT NULL,
    amount REAL NOT NULL,
    price REAL NOT NULL,
    tx_hash TEXT UNIQUE,
    block_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (token_address) REFERENCES tokens (address)
);

CREATE TABLE IF NOT EXISTS users (
    address TEXT PRIMARY KEY,
    username TEXT,
    avatar TEXT,
    bio TEXT,
    twitter TEXT,
    telegram TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS capsules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    developer TEXT NOT NULL,
    app_type TEXT,
    token_address TEXT,
    downloads INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,
    price REAL DEFAULT 0,
    manifest_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bridge_transactions (
    id TEXT PRIMARY KEY,
    user_address TEXT NOT NULL,
    amount REAL NOT NULL,
    direction TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    eth_tx_hash TEXT,
    cf_tx_hash TEXT,
    confirmations INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_address TEXT NOT NULL,
    user_address TEXT NOT NULL,
    content TEXT NOT NULL,
    parent_id INTEGER,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (token_address) REFERENCES tokens (address),
    FOREIGN KEY (parent_id) REFERENCES comments (id)
);

CREATE INDEX IF NOT EXISTS idx_tokens_creator ON tokens(creator);
CREATE INDEX IF NOT EXISTS idx_tokens_market_cap ON tokens(market_cap DESC);
CREATE INDEX IF NOT EXISTS idx_trades_token ON trades(token_address);
CREATE INDEX IF NOT EXISTS idx_trades_trader ON trades(trader);
CREATE INDEX IF NOT EXISTS idx_comments_token ON comments(token_address);
"""
