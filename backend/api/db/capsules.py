from .core import pool, serialize

async def get_capsules(limit=50, offset=0, sort="downloads", app_type=None, token=None):
    if not pool:
        return []
    q = "SELECT * FROM capsules"
    args = []
    conditions = []
    if app_type:
        args.append(app_type)
        conditions.append(f"app_type = ${len(args)}")
    if token:
        args.append(token)
        conditions.append(f"token_address = ${len(args)}")
    if conditions:
        q += " WHERE " + " AND ".join(conditions)
    if sort == "rating":
        q += " ORDER BY rating DESC"
    elif sort == "new":
        q += " ORDER BY created_at DESC"
    else:
        q += " ORDER BY downloads DESC"
    q += f" LIMIT ${len(args)+1} OFFSET ${len(args)+2}"
    args.extend([limit, offset])
    rows = await pool.fetch(q, *args)
    return [serialize(r) for r in rows]

async def get_featured_capsules(limit=6):
    if not pool:
        return []
    rows = await pool.fetch("SELECT * FROM capsules ORDER BY downloads DESC, rating DESC LIMIT $1", limit)
    return [serialize(r) for r in rows]

async def get_capsule(capsule_id):
    if not pool:
        return None
    row = await pool.fetchrow("SELECT * FROM capsules WHERE id = $1", capsule_id)
    return serialize(row)

async def get_capsule_reviews(capsule_id, limit=20):
    if not pool:
        return []
    rows = await pool.fetch("SELECT * FROM capsule_reviews WHERE capsule_id = $1 ORDER BY created_at DESC LIMIT $2", capsule_id, limit)
    return [serialize(r) for r in rows]

async def get_token_capsules(token_address):
    if not pool:
        return []
    rows = await pool.fetch("SELECT * FROM capsules WHERE token_address = $1 ORDER BY downloads DESC", token_address)
    return [serialize(r) for r in rows]

async def get_capsules_stats():
    if not pool:
        return {"total_capsules": 0, "total_downloads": 0, "total_creators": 0}
    row = await pool.fetchrow("SELECT COUNT(*) as total_capsules, COALESCE(SUM(downloads), 0) as total_downloads, COUNT(DISTINCT creator) as total_creators FROM capsules")
    return serialize(row) if row else {"total_capsules": 0, "total_downloads": 0, "total_creators": 0}

async def get_recent_activity(limit=20):
    if not pool:
        return []
    rows = await pool.fetch("""
        SELECT CASE WHEN is_buy THEN 'buy' ELSE 'sell' END as type,
            CASE WHEN is_buy THEN 'Bought ' || t.symbol ELSE 'Sold ' || t.symbol END as title,
            tr.trader as user,
            CASE WHEN is_buy THEN '+' || ROUND(CAST(tr.token_amount AS NUMERIC) / 1e18, 2)::TEXT || ' ' || t.symbol
                ELSE ROUND(CAST(tr.eth_amount AS NUMERIC) / 1e18, 4)::TEXT || ' ETH' END as amount,
            to_char(tr.created_at, 'HH24:MI') as time
        FROM trades tr JOIN tokens t ON tr.token_address = t.address ORDER BY tr.created_at DESC LIMIT $1
    """, limit)
    return [serialize(r) for r in rows]
