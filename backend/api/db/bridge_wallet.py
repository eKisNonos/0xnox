import subprocess
import secrets
import base64

CLI = "/opt/cellframe-node/bin/cellframe-node-cli"
WALLET_DIR = "/opt/cellframe-node/var/lib/wallet"

async def generate_cellframe_wallet(eth_address=None):
    name = f"nox_{secrets.token_hex(4)}"
    try:
        result = subprocess.run(
            ["docker", "exec", "cellframe-node", CLI, "wallet", "new", "-w", name],
            capture_output=True, text=True, timeout=30)
        if result.returncode != 0:
            return {"error": "Failed to create wallet", "details": result.stderr}
        info = subprocess.run(
            ["docker", "exec", "cellframe-node", CLI, "wallet", "info", "-w", name, "-net", "Backbone"],
            capture_output=True, text=True, timeout=30)
        address = None
        for line in info.stdout.split('\n'):
            if 'addr:' in line:
                parts = line.split('addr:')
                if len(parts) > 1:
                    address = parts[1].strip()
                    break
        if not address:
            return {"error": "Could not get wallet address", "output": info.stdout}
        find_result = subprocess.run(
            ["docker", "exec", "cellframe-node", "find", WALLET_DIR, "-name", f"{name}*.dwallet"],
            capture_output=True, text=True, timeout=10)
        wallet_file, wallet_filename, wallet_path = None, None, None
        if find_result.stdout.strip():
            wallet_path = find_result.stdout.strip().split('\n')[0]
            wallet_filename = wallet_path.split('/')[-1]
            cat_result = subprocess.run(
                ["docker", "exec", "cellframe-node", "cat", wallet_path],
                capture_output=True, timeout=10)
            if cat_result.returncode == 0:
                wallet_file = base64.b64encode(cat_result.stdout).decode('utf-8')
            if wallet_path and wallet_file:
                subprocess.run(["docker", "exec", "cellframe-node", "rm", "-f", wallet_path],
                    capture_output=True, timeout=10)
        return {
            "address": address, "name": name, "wallet_name": name,
            "wallet_file": wallet_file, "wallet_filename": wallet_filename or f"{name}.dwallet",
            "network": "Backbone", "security_note": "Wallet file deleted from server"
        }
    except Exception as e:
        return {"error": str(e)}

async def get_cellframe_balance(cf_address):
    try:
        result = subprocess.run(
            ["docker", "exec", "cellframe-node", CLI, "wallet", "info", "-addr", cf_address],
            capture_output=True, text=True, timeout=30)
        for line in result.stdout.split('\n'):
            if 'balance' in line.lower() and 'nox' in line.lower():
                parts = line.split()
                for i, p in enumerate(parts):
                    if 'nox' in p.lower() and i > 0:
                        return parts[i-1]
        return "0"
    except:
        return "0"
