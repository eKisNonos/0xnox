from .core import pool, serialize

async def register_cf_address(address_hash, cf_address, eth_address=None):
    if not pool:
        return None
    await pool.execute("""
        INSERT INTO cf_address_registry (address_hash, cf_address, eth_address)
        VALUES ($1, $2, $3)
        ON CONFLICT (address_hash) DO UPDATE SET
            cf_address = EXCLUDED.cf_address,
            eth_address = COALESCE(EXCLUDED.eth_address, cf_address_registry.eth_address)
    """, address_hash, cf_address, eth_address)
    return await lookup_cf_address(address_hash)

async def lookup_cf_address(address_hash):
    if not pool:
        return None
    row = await pool.fetchrow("""
        SELECT address_hash, cf_address, eth_address, verified, created_at
        FROM cf_address_registry WHERE address_hash = $1
    """, address_hash)
    return serialize(row) if row else None

async def get_real_cf_address(hash_or_short):
    if not pool:
        return None
    row = await pool.fetchrow("SELECT cf_address FROM cf_address_registry WHERE address_hash = $1", hash_or_short)
    if row:
        return row['cf_address']
    hex_hash = '0x' + hash_or_short if not hash_or_short.startswith('0x') else hash_or_short
    row = await pool.fetchrow("SELECT cf_address FROM cf_address_registry WHERE address_hash = $1", hex_hash)
    return row['cf_address'] if row else None
