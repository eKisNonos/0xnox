from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime
from typing import List
from .db.database import db

class WSManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, msg: dict):
        for ws in self.active:
            try:
                await ws.send_json(msg)
            except:
                pass

manager = WSManager()

async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat(), "version": "2.0.0"}

async def root():
    return {"message": "0xNOX API", "version": "2.0.0", "status": "operational"}

async def get_stats():
    return await db.get_stats()

async def get_king():
    return {"king": await db.get_king()}

async def get_trending():
    tokens = await db.get_tokens(limit=10, sort="mcap")
    return {"tokens": tokens}

async def search(q: str = ""):
    return {"tokens": []}

async def get_activity():
    return {"activities": []}

async def ws_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        stats = await db.get_stats()
        await ws.send_json({"type": "stats", "data": stats})
        while True:
            data = await ws.receive_text()
            await ws.send_json({"type": "pong", "data": data})
    except WebSocketDisconnect:
        manager.disconnect(ws)
    except:
        manager.disconnect(ws)
