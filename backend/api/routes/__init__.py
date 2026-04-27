from fastapi import APIRouter
from .tokens import router as tokens_router
from .users import router as users_router
from .bridge import router as bridge_router
from .capsules import router as capsules_router
from .platform import router as platform_router

router = APIRouter()

# Include all route modules
router.include_router(platform_router, tags=["platform"])
router.include_router(tokens_router, prefix="/tokens", tags=["tokens"])
router.include_router(users_router, prefix="/users", tags=["users"])
router.include_router(bridge_router, prefix="/bridge", tags=["bridge"])
router.include_router(capsules_router, prefix="/capsules", tags=["capsules"])
