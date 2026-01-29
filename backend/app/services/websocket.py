from fastapi import WebSocket
import asyncio

async def market_stream(ws: WebSocket):
    await ws.accept()
    while True:
        await ws.send_json({"symbol": "NIFTY", "price": 22350})
        await asyncio.sleep(2)
