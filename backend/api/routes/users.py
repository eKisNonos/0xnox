"""User-related API routes"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/{address}/trades")
async def get_user_trades(address: str):
    return {"trades": []}

@router.get("/{address}/holdings")
async def get_user_holdings(address: str):
    return {"holdings": []}

@router.get("/{address}/profile")
async def get_user_profile(address: str):
    return {"address": address, "username": None}
