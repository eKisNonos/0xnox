from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import logging

from .db.database import db
from .db import core as pg_db
from . import endpoints

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting 0xNOX API...")
    await db.connect()
    await pg_db.init()
    logger.info("Database connected")
    yield
    await db.close()

app = FastAPI(title="0xNOX API", description="NOX Token Infrastructure", version="2.0.0",
              docs_url="/docs", redoc_url="/redoc", lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.add_middleware(GZipMiddleware, minimum_size=1000)

from .routes import tokens, bridge, capsules, platform, metadata

app.include_router(tokens.router, prefix="/api/v1/tokens", tags=["tokens"])
app.include_router(bridge.router, prefix="/api/v1/bridge", tags=["bridge"])
app.include_router(capsules.router, prefix="/api/v1/capsules", tags=["capsules"])
app.include_router(platform.router, prefix="/api/v1", tags=["platform"])
app.include_router(metadata.router, prefix="/api/v1/metadata", tags=["metadata"])

@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

app.get("/health")(endpoints.health)
app.get("/")(endpoints.root)
app.get("/api/v1/stats")(endpoints.get_stats)
app.get("/api/v1/platform/stats")(endpoints.get_stats)
app.get("/api/v1/king")(endpoints.get_king)
app.get("/api/v1/trending")(endpoints.get_trending)
app.get("/api/v1/search")(endpoints.search)
app.get("/api/v1/activity")(endpoints.get_activity)
app.websocket("/api/v1/ws")(endpoints.ws_endpoint)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8085, log_level="info")
