"""Shared accent theme preference for Mini App + browser gate."""

from __future__ import annotations

import json
import threading
from datetime import datetime, timezone
from pathlib import Path

_LOCK = threading.Lock()
BOT_DIR = Path(__file__).resolve().parent
DATA_DIR = BOT_DIR / "data"
STORE_PATH = DATA_DIR / "accent-theme.json"
APP_MIRROR_PATH = BOT_DIR.parent / "accent-theme.json"

VALID_THEMES = {
    "violet",
    "blue",
    "teal",
    "green",
    "rose",
    "orange",
    "amber",
    "slate",
}


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _empty() -> dict:
    return {"theme": "violet", "updatedAt": None}


def _write_unlocked(data: dict) -> dict:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    theme = str(data.get("theme") or "violet").strip().lower()
    if theme not in VALID_THEMES:
        theme = "violet"
    payload = {"theme": theme, "updatedAt": _now_iso()}
    text = json.dumps(payload, indent=2) + "\n"
    STORE_PATH.write_text(text, encoding="utf-8")
    try:
        APP_MIRROR_PATH.write_text(text, encoding="utf-8")
    except OSError:
        pass
    return payload


def load_accent() -> dict:
    with _LOCK:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        if not STORE_PATH.exists():
            return _write_unlocked(_empty())
        try:
            raw = json.loads(STORE_PATH.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return _write_unlocked(_empty())
        if not isinstance(raw, dict):
            return _write_unlocked(_empty())
        theme = str(raw.get("theme") or "violet").strip().lower()
        if theme not in VALID_THEMES:
            theme = "violet"
        return {"theme": theme, "updatedAt": raw.get("updatedAt")}


def set_accent(theme: str) -> dict:
    with _LOCK:
        return _write_unlocked({"theme": theme})
