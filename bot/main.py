"""
J2026VaultBot — everything for the Telegram bot is in this folder.

  bot/
    main.py
    config.py              (gitignored — copy from config.example.py)
    config.example.py
    requirements.txt
    members_store.py
    members_api.py
    assets/                welcome / membership / help / menu images
    data/members.json      registered members
    logs/
    run-bot.sh
    run-bot.bat

Start:
  ./bot/run-bot.sh
  bot\\run-bot.bat
"""

from __future__ import annotations

import html
import re
import sys
import threading
import time
from io import BytesIO
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from telebot import TeleBot, types

from config import (
    API_TOKEN,
    WEBAPP_URL,
    TELEGRAM_COMMUNITY,
    DISCORD_INVITE,
)

try:
    from config import MEMBERS_API_HOST, MEMBERS_API_PORT, MEMBERS_API_PUBLIC_URL
except ImportError:
    MEMBERS_API_HOST = "0.0.0.0"
    MEMBERS_API_PORT = 8765
    MEMBERS_API_PUBLIC_URL = ""

from members_api import is_owner_user, start_members_api
from members_store import list_members, member_stats, touch_from_telegram_user

BOT_USERNAME = "J26VaultBot"
BOT_DIR = Path(__file__).resolve().parent
ASSETS_DIR = BOT_DIR / "assets"


def _asset(*names: str) -> Path:
    for name in names:
        path = ASSETS_DIR / name
        if path.exists():
            return path
    return ASSETS_DIR / names[0]


IMG_WELCOME = _asset("welcome.jpg", "welcome.png")
IMG_PREMIUM = _asset("membership.jpg", "membership.png")
IMG_HELP = _asset("help.jpg", "help.png")
IMG_MENU = _asset("menu.jpg", "menu.png")

PAYMENTS_DIR = ASSETS_DIR / "payments"
PAYMENT_METHODS = {
    "paypal": {
        "label": "PayPal",
        "card": PAYMENTS_DIR / "paypal-card.jpg",
        "banner": PAYMENTS_DIR / "paypal-banner.jpg",
        "qr": PAYMENTS_DIR / "paypal-qr.jpg",
    },
    "cashapp": {
        "label": "Cash App",
        "card": PAYMENTS_DIR / "cashapp-card.jpg",
        "banner": PAYMENTS_DIR / "cashapp-banner.jpg",
        "qr": PAYMENTS_DIR / "cashapp-qr.jpg",
    },
    "zelle": {
        "label": "Zelle",
        "card": PAYMENTS_DIR / "zelle-card.jpg",
        "banner": PAYMENTS_DIR / "zelle-banner.jpg",
        "qr": PAYMENTS_DIR / "zelle-qr.jpg",
    },
}

# How long payment QR stays up before returning to membership
PAYMENT_TTL_SEC = 7 * 60

bot = TeleBot(API_TOKEN, parse_mode="HTML", threaded=False)

_nav_lock = threading.Lock()
# chat_id -> last bot panel message id (single clean panel)
_last_panel: dict[int, int] = {}
# chat_id -> extra QR message ids (cleaned with the payment panel)
_payment_extras: dict[int, list[int]] = {}
_payment_timers: dict[int, threading.Timer] = {}
_image_cache: dict[Path, bytes] = {}
_welcomed: set[int] = set()


MEMBERSHIP_TEXT = """
<b>💎 How To Buy Vault Access</b>

<b>Basic Membership — $5/month</b>
Access to the archive, including programs, games, movies, TV, editing packs, plugins, drumkits, leaks, and more.

<b>Lifetime Membership — $100 one-time</b>
Everything in Basic, forever. No renewals.

<b>💳 Payment methods</b>
Tap <b>PayPal</b>, <b>Cash App</b>, or <b>Zelle</b> below to open the QR (stays up ~7 minutes).

After you pay, DM proof on <b>Discord</b>: screenshot + your name / email used to pay.

Need a hand? /help · or tap <b>Back</b> for the welcome screen.
""".strip()


