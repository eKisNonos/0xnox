from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
import hashlib
import json
import os
from datetime import datetime
from .upload import save_base64_image

router = APIRouter()
METADATA_DIR = '/var/www/0xnox.com/metadata'
os.makedirs(METADATA_DIR, exist_ok=True)

class TokenMetadata(BaseModel):
    name: str
    symbol: str
    description: Optional[str] = ''
    image: Optional[str] = ''
    banner: Optional[str] = ''
    external_url: Optional[str] = ''
    social: Optional[Dict[str, str]] = {}
    created_at: Optional[int] = None

@router.post('/')
async def upload_metadata(data: TokenMetadata):
    try:
        content_hash = hashlib.sha256(
            f"{data.name}:{data.symbol}:{datetime.now().timestamp()}".encode()
        ).hexdigest()[:16]
        image_url = save_base64_image(data.image, f'{data.symbol.lower()}_logo') if data.image and data.image.startswith('data:image/') else (data.image or '')
        banner_url = save_base64_image(data.banner, f'{data.symbol.lower()}_banner') if data.banner and data.banner.startswith('data:image/') else (data.banner or '')
        metadata = {
            'name': data.name,
            'symbol': data.symbol,
            'description': data.description or '',
            'image': f'https://0xnox.com{image_url}' if image_url.startswith('/') else image_url,
            'banner': f'https://0xnox.com{banner_url}' if banner_url.startswith('/') else banner_url,
            'external_url': data.external_url or '',
            'attributes': [],
            'social': data.social or {},
            'created_at': data.created_at or int(datetime.now().timestamp() * 1000)
        }
        for platform, url in (data.social or {}).items():
            if url:
                metadata['attributes'].append({'trait_type': platform.capitalize(), 'value': url})
        filename = f'{content_hash}.json'
        with open(os.path.join(METADATA_DIR, filename), 'w') as f:
            json.dump(metadata, f, indent=2)
        return {
            'success': True, 'uri': f'https://0xnox.com/metadata/{filename}',
            'hash': content_hash, 'image': metadata['image'], 'banner': metadata['banner']
        }
    except Exception as e:
        raise HTTPException(500, f'Metadata upload failed: {str(e)}')

@router.get('/{hash}')
async def get_metadata(hash: str):
    filepath = os.path.join(METADATA_DIR, f'{hash}.json')
    if not os.path.exists(filepath):
        raise HTTPException(404, 'Metadata not found')
    with open(filepath) as f:
        return json.load(f)
