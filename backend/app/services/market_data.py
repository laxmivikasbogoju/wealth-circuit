import yfinance as yf
from typing import List, Dict, Any
import pandas as pd
from datetime import datetime, timedelta
import requests

class MarketDataService:
    
    # Popular Indian indices and stocks
    INDIAN_INDICES = {
        "NIFTY 50": "^NSEI",
        "SENSEX": "^BSESN",
        "NIFTY BANK": "^NSEBANK",
        "NIFTY IT": "^CNXIT"
    }
    
    POPULAR_STOCKS = [
        "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "HINDUNILVR.NS",
        "ICICIBANK.NS", "SBIN.NS", "BHARTIARTL.NS", "ITC.NS", "KOTAKBANK.NS",
        "LT.NS", "AXISBANK.NS", "BAJFINANCE.NS", "ASIANPAINT.NS", "MARUTI.NS"
    ]
    
    @staticmethod
    def get_stock_quote(symbol: str) -> Dict[str, Any]:
        """Get real-time stock quote"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            hist = ticker.history(period="1d")
            
            if hist.empty:
                return None
            
            current_price = hist['Close'].iloc[-1]
            previous_close = info.get('previousClose', current_price)
            change = current_price - previous_close
            change_percent = (change / previous_close) * 100 if previous_close else 0
            
            return {
                "symbol": symbol,
                "price": round(current_price, 2),
                "change": round(change, 2),
                "change_percent": round(change_percent, 2),
                "volume": int(hist['Volume'].iloc[-1]) if 'Volume' in hist else 0,
                "market_cap": info.get('marketCap'),
                "high": round(hist['High'].iloc[-1], 2) if 'High' in hist else None,
                "low": round(hist['Low'].iloc[-1], 2) if 'Low' in hist else None,
                "open": round(hist['Open'].iloc[-1], 2) if 'Open' in hist else None,
                "previous_close": round(previous_close, 2)
            }
        except Exception as e:
            print(f"Error fetching stock quote for {symbol}: {e}")
            return None
    
    @staticmethod
    def get_market_indices() -> List[Dict[str, Any]]:
        """Get major market indices"""
        indices_data = []
        for name, symbol in MarketDataService.INDIAN_INDICES.items():
            try:
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period="2d")
                
                if len(hist) < 2:
                    continue
                
                current_value = hist['Close'].iloc[-1]
                previous_value = hist['Close'].iloc[-2]
                change = current_value - previous_value
                change_percent = (change / previous_value) * 100
                
                indices_data.append({
                    "name": name,
                    "symbol": symbol,
                    "value": round(current_value, 2),
                    "change": round(change, 2),
                    "change_percent": round(change_percent, 2)
                })
            except Exception as e:
                print(f"Error fetching index {name}: {e}")
                continue
        
        return indices_data
    
    @staticmethod
    def get_top_gainers_losers() -> Dict[str, List[Dict[str, Any]]]:
        """Get top gainers and losers"""
        stocks_data = []
        
        for symbol in MarketDataService.POPULAR_STOCKS[:10]:
            quote = MarketDataService.get_stock_quote(symbol)
            if quote:
                stocks_data.append(quote)
        
        # Sort by change_percent
        gainers = sorted([s for s in stocks_data if s['change_percent'] > 0], 
                        key=lambda x: x['change_percent'], reverse=True)[:5]
        losers = sorted([s for s in stocks_data if s['change_percent'] < 0], 
                       key=lambda x: x['change_percent'])[:5]
        
        return {
            "gainers": gainers,
            "losers": losers
        }
    
    @staticmethod
    def get_historical_data(symbol: str, period: str = "1mo") -> List[Dict[str, Any]]:
        """Get historical data for charts"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period)
            
            data = []
            for index, row in hist.iterrows():
                data.append({
                    "date": index.strftime("%Y-%m-%d"),
                    "open": round(row['Open'], 2),
                    "high": round(row['High'], 2),
                    "low": round(row['Low'], 2),
                    "close": round(row['Close'], 2),
                    "volume": int(row['Volume'])
                })
            
            return data
        except Exception as e:
            print(f"Error fetching historical data for {symbol}: {e}")
            return []
    
    @staticmethod
    def search_stocks(query: str) -> List[Dict[str, str]]:
        """Search for stocks by symbol or name"""
        # Simple search in popular stocks
        results = []
        query = query.upper()
        
        for symbol in MarketDataService.POPULAR_STOCKS:
            if query in symbol:
                results.append({
                    "symbol": symbol,
                    "name": symbol.replace(".NS", "")
                })
        
        return results[:10]
    
    @staticmethod
    def get_market_news() -> List[Dict[str, Any]]:
        """Get latest market news - using mock data for demo"""
        # In production, integrate with news API like NewsAPI, Alpha Vantage, etc.
        mock_news = [
            {
                "title": "Markets End Higher as IT Stocks Rally",
                "description": "Indian stock markets closed in green today with strong gains in IT and banking sectors.",
                "url": "https://example.com/news/1",
                "source": "Market Today",
                "published_at": datetime.now().isoformat(),
                "image_url": None
            },
            {
                "title": "RBI Maintains Repo Rate at 6.5%",
                "description": "Reserve Bank of India keeps key policy rates unchanged in latest monetary policy meeting.",
                "url": "https://example.com/news/2",
                "source": "Economic Times",
                "published_at": (datetime.now() - timedelta(hours=2)).isoformat(),
                "image_url": None
            },
            {
                "title": "Tech Giants Report Strong Q4 Results",
                "description": "Major IT companies exceed market expectations with robust earnings.",
                "url": "https://example.com/news/3",
                "source": "Business Line",
                "published_at": (datetime.now() - timedelta(hours=5)).isoformat(),
                "image_url": None
            }
        ]
        
        return mock_news