def payment_text(method_key: str) -> str:
    label = PAYMENT_METHODS[method_key]["label"]
    mins = PAYMENT_TTL_SEC // 60
    return f"""
<b>💳 Pay with {html.escape(label)}</b>

Scan the QR below (or use the banner details).

This payment screen stays open for about <b>{mins} minutes</b>.

<b>After you pay</b> — DM proof on Discord:
• payment screenshot
• name / email used on the payment

Staff will confirm and unlock access.

Tap <b>Back</b> anytime to return to plans. /help if you need help.
""".strip()

def welcome_text(first_name: str) -> str:
    name = html.escape(str(first_name or "there"))
    return f"""
<b>👋 Welcome, {name}!</b>

Welcome to <b>J2026Vault</b>.

• Tap <b>App</b> (bottom left) to open the vault Mini App
• /membership — plans & payments
• /help — commands

Community links are below.
""".strip()


HELP_TEXT = """
<b>📖 Help</b>

• /start — welcome
• /membership — plans & payments
• /help — this menu

Open the vault with the <b>App</b> button at the bottom left.
Tap <b>Back</b> to return to welcome.
""".strip()


def screen_payload(screen: str, first_name: str):
    if screen == "start":
        return IMG_WELCOME, welcome_text(first_name)
    if screen == "membership":
        return IMG_PREMIUM, MEMBERSHIP_TEXT
    if screen.startswith("pay:"):
        method = screen.split(":", 1)[-1]
        info = PAYMENT_METHODS.get(method)
        if info:
            image = info["card"] if info["card"].exists() else info["banner"]
            return image, payment_text(method)
    return IMG_HELP, HELP_TEXT


def photo_buf(image_path: Path):
    if not image_path.exists():
        return None
    data = _image_cache.get(image_path)
    if data is None:
        data = image_path.read_bytes()
        _image_cache[image_path] = data
    buf = BytesIO(data)
    buf.name = image_path.name
    return buf


def screen_markup(screen: str) -> types.InlineKeyboardMarkup:
    markup = types.InlineKeyboardMarkup(row_width=1)
    if screen == "membership":
        markup.row(
            types.InlineKeyboardButton("PayPal", callback_data="pay:paypal"),
            types.InlineKeyboardButton("Cash App", callback_data="pay:cashapp"),
            types.InlineKeyboardButton("Zelle", callback_data="pay:zelle"),
        )
    elif screen.startswith("pay:"):
        markup.add(types.InlineKeyboardButton("Join Discord (send proof)", url=DISCORD_INVITE))
    markup.add(types.InlineKeyboardButton("Join Telegram Community", url=TELEGRAM_COMMUNITY))
    if not screen.startswith("pay:"):
        markup.add(types.InlineKeyboardButton("Join Discord", url=DISCORD_INVITE))
    if screen == "membership":
        markup.add(types.InlineKeyboardButton("⬅️ Back", callback_data="nav:start"))
    elif screen.startswith("pay:"):
        markup.add(types.InlineKeyboardButton("⬅️ Back to plans", callback_data="nav:membership"))
    elif screen == "help":
        markup.add(types.InlineKeyboardButton("⬅️ Back", callback_data="nav:start"))
    return markup


def cancel_payment_timer(chat_id: int, *, clear_extras: bool = True) -> None:
    with _nav_lock:
        timer = _payment_timers.pop(chat_id, None)
        extras = _payment_extras.pop(chat_id, []) if clear_extras else []
    if timer is not None:
        try:
            timer.cancel()
        except Exception:
            pass
    for mid in extras:
        safe_delete(chat_id, mid)


def clear_payment_extras(chat_id: int) -> None:
    with _nav_lock:
        extras = _payment_extras.pop(chat_id, [])
    for mid in extras:
        safe_delete(chat_id, mid)


def schedule_payment_expiry(chat_id: int, first_name: str) -> None:
    # Replace any previous timer, but keep the QR extras we just posted
    cancel_payment_timer(chat_id, clear_extras=False)

    def _expire():
        print(f"payment expired -> membership for {chat_id}", flush=True)
        clear_payment_extras(chat_id)
        with _nav_lock:
            _payment_timers.pop(chat_id, None)
        try:
            show_screen(chat_id, "membership", first_name)
        except Exception as err:
            print(f"payment expire restore failed {chat_id}: {err}", flush=True)

    timer = threading.Timer(PAYMENT_TTL_SEC, _expire)
    timer.daemon = True
    with _nav_lock:
        _payment_timers[chat_id] = timer
    timer.start()


