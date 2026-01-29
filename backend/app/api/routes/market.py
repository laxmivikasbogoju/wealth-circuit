from fastapi import APIRouter, WebSocket
from app.services.market_data import MarketDataService
from app.services.websocket import market_stream

router = APIRouter(prefix="/market")
service = MarketDataService()

@router.get("/quote/{symbol}")
async def quote(symbol: str):
    return await service.get_quote(symbol)

@router.websocket("/ws")
async def websocket(ws: WebSocket):
    await market_stream(ws)
