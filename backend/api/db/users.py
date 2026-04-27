from .core import pool, serialize

async def get_user_profile(address):
    if not pool:
        return None
    stats_row = await pool.fetchrow("""
        SELECT COUNT(*) as total_trades, COUNT(DISTINCT token_address) as tokens_traded,
            SUM(CASE WHEN is_buy THEN eth_amount ELSE 0 END) as total_bought,
            SUM(CASE WHEN NOT is_buy THEN eth_amount ELSE 0 END) as total_sold
        FROM trades WHERE trader = $1
    """, address)
    created_row = await pool.fetchrow("SELECT COUNT(*) as tokens_created FROM tokens WHERE creator = $1", address)
    return {
        "address": address,
        "total_trades": int(stats_row["total_trades"]) if stats_row else 0,
        "tokens_traded": int(stats_row["tokens_traded"]) if stats_row else 0,
        "total_bought": str(stats_row["total_bought"] or 0) if stats_row else "0",
        "total_sold": str(stats_row["total_sold"] or 0) if stats_row else "0",
        "tokens_created": int(created_row["tokens_created"]) if created_row else 0
    }
