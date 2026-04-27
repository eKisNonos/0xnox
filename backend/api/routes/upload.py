import base64
import uuid
import os

UPLOAD_DIR = '/var/www/0xnox.com/uploads'

os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_base64_image(data_url: str, prefix: str) -> str:
    if not data_url or not data_url.startswith('data:image/'):
        return ''
    try:
        header, encoded = data_url.split(',', 1)
        ext = 'png'
        if 'jpeg' in header or 'jpg' in header:
            ext = 'jpg'
        elif 'gif' in header:
            ext = 'gif'
        elif 'webp' in header:
            ext = 'webp'
        img_data = base64.b64decode(encoded)
        filename = f"{prefix}_{uuid.uuid4().hex[:8]}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, 'wb') as f:
            f.write(img_data)
        return f'/uploads/{filename}'
    except:
        return ''
