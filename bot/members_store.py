"""Shared member registry for J2026Vault Mini App + bot."""

from __future__ import annotations

import json
import threading
from datetime import datetime, timezone
from pathlib import Path

_LOCK = threading.Lock()
BOT_DIR = Path(__file__).resolve().parent
DATA_DIR = BOT_DIR / "data"
STORE_PATH = DATA_DIR / "members.json"
# Mirror to repo root so GitHub Pages can read members.json
APP_MIRROR_PATH = BOT_DIR.parent / "members.json"

PLAN_KEYS = {"MORTAL", "ACOLYTE", "ETERNAL"}
SOURCE_KEYS = {"bot", "webapp", "web", "editor", "manual"}


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _today_display() -> str:
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


def _normalize_sources(raw) -> list[str]:
    out: list[str] = []
    if isinstance(raw, str) and raw.strip():
        raw = [raw]
    if not isinstance(raw, list):
        return out
    for item in raw:
        key = str(item or "").strip().lower()
        if key in SOURCE_KEYS and key not in out:
            out.append(key)
    return out


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
    try:
        seen_count = max(0, int(raw.get("seenCount") or 0))
    except (TypeError, ValueError):
        seen_count = 0

    ends_at = raw.get("endsAt")
    if ends_at is not None:
        ends_at = str(ends_at)

    first_source = str(raw.get("firstSource") or "").strip().lower()
    if first_source not in SOURCE_KEYS:
        first_source = ""

    last_seen = str(raw.get("lastSeenAt") or "").strip() or None
    sources = _normalize_sources(raw.get("sources"))

    avatar_raw = str(raw.get("avatarDataUrl") or "").strip() or None
    # Ignore tiny/corrupt placeholder data-URLs from earlier bad fetches
    if avatar_raw and (not avatar_raw.startswith("data:image") or len(avatar_raw) < 2000):
        avatar_raw = None

    return {
        "id": member_id,
        "username": str(raw.get("username") or "").lstrip("@").strip(),
        "name": str(raw.get("name") or "").strip() or f"User {member_id}",
        "photoUrl": str(raw.get("photoUrl") or "").strip(),
        "avatarDataUrl": avatar_raw,
        # True only when the user uploaded a custom PNG/GIF in the Mini App
        "avatarCustom": bool(raw.get("avatarCustom")),
        "registeredAt": registered,
        "downloads": downloads,
        "purchases": purchases,
        "plan": plan,
        "endsAt": ends_at,
        "sources": sources,
        "firstSource": first_source or (sources[0] if sources else ""),
        "seenCount": seen_count,
        "lastSeenAt": last_seen,
        "updatedAt": str(raw.get("updatedAt") or _now_iso()),
    }


def upsert_member(patch: dict, *, create_registered: bool = True, touch: bool = False, source: str | None = None) -> dict:
    store = load_store()
    members = list(store.get("members") or [])
    normalized = normalize_member(patch)
    if not normalized:
        raise ValueError("Invalid member")

    src = str(source or patch.get("source") or "").strip().lower()
    if src not in SOURCE_KEYS:
        src = ""

    idx = next((i for i, m in enumerate(members) if int(m.get("id") or 0) == normalized["id"]), None)
    now = _now_iso()

    if idx is None:
        if src:
            normalized["sources"] = [src]
            normalized["firstSource"] = src
        if touch or src:
            normalized["seenCount"] = max(1, normalized.get("seenCount") or 0)
            normalized["lastSeenAt"] = now
        if not create_registered:
            normalized["registeredAt"] = normalized["registeredAt"] or _today_display()
        members.append(normalized)
    else:
        prev = normalize_member(members[idx]) or {}
        if not str(patch.get("registeredAt") or "").strip():
            normalized["registeredAt"] = prev.get("registeredAt") or normalized["registeredAt"]
        if "avatarDataUrl" not in patch:
            if not normalized.get("avatarDataUrl") and prev.get("avatarDataUrl"):
                normalized["avatarDataUrl"] = prev["avatarDataUrl"]
        elif not patch.get("avatarDataUrl"):
            normalized["avatarDataUrl"] = None

        if "avatarCustom" not in patch:
            normalized["avatarCustom"] = bool(prev.get("avatarCustom"))

        if "photoUrl" not in patch:
            if not normalized.get("photoUrl") and prev.get("photoUrl"):
                normalized["photoUrl"] = prev["photoUrl"]
        elif not str(patch.get("photoUrl") or "").strip():
            normalized["photoUrl"] = ""

        if not str(patch.get("name") or "").strip() and prev.get("name"):
            normalized["name"] = prev["name"]
        if not str(patch.get("username") or "").strip() and prev.get("username"):
            # Allow explicit empty username only when key present as ""
            if "username" not in patch:
                normalized["username"] = prev["username"]
        if "downloads" not in patch:
            normalized["downloads"] = prev.get("downloads", 0)
        if "purchases" not in patch:
            normalized["purchases"] = prev.get("purchases", 0)
        if "plan" not in patch:
            normalized["plan"] = prev.get("plan", "MORTAL")
            normalized["endsAt"] = prev.get("endsAt")

        sources = list(prev.get("sources") or [])
        for s in normalized.get("sources") or []:
            if s not in sources:
                sources.append(s)
        if src and src not in sources:
            sources.append(src)
        normalized["sources"] = sources
        normalized["firstSource"] = prev.get("firstSource") or (sources[0] if sources else "")

        seen = int(prev.get("seenCount") or 0)
        if touch or src:
            seen += 1
            normalized["lastSeenAt"] = now
        else:
            normalized["lastSeenAt"] = prev.get("lastSeenAt")
        if "seenCount" in patch:
            try:
                seen = max(seen, int(patch.get("seenCount") or 0))
            except (TypeError, ValueError):
                pass
        normalized["seenCount"] = seen
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
    out.sort(key=lambda m: (m.get("lastSeenAt") or m.get("updatedAt") or ""), reverse=True)
    return out


def member_stats() -> dict:
    members = list_members()
    with_username = sum(1 for m in members if m.get("username"))
    today = _today_display()
    new_today = sum(1 for m in members if m.get("registeredAt") == today)
    by_source: dict[str, int] = {}
    for m in members:
        key = m.get("firstSource") or "unknown"
        by_source[key] = by_source.get(key, 0) + 1
    return {
        "total": len(members),
        "withUsername": with_username,
        "newToday": new_today,
        "bySource": by_source,
        "updatedAt": load_store().get("updatedAt"),
    }


def replace_all_members(members: list) -> dict:
    cleaned = []
    for raw in members or []:
        member = normalize_member(raw)
        if member:
            cleaned.append(member)
    return save_store({"members": cleaned})


def touch_from_telegram_user(user, *, source: str = "bot", **extra) -> dict:
    """Record / refresh a member when they hit the bot or Mini App."""
    if user is None:
        raise ValueError("Missing user")
    user_id = int(getattr(user, "id", 0) or 0)
    if user_id <= 0:
        raise ValueError("Invalid user id")
    username = getattr(user, "username", None) or ""
    first = getattr(user, "first_name", None) or ""
    last = getattr(user, "last_name", None) or ""
    name = f"{first} {last}".strip() or (f"@{username}" if username else f"User {user_id}")
    photo = getattr(user, "photo_url", None) or ""
    patch = {
        "id": user_id,
        "username": username,
        "name": name,
        "photoUrl": photo,
    }
    for key in ("avatarDataUrl", "photoUrl", "name", "username"):
        if key in extra and extra[key]:
            patch[key] = extra[key]
    return upsert_member(patch, touch=True, source=source)
