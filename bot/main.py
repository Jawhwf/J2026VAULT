"""
J2026VaultBot
Official Telegram bot for J2026Vault.

Run:
    cd /Users/j2025/Desktop/J2026VaultBot
    source .venv/bin/activate
    python bot/main.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from telebot import TeleBot, types

from config import (
    API_TOKEN,
    WEBAPP_URL,
    TELEGRAM_COMMUNITY,
    DISCORD_INVITE,
)

BOT_USERNAME = "J2026VaultBot"
ASSETS_DIR = Path(__file__).resolve().parent / "assets"

IMG_WELCOME = ASSETS_DIR / "welcome.png"
IMG_PREMIUM = ASSETS_DIR / "membership.png"
IMG_HELP = ASSETS_DIR / "help.png"
IMG_MENU = ASSETS_DIR / "menu.png"

bot = TeleBot(API_TOKEN, parse_mode="HTML")


def main_menu():
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
    return markup


def send_banner(chat_id, image_path, caption, reply_markup=None):
    """Send a local PNG with caption + buttons. Falls back if caption is too long."""
    caption = (caption or "").strip()
    if not image_path.exists():
        bot.send_message(chat_id, caption or "Image missing.", reply_markup=reply_markup)
        return

    with open(image_path, "rb") as photo:
        if len(caption) <= 1024:
            bot.send_photo(
                chat_id,
                photo,
                caption=caption,
                reply_markup=reply_markup,
                parse_mode="HTML",
            )
            return
        bot.send_photo(chat_id, photo)

    bot.send_message(chat_id, caption, reply_markup=reply_markup)


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


@bot.message_handler(commands=["start"])
def start(message):
    first_name = message.from_user.first_name or "there"
    text = f"""
<b>👋 Welcome, {first_name}!</b>

Welcome to <b>J2026Vault</b> — the official gateway to the vault Mini App and membership archive.

Tap the <b>App</b> button at the bottom left to launch the vault, or join the community links below.

Send /membership for plans & payment info.
Send /help for commands.
""".strip()
    send_banner(message.chat.id, IMG_WELCOME, text, reply_markup=main_menu())


@bot.message_handler(commands=["membership", "pricing", "buy"])
def membership(message):
    send_banner(message.chat.id, IMG_PREMIUM, MEMBERSHIP_TEXT, reply_markup=main_menu())


@bot.message_handler(commands=["help"])
def help_command(message):
    text = """
<b>📖 Help</b>

• /start — welcome screen
• /membership — plans & payments
• /help — this menu

<b>Open the vault</b>
Use the <b>App</b> button at the bottom left.

<b>Community</b>
💬 Telegram community
🎮 Discord

Questions? DM staff or owner.
""".strip()
    send_banner(message.chat.id, IMG_HELP, text, reply_markup=main_menu())


@bot.message_handler(func=lambda message: True)
def default_reply(message):
    text = """
<b>🤖 J2026Vault Bot</b>

Use:
• /start — welcome
• /membership — Basic ($5/mo) & Lifetime ($100)
• /help — commands

Open the vault with the <b>App</b> button at the bottom left.
""".strip()
    send_banner(message.chat.id, IMG_MENU, text, reply_markup=main_menu())


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
    print("Polling for updates...", flush=True)
    print("Press Ctrl+C to stop.\n", flush=True)

    try:
        bot.get_updates(offset=-1, timeout=1)
    except Exception as err:
        print(f"Startup sync skipped: {err}", flush=True)

    bot.infinity_polling(timeout=60, long_polling_timeout=50)
