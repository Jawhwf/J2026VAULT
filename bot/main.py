"""
J2026VaultBot
Official Telegram bot for J2026Vault.

Layout:
    bot/
      main.py              # this file
      config.py            # secrets (gitignored) — copy from config.example.py
      config.example.py
      requirements.txt
      assets/              # welcome / membership / help / menu banners
      run-bot.sh           # macOS / Linux
      run-bot.bat          # Windows
      logs/                # runtime logs (optional)

Run (from project root):
    ./run-bot.sh          # macOS / Linux
    run-bot.bat           # Windows

Or from this folder:
    ./run-bot.sh
    run-bot.bat
"""

import sys
import threading
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
    from config import MEMBERS_API_HOST, MEMBERS_API_PORT
except ImportError:
    MEMBERS_API_HOST = "0.0.0.0"
    MEMBERS_API_PORT = 8765

from members_store import list_members, touch_from_telegram_user
from members_api import is_owner_user, start_members_api

BOT_USERNAME = "J2026VaultBot"
ASSETS_DIR = Path(__file__).resolve().parent / "assets"

IMG_WELCOME = ASSETS_DIR / "welcome.png"
IMG_PREMIUM = ASSETS_DIR / "membership.png"
IMG_HELP = ASSETS_DIR / "help.png"
IMG_MENU = ASSETS_DIR / "menu.png"

# threaded=False avoids overlapping navigates fighting over the same panel
bot = TeleBot(API_TOKEN, parse_mode="HTML", threaded=False)

# chat_id -> {"current": screen_key|None, "stack": [...], "message_id": int|None}
_nav = {}
_nav_lock = threading.Lock()

_IMAGE_BYTES = {}
for _path in (IMG_WELCOME, IMG_PREMIUM, IMG_HELP, IMG_MENU):
    if _path.exists():
        _IMAGE_BYTES[_path] = _path.read_bytes()


MEMBERSHIP_TEXT = """
<b>💎 How To Buy Vault Access</b>

<b>Basic Membership — $5/month</b>
Access to the archive, including:
• Programs
• Games
• Movies
• TV Shows
• Editing plugins & packs
• Photo / Blender / Audio plugins
• Drumkits
• CEP extensions
• Music projects & leaks
• Discord stashes
• Movie / trusted sites
• Music trackers
• Steam methods

DM staff or owner to confirm.

<b>Lifetime Membership — $100 one-time</b>
• Permanent server access
• Early access to unreleased content
• Custom requests
• First access to new drops
• Resell permissions
• Direct help & tutorials

DM staff or owner to confirm.

<b>💳 Payment methods</b>
We currently accept:
• PayPal
• Cash App

We do <b>not</b> accept Bitcoin, crypto, or other apps at the moment.

DM staff or owner to pay / confirm.

Private members-only vault — real members only.
""".strip()


def welcome_text(first_name):
    return f"""
<b>👋 Welcome, {first_name}!</b>

Welcome to <b>J2026Vault</b> — the official gateway to the vault Mini App and membership archive.

Tap the <b>App</b> button at the bottom left to launch the vault, or join the community links below.

Send /membership for plans & payment info.
Send /help for commands.
""".strip()


HELP_TEXT = """
<b>📖 Help</b>

• /start — welcome screen
• /membership — plans & payments
• /help — this menu

<b>Open the vault</b>
Use the <b>App</b> button at the bottom left.

Questions? DM staff or owner.
""".strip()


MENU_TEXT = """
<b>🤖 J2026Vault Bot</b>

Use:
• /start — welcome
• /membership — Basic ($5/mo) & Lifetime ($100)
• /help — commands

Open the vault with the <b>App</b> button at the bottom left.
""".strip()


def screen_content(screen, first_name="there"):
    if screen == "start":
        return IMG_WELCOME, welcome_text(first_name)
    if screen == "membership":
        return IMG_PREMIUM, MEMBERSHIP_TEXT
    if screen == "help":
        return IMG_HELP, HELP_TEXT
    return IMG_MENU, MENU_TEXT


