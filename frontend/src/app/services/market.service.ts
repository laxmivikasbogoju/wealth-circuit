import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, interval, switchMap, startWith } from 'rxjs';
import { environment } from '../../environment/environment';
import { StockQuote, MarketIndex, NewsItem, HistoricalData } from '../models/market.model';

@Injectable({
  providedIn: 'root'
})
export class MarketDataService {
  private apiUrl = `${environment.apiUrl}/market`;
   private API = 'http://localhost:8000/market/news';
  constructor(private http: HttpClient) {}

  getIndices(): Observable<MarketIndex[]> {
    return this.http.get<MarketIndex[]>(`${this.apiUrl}/indices`);
  }

  getIndicesRealtime(): Observable<MarketIndex[]> {
    // Update every 30 seconds
    return interval(30000).pipe(
      startWith(0),
      switchMap(() => this.getIndices())
    );
  }

  getStockQuote(symbol: string): Observable<StockQuote> {
    return this.http.get<StockQuote>(`${this.apiUrl}/quote/${symbol}`);
  }

  getGainersLosers(): Observable<{ gainers: StockQuote[], losers: StockQuote[] }> {
    return this.http.get<{ gainers: StockQuote[], losers: StockQuote[] }>(`${this.apiUrl}/gainers-losers`);
  }

  getHistoricalData(symbol: string, period: string = '1mo'): Observable<HistoricalData[]> {
    const params = new HttpParams().set('period', period);
    return this.http.get<HistoricalData[]>(`${this.apiUrl}/historical/${symbol}`, { params });
  }

  searchStocks(query: string): Observable<any[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<any[]>(`${this.apiUrl}/search`, { params });
  }

  getNews(): Observable<NewsItem[]> {
    return this.http.get<NewsItem[]>(`${this.API}`);
  }

  getPopularStocks(): Observable<StockQuote[]> {
    return this.http.get<StockQuote[]>(`${this.apiUrl}/popular-stocks`);
  }

  getPopularStocksRealtime(): Observable<StockQuote[]> {
    // Update every 30 seconds
    return interval(30000).pipe(
      startWith(0),
      switchMap(() => this.getPopularStocks())
    );
  }
}