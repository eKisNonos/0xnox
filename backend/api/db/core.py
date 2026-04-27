import asyncpg
import os
import logging
from decimal import Decimal

logger = logging.getLogger(__name__)
pool = None

async def init():
    global pool
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        logger.warning("No DATABASE_URL - running without database")
        return
    try:
        pool = await asyncpg.create_pool(db_url, min_size=2, max_size=10)
        logger.info("Database connected successfully")
    except asyncpg.PostgresError as e:
        logger.error(f"Database connection failed: {e}")
        raise

async def close():
    if pool:
        await pool.close()
        logger.info("Database connection closed")

def serialize(row):
    if not row:
        return None
    d = dict(row) if hasattr(row, 'items') else row
    for k, v in d.items():
        if isinstance(v, Decimal):
            d[k] = str(v)
    return d
