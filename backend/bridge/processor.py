import asyncio
import logging
import asyncpg
from . import emission
from .config import DB_URL

log = logging.getLogger(__name__)

class BridgeProcessor:
    def __init__(self):
        self.pool = None
        self.running = False

    async def start(self):
        self.pool = await asyncpg.create_pool(DB_URL, min_size=1, max_size=3)
        self.running = True
        log.info('Bridge processor started')
        while self.running:
            try:
                await self.process_pending()
            except Exception as e:
                log.error(f'Process error: {e}')
            await asyncio.sleep(30)

    async def stop(self):
        self.running = False
        if self.pool:
            await self.pool.close()

    async def process_pending(self):
        rows = await self.pool.fetch("""
            SELECT tx_id, cf_address, net_amount FROM bridge_transactions
            WHERE status = 2 AND cf_tx_hash IS NULL AND direction = 0
            AND cf_address NOT LIKE '0x%' AND LENGTH(cf_address) > 80
            ORDER BY created_at ASC LIMIT 5
        """)

        for row in rows:
            tx_id = row['tx_id']
            cf_addr = row['cf_address']
            amount = int(row['net_amount'])
            log.info(f'Processing: {tx_id[:16]}... -> {cf_addr[:20]}...')

            try:
                emission_hash, tx_hash = await emission.full_emission(cf_addr, amount)
                if emission_hash:
                    await self.pool.execute("""
                        UPDATE bridge_transactions
                        SET cf_tx_hash = $1, emission_hash = $2, completed_at = NOW()
                        WHERE tx_id = $3
                    """, tx_hash or emission_hash, emission_hash, tx_id)
                    log.info(f'Completed: {tx_id[:16]}')
                else:
                    await self.pool.execute("""
                        UPDATE bridge_transactions SET status = 4, error = 'Emission failed'
                        WHERE tx_id = $1
                    """, tx_id)
            except Exception as e:
                log.error(f'TX {tx_id[:16]} failed: {e}')
                await asyncio.sleep(60)

async def run():
    p = BridgeProcessor()
    await p.start()
