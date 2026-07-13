"""Tiny HTTP API for Mini App member sync (stdlib only).

Also serves the Mini App static files from the project root so a public tunnel
can host both the UI and /api on the same HTTPS origin.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import mimetypes
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

from members_store import (
    get_member,
    list_members,
    member_stats,
    normalize_member,
    replace_all_members,
    upsert_member,
)
from catalog_store import list_products, replace_all_products
from accent_store import load_accent, set_accent, VALID_THEMES
from avatars import fetch_profile_photo_data_url

OWNER_IDS = {6690519994, 1866326493}
OWNER_USERNAMES = {"j2026vault", "kiselomlqko", "yogurt"}

STATIC_ROOT = Path(__file__).resolve().parent.parent
_STATIC_BLOCK = (
    ".venv/",
    ".git/",
    "bot/config.py",
    "bot/logs/",
    "bot/data/",
    "bot/__pycache__/",
)


def _parse_init_data(init_data: str) -> dict:
    pairs = parse_qs(init_data, keep_blank_values=True)
    return {k: (v[0] if isinstance(v, list) and v else "") for k, v in pairs.items()}


def validate_init_data(init_data: str, bot_token: str) -> dict | None:
    """Validate Telegram WebApp initData. Returns parsed user dict or None."""
    if not init_data or not bot_token:
        return None
    parsed = _parse_init_data(init_data)
    received_hash = parsed.pop("hash", None)
    if not received_hash:
        return None

    data_check = "\n".join(f"{k}={parsed[k]}" for k in sorted(parsed.keys()))
    secret_key = hmac.new(b"WebAppData", bot_token.encode("utf-8"), hashlib.sha256).digest()
    expected = hmac.new(secret_key, data_check.encode("utf-8"), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, received_hash):
        return None

    user_raw = parsed.get("user")
    if not user_raw:
        return None
    try:
        user = json.loads(user_raw)
    except json.JSONDecodeError:
        return None
    if not isinstance(user, dict) or not user.get("id"):
        return None
    return user


def is_owner_user(user: dict | None) -> bool:
    if not user:
        return False
    try:
        uid = int(user.get("id") or 0)
    except (TypeError, ValueError):
        uid = 0
    if uid in OWNER_IDS:
        return True
    uname = str(user.get("username") or "").lstrip("@").strip().lower()
    return bool(uname and uname in OWNER_USERNAMES)


def build_handler(bot_token: str):
    class MembersHandler(BaseHTTPRequestHandler):
        def log_message(self, fmt, *args):
            print(f"[members-api] {self.address_string()} - {fmt % args}", flush=True)

        def _cors(self):
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Telegram-Init-Data")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")

        def _json(self, code: int, payload: dict):
            body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.send_response(code)
            self._cors()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def _read_json(self) -> dict:
            length = int(self.headers.get("Content-Length") or 0)
            if length <= 0:
                return {}
            raw = self.rfile.read(length)
            try:
                data = json.loads(raw.decode("utf-8"))
            except (UnicodeDecodeError, json.JSONDecodeError):
                return {}
            return data if isinstance(data, dict) else {}

        def _auth_user(self):
            init_data = self.headers.get("X-Telegram-Init-Data") or ""
            if not init_data:
                # Also allow query param for simple GETs while debugging
                qs = parse_qs(urlparse(self.path).query)
                init_data = (qs.get("initData") or [""])[0]
            return validate_init_data(init_data, bot_token)

        def do_OPTIONS(self):
            self.send_response(204)
            self._cors()
            self.end_headers()

        def _blocked_static(self, rel: str) -> bool:
            norm = rel.replace("\\", "/").lstrip("/")
            lower = norm.lower()
            for prefix in _STATIC_BLOCK:
                if lower == prefix.rstrip("/").lower() or lower.startswith(prefix.lower()):
                    return True
            if lower.endswith(".py") and lower.startswith("bot/"):
                return True
            return False

        def _serve_static(self) -> bool:
            raw = unquote(urlparse(self.path).path or "/")
            if raw.startswith("/api/") or raw in (
                "/api",
                "/health",
                "/catalog",
                "/products",
                "/accent",
                "/theme",
                "/me",
                "/members",
                "/stats",
            ):
                return False
            rel = "index.html" if raw in ("", "/") else raw.lstrip("/")
            if ".." in Path(rel).parts or self._blocked_static(rel):
                self._json(404, {"ok": False, "error": "Not found"})
                return True
            file_path = (STATIC_ROOT / rel).resolve()
            try:
                file_path.relative_to(STATIC_ROOT.resolve())
            except ValueError:
                self._json(404, {"ok": False, "error": "Not found"})
                return True
            if not file_path.is_file():
                return False
            try:
                data = file_path.read_bytes()
            except OSError:
                self._json(404, {"ok": False, "error": "Not found"})
                return True
            ctype = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
            self.send_response(200)
            self._cors()
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(data)
            return True

        def do_GET(self):
            path = urlparse(self.path).path.rstrip("/") or "/"

            # Public health probe (used by Mini App / tunnel checks)
            if path in ("/api/health", "/health"):
                return self._json(200, {"ok": True, "service": "j2026vault-members"})

            # Public catalog read (same data mirrored to products.json for Pages)
            if path in ("/api/catalog", "/catalog", "/api/products", "/products"):
                products = list_products()
                return self._json(200, {"ok": True, "count": len(products), "products": products})

            # Public accent theme (shared across Telegram / browser / local via mirror file)
            if path in ("/api/accent", "/accent", "/api/theme", "/theme"):
                data = load_accent()
                return self._json(200, {"ok": True, **data})

            # Public discovery file for the live API base (same origin when tunneled)
            if path in ("/api/public-url", "/public-url"):
                try:
                    from public_tunnel import current_public_url

                    url = current_public_url() or ""
                except Exception:
                    url = ""
                if not url:
                    try:
                        data = json.loads((STATIC_ROOT / "members-api-url.json").read_text(encoding="utf-8"))
                        url = str((data or {}).get("url") or "").strip()
                    except Exception:
                        url = ""
                return self._json(200, {"ok": True, "url": url})

            if self._serve_static():
                return

            user = self._auth_user()
            if not user:
                return self._json(401, {"ok": False, "error": "Unauthorized"})

            if path in ("/api/stats", "/stats"):
                if not is_owner_user(user):
                    return self._json(403, {"ok": False, "error": "Owners only"})
                return self._json(200, {"ok": True, "stats": member_stats(), "members": list_members()})

            if path in ("/api/me", "/me"):
                member = get_member(int(user["id"]))
                return self._json(200, {"ok": True, "user": user, "member": member})

            if path in ("/api/members", "/members"):
                if not is_owner_user(user):
                    return self._json(403, {"ok": False, "error": "Owners only"})
                members = list_members()
                return self._json(
                    200,
                    {
                        "ok": True,
                        "count": len(members),
                        "stats": member_stats(),
                        "members": members,
                    },
                )

            return self._json(404, {"ok": False, "error": "Not found"})

        def do_POST(self):
            path = urlparse(self.path).path.rstrip("/") or "/"
            user = self._auth_user()
            if not user:
                return self._json(401, {"ok": False, "error": "Unauthorized"})
            body = self._read_json()

            # Any authenticated Mini App user can save the shared accent theme
            if path in ("/api/accent", "/accent", "/api/theme", "/theme"):
                theme = str(body.get("theme") or body.get("id") or "").strip().lower()
                if theme not in VALID_THEMES:
                    return self._json(400, {"ok": False, "error": "Invalid theme", "allowed": sorted(VALID_THEMES)})
                data = set_accent(theme)
                return self._json(200, {"ok": True, **data})

            if path in ("/api/me/sync", "/me/sync", "/api/heartbeat", "/heartbeat"):
                source = str(body.get("source") or "webapp").strip().lower()
                if source not in {"bot", "webapp", "web", "editor", "manual"}:
                    source = "webapp"
                uid = int(user["id"])
                photo_url = str(body.get("photoUrl") or user.get("photo_url") or "").strip()
                patch = {
                    "id": uid,
                    "username": user.get("username") or "",
                    "name": body.get("name")
                    or f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
                    or (f"@{user.get('username')}" if user.get("username") else f"User {user['id']}"),
                    "photoUrl": photo_url,
                }
                for key in ("downloads", "purchases", "registeredAt"):
                    if key in body:
                        patch[key] = body[key]

                # Custom Mini App upload sticks; otherwise always refresh from Telegram
                # so PFP changes in Telegram show up on the next Mini App open.
                avatar_custom = bool(body.get("avatarCustom") or body.get("customAvatar"))
                avatar = str(body.get("avatarDataUrl") or "").strip()
                if avatar_custom and avatar.startswith("data:image") and len(avatar) >= 2000:
                    patch["avatarDataUrl"] = avatar
                    patch["avatarCustom"] = True
                else:
                    patch["avatarCustom"] = False
                    fetched = fetch_profile_photo_data_url(bot_token, uid)
                    if fetched:
                        patch["avatarDataUrl"] = fetched
                        patch["photoUrl"] = photo_url or ""
                    elif photo_url:
                        patch["photoUrl"] = photo_url

                if is_owner_user(user) and "plan" in body:
                    patch["plan"] = body.get("plan")
                    if "endsAt" in body:
                        patch["endsAt"] = body.get("endsAt")
                store = upsert_member(patch, touch=True, source=source)
                member = get_member(uid)
                return self._json(
                    200,
                    {
                        "ok": True,
                        "member": member,
                        "count": len(store.get("members") or []),
                        "stats": member_stats() if is_owner_user(user) else None,
                    },
                )

            if path in ("/api/members", "/members"):
                if not is_owner_user(user):
                    return self._json(403, {"ok": False, "error": "Owners only"})
                member = normalize_member(body)
                if not member:
                    return self._json(400, {"ok": False, "error": "Invalid member"})
                upsert_member(member)
                return self._json(200, {"ok": True, "member": get_member(member["id"]), "members": list_members()})

            # POST /api/me/refresh-avatar — any user can refresh their own Telegram PFP
            if path in ("/api/me/refresh-avatar", "/me/refresh-avatar"):
                uid = int(user["id"])
                avatar = fetch_profile_photo_data_url(bot_token, uid)
                if not avatar:
                    return self._json(
                        404,
                        {
                            "ok": False,
                            "error": "No Telegram photo found — set a profile photo in Telegram, then reopen",
                        },
                    )
                upsert_member(
                    {
                        "id": uid,
                        "avatarDataUrl": avatar,
                        "photoUrl": "",
                        "avatarCustom": False,
                    },
                    touch=True,
                    source="webapp",
                )
                return self._json(200, {"ok": True, "member": get_member(uid)})

            # POST /api/members/<id>/refresh-avatar
            parts = [p for p in path.split("/") if p]
            if len(parts) >= 3 and parts[-1] == "refresh-avatar":
                try:
                    member_id = int(parts[-2])
                except ValueError:
                    return self._json(400, {"ok": False, "error": "Invalid id"})
                # Owners can refresh anyone; members can only refresh themselves
                if not is_owner_user(user) and int(user["id"]) != member_id:
                    return self._json(403, {"ok": False, "error": "Owners only"})
                avatar = fetch_profile_photo_data_url(bot_token, member_id)
                if not avatar:
                    return self._json(
                        404,
                        {
                            "ok": False,
                            "error": "No Telegram photo yet — they must /start the bot or open the Mini App",
                        },
                    )
                upsert_member(
                    {
                        "id": member_id,
                        "avatarDataUrl": avatar,
                        "photoUrl": "",
                        "avatarCustom": False,
                    },
                    source="editor",
                )
                return self._json(
                    200,
                    {"ok": True, "member": get_member(member_id), "members": list_members()},
                )

            return self._json(404, {"ok": False, "error": "Not found"})

        def do_PUT(self):
            path = urlparse(self.path).path.rstrip("/") or "/"
            user = self._auth_user()
            if not user:
                return self._json(401, {"ok": False, "error": "Unauthorized"})
            if not is_owner_user(user):
                return self._json(403, {"ok": False, "error": "Owners only"})
            body = self._read_json()

            if path in ("/api/members", "/members"):
                members = body.get("members")
                if not isinstance(members, list):
                    return self._json(400, {"ok": False, "error": "members array required"})
                store = replace_all_members(members)
                return self._json(200, {"ok": True, "count": len(store.get("members") or []), "members": list_members()})

            if path in ("/api/catalog", "/catalog", "/api/products", "/products"):
                products = body.get("products")
                if not isinstance(products, list):
                    return self._json(400, {"ok": False, "error": "products array required"})
                existing = list_products()
                # Guard against accidental wipes (failed client payloads / empty PUT)
                if len(products) == 0 and len(existing) > 0 and not body.get("forceEmpty"):
                    return self._json(
                        400,
                        {
                            "ok": False,
                            "error": "Refusing to wipe catalog with an empty list",
                            "count": len(existing),
                        },
                    )
                store = replace_all_products(products)
                return self._json(
                    200,
                    {"ok": True, "count": len(store.get("products") or []), "products": list_products()},
                )

            if path.startswith("/api/members/") or path.startswith("/members/"):
                parts = [p for p in path.split("/") if p]
                # /api/members/<id>/refresh-avatar
                if len(parts) >= 3 and parts[-1] == "refresh-avatar":
                    try:
                        member_id = int(parts[-2])
                    except ValueError:
                        return self._json(400, {"ok": False, "error": "Invalid id"})
                    avatar = fetch_profile_photo_data_url(bot_token, member_id)
                    if not avatar:
                        return self._json(
                            404,
                            {
                                "ok": False,
                                "error": "No Telegram photo yet — they must /start the bot or open the Mini App",
                            },
                        )
                    upsert_member(
                        {
                            "id": member_id,
                            "avatarDataUrl": avatar,
                            "photoUrl": "",
                            "avatarCustom": False,
                        },
                        source="editor",
                    )
                    return self._json(
                        200,
                        {"ok": True, "member": get_member(member_id), "members": list_members()},
                    )

                tail = path.split("/")[-1]
                try:
                    member_id = int(tail)
                except ValueError:
                    return self._json(400, {"ok": False, "error": "Invalid id"})
                body["id"] = member_id
                member = normalize_member(body)
                if not member:
                    return self._json(400, {"ok": False, "error": "Invalid member"})
                upsert_member(body, source="editor")
                return self._json(200, {"ok": True, "member": get_member(member_id), "members": list_members()})

            return self._json(404, {"ok": False, "error": "Not found"})

    return MembersHandler


def start_members_api(bot_token: str, host: str = "0.0.0.0", port: int = 8765) -> ThreadingHTTPServer:
    handler = build_handler(bot_token)
    server = ThreadingHTTPServer((host, port), handler)
    thread = threading.Thread(target=server.serve_forever, name="members-api", daemon=True)
    thread.start()
    print(f"[members-api] listening on http://{host}:{port}", flush=True)
    return server
