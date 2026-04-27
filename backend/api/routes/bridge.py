from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from api.db import core
from api.db import bridge as bridge_db
from web3 import Web3
from .bridge_fmt import format_tx, format_amount

router = APIRouter()

class RegisterAddressRequest(BaseModel):
    eth_address: str
    cf_address: str

class BridgeToCellRequest(BaseModel):
    eth_address: str
    cf_address: str
    amount: str

BRIDGE_FEE = 0.005
MIN_BRIDGE = 100 * 10**18

@router.get("/stats")
async def get_bridge_stats():
    try:
        if not core.pool:
            return {"total_bridged": "0", "pending_count": 0, "fee_percent": 0.5}
        row = await core.pool.fetchrow("""
            SELECT COALESCE(SUM(CASE WHEN status = 2 AND direction = 0 THEN amount::numeric ELSE 0 END), 0) as bridged_to_cell,
            COALESCE(SUM(CASE WHEN status = 2 AND direction = 1 THEN amount::numeric ELSE 0 END), 0) as bridged_to_eth,
            COUNT(CASE WHEN status < 2 THEN 1 END) as pending_count, COUNT(*) as total_count FROM bridge_transactions
        """)
        to_cell, to_eth = int(row['bridged_to_cell']) if row else 0, int(row['bridged_to_eth']) if row else 0
        return {"bridged_to_cell": str(to_cell), "bridged_to_cell_formatted": f"{to_cell / 10**18:,.2f}",
                "bridged_to_eth": str(to_eth), "bridged_to_eth_formatted": f"{to_eth / 10**18:,.2f}",
                "pending_count": row['pending_count'] if row else 0, "total_transactions": row['total_count'] if row else 0, "fee_percent": 0.5}
    except Exception as e:
        return {"bridged_to_cell": "0", "bridged_to_eth": "0", "pending_count": 0, "fee_percent": 0.5, "error": str(e)}

@router.get("/history/{address}")
async def get_bridge_history(address: str):
    try:
        txs = await bridge_db.get_user_bridge_transactions(address.lower())
        return {"transactions": [format_tx(tx) for tx in (txs or [])]}
    except Exception as e:
        return {"transactions": [], "error": str(e)}

@router.get("/user/{address}")
async def get_user_history(address: str):
    return await get_bridge_history(address)

@router.get("/transactions")
async def get_all_transactions(limit: int = 100, status: int = None):
    try:
        txs = await bridge_db.get_bridge_transactions(limit=limit, status=status)
        return {"transactions": [format_tx(tx) for tx in (txs or [])]}
    except Exception as e:
        return {"transactions": [], "error": str(e)}

@router.get("/transaction/{tx_id}")
async def get_transaction(tx_id: str):
    try:
        tx = await bridge_db.get_bridge_transaction(tx_id)
        if not tx:
            raise HTTPException(404, "Transaction not found")
        return format_tx(tx)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/register-address")
async def register_address(req: RegisterAddressRequest):
    if not req.eth_address or not req.eth_address.startswith("0x"):
        raise HTTPException(400, "Invalid ETH address")
    if not req.cf_address or len(req.cf_address) < 50:
        raise HTTPException(400, "Invalid CF address")
    address_hash = Web3.keccak(text=req.cf_address).hex()
    try:
        if core.pool:
            await core.pool.execute("""INSERT INTO bridge_addresses (eth_address, cf_address, address_hash, created_at)
                VALUES ($1, $2, $3, NOW()) ON CONFLICT (eth_address) DO UPDATE SET cf_address=$2, address_hash=$3""",
                req.eth_address.lower(), req.cf_address, address_hash)
            return {"success": True, "eth_address": req.eth_address, "cf_address": req.cf_address, "hash": address_hash}
    except Exception as e:
        return {"success": False, "error": str(e)}
    return {"success": True}

@router.post("/to-cell")
async def bridge_to_cell(req: BridgeToCellRequest):
    try:
        amount = int(req.amount)
    except:
        raise HTTPException(400, "Invalid amount")
    if amount < MIN_BRIDGE:
        raise HTTPException(400, f"Min {MIN_BRIDGE // 10**18} NOX")
    fee, receive = int(amount * BRIDGE_FEE), amount - int(amount * BRIDGE_FEE)
    return {"status": "pending", "amount": str(amount), "amount_formatted": format_amount(str(amount)),
            "fee": str(fee), "fee_formatted": format_amount(str(fee)), "receive": str(receive), "receive_formatted": format_amount(str(receive))}
