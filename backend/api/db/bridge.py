from . import core
from .core import serialize

async def get_bridge_stats():
    if not core.pool:
        return {"bridged_to_cell": "0", "bridged_to_eth": "0", "total_fees": "0", "pending_count": 0}
    row = await core.pool.fetchrow("SELECT * FROM bridge_stats WHERE id = 1")
    return serialize(row) if row else {"bridged_to_cell": "0", "bridged_to_eth": "0", "total_fees": "0", "pending_count": 0}

async def get_bridge_transactions(limit=50, status=None):
    if not core.pool:
        return []
    q, args = "SELECT * FROM bridge_transactions", []
    if status is not None:
        args.append(status)
        q += f" WHERE status = ${len(args)}"
    q += f" ORDER BY created_at DESC LIMIT ${len(args)+1}"
    args.append(limit)
    return [serialize(r) for r in await core.pool.fetch(q, *args)]

async def get_bridge_transaction(tx_id):
    if not core.pool:
        return None
    row = await core.pool.fetchrow("SELECT * FROM bridge_transactions WHERE tx_id = $1", tx_id)
    return serialize(row)

async def get_user_bridge_transactions(eth_address, limit=50):
    if not core.pool:
        return []
    rows = await core.pool.fetch(
        "SELECT * FROM bridge_transactions WHERE eth_address = $1 ORDER BY created_at DESC LIMIT $2",
        eth_address, limit)
    return [serialize(r) for r in rows]

async def record_bridge_transaction(tx_id, eth_address, cf_address, amount, fee, direction=0, eth_tx_hash=None, block_number=None):
    if not core.pool:
        return None
    net = int(amount) - int(fee)
    await core.pool.execute("""
        INSERT INTO bridge_transactions (tx_id, eth_address, cf_address, amount, fee, net_amount, direction, status, eth_tx_hash, block_number)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, $9)
    """, tx_id, eth_address, cf_address, amount, fee, net, direction, eth_tx_hash, block_number)
    return await get_bridge_transaction(tx_id)

async def update_bridge_transaction(tx_id, status=None, confirmations=None, cf_tx_hash=None):
    if not core.pool:
        return None
    updates, args = [], [tx_id]
    if status is not None:
        args.append(status)
        updates.append(f"status = ${len(args)}")
        if status == 2:
            updates.append("completed_at = NOW()")
    if confirmations is not None:
        args.append(confirmations)
        updates.append(f"confirmations = ${len(args)}")
    if cf_tx_hash is not None:
        args.append(cf_tx_hash)
        updates.append(f"cf_tx_hash = ${len(args)}")
    if updates:
        await core.pool.execute(f"UPDATE bridge_transactions SET {', '.join(updates)} WHERE tx_id = $1", *args)
    return await get_bridge_transaction(tx_id)

async def get_pending_bridge_transactions():
    if not core.pool:
        return []
    rows = await core.pool.fetch("""
        SELECT tx_id, eth_address, cf_address, amount, fee, block_number
        FROM bridge_transactions WHERE status < 2 AND direction = 0 ORDER BY block_number ASC
    """)
    return [serialize(r) for r in rows]

async def register_cf_address(address_hash, cf_address, eth_address):
    if not core.pool:
        return
    await core.pool.execute("""
        INSERT INTO cf_addresses (address_hash, cf_address, eth_address) VALUES ($1, $2, $3)
        ON CONFLICT (address_hash) DO UPDATE SET cf_address = $2, eth_address = $3
    """, address_hash, cf_address, eth_address)

async def lookup_cf_address(address_hash):
    if not core.pool:
        return None
    row = await core.pool.fetchrow("SELECT * FROM cf_addresses WHERE address_hash = $1", address_hash)
    return serialize(row)
