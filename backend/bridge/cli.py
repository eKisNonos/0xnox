import re
import subprocess
import logging
from .config import CF_CLI, CF_NET, CF_TOKEN, CF_CHAIN, CF_MAIN, EMISSION_CERTS

log = logging.getLogger(__name__)

def run(args, timeout=60):
    try:
        r = subprocess.run([CF_CLI] + args, capture_output=True, text=True, timeout=timeout)
        return r.stdout + r.stderr, r.returncode == 0
    except Exception as e:
        log.error(f'CLI: {e}')
        return str(e), False

def parse_hash(output):
    m = re.search(r'(?:Datum|hash|New)[:\s]+(?:0x)?([A-Fa-f0-9]{64})', output, re.I)
    return f'0x{m.group(1).upper()}' if m else None

def is_synced():
    out, ok = run(['net', '-net', CF_NET, 'get', 'status'])
    return ok and 'NET_STATE_ONLINE' in out and 'percent: 100' in out

def create_emission(addr, amount):
    out, ok = run(['token_emit', '-net', CF_NET, '-chain_emission', CF_CHAIN, '-token', CF_TOKEN,
                   '-emission_value', str(amount), '-addr', addr, '-certs', EMISSION_CERTS[0]])
    if not ok or 'error' in out.lower():
        return None, out
    return parse_hash(out), out

def sign_emission(datum_hash, cert):
    out, ok = run(['token_emit', 'sign', '-net', CF_NET, '-chain', CF_CHAIN,
                   '-emission', datum_hash, '-certs', cert])
    if not ok:
        return None, out
    return parse_hash(out) or datum_hash, out

def process_mempool(datum_hash, chain=None):
    chain = chain or CF_CHAIN
    out, ok = run(['mempool_proc', '-net', CF_NET, '-chain', chain, '-datum', datum_hash])
    return 'isProcessed: true' in out, out

def check_emission_status(datum_hash):
    out, _ = run(['mempool_list', '-net', CF_NET, '-chain', CF_CHAIN])
    if datum_hash.upper() in out.upper():
        return 'mempool'
    out, _ = run(['ledger', 'info', '-net', CF_NET, '-hash', datum_hash])
    if 'error' not in out.lower() and 'code: 11' not in out:
        return 'accepted'
    return 'unknown'

def create_tx_from_emission(emission_hash, cert):
    out, ok = run(['tx_create', '-net', CF_NET, '-chain', CF_MAIN,
                   '-from_emission', emission_hash, '-certs', cert], timeout=120)
    if not ok or 'error' in out.lower():
        return None, out
    return parse_hash(out), out

def get_balance(addr):
    out, _ = run(['wallet', 'info', '-addr', addr, '-net', CF_NET])
    m = re.search(rf'ticker:\s*{CF_TOKEN}.*?coins:\s*([\d.]+)', out, re.S | re.I)
    return float(m.group(1)) if m else 0.0
