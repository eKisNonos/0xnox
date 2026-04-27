#!/usr/bin/env python3
import os
import subprocess
import sys
from dotenv import load_dotenv

load_dotenv()

ETHERSCAN_KEY = os.getenv("ETHERSCAN_API_KEY")

def verify_contract(address, contract_name, constructor_args=""):
    print(f"Verifying {contract_name} at {address}...")
    cmd = [
        "forge", "verify-contract",
        "--chain", "mainnet",
        "--etherscan-api-key", ETHERSCAN_KEY,
        address,
        contract_name
    ]
    if constructor_args:
        cmd.extend(["--constructor-args", constructor_args])
    result = subprocess.run(cmd, cwd="../contracts", capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Verification failed: {result.stderr}")
        return False
    print(f"Verified: {contract_name}")
    return True

def main():
    if len(sys.argv) < 4:
        print("Usage: verify.py <factory> <treasury> <implementation>")
        sys.exit(1)
    factory = sys.argv[1]
    treasury = sys.argv[2]
    impl = sys.argv[3]
    verify_contract(impl, "src/Token.sol:OxNoxToken")
    treasury_args = os.getenv("NOX_TOKEN_ADDRESS") + os.getenv("STAKING_ADDRESS") + os.getenv("UNISWAP_ROUTER") + os.getenv("WETH_ADDRESS")
    verify_contract(treasury, "src/Treasury.sol:OxNoxTreasury", treasury_args)
    factory_args = treasury + os.getenv("NOX_TOKEN_ADDRESS") + os.getenv("NFT_PASS_ADDRESS") + impl
    verify_contract(factory, "src/Factory.sol:OxNoxFactory", factory_args)
    print("\nAll contracts verified!")

if __name__ == "__main__":
    main()
