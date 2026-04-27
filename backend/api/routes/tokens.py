from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import re
from ..db.database import db

router = APIRouter()

def validate_address(addr: str) -> str:
    if not addr or not re.match(r'^0x[a-fA-F0-9]{40}$', addr):
        raise HTTPException(400, "Invalid Ethereum address")
    return addr.lower()

@router.get("/")
async def list_tokens(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    sort: str = Query("mcap", pattern="^(mcap|new)$"),
    creator: Optional[str] = None
):
    if creator:
        creator = validate_address(creator)
    tokens = await db.get_tokens(limit, offset, sort)
    return {"tokens": tokens, "total": len(tokens)}

@router.get("/{address}")
async def get_token(address: str):
    addr = validate_address(address)
    token = await db.get_token(addr)
    if not token:
        raise HTTPException(404, "Token not found")
    return token

@router.get("/{address}/trades")
async def get_token_trades(
    address: str,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    addr = validate_address(address)
    return {"trades": [], "total": 0}

@router.get("/{address}/chart")
async def get_token_chart(
    address: str,
    timeframe: str = Query("1h", pattern="^(1m|5m|15m|1h|4h|1d)$"),
    limit: int = Query(100, ge=1, le=1000)
):
    addr = validate_address(address)
    return {"prices": []}

@router.get("/{address}/comments")
async def get_token_comments(
    address: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    addr = validate_address(address)
    return {"comments": [], "total": 0}
