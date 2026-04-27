import asyncio
import logging
import asyncpg
from web3 import Web3
from .config import RPC_URLS, BRIDGE_ADDRESS, BRIDGE_ABI, POLL_INTERVAL, REQUIRED_CONFIRMATIONS, DB_URL

log = logging.getLogger(__name__)

class BridgeListener:
    def __init__(self):
        self.w3, self.bridge, self.pool, self.last_block, self.rpc_idx = None, None, None, 0, 0

    def connect_rpc(self):
        for i in range(len(RPC_URLS)):
            url = RPC_URLS[(self.rpc_idx + i) % len(RPC_URLS)]
            try:
                w3 = Web3(Web3.HTTPProvider(url, request_kwargs={'timeout': 30}))
                if w3.is_connected():
                    self.w3 = w3
                    self.bridge = w3.eth.contract(address=Web3.to_checksum_address(BRIDGE_ADDRESS), abi=BRIDGE_ABI)
                    self.rpc_idx = (self.rpc_idx + i + 1) % len(RPC_URLS)
                    log.info(f'RPC: {url[:40]}')
                    return True
            except: continue
        return False

    async def start(self):
        log.info(f'Listener: {BRIDGE_ADDRESS}')
        self.pool = await asyncpg.create_pool(DB_URL, min_size=1, max_size=3)
        if not self.connect_rpc(): raise Exception('No RPC')
        while True:
            try: await self.poll()
            except Exception as e: log.error(f'Poll: {e}'); self.connect_rpc()
            await asyncio.sleep(POLL_INTERVAL)

    async def poll(self):
        if not self.w3 or not self.w3.is_connected(): self.connect_rpc(); return
        cur = self.w3.eth.block_number
        if self.last_block == 0: self.last_block = cur - 10; return
        safe = cur - 2
        if safe <= self.last_block: return
        from_b, to_b = self.last_block + 1, min(safe, self.last_block + 100)
        try:
            for e in self.bridge.events.BridgeToCell.get_logs(from_block=from_b, to_block=to_b):
                await self.handle(e, cur)
            self.last_block = to_b
        except Exception as ex:
            if 'beyond' in str(ex): self.last_block = cur - 20
            else: raise

    async def handle(self, ev, cur):
        tx_id, sender = ev.args.txId.hex(), ev.args.sender.lower()
        cf_hash, amt, fee = '0x' + ev.args.cfRecipient.hex(), str(ev.args.amount), str(ev.args.fee)
        net, blk, status = str(int(amt)-int(fee)), ev.blockNumber, 2 if cur-ev.blockNumber >= REQUIRED_CONFIRMATIONS else 1
        cf = await self.lookup_cf(cf_hash, sender) or cf_hash
        log.info(f'TX: {sender[:10]}... {int(amt)/1e18:.0f} NOX blk={blk}')
        await self.pool.execute(
            """INSERT INTO bridge_transactions (tx_id,eth_address,cf_address,amount,fee,net_amount,direction,status,confirmations,eth_tx_hash,block_number) VALUES ($1,$2,$3,$4,$5,$6,0,$7,$8,$9,$10) ON CONFLICT (tx_id) DO UPDATE SET status=EXCLUDED.status,confirmations=EXCLUDED.confirmations,cf_address=CASE WHEN bridge_transactions.cf_address LIKE '0x%' THEN EXCLUDED.cf_address ELSE bridge_transactions.cf_address END""",
            tx_id, sender, cf, amt, fee, net, status, cur-blk, ev.transactionHash.hex(), blk)

    async def lookup_cf(self, h, eth):
        r = await self.pool.fetchrow('SELECT cf_address FROM bridge_addresses WHERE address_hash=$1 OR eth_address=$2', h, eth)
        return r['cf_address'] if r else None