def photo_file(image_path):
    data = _IMAGE_BYTES.get(image_path)
    if data is None:
        if not image_path.exists():
            return None
        data = image_path.read_bytes()
        _IMAGE_BYTES[image_path] = data
    buf = BytesIO(data)
    buf.name = image_path.name
    return buf


def main_menu(show_back=False):
    markup = types.InlineKeyboardMarkup(row_width=1)
    markup.add(
        types.InlineKeyboardButton(
            "Join Telegram Community",
            url=TELEGRAM_COMMUNITY,
        )
    )
    markup.add(
        types.InlineKeyboardButton(
            "Join Discord",
            url=DISCORD_INVITE,
        )
    )
    if show_back:
        markup.add(
            types.InlineKeyboardButton(
                "🔙 Back",
                callback_data="nav:back",
            )
        )
    return markup


def delete_message_safe(chat_id, message_id):
    if not chat_id or not message_id:
        return
    try:
        bot.delete_message(chat_id, message_id)
    except Exception:
        pass


def send_banner(chat_id, image_path, caption, reply_markup=None):
    caption = (caption or "").strip()
    photo = photo_file(image_path)
    if photo is None:
        msg = bot.send_message(chat_id, caption or "Image missing.", reply_markup=reply_markup)
        return getattr(msg, "message_id", None)

    msg = bot.send_photo(
        chat_id,
        photo,
        caption=caption[:1024],
        reply_markup=reply_markup,
        parse_mode="HTML",
    )
    return getattr(msg, "message_id", None)


def edit_banner(chat_id, message_id, image_path, caption, reply_markup=None):
    """Update the existing panel in place. Never deletes."""
    caption = (caption or "").strip()[:1024]
    photo = photo_file(image_path)
    if photo is None or not message_id:
        return False
    try:
        media = types.InputMediaPhoto(media=photo, caption=caption, parse_mode="HTML")
        bot.edit_message_media(
            media=media,
            chat_id=chat_id,
            message_id=message_id,
            reply_markup=reply_markup,
        )
        return True
    except Exception as err:
        err_text = str(err).lower()
        # Same screen tapped again — treat as success, do not delete/resend
        if "message is not modified" in err_text or "exactly the same" in err_text:
            return True
        print(f"edit_banner failed ({chat_id}/{message_id}): {err}", flush=True)
        return False


def navigate(chat_id, screen, first_name="there", from_back=False, panel_message_id=None):
    with _nav_lock:
        state = _nav.setdefault(chat_id, {"current": None, "stack": [], "message_id": None})

        if from_back:
            if not state["stack"]:
                return False
            screen = state["stack"].pop()
        elif state["current"] and state["current"] != screen:
            state["stack"].append(state["current"])
            if len(state["stack"]) > 12:
                state["stack"] = state["stack"][-12:]

        state["current"] = screen
        image, caption = screen_content(screen, first_name)
        markup = main_menu(show_back=bool(state["stack"]))
        target_id = panel_message_id or state.get("message_id")

        # 1) Prefer editing the current panel (no delete)
        if target_id and edit_banner(chat_id, target_id, image, caption, reply_markup=markup):
            state["message_id"] = target_id
            return True

        # 2) No panel yet / edit impossible: send ONE new panel
        new_id = send_banner(chat_id, image, caption, reply_markup=markup)
        old_id = state.get("message_id")
        state["message_id"] = new_id

        # Only remove the old panel after the new one exists (and never in a loop)
        if old_id and new_id and old_id != new_id:
            delete_message_safe(chat_id, old_id)
        return True


def record_member(user):
    try:
        touch_from_telegram_user(user)
    except Exception as err:
        print(f"record_member failed: {err}", flush=True)


def handle_command(message, screen):
    first_name = message.from_user.first_name or "there"
    user_cmd_id = message.message_id
    chat_id = message.chat.id

    record_member(message.from_user)
    navigate(chat_id, screen, first_name=first_name)
    # Delete the user's /command bubble after the panel updates
    delete_message_safe(chat_id, user_cmd_id)


