from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_capsules():
    return {"capsules": []}

@router.get("/stats")
async def get_capsule_stats():
    return {"total_capsules": 0, "total_downloads": 0}
