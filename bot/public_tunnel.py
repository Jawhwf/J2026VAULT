"""Expose the local members API on a public HTTPS URL (Pinggy free tunnel).

Cloudflare quick tunnels are unreliable from this network; Pinggy via SSH works.
The URL changes whenever the tunnel restarts — callers should update the Telegram
Mini App menu button so every user receives the fresh ?api= URL automatically.
"""

from __future__ import annotations

import json
import re
import subprocess
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

ROOT = Path(__file__).resolve().parent.parent
OUT_FILE = ROOT / "members-api-url.json"

_URL_RE = re.compile(
    r"https://[a-zA-Z0-9.-]+\.(?:free\.pinggy\.net|run\.pinggy-free\.link)",
    re.IGNORECASE,
)

_lock = threading.Lock()
_current_url = ""
_stop = threading.Event()


def current_public_url() -> str:
    with _lock:
        return _current_url


def write_members_api_url(url: str) -> None:
    clean = str(url or "").strip().rstrip("/")
    payload = {
        "url": clean,
        "updatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "note": "Auto-written by the bot tunnel. Mini App also receives this via ?api= on the menu button.",
    }
    OUT_FILE.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def _pick_https_url(text: str) -> str:
    found = _URL_RE.findall(text or "")
    if not found:
        return ""
    for u in found:
        if "free.pinggy.net" in u.lower():
            return u.rstrip("/")
    return found[0].rstrip("/")


def _publish(url: str, on_url: Callable[[str], None] | None) -> None:
    global _current_url
    clean = str(url or "").strip().rstrip("/")
    if not clean:
        return
    with _lock:
        if clean == _current_url:
            return
        _current_url = clean
    try:
        write_members_api_url(clean)
    except Exception as err:
        print(f"[public-tunnel] write members-api-url.json failed: {err}", flush=True)
    print(f"[public-tunnel] public API: {clean}", flush=True)
    if on_url:
        try:
            on_url(clean)
        except Exception as err:
            print(f"[public-tunnel] on_url callback failed: {err}", flush=True)


def start_public_tunnel(
    port: int = 8765,
    on_url: Callable[[str], None] | None = None,
) -> None:
    """Start a background loop that keeps a Pinggy tunnel alive."""

    def worker() -> None:
        while not _stop.is_set():
            cmd = [
                "ssh",
                "-p",
                "443",
                "-o",
                "StrictHostKeyChecking=no",
                "-o",
                "UserKnownHostsFile=/dev/null",
                "-o",
                "ServerAliveInterval=30",
                "-o",
                "ServerAliveCountMax=3",
                "-o",
                "ExitOnForwardFailure=yes",
                "-R0:127.0.0.1:%d" % int(port),
                "a.pinggy.io",
            ]
            print(f"[public-tunnel] starting Pinggy → 127.0.0.1:{port}", flush=True)
            try:
                proc = subprocess.Popen(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    bufsize=1,
                )
            except FileNotFoundError:
                print("[public-tunnel] ssh not found — cannot expose public API", flush=True)
                return
            except Exception as err:
                print(f"[public-tunnel] failed to start: {err}", flush=True)
                time.sleep(5)
                continue

            best = ""
            published = False
            try:
                assert proc.stdout is not None
                for line in proc.stdout:
                    if _stop.is_set():
                        break
                    line = line.rstrip()
                    if line and (
                        "http" in line.lower()
                        or "authenticated" in line.lower()
                        or "expire" in line.lower()
                    ):
                        print(f"[public-tunnel] {line[:240]}", flush=True)

                    url = _pick_https_url(line)
                    if not url:
                        continue

                    # Upgrade to free.pinggy.net if we only saw the .link host first
                    if (not best) or (
                        "free.pinggy.net" in url.lower()
                        and "free.pinggy.net" not in best.lower()
                    ):
                        best = url
                        _publish(best, on_url)
                        published = True
            finally:
                if best and not published:
                    _publish(best, on_url)
                try:
                    proc.terminate()
                except Exception:
                    pass
                try:
                    proc.wait(timeout=5)
                except Exception:
                    try:
                        proc.kill()
                    except Exception:
                        pass

            if _stop.is_set():
                break
            print("[public-tunnel] disconnected — reconnecting in 4s…", flush=True)
            time.sleep(4)

    thread = threading.Thread(target=worker, name="public-tunnel", daemon=True)
    thread.start()


def stop_public_tunnel() -> None:
    _stop.set()
