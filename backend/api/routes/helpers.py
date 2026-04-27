from fastapi import HTTPException
import re

def validate_address(addr: str) -> str:
    if not addr or not re.match(r'^0x[a-fA-F0-9]{40}$', addr):
        raise HTTPException(400, "Invalid Ethereum address")
    return addr.lower()

def validate_limit(limit: int, max_limit: int = 100) -> int:
    return min(max(1, limit), max_limit)
