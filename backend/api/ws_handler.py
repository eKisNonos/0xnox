from fastapi import WebSocket, WebSocketDisconnect
import asyncio
import json
import logging
from .db import get_stats, get_king, get_token
from .websocket import manager

logger = logging.getLogger(__name__)

async def handle_websocket(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        stats = await get_stats()
        await websocket.send_json({"type": "stats", "data": stats})
        king = await get_king()
        if king:
            await websocket.send_json({"type": "king", "data": king})
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30)
                try:
                    msg = json.loads(data)
                except json.JSONDecodeError:
                    await websocket.send_json({"type": "error", "message": "Invalid JSON"})
                    continue
                if msg.get("type") == "subscribe":
                    channel = msg.get("channel")
                    if channel == "token":
                        token_addr = msg.get("address")
                        if token_addr:
                            token = await get_token(token_addr.lower())
                            if token:
                                await websocket.send_json({"type": "token", "data": token})
            except asyncio.TimeoutError:
                await websocket.send_json({"type": "ping"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)
