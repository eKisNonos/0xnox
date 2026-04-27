from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..db import bridge as db
from .helpers import validate_address
from .bridge import validate_cellframe_address, validate_address_hash

router = APIRouter()

class CellframeWalletRequest(BaseModel):
    eth_address: str = None

@router.post("/bridge/wallet/generate")
async def generate_cellframe_wallet(req: CellframeWalletRequest = None):
    eth_addr = None
    if req and req.eth_address:
        eth_addr = validate_address(req.eth_address)
    return await db.generate_cellframe_wallet(eth_addr)

@router.get("/bridge/wallet/{cf_address}/balance")
async def get_cellframe_balance(cf_address: str):
    balance = await db.get_cellframe_balance(cf_address)
    return {"address": cf_address, "balance": balance}

class RegisterAddressRequest(BaseModel):
    eth_address: str
    cf_address: str
    address_hash: str

@router.post("/bridge/register-address")
async def register_address(req: RegisterAddressRequest):
    eth_addr = validate_address(req.eth_address)
    cf_addr = validate_cellframe_address(req.cf_address)
    addr_hash = validate_address_hash(req.address_hash)
    await db.register_cf_address(addr_hash, cf_addr, eth_addr)
    return {"success": True, "address_hash": addr_hash, "cf_address": cf_addr}

@router.get("/bridge/address/{address_hash}")
async def lookup_address(address_hash: str):
    addr_hash = validate_address_hash(address_hash)
    result = await db.lookup_cf_address(addr_hash)
    if not result:
        raise HTTPException(404, "Address not registered")
    return result