def record_member(user, *, source: str = "bot") -> None:
    try:
        from avatars import fetch_profile_photo_data_url

        patch_extra = {}
        user_id = int(getattr(user, "id", 0) or 0)
        if user_id > 0:
            avatar = fetch_profile_photo_data_url(API_TOKEN, user_id)
            if avatar:
                patch_extra["avatarDataUrl"] = avatar
                patch_extra["photoUrl"] = ""
        touch_from_telegram_user(user, source=source, **patch_extra)
    except Exception as err:
        print(f"record_member failed: {err}", flush=True)


def safe_delete(chat_id: int, message_id: int | None) -> None:
    if not message_id:
        return
    try:
        bot.delete_message(chat_id, message_id)
    except Exception:
        pass


def show_screen(chat_id: int, screen: str, first_name: str, delete_message_id: int | None = None) -> bool:
    """
    Show one panel for this chat: replace the previous panel if present,
    then delete the user's command message to keep the chat clean.
    """
    # Leaving a payment screen (or switching methods) clears timed QR extras
    if not screen.startswith("pay:"):
        cancel_payment_timer(chat_id)
    else:
        clear_payment_extras(chat_id)

    image, caption = screen_payload(screen, first_name)
    markup = screen_markup(screen)
    caption = caption[:1024]
    photo = photo_buf(image)

    with _nav_lock:
        old_id = _last_panel.get(chat_id)

    # 1) Prefer editing the existing panel in place
    ok = False
    panel_id = old_id
    if old_id and photo is not None:
        try:
            media = types.InputMediaPhoto(photo, caption=caption, parse_mode="HTML")
            bot.edit_message_media(
                media=media,
                chat_id=chat_id,
                message_id=old_id,
                reply_markup=markup,
            )
            print(f"edited panel /{screen} -> {chat_id} msg={old_id}", flush=True)
            ok = True
            panel_id = old_id
        except Exception as err:
            print(f"edit_message_media failed /{screen} {chat_id}: {err}", flush=True)

    if not ok and old_id:
        try:
            bot.edit_message_caption(
                caption=caption,
                chat_id=chat_id,
                message_id=old_id,
                reply_markup=markup,
                parse_mode="HTML",
            )
            print(f"edited caption /{screen} -> {chat_id} msg={old_id}", flush=True)
            ok = True
            panel_id = old_id
        except Exception as err:
            print(f"edit_message_caption failed /{screen} {chat_id}: {err}", flush=True)
            safe_delete(chat_id, old_id)
            panel_id = None

    # 2) Send a fresh panel
    if not ok:
        new_id = None
        if photo is not None:
            try:
                photo = photo_buf(image)
                photo_msg = bot.send_photo(
                    chat_id,
                    photo,
                    caption=caption,
                    reply_markup=markup,
                    parse_mode="HTML",
                )
                new_id = getattr(photo_msg, "message_id", None)
                ok = True
                print(f"sent photo /{screen} -> {chat_id}", flush=True)
            except Exception as err:
                print(f"send_photo failed /{screen} {chat_id}: {err}", flush=True)

        if not ok:
            try:
                msg = bot.send_message(chat_id, caption, reply_markup=markup, parse_mode="HTML")
                new_id = getattr(msg, "message_id", None)
                ok = True
                print(f"sent text /{screen} -> {chat_id}", flush=True)
            except Exception as err:
                print(f"send_message failed /{screen} {chat_id}: {err}", flush=True)
                try:
                    plain = re.sub(r"<[^>]+>", "", caption)
                    msg = bot.send_message(chat_id, plain or "Welcome to J2026Vault.", reply_markup=markup)
                    new_id = getattr(msg, "message_id", None)
                    ok = True
                except Exception as err2:
                    print(f"plain fallback failed /{screen} {chat_id}: {err2}", flush=True)
                    safe_delete(chat_id, delete_message_id)
                    return False
        panel_id = new_id
        if new_id:
            with _nav_lock:
                _last_panel[chat_id] = new_id

    # Payment screens auto-return to membership after TTL
    if ok and screen.startswith("pay:"):
        schedule_payment_expiry(chat_id, first_name)

    safe_delete(chat_id, delete_message_id)
    return ok


