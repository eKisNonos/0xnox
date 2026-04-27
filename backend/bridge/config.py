import os
from dotenv import load_dotenv

load_dotenv()

RPC_URLS = [
    'https://ethereum-rpc.publicnode.com',
    'https://eth.llamarpc.com',
    'https://1rpc.io/eth',
    'https://rpc.payload.de'
]

BRIDGE_ADDRESS = os.getenv('BRIDGE_ADDRESS', '0x70Fb00075879E7D9d87EA5536c6c374cc2d14435')
POLL_INTERVAL = int(os.getenv('POLL_INTERVAL', '12'))
REQUIRED_CONFIRMATIONS = int(os.getenv('REQUIRED_CONFIRMATIONS', '3'))

CF_CLI = '/opt/cellframe-node/bin/cellframe-node-cli'
CF_NET = os.getenv('CELLFRAME_NETWORK', 'Backbone')
CF_TOKEN = os.getenv('CELLFRAME_TOKEN', 'NOX')
CF_CHAIN = 'zerochain'
CF_MAIN = 'main'

EMISSION_CERTS = [c.strip() for c in os.getenv('EMISSION_CERTS', 'nox_owner1,nox_owner2,nox_owner3').split(',')]
TX_CERT = os.getenv('TX_CERT', 'nox_owner1')

DB_URL = os.getenv('DATABASE_URL', 'postgresql://noxuser:nox_bridge_2024@localhost/noxdb')

BRIDGE_ABI = [{'anonymous': False, 'inputs': [
    {'indexed': True, 'name': 'txId', 'type': 'bytes32'},
    {'indexed': True, 'name': 'sender', 'type': 'address'},
    {'indexed': False, 'name': 'cfRecipient', 'type': 'bytes32'},
    {'indexed': False, 'name': 'amount', 'type': 'uint256'},
    {'indexed': False, 'name': 'fee', 'type': 'uint256'}
], 'name': 'BridgeToCell', 'type': 'event'}]
