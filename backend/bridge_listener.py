#!/usr/bin/env python3
import asyncio
import logging
import os
from dotenv import load_dotenv

load_dotenv()

handlers = [logging.StreamHandler()]
if os.path.exists('/var/log'):
    handlers.append(logging.FileHandler('/var/log/0xnox-bridge.log'))

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s', handlers=handlers)

from bridge.listener import BridgeListener
from bridge.processor import BridgeProcessor

async def main():
    listener = BridgeListener()
    processor = BridgeProcessor()
    await asyncio.gather(listener.start(), processor.start())

if __name__ == '__main__':
    asyncio.run(main())
