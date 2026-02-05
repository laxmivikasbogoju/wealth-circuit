from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import StockQuote, MarketIndex, NewsItem
from app.services.market_data import MarketDataService

router = APIRouter(prefix="/market", tags=["Market Data"])

@router.get("/indices", response_model=List[MarketIndex])
async def get_indices(current_user: User = Depends(get_current_user)):
    """Get major market indices"""
    indices = MarketDataService.get_market_indices()
    return indices

@router.get("/quote/{symbol}", response_model=StockQuote)
async def get_stock_quote(
    symbol: str,
    current_user: User = Depends(get_current_user)
):
    """Get real-time stock quote"""
    quote = MarketDataService.get_stock_quote(symbol)
    if not quote:
        raise HTTPException(status_code=404, detail="Stock not found")
    return quote

@router.get("/gainers-losers")
async def get_gainers_losers(current_user: User = Depends(get_current_user)):
    """Get top gainers and losers"""
    data = MarketDataService.get_top_gainers_losers()
    return data

@router.get("/historical/{symbol}")
async def get_historical_data(
    symbol: str,
    period: str = Query(default="1mo", regex="^(1d|5d|1mo|3mo|6mo|1y|5y)$"),
    current_user: User = Depends(get_current_user)
):
    """Get historical data for charts"""
    data = MarketDataService.get_historical_data(symbol, period)
    if not data:
        raise HTTPException(status_code=404, detail="No historical data found")
    return data

@router.get("/search")
async def search_stocks(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user)
):
    """Search for stocks"""
    results = MarketDataService.search_stocks(q)
    return results

@router.get("/news", response_model=List[NewsItem])
async def get_market_news(current_user: User = Depends(get_current_user)):
    """
    Get latest market news from RSS feeds
    
    Sources:
    - Moneycontrol
    - Economic Times
    - Business Standard
    - LiveMint
    
    Returns 8 most recent articles with:
    - title
    - description
    - url
    - source
    - published_at
    - image_url
    """
    news = MarketDataService.get_market_news()
    return news

@router.get("/popular-stocks")
async def get_popular_stocks(current_user: User = Depends(get_current_user)):
    """Get popular stocks with quotes"""
    stocks = []
    for symbol in MarketDataService.POPULAR_STOCKS[:10]:
        quote = MarketDataService.get_stock_quote(symbol)
        if quote:
            stocks.append(quote)
    return stocks