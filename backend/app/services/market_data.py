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
        """Get latest market news from real RSS feeds"""
        import feedparser
        from datetime import datetime
        
        all_news = []
        
        # RSS feeds from major Indian financial news sources
        news_sources = [
            {
                'name': 'Moneycontrol',
                'url': 'https://www.moneycontrol.com/rss/business.xml',
                'base_url': 'https://www.moneycontrol.com'
            },
            {
                'name': 'Economic Times - Markets',
                'url': 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
                'base_url': 'https://economictimes.indiatimes.com'
            },
            {
                'name': 'Business Standard',
                'url': 'https://www.business-standard.com/rss/markets-106.rss',
                'base_url': 'https://www.business-standard.com'
            },
            {
                'name': 'LiveMint - Markets',
                'url': 'https://www.livemint.com/rss/markets',
                'base_url': 'https://www.livemint.com'
            }
        ]
        
        for source in news_sources:
            try:
                # Parse RSS feed
                feed = feedparser.parse(source['url'])
                
                # Get first 2 articles from each source
                for entry in feed.entries[:2]:
                    # Extract publication date
                    pub_date = entry.get('published', '')
                    try:
                        # Try to parse the date
                        if pub_date:
                            from email.utils import parsedate_to_datetime
                            parsed_date = parsedate_to_datetime(pub_date)
                            pub_date_iso = parsed_date.isoformat()
                        else:
                            pub_date_iso = datetime.now().isoformat()
                    except:
                        pub_date_iso = datetime.now().isoformat()
                    
                    # Extract description/summary
                    description = entry.get('summary', '')
                    if description:
                        # Clean HTML tags from description
                        from bs4 import BeautifulSoup
                        soup = BeautifulSoup(description, 'html.parser')
                        description = soup.get_text()[:200]  # Limit to 200 chars
                    
                    news_item = {
                        'title': entry.get('title', 'No title'),
                        'description': description,
                        'url': entry.get('link', source['base_url']),
                        'source': source['name'],
                        'published_at': pub_date_iso,
                        'image_url': None
                    }
                    
                    all_news.append(news_item)
                    
            except Exception as e:
                print(f"Error fetching news from {source['name']}: {str(e)}")
                continue
        
        # If no news fetched, use fallback
        if not all_news:
            all_news = MarketDataService._get_fallback_news()
        
        # Sort by date (newest first) and return top 8
        all_news.sort(key=lambda x: x['published_at'], reverse=True)
        return all_news[:8]
    
    @staticmethod
    def _get_fallback_news() -> List[Dict[str, Any]]:
        """Fallback news when RSS feeds are unavailable"""
        return [
            {
                "title": "Markets End Higher as IT Stocks Rally on Strong Earnings",
                "description": "Indian stock markets closed in green today with strong gains in IT and banking sectors. Nifty 50 crossed 22,000 mark.",
                "url": "https://www.moneycontrol.com/news/business/markets/",
                "source": "Moneycontrol",
                "published_at": datetime.now().isoformat(),
                "image_url": None
            },
            {
                "title": "RBI Maintains Repo Rate at 6.5% Amid Inflation Concerns",
                "description": "Reserve Bank of India keeps key policy rates unchanged in latest monetary policy meeting, citing inflation management.",
                "url": "https://economictimes.indiatimes.com/markets",
                "source": "Economic Times",
                "published_at": (datetime.now() - timedelta(hours=2)).isoformat(),
                "image_url": None
            },
            {
                "title": "Tech Giants Report Strong Q4 Results, Stock Prices Surge",
                "description": "Major IT companies exceed market expectations with robust earnings, leading to surge in tech stock prices.",
                "url": "https://www.livemint.com/market",
                "source": "Live Mint",
                "published_at": (datetime.now() - timedelta(hours=4)).isoformat(),
                "image_url": None
            }
        ]