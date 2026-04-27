import logging
from .core import pool, serialize

logger = logging.getLogger(__name__)

async def get_token_comments(token_address, limit=50, offset=0):
    if not pool:
        return []
    rows = await pool.fetch("""
        SELECT c.*, COALESCE(r.reply_count, 0) as reply_count, COALESCE(l.like_count, 0) as likes
        FROM comments c
        LEFT JOIN (SELECT parent_id, COUNT(*) as reply_count FROM comments WHERE parent_id IS NOT NULL GROUP BY parent_id) r ON c.id = r.parent_id
        LEFT JOIN (SELECT comment_id, COUNT(*) as like_count FROM comment_likes GROUP BY comment_id) l ON c.id = l.comment_id
        WHERE c.token_address = $1 AND c.parent_id IS NULL ORDER BY c.created_at DESC LIMIT $2 OFFSET $3
    """, token_address, limit, offset)
    return [serialize(r) for r in rows]

async def get_comment_replies(comment_id, limit=20):
    if not pool:
        return []
    rows = await pool.fetch("""
        SELECT c.*, COALESCE(l.like_count, 0) as likes
        FROM comments c
        LEFT JOIN (SELECT comment_id, COUNT(*) as like_count FROM comment_likes GROUP BY comment_id) l ON c.id = l.comment_id
        WHERE c.parent_id = $1 ORDER BY c.created_at ASC LIMIT $2
    """, comment_id, limit)
    return [serialize(r) for r in rows]

async def create_comment(token_address, author, content, parent_id=None):
    if not pool:
        return None
    row = await pool.fetchrow("""
        INSERT INTO comments (token_address, author, content, parent_id)
        VALUES ($1, $2, $3, $4) RETURNING *
    """, token_address, author, content, parent_id)
    return serialize(row)

async def like_comment(comment_id, user_address):
    if not pool:
        return False
    try:
        await pool.execute("""
            INSERT INTO comment_likes (comment_id, user_address) VALUES ($1, $2) ON CONFLICT DO NOTHING
        """, comment_id, user_address)
        return True
    except Exception as e:
        logger.error(f"Like comment failed: {e}")
        return False
