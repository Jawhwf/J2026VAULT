"""Telegram profile photo helpers for member registry."""

from __future__ import annotations

import base64
from io import BytesIO

import requests

MIN_JPEG_BYTES = 1200


def fetch_profile_photo_data_url(bot_token: str, user_id: int) -> str | None:
    """Download a user's Telegram profile photo as a JPEG data URL."""
    if not bot_token or not user_id:
        return None
    try:
        r = requests.get(
            f"https://api.telegram.org/bot{bot_token}/getUserProfilePhotos",
            params={"user_id": int(user_id), "limit": 1},
            timeout=20,
        )
        data = r.json()
        if not data.get("ok"):
            return None
        result = data.get("result") or {}
        if not int(result.get("total_count") or 0):
            return None
        photos = result.get("photos") or []
        if not photos or not photos[0]:
            return None
        # Largest size in the first photo set
        best = photos[0][-1]
        file_id = best.get("file_id")
        if not file_id:
            return None

        fr = requests.get(
            f"https://api.telegram.org/bot{bot_token}/getFile",
            params={"file_id": file_id},
            timeout=20,
        )
        fdata = fr.json()
        if not fdata.get("ok"):
            return None
        file_path = (fdata.get("result") or {}).get("file_path")
        if not file_path:
            return None

        raw = requests.get(
            f"https://api.telegram.org/file/bot{bot_token}/{file_path}",
            timeout=30,
        ).content
        if not raw or len(raw) < 200:
            return None

        try:
            from PIL import Image

            im = Image.open(BytesIO(raw)).convert("RGB")
            im.thumbnail((320, 320))
            out = BytesIO()
            im.save(out, format="JPEG", quality=88, optimize=True)
            jpeg = out.getvalue()
        except Exception:
            jpeg = raw

        if len(jpeg) < MIN_JPEG_BYTES:
            # Fall back to original download if compression collapsed
            jpeg = raw
        if len(jpeg) < MIN_JPEG_BYTES:
            return None

        b64 = base64.b64encode(jpeg).decode("ascii")
        return f"data:image/jpeg;base64,{b64}"
    except Exception as err:
        print(f"avatar fetch failed {user_id}: {err}", flush=True)
        return None
