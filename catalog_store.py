"""Shared catalog product registry for J2026Vault Mini App."""

from __future__ import annotations

import json
import threading
from datetime import datetime, timezone
from pathlib import Path

_LOCK = threading.Lock()
BOT_DIR = Path(__file__).resolve().parent
DATA_DIR = BOT_DIR / "data"
STORE_PATH = DATA_DIR / "products.json"
APP_MIRROR_PATH = BOT_DIR.parent / "products.json"


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _empty_store() -> dict:
    return {"updatedAt": None, "products": []}


def _ensure_store() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not STORE_PATH.exists():
        _write_unlocked(_empty_store())


def _write_unlocked(data: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    data = dict(data or {})
    data["updatedAt"] = _now_iso()
    products = data.get("products") or []
    if not isinstance(products, list):
        products = []
    data["products"] = products
    text = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    STORE_PATH.write_text(text, encoding="utf-8")
    try:
        APP_MIRROR_PATH.write_text(text, encoding="utf-8")
    except OSError:
        pass


def load_store() -> dict:
    with _LOCK:
        _ensure_store()
        try:
            raw = json.loads(STORE_PATH.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            raw = _empty_store()
        if not isinstance(raw, dict):
            raw = _empty_store()
        products = raw.get("products")
        if not isinstance(products, list):
            products = []
        raw["products"] = products
        return raw


def list_products() -> list:
    return list(load_store().get("products") or [])


def replace_all_products(products: list) -> dict:
    cleaned = []
    for item in products or []:
        if isinstance(item, dict) and item.get("id") is not None:
            cleaned.append(item)
    with _LOCK:
        data = {"products": cleaned}
        _write_unlocked(data)
        return data
