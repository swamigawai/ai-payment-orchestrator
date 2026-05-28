import os
import asyncio
from dotenv import load_dotenv
load_dotenv()
from telegram.ext import Application

async def main():
    token = os.environ.get("TELEGRAM_TOKEN")
    print(f"Loaded Token: {token}")
    try:
        app = Application.builder().token(token).build()
        await app.initialize()
        await app.start()
        me = await app.bot.get_me()
        print(f"Success! Bot connected as: {me.username}")
        await app.stop()
        await app.shutdown()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
