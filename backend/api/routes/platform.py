"""Platform-wide API routes"""
from fastapi import APIRouter
from ..db.database import get_stats, get_king

router = APIRouter()

@router.get("/stats")
async def platform_stats():
    """Get platform statistics"""
    return await get_stats()

@router.get("/king")
async def get_platform_king():
    """Get current king of the hill"""
    king = await get_king()
    return {"king": king}

@router.get("/trending")
async def get_trending():
    """Get trending tokens"""
    return {"tokens": []}

@router.get("/search")
async def search(q: str):
    """Search tokens"""
    return {"tokens": []}

@router.get("/activity")
async def get_activity():
    """Get platform activity"""
    return {"activities": []}
