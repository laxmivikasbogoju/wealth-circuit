import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MarketDataService } from '../../services/market.service';
import { AuthService } from '../../services/auth.service';
import { StockQuote, MarketIndex, NewsItem } from '../../models/market.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  indices: MarketIndex[] = [];
  popularStocks: StockQuote[] = [];
  gainers: StockQuote[] = [];
  losers: StockQuote[] = [];
  news: NewsItem[] = [];
  currentUser: any;
  nowIso!: string;
  
  private subscriptions: Subscription[] = [];
  isLoading = true;

  constructor(
    private marketDataService: MarketDataService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.setupRealTimeUpdates();
    this.nowIso = new Date().toISOString();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadData(): void {
    // Load indices
    const indicesSub = this.marketDataService.getIndices().subscribe({
      next: (data) => {
        this.indices = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading indices:', error);
        this.isLoading = false;
      }
    });
    this.subscriptions.push(indicesSub);

    // Load popular stocks
    const stocksSub = this.marketDataService.getPopularStocks().subscribe({
      next: (data) => this.popularStocks = data,
      error: (error) => console.error('Error loading stocks:', error)
    });
    this.subscriptions.push(stocksSub);

    // Load gainers and losers
    const glSub = this.marketDataService.getGainersLosers().subscribe({
      next: (data) => {
        this.gainers = data.gainers;
        this.losers = data.losers;
      },
      error: (error) => console.error('Error loading gainers/losers:', error)
    });
    this.subscriptions.push(glSub);

    // Load news
    const newsSub = this.marketDataService.getNews().subscribe({
      next: (data) => this.news = data,
      error: (error) => console.error('Error loading news:', error)
    });
    this.subscriptions.push(newsSub);
  }

  setupRealTimeUpdates(): void {
    // Update indices every 30 seconds
    const indicesUpdate = this.marketDataService.getIndicesRealtime().subscribe({
      next: (data) => this.indices = data
    });
    this.subscriptions.push(indicesUpdate);

    // Update stocks every 30 seconds
    const stocksUpdate = this.marketDataService.getPopularStocksRealtime().subscribe({
      next: (data) => this.popularStocks = data
    });
    this.subscriptions.push(stocksUpdate);
  }

  getChangeClass(change: number): string {
    return change >= 0 ? 'positive' : 'negative';
  }

  formatChange(change: number): string {
    return change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
  }

  formatPercent(percent: number): string {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  }

  formatNumber(num: number): string {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  }

  logout(): void {
    this.authService.logout();
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  viewIndexChart(symbol: string): void {
    this.router.navigate(['/dashboard/chart', symbol]);
  }

  viewStockChart(symbol: string): void {
    this.router.navigate(['/dashboard/chart', symbol]);
  }
}