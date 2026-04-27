import os
import secrets
import subprocess
import base64
import re
import time
import hashlib
from .core import pool

def keccak256(data):
    if isinstance(data, str):
        data = data.encode()
    from eth_hash.auto import keccak
    return '0x' + keccak(data).hex()

async def generate_cellframe_wallet(eth_address=None):
    cli_path = "/opt/cellframe-node/bin/cellframe-node-cli"
    wallet_path = "/opt/cellframe-node/var/lib/wallet"
    network = os.getenv("CELLFRAME_NETWORK", "Backbone")
    wallet_name = f"nox_{int(time.time())}_{secrets.token_hex(4)}"
    try:
        cmd = [cli_path, "wallet", "new", "-w", wallet_name, "-net", network]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        output = result.stdout + result.stderr
        addr_match = re.search(r'(?:new\s+)?addr(?:ess)?[:\s]+([A-Za-z][A-Za-z0-9]{89,119})', output, re.I)
        if not addr_match:
            raise Exception(f"Failed to create wallet: {output}")
        address = addr_match.group(1)
        wallet_file = f"{wallet_path}/{wallet_name}.dwallet"
        wallet_file_b64 = None
        if os.path.exists(wallet_file):
            with open(wallet_file, 'rb') as f:
                wallet_file_b64 = base64.b64encode(f.read()).decode('utf-8')
        return {
            "address": address,
            "wallet_name": wallet_name,
            "network": network,
            "wallet_file": wallet_file_b64,
            "wallet_filename": f"{wallet_name}.dwallet"
        }
    except subprocess.TimeoutExpired:
        raise Exception("Wallet creation timed out")
    except Exception as e:
        raise Exception(f"Wallet creation failed: {str(e)}")

async def get_cellframe_balance(cf_address):
    return "0"