def handle_command(message, screen: str) -> None:
    user = message.from_user
    chat_id = message.chat.id
    first_name = (user.first_name if user else None) or "there"
    print(
        f"cmd /{screen} from {chat_id} (@{getattr(user, 'username', None) or '-'}) text={message.text!r}",
        flush=True,
    )
    record_member(user)
    ok = show_screen(chat_id, screen, first_name, delete_message_id=message.message_id)
    print(f"cmd /{screen} -> {'ok' if ok else 'FAIL'} for {chat_id}", flush=True)


@bot.message_handler(commands=["start"])
def on_start(message):
    _welcomed.add(message.chat.id)
    handle_command(message, "start")


@bot.message_handler(commands=["membership", "pricing", "buy"])
def on_membership(message):
    _welcomed.add(message.chat.id)
    handle_command(message, "membership")


@bot.message_handler(commands=["help"])
def on_help(message):
    _welcomed.add(message.chat.id)
    handle_command(message, "help")


@bot.callback_query_handler(func=lambda c: bool(c.data) and c.data.startswith("nav:"))
def on_nav(call: types.CallbackQuery):
    screen = (call.data or "").split(":", 1)[-1]
    if screen not in {"start", "membership", "help"}:
        bot.answer_callback_query(call.id)
        return
    user = call.from_user
    chat_id = call.message.chat.id if call.message else None
    if not chat_id:
        bot.answer_callback_query(call.id)
        return
    first_name = (user.first_name if user else None) or "there"
    record_member(user)
    _welcomed.add(chat_id)
    with _nav_lock:
        if call.message and call.message.message_id:
            _last_panel[chat_id] = call.message.message_id
    ok = show_screen(chat_id, screen, first_name)
    bot.answer_callback_query(call.id)
    print(f"nav {screen} -> {'ok' if ok else 'FAIL'} for {chat_id}", flush=True)


@bot.callback_query_handler(func=lambda c: bool(c.data) and c.data.startswith("pay:"))
def on_pay(call: types.CallbackQuery):
    method = (call.data or "").split(":", 1)[-1]
    if method not in PAYMENT_METHODS:
        bot.answer_callback_query(call.id, text="Unknown payment method")
        return
    user = call.from_user
    chat_id = call.message.chat.id if call.message else None
    if not chat_id:
        bot.answer_callback_query(call.id)
        return
    first_name = (user.first_name if user else None) or "there"
    record_member(user)
    _welcomed.add(chat_id)
    with _nav_lock:
        if call.message and call.message.message_id:
            _last_panel[chat_id] = call.message.message_id
    label = PAYMENT_METHODS[method]["label"]
    bot.answer_callback_query(call.id, text=f"Opening {label}…")
    ok = show_screen(chat_id, f"pay:{method}", first_name)
    print(f"pay {method} -> {'ok' if ok else 'FAIL'} for {chat_id}", flush=True)


@bot.message_handler(commands=["members"])
def on_members(message):
    record_member(message.from_user)
    user = {"id": message.from_user.id, "username": message.from_user.username}
    if not is_owner_user(user):
        bot.reply_to(message, "Owners only.")
        return
    members = list_members()
    stats = member_stats()
    if not members:
        bot.reply_to(message, "No members yet. They appear after /start or Mini App open.")
        return
    lines = [
        f"<b>Members ({stats.get('total', len(members))})</b>",
        f"Usernames: {stats.get('withUsername', 0)} · New today: {stats.get('newToday', 0)}",
        "",
    ]
    for m in members[:40]:
        uname = f"@{m['username']}" if m.get("username") else "—"
        via = m.get("firstSource") or "—"
        lines.append(
            f"• <b>{html.escape(str(m.get('name') or 'User'))}</b> ({html.escape(uname)})\n"
            f"  id <code>{m['id']}</code> · {m.get('plan', 'MORTAL')} · via {html.escape(str(via))} · reg {m.get('registeredAt', '—')}"
        )
    if len(members) > 40:
        lines.append(f"\n…and {len(members) - 40} more")
    bot.reply_to(message, "\n".join(lines))


