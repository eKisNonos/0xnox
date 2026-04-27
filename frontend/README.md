# 0xNOX Token Launchpad

Decentralized token launchpad with bonding curve mechanics on Ethereum.

## Quick Start

```bash
# Setup everything
./scripts/setup.sh

# Edit configs with your addresses
nano backend/.env
nano indexer/.env
nano frontend/js/config.js

# Start services
./scripts/start.sh

# Stop services
./scripts/stop.sh
```

## Architecture

```
Frontend (Static JS) ──▶ Backend (FastAPI) ◀── Indexer (Rust)
                              │                    │
                         PostgreSQL            Ethereum
```

## Components

### Smart Contracts (`/contracts`)
- **Factory.sol** - Creates new tokens
- **Token.sol** - ERC20 with bonding curve
- **Treasury.sol** - Fee distribution

### Backend (`/backend`)
- FastAPI REST + WebSocket
- PostgreSQL database

### Frontend (`/frontend`)
- Vanilla JS SPA
- ethers.js wallet integration

### Indexer (`/indexer`)
- Rust event listener
- Real-time blockchain sync

## API Endpoints

```
GET  /api/v1/tokens              List tokens
GET  /api/v1/tokens/:addr        Token details
GET  /api/v1/tokens/:addr/trades Token trades
GET  /api/v1/users/:addr/holdings User portfolio
GET  /api/v1/stats               Platform stats
GET  /api/v1/king                Top token
GET  /api/v1/search?q=           Search
WS   /ws                         Real-time updates
```

## Config

**Backend (.env):**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/oxnox
ETH_RPC_URL=https://ethereum.publicnode.com
```

**Indexer (.env):**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/oxnox
ETH_RPC_URL=wss://ethereum.publicnode.com
FACTORY_ADDRESS=0x...
START_BLOCK=0
```

**Frontend (config.js):**
```javascript
FACTORY_ADDRESS: "0x...",
NOX_TOKEN: "0x0a26c80Be4E060e688d7C23aDdB92cBb5D2C9eCA",
NFT_PASS: "0x7b575DD8e8b111c52Ab1e872924d4Efd4DF403df",
API_URL: "https://api.0xnox.com",
```

## Economics

- **Creation:** 10,000 NOX (free with ZeroState Pass)
- **Trading Fee:** 1%
- **Graduation:** $69,420 market cap
- **Curve:** Cubic bonding `P = k × S²`

## Deploy Contracts

```bash
cd scripts
cp .env.example .env
# Add DEPLOYER_PRIVATE_KEY
python deploy.py
python verify.py
```
