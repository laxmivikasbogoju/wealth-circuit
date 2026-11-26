import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavHeaderComponent } from '../shared/nav-header/nav-header.component';
import { RecommendationService } from '../../services/recommendation.service';
import { MarketDataService } from '../../services/market.service';
import { Recommendation, RecommendationStats } from '../../models/recommendation.model';
import { MarketIndex, StockQuote } from '../../models/market.model';

type TabId = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'SHORT_TERM' | 'POSITIONAL' | 'INTRADAY';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, FormsModule, NavHeaderComponent],
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css']
})
export class RecommendationsComponent implements OnInit {
  recommendations: Recommendation[] = [];
  stats: RecommendationStats = { total: 0, active: 0, hit_rate: 0, avg_return: 0 };
  indices: MarketIndex[] = [];
  gainers: StockQuote[] = [];
  losers: StockQuote[] = [];

  isLoading = true;
  searchQuery = '';
  activeTab: TabId = 'ALL';
  notificationsEnabled = false;

  tabs: { id: TabId; label: string }[] = [
    { id: 'ALL', label: 'All Calls' },
    { id: 'ACTIVE', label: 'Active Calls' },
    { id: 'COMPLETED', label: 'Completed Calls' },
    { id: 'SHORT_TERM', label: 'Short Term' },
    { id: 'POSITIONAL', label: 'Positional' },
    { id: 'INTRADAY', label: 'Intraday' }
  ];

  constructor(
    private recommendationService: RecommendationService,
    private marketDataService: MarketDataService
  ) {}

  ngOnInit(): void {
    this.loadRecommendations();
    this.loadMarketOverview();
    this.notificationsEnabled = typeof Notification !== 'undefined' && Notification.permission === 'granted';
  }

  loadRecommendations(): void {
    this.isLoading = true;
    this.recommendationService.getRecommendations().subscribe({
      next: (res) => {
        this.recommendations = res.recommendations;
        this.stats = res.stats;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadMarketOverview(): void {
    this.marketDataService.getIndices().subscribe({
      next: (data) => this.indices = data.slice(0, 2)
    });
    this.marketDataService.getGainersLosers().subscribe({
      next: (data) => {
        this.gainers = data.gainers.slice(0, 3);
        this.losers = data.losers.slice(0, 3);
      }
    });
  }

  get filteredRecommendations(): Recommendation[] {
    let rows = this.recommendations;

    if (this.activeTab === 'ACTIVE') {
      rows = rows.filter(r => r.status === 'ACTIVE');
    } else if (this.activeTab === 'COMPLETED') {
      rows = rows.filter(r => r.status === 'TARGET_HIT' || r.status === 'SL_HIT');
    } else if (this.activeTab !== 'ALL') {
      rows = rows.filter(r => r.category === this.activeTab);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toUpperCase();
      rows = rows.filter(r => r.symbol.toUpperCase().includes(q));
    }

    return rows;
  }

  setTab(tab: TabId): void {
    this.activeTab = tab;
  }

  entryMid(r: Recommendation): number {
    return (r.entry_low + r.entry_high) / 2;
  }

  pctFor(r: Recommendation, value: number): number {
    const mid = this.entryMid(r);
    if (!mid) return 0;
    const pct = r.call_type === 'BUY' ? ((value - mid) / mid) * 100 : ((mid - value) / mid) * 100;
    return pct;
  }

  formatPct(pct: number): string {
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  }

  displayStatus(status: string): string {
    return status === 'ACTIVE' ? 'ACTIVE' : 'COMPLETED';
  }

  statusClass(status: string): string {
    return status === 'ACTIVE' ? 'active' : 'completed';
  }

  categoryLabel(category: string): string {
    switch (category) {
      case 'SHORT_TERM': return 'Short Term';
      case 'INTRADAY': return 'Intraday';
      default: return 'Positional';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  formatChange(change: number): string {
    return change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
  }

  formatPercent(percent: number): string {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  }

  getChangeClass(change: number): string {
    return change >= 0 ? 'positive' : 'negative';
  }

  enableNotifications(): void {
    if (typeof Notification === 'undefined') {
      return;
    }
    Notification.requestPermission().then(permission => {
      this.notificationsEnabled = permission === 'granted';
    });
  }
}
