import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class MarketService {
  API = 'http://localhost:8000/market';

  getQuote(symbol: string) {
    return fetch(`${this.API}/quote/${symbol}`).then(r => r.json());
  }

  connectWS() {
    return new WebSocket('ws://localhost:8000/market/ws');
  }
}
