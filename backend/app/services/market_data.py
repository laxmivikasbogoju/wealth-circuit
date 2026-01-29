import httpx

class MarketDataService:
    async def get_quote(self, symbol: str):
        # Replace with Zerodha/Angel API
        return {
            "symbol": symbol,
            "price": 2450.50,
            "change": 1.2
        }
