from .core import pool, serialize

async def get_graduating(limit=10):
    if not pool:
        return []
    rows = await pool.fetch("SELECT t.*, COALESCE(h.holders, 0) as holders FROM tokens t LEFT JOIN (SELECT token_address, COUNT(*) as holders FROM holders GROUP BY token_address) h ON t.address = h.token_address WHERE t.state = 1 ORDER BY t.reserve DESC LIMIT $1", limit)
    return [serialize(r) for r in rows]

async def get_chart_data(token_address, interval="1h", limit=100):
    if not pool:
        return []
    interval_map = {"1m": "1 minute", "5m": "5 minutes", "15m": "15 minutes", "1h": "1 hour", "4h": "4 hours", "1d": "1 day"}
    pg_interval = interval_map.get(interval, "1 hour")
    rows = await pool.fetch("""
        WITH price_calc AS (
            SELECT date_trunc('hour', created_at) as bucket,
                CASE WHEN token_amount > 0 THEN CAST(eth_amount AS NUMERIC) / CAST(token_amount AS NUMERIC) * 1e18 ELSE 0 END as price, created_at
            FROM trades WHERE token_address = $1 AND token_amount > 0
        ),
        bucketed AS (
            SELECT EXTRACT(EPOCH FROM bucket)::bigint as time,
                FIRST_VALUE(price) OVER (PARTITION BY bucket ORDER BY created_at ASC) as open,
                MAX(price) OVER (PARTITION BY bucket) as high, MIN(price) OVER (PARTITION BY bucket) as low,
                FIRST_VALUE(price) OVER (PARTITION BY bucket ORDER BY created_at DESC) as close
            FROM price_calc WHERE bucket IS NOT NULL
        )
        SELECT DISTINCT time, close as price FROM bucketed ORDER BY time ASC LIMIT $2
    """, token_address, limit)
    return [{"time": int(r["time"]), "price": str(r["price"])} for r in rows]

async def get_trending_tokens(limit=10):
    if not pool:
        return []
    rows = await pool.fetch("""
        WITH recent_activity AS (
            SELECT token_address, COUNT(*) as trade_count, SUM(eth_amount) as volume, COUNT(DISTINCT trader) as unique_traders
            FROM trades WHERE created_at > NOW() - INTERVAL '24 hours' GROUP BY token_address
        )
        SELECT t.*, COALESCE(ra.trade_count, 0) as recent_trades, COALESCE(ra.volume, 0) as volume_24h,
            COALESCE(ra.unique_traders, 0) as unique_traders, COALESCE(h.holders, 0) as holders,
            (COALESCE(ra.trade_count, 0) * 10 + COALESCE(ra.unique_traders, 0) * 5 + CAST(COALESCE(ra.volume, 0) AS NUMERIC) / 1e18) as trending_score
        FROM tokens t
        LEFT JOIN recent_activity ra ON t.address = ra.token_address
        LEFT JOIN (SELECT token_address, COUNT(*) as holders FROM holders GROUP BY token_address) h ON t.address = h.token_address
        WHERE t.state < 3 ORDER BY trending_score DESC NULLS LAST LIMIT $1
    """, limit)
    return [serialize(r) for r in rows]