@bot.message_handler(
    func=lambda m: bool(m.text) and m.text.strip().lower() in {"start", "help", "membership"}
)
def on_plain(message):
    key = message.text.strip().lower()
    _welcomed.add(message.chat.id)
    handle_command(message, key)


@bot.message_handler(func=lambda m: True, content_types=["text"])
def on_other_text(message):
    if getattr(message.chat, "type", "") != "private":
        return
    text = (message.text or "").strip()
    if not text or text.startswith("/"):
        return
    chat_id = message.chat.id
    if chat_id not in _welcomed:
        _welcomed.add(chat_id)
        handle_command(message, "start")
        return
    tip = bot.reply_to(
        message,
        "Use /start, /membership, or /help.\nOr tap <b>App</b> to open the vault.",
        parse_mode="HTML",
    )
    # Soft cleanup: remove tip + user noise after a moment isn't needed; leave tip.


if __name__ == "__main__":
    print("=" * 40, flush=True)
    print(" J2026VaultBot is now running", flush=True)
    print("=" * 40, flush=True)
    print(f"Bot: @{BOT_USERNAME}", flush=True)
    print(f"Mini App: {WEBAPP_URL}", flush=True)
    print(f"Folder: {BOT_DIR}", flush=True)
    for label, path in (
        ("welcome", IMG_WELCOME),
        ("premium", IMG_PREMIUM),
        ("help", IMG_HELP),
        ("menu", IMG_MENU),
        ("paypal-card", PAYMENT_METHODS["paypal"]["card"]),
        ("cashapp-card", PAYMENT_METHODS["cashapp"]["card"]),
        ("zelle-card", PAYMENT_METHODS["zelle"]["card"]),
    ):
        print(f"  {label}: {'OK' if path.exists() else 'MISSING'} — {path.name}", flush=True)

    try:
        bot.set_my_commands([
            types.BotCommand("start", "Welcome"),
            types.BotCommand("membership", "Plans & payments"),
            types.BotCommand("help", "Commands"),
        ])
        print("Bot commands registered", flush=True)
    except Exception as err:
        print(f"set_my_commands failed: {err}", flush=True)

    try:
        start_members_api(API_TOKEN, host=MEMBERS_API_HOST, port=int(MEMBERS_API_PORT))
        print(f"Members API: http://127.0.0.1:{MEMBERS_API_PORT}", flush=True)
    except Exception as err:
        print(f"Members API failed: {err}", flush=True)

    public_api = str(MEMBERS_API_PUBLIC_URL or "").strip().rstrip("/")
    if public_api:
        try:
            import json as _json
            from datetime import datetime, timezone

            out = BOT_DIR.parent / "members-api-url.json"
            out.write_text(
                _json.dumps(
                    {
                        "url": public_api,
                        "updatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
                    },
                    indent=2,
                )
                + "\n",
                encoding="utf-8",
            )
            print(f"Public members API URL written: {public_api}", flush=True)
        except Exception as err:
            print(f"members-api-url.json write failed: {err}", flush=True)
    else:
        print(
            "Tip: set MEMBERS_API_PUBLIC_URL or run ./bot/run-public-api.sh so Mini App users sync live.",
            flush=True,
        )

    # Ensure root members.json mirror exists for GitHub Pages
    try:
        from members_store import load_store, save_store

        save_store(load_store())
        print(f"Members mirror: {BOT_DIR.parent / 'members.json'}", flush=True)
    except Exception as err:
        print(f"members mirror skipped: {err}", flush=True)

    try:
        bot.delete_webhook(drop_pending_updates=False)
    except Exception as err:
        print(f"delete_webhook skipped: {err}", flush=True)

    print("Polling for updates...", flush=True)
    print("Press Ctrl+C to stop.\n", flush=True)

    while True:
        try:
            bot.infinity_polling(timeout=20, long_polling_timeout=10, skip_pending=False)
            break
        except Exception as err:
            msg = str(err)
            if "409" in msg or "Conflict" in msg:
                print("getUpdates conflict — retrying in 3s...", flush=True)
                time.sleep(3)
                continue
            raise