@bot.message_handler(commands=["start"])
def start(message):
    handle_command(message, "start")


@bot.message_handler(commands=["membership", "pricing", "buy"])
def membership(message):
    handle_command(message, "membership")


@bot.message_handler(commands=["help"])
def help_command(message):
    handle_command(message, "help")


@bot.message_handler(commands=["members"])
def members_command(message):
    """Owner-only quick list of registered members."""
    record_member(message.from_user)
    user = {
        "id": message.from_user.id,
        "username": message.from_user.username,
    }
    if not is_owner_user(user):
        try:
            bot.reply_to(message, "Owners only.")
        except Exception:
            pass
        return

    members = list_members()
    if not members:
        text = "No members registered yet.\nPeople appear after they /start the bot or open the Mini App."
    else:
        lines = [f"<b>Members ({len(members)})</b>", ""]
        for m in members[:40]:
            uname = f"@{m['username']}" if m.get("username") else "—"
            lines.append(
                f"• <b>{m.get('name') or 'User'}</b> ({uname})\n"
                f"  id <code>{m['id']}</code> · {m.get('plan', 'MORTAL')} · reg {m.get('registeredAt', '—')}"
            )
        if len(members) > 40:
            lines.append(f"\n…and {len(members) - 40} more")
        text = "\n".join(lines)
    try:
        bot.reply_to(message, text)
    except Exception:
        pass
    delete_message_safe(message.chat.id, message.message_id)


@bot.callback_query_handler(func=lambda call: call.data == "nav:back")
def on_back(call):
    first_name = call.from_user.first_name or "there"
    ok = navigate(
        call.message.chat.id,
        None,
        first_name=first_name,
        from_back=True,
        panel_message_id=call.message.message_id,
    )
    try:
        if ok:
            bot.answer_callback_query(call.id)
        else:
            bot.answer_callback_query(call.id, "Nothing to go back to")
    except Exception:
        pass


@bot.message_handler(func=lambda message: True)
def default_reply(message):
    # Don't touch the panel or delete random messages — avoids wipe/resend loops
    try:
        bot.reply_to(
            message,
            "Use /start, /membership, or /help.",
        )
    except Exception:
        pass


if __name__ == "__main__":
    print("=" * 40, flush=True)
    print(" J2026VaultBot is now running", flush=True)
    print("=" * 40, flush=True)
    print(f"Bot: @{BOT_USERNAME}", flush=True)
    print(f"Mini App: {WEBAPP_URL}", flush=True)
    print(f"Assets: {ASSETS_DIR}", flush=True)
    for label, path in (
        ("welcome", IMG_WELCOME),
        ("premium", IMG_PREMIUM),
        ("help", IMG_HELP),
        ("menu", IMG_MENU),
    ):
        print(f"  {label}: {'OK' if path.exists() else 'MISSING'} — {path.name}", flush=True)
    print(f"Loaded: {Path(__file__).resolve()}", flush=True)
    try:
        start_members_api(API_TOKEN, host=MEMBERS_API_HOST, port=int(MEMBERS_API_PORT))
        print(f"Members API: http://127.0.0.1:{MEMBERS_API_PORT}", flush=True)
        print("  (Expose with a tunnel for live Mini App sync, or upload members.json)", flush=True)
    except Exception as err:
        print(f"Members API failed to start: {err}", flush=True)
    print("Polling for updates...", flush=True)
    print("Press Ctrl+C to stop.\n", flush=True)

    try:
        bot.get_updates(offset=-1, timeout=1)
    except Exception as err:
        print(f"Startup sync skipped: {err}", flush=True)

    # skip_pending=False avoids an extra getUpdates clash right after another instance stops
    while True:
        try:
            bot.infinity_polling(timeout=20, long_polling_timeout=10, skip_pending=False)
            break
        except Exception as err:
            msg = str(err)
            if "409" in msg or "Conflict" in msg:
                print("Another getUpdates session is still closing — retrying in 3s...", flush=True)
                import time
                time.sleep(3)
                continue
            raise
