from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, validator
from ..db import comments as db
from .helpers import validate_address

router = APIRouter()

class CreateCommentRequest(BaseModel):
    author: str
    content: str
    parent_id: int = None

    @validator('content')
    def validate_content(cls, v):
        if not v or len(v.strip()) < 1:
            raise ValueError('Content cannot be empty')
        if len(v) > 500:
            raise ValueError('Content too long (max 500 chars)')
        return v.strip()

@router.get("/tokens/{address}/comments")
async def get_comments(
    address: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    addr = validate_address(address)
    comments = await db.get_token_comments(addr, limit, offset)
    return {"comments": comments}

@router.post("/tokens/{address}/comments")
async def post_comment(address: str, req: CreateCommentRequest):
    addr = validate_address(address)
    author = validate_address(req.author)
    comment = await db.create_comment(addr, author, req.content, req.parent_id)
    if not comment:
        raise HTTPException(500, "Failed to create comment")
    return comment

@router.get("/comments/{comment_id}/replies")
async def get_replies(comment_id: int, limit: int = Query(20, ge=1, le=100)):
    replies = await db.get_comment_replies(comment_id, limit)
    return {"replies": replies}

@router.post("/comments/{comment_id}/like")
async def like_comment(comment_id: int, user_address: str):
    addr = validate_address(user_address)
    success = await db.like_comment(comment_id, addr)
    return {"success": success}
