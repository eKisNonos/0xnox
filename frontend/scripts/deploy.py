#!/usr/bin/env python3
import os
import json
import subprocess
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

RPC_URL = os.getenv("ETH_RPC_URL")
PRIVATE_KEY = os.getenv("DEPLOYER_PRIVATE_KEY")
NOX_TOKEN = os.getenv("NOX_TOKEN_ADDRESS")
NFT_PASS = os.getenv("NFT_PASS_ADDRESS")
STAKING = os.getenv("STAKING_ADDRESS")
ROUTER = os.getenv("UNISWAP_ROUTER")
WETH = os.getenv("WETH_ADDRESS")

def compile_contracts():
    print("Compiling contracts...")
    result = subprocess.run(["forge", "build"], cwd="../contracts", capture_output=True, text=True)
    if result.returncode != 0:
        raise Exception(f"Compilation failed: {result.stderr}")
    print("Compilation successful")

def load_artifact(name):
    path = f"../contracts/out/{name}.sol/{name}.json"
    with open(path) as f:
        data = json.load(f)
    return data["abi"], data["bytecode"]["object"]

def deploy_contract(w3, account, abi, bytecode, *args):
    contract = w3.eth.contract(abi=abi, bytecode=bytecode)
    tx = contract.constructor(*args).build_transaction({
        "from": account.address, "nonce": w3.eth.get_transaction_count(account.address),
        "gas": 5000000, "gasPrice": w3.eth.gas_price
    })
    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return receipt.contractAddress

def main():
    compile_contracts()
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    account = w3.eth.account.from_key(PRIVATE_KEY)
    print(f"Deploying from: {account.address}")
    token_abi, token_bytecode = load_artifact("OxNoxToken")
    impl = deploy_contract(w3, account, token_abi, token_bytecode)
    print(f"Token Implementation: {impl}")
    treasury_abi, treasury_bytecode = load_artifact("OxNoxTreasury")
    treasury = deploy_contract(w3, account, treasury_abi, treasury_bytecode, NOX_TOKEN, STAKING, ROUTER, WETH)
    print(f"Treasury: {treasury}")
    factory_abi, factory_bytecode = load_artifact("OxNoxFactory")
    factory = deploy_contract(w3, account, factory_abi, factory_bytecode, treasury, NOX_TOKEN, NFT_PASS, impl)
    print(f"Factory: {factory}")
    print("\nDeployment complete!")
    print(json.dumps({"factory": factory, "treasury": treasury, "implementation": impl}, indent=2))

if __name__ == "__main__":
    main()
