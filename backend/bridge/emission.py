import asyncio
import logging
from . import cli
from .config import EMISSION_CERTS, TX_CERT

log = logging.getLogger(__name__)

async def create_and_sign(addr, amount):
    if not cli.is_synced():
        log.error('Node not synced')
        return None

    if not addr or len(addr) < 80:
        log.error(f'Invalid address: {addr}')
        return None

    log.info(f'Creating emission: {int(amount)/1e18:.2f} NOX -> {addr[:20]}...')
    datum_hash, out = cli.create_emission(addr, int(amount))
    if not datum_hash:
        log.error(f'Emission create failed: {out[:200]}')
        return None
    log.info(f'Emission created: {datum_hash}')

    for i, cert in enumerate(EMISSION_CERTS[1:], 2):
        await asyncio.sleep(1)
        new_hash, out = cli.sign_emission(datum_hash, cert)
        if new_hash:
            log.info(f'Signed {i}/{len(EMISSION_CERTS)}: {new_hash}')
            datum_hash = new_hash
        else:
            log.warning(f'Sign {i} failed: {out[:100]}')

    return datum_hash

async def process_and_transfer(emission_hash):
    processed, out = cli.process_mempool(emission_hash)
    log.info(f'Mempool proc: {processed}')

    for _ in range(60):
        await asyncio.sleep(10)
        status = cli.check_emission_status(emission_hash)
        log.info(f'Emission status: {status}')
        if status == 'accepted':
            break
        if status == 'unknown':
            processed, _ = cli.process_mempool(emission_hash)
    else:
        log.warning('Emission not accepted after 10min')
        return None

    tx_hash, out = cli.create_tx_from_emission(emission_hash, TX_CERT)
    if tx_hash:
        log.info(f'TX created: {tx_hash}')
    else:
        log.error(f'TX create failed: {out[:200]}')
    return tx_hash

async def full_emission(addr, amount):
    emission_hash = await create_and_sign(addr, amount)
    if not emission_hash:
        return None, None
    tx_hash = await process_and_transfer(emission_hash)
    return emission_hash, tx_hash
