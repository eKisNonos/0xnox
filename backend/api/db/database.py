import aiosqlite
import logging
from typing import Optional, List, Dict, Any
from .schema import SCHEMA

logger = logging.getLogger(__name__)

class Database:
    def __init__(self, db_path: str = "./data/0xnox.db"):
        self.db_path = db_path
        self.connection: Optional[aiosqlite.Connection] = None

    async def connect(self):
        self.connection = await aiosqlite.connect(self.db_path)
        self.connection.row_factory = aiosqlite.Row
        await self.connection.executescript(SCHEMA)
        await self.connection.commit()

    async def close(self):
        if self.connection:
            await self.connection.close()

    async def get_stats(self) -> Dict[str, Any]:
        cursor = await self.connection.execute("""
            SELECT COUNT(*) as total_tokens, COALESCE(SUM(volume_24h), 0) as total_volume,
            COUNT(CASE WHEN state = 'graduated' THEN 1 END) as total_graduated
            FROM tokens
        """)
        row = await cursor.fetchone()
        return dict(row) if row else {"total_tokens": 0, "total_volume": "0", "total_graduated": 0}

    async def get_tokens(self, limit: int = 50, offset: int = 0, sort: str = "mcap") -> List[Dict]:
        order = "market_cap DESC" if sort == "mcap" else "created_at DESC"
        cursor = await self.connection.execute(
            f"SELECT * FROM tokens ORDER BY {order} LIMIT ? OFFSET ?", (limit, offset))
        return [dict(row) for row in await cursor.fetchall()]

    async def get_token(self, address: str) -> Optional[Dict]:
        cursor = await self.connection.execute("SELECT * FROM tokens WHERE address = ?", (address,))
        row = await cursor.fetchone()
        return dict(row) if row else None

    async def create_token(self, data: Dict) -> bool:
        try:
            await self.connection.execute(
                "INSERT INTO tokens (address, name, symbol, description, image, creator, market_cap) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (data["address"], data["name"], data["symbol"], data.get("description", ""),
                 data.get("image", ""), data["creator"], float(data.get("market_cap", 0))))
            await self.connection.commit()
            return True
        except Exception as e:
            logger.error(f"Create token failed: {e}")
            return False

    async def get_king(self):
        return {"address": "0x" + "0" * 40, "tokens": 0, "volume": "0"}

db = Database()

async def init_db():
    await db.connect()

async def close_db():
    await db.close()

async def get_stats():
    return await db.get_stats()

async def get_tokens(limit=50, offset=0, sort="mcap", creator=None):
    return await db.get_tokens(limit, offset, sort)

async def get_token(address):
    return await db.get_token(address)

async def get_king():
    return await db.get_king()
