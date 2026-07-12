"""Shared member registry for J2026Vault Mini App + bot."""

from __future__ import annotations

import json
import threading
from datetime import datetime, timezone
from pathlib import Path

_LOCK = threading.Lock()
DATA_DIR = Path(__file__).resolve().parent / "data"
STORE_PATH = DATA_DIR / "members.json"
# Also mirror next to the Mini App so GitHub Pages can serve it after upload
APP_MIRROR_PATH = Path(__file__).resolve().parent.parent / "members.json"

PLAN_KEYS = {"MORTAL", "ACOLYTE", "ETERNAL"}


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _today_display() -> str:
    # DD.MM.YYYY to match the Mini App profile label style
    return datetime.now().strftime("%d.%m.%Y")


def _empty_store() -> dict:
    return {"updatedAt": None, "members": []}


def _ensure_store() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not STORE_PATH.exists():
        _write_unlocked(_empty_store())


def _write_unlocked(data: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    data = dict(data or {})
    data["updatedAt"] = _now_iso()
    members = data.get("members") or []
    data["members"] = members
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
        members = raw.get("members")
        if not isinstance(members, list):
            members = []
        raw["members"] = members
        return raw


def save_store(data: dict) -> dict:
    with _LOCK:
        _write_unlocked(data)
        return data


def normalize_member(raw: dict | None, *, fallback_id: int | None = None) -> dict | None:
    if not isinstance(raw, dict):
        raw = {}
    try:
        member_id = int(raw.get("id", fallback_id))
    except (TypeError, ValueError):
        return None
    if member_id <= 0:
        return None

    plan = str(raw.get("plan") or "MORTAL").upper()
    if plan not in PLAN_KEYS:
        plan = "MORTAL"

    registered = str(raw.get("registeredAt") or "").strip()
    if not registered:
        registered = _today_display()

    try:
        downloads = max(0, int(raw.get("downloads") or 0))
    except (TypeError, ValueError):
        downloads = 0
    try:
        purchases = max(0, int(raw.get("purchases") or 0))
    except (TypeError, ValueError):
        purchases = 0

    ends_at = raw.get("endsAt")
    if ends_at is not None:
        ends_at = str(ends_at)

    return {
        "id": member_id,
        "username": str(raw.get("username") or "").lstrip("@").strip(),
        "name": str(raw.get("name") or "").strip() or f"User {member_id}",
        "photoUrl": str(raw.get("photoUrl") or "").strip(),
        "avatarDataUrl": str(raw.get("avatarDataUrl") or "").strip() or None,
        "registeredAt": registered,
        "downloads": downloads,
        "purchases": purchases,
        "plan": plan,
        "endsAt": ends_at,
        "updatedAt": str(raw.get("updatedAt") or _now_iso()),
    }


def upsert_member(patch: dict, *, create_registered: bool = True) -> dict:
    store = load_store()
    members = list(store.get("members") or [])
    normalized = normalize_member(patch)
    if not normalized:
        raise ValueError("Invalid member")

    idx = next((i for i, m in enumerate(members) if int(m.get("id") or 0) == normalized["id"]), None)
    if idx is None:
        if not create_registered:
            normalized["registeredAt"] = normalized["registeredAt"] or _today_display()
        members.append(normalized)
    else:
        prev = normalize_member(members[idx]) or {}
        # Keep original registration date unless the patch explicitly sets one
        if not str(patch.get("registeredAt") or "").strip():
            normalized["registeredAt"] = prev.get("registeredAt") or normalized["registeredAt"]
        # Don't wipe avatar/photo with empty values from a partial heartbeat
        if not normalized.get("avatarDataUrl") and prev.get("avatarDataUrl"):
            normalized["avatarDataUrl"] = prev["avatarDataUrl"]
        if not normalized.get("photoUrl") and prev.get("photoUrl"):
            normalized["photoUrl"] = prev["photoUrl"]
        if not str(patch.get("name") or "").strip() and prev.get("name"):
            normalized["name"] = prev["name"]
        if not str(patch.get("username") or "").strip() and prev.get("username"):
            normalized["username"] = prev["username"]
        if "downloads" not in patch:
            normalized["downloads"] = prev.get("downloads", 0)
        if "purchases" not in patch:
            normalized["purchases"] = prev.get("purchases", 0)
        if "plan" not in patch:
            normalized["plan"] = prev.get("plan", "MORTAL")
            normalized["endsAt"] = prev.get("endsAt")
        members[idx] = normalized

    store["members"] = members
    return save_store(store)


def get_member(member_id: int) -> dict | None:
    store = load_store()
    for raw in store.get("members") or []:
        try:
            if int(raw.get("id")) == int(member_id):
                return normalize_member(raw)
        except (TypeError, ValueError):
            continue
    return None


def list_members() -> list[dict]:
    store = load_store()
    out = []
    for raw in store.get("members") or []:
        member = normalize_member(raw)
        if member:
            out.append(member)
    out.sort(key=lambda m: (m.get("name") or "").lower())
    return out


def replace_all_members(members: list) -> dict:
    cleaned = []
    for raw in members or []:
        member = normalize_member(raw)
        if member:
            cleaned.append(member)
    return save_store({"members": cleaned})


def touch_from_telegram_user(user) -> dict:
    """Record / refresh a member when they hit the bot."""
    if user is None:
        raise ValueError("Missing user")
    user_id = int(getattr(user, "id", 0) or 0)
    if user_id <= 0:
        raise ValueError("Invalid user id")
    username = getattr(user, "username", None) or ""
    first = getattr(user, "first_name", None) or ""
    last = getattr(user, "last_name", None) or ""
    name = f"{first} {last}".strip() or (f"@{username}" if username else f"User {user_id}")
    return upsert_member(
        {
            "id": user_id,
            "username": username,
            "name": name,
        }
    )
