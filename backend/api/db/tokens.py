from .core import pool, serialize

async def get_tokens(limit=50, offset=0, state=None, sort="mcap", creator=None):
    if not pool:
        return []
    q = "SELECT t.*, COALESCE(h.holders, 0) as holders FROM tokens t LEFT JOIN (SELECT token_address, COUNT(*) as holders FROM holders GROUP BY token_address) h ON t.address = h.token_address"
    args = []
    conditions = []
    if state is not None:
        args.append(state)
        conditions.append(f"t.state = ${len(args)}")
    if creator is not None:
        args.append(creator)
        conditions.append(f"t.creator = ${len(args)}")
    if conditions:
        q += " WHERE " + " AND ".join(conditions)
    if sort == "new":
        q += " ORDER BY t.created_at DESC"
    else:
        q += " ORDER BY t.reserve DESC"
    q += f" LIMIT ${len(args)+1} OFFSET ${len(args)+2}"
    args.extend([limit, offset])
    rows = await pool.fetch(q, *args)
    return [serialize(r) for r in rows]

async def get_token(address):
    if not pool:
        return None
    row = await pool.fetchrow("SELECT t.*, COALESCE(h.holders, 0) as holders FROM tokens t LEFT JOIN (SELECT token_address, COUNT(*) as holders FROM holders GROUP BY token_address) h ON t.address = h.token_address WHERE t.address = $1", address)
    return serialize(row)

async def get_trades(token, limit=100, offset=0):
    if not pool:
        return []
    rows = await pool.fetch("SELECT * FROM trades WHERE token_address = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3", token, limit, offset)
    return [serialize(r) for r in rows]

async def get_user_trades(trader, limit=100):
    if not pool:
        return []
    rows = await pool.fetch("SELECT tr.*, t.name, t.symbol FROM trades tr JOIN tokens t ON tr.token_address = t.address WHERE tr.trader = $1 ORDER BY tr.created_at DESC LIMIT $2", trader, limit)
    return [serialize(r) for r in rows]

async def get_user_holdings(address):
    if not pool:
        return []
    rows = await pool.fetch("SELECT h.*, t.name, t.symbol, t.reserve, t.supply FROM holders h JOIN tokens t ON h.token_address = t.address WHERE h.holder_address = $1 AND h.balance > 0 ORDER BY h.balance DESC", address)
    return [serialize(r) for r in rows]

async def get_stats():
    if not pool:
        return {"total_tokens": 0, "total_volume": "0", "total_graduated": 0, "total_burned": "0"}
    row = await pool.fetchrow("SELECT * FROM stats WHERE id = 1")
    return serialize(row) if row else {"total_tokens": 0, "total_volume": "0", "total_graduated": 0, "total_burned": "0"}

async def get_king():
    if not pool:
        return None
    row = await pool.fetchrow("SELECT t.*, COALESCE(h.holders, 0) as holders FROM tokens t LEFT JOIN (SELECT token_address, COUNT(*) as holders FROM holders GROUP BY token_address) h ON t.address = h.token_address WHERE t.state < 3 ORDER BY t.reserve DESC LIMIT 1")
    return serialize(row)

async def search_tokens(query, limit=20):
    if not pool:
        return []
    rows = await pool.fetch("SELECT t.*, COALESCE(h.holders, 0) as holders FROM tokens t LEFT JOIN (SELECT token_address, COUNT(*) as holders FROM holders GROUP BY token_address) h ON t.address = h.token_address WHERE t.name ILIKE $1 OR t.symbol ILIKE $1 ORDER BY t.reserve DESC LIMIT $2", f"%{query}%", limit)
    return [serialize(r) for r in rows]
