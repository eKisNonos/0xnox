import asyncio
import logging
from .listener import BridgeListener
from .processor import BridgeProcessor

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')

async def main():
    listener = BridgeListener()
    processor = BridgeProcessor()
    await asyncio.gather(listener.start(), processor.start())

def run():
    asyncio.run(main())
