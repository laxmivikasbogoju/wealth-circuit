import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MarketDataService } from '../../services/market.service';
import { HistoricalData } from '../../models/market.model';

// Declare lightweight-charts library
declare const LightweightCharts: any;

@Component({
  selector: 'app-stock-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-chart.component.html',
  styleUrls: ['./stock-chart.component.css']
})
export class StockChartComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef<HTMLDivElement>;
  
  symbol: string = '';
  indexName: string = '';
  historicalData: HistoricalData[] = [];
  currentPrice: number = 0;
  change: number = 0;
  changePercent: number = 0;
  high24h: number = 0;
  low24h: number = 0;
  volume24h: number = 0;
  
  chart: any;
  candlestickSeries: any;
  volumeSeries: any;
  selectedPeriod: string = '1mo';
  selectedChartType: 'candlestick' | 'line' = 'candlestick';
  isLoading = true;
  
  private subscriptions: Subscription[] = [];
  private libraryLoaded = false;

  periods = [
    { label: '1D', value: '1d' },
    { label: '5D', value: '5d' },
    { label: '1M', value: '1mo' },
    { label: '3M', value: '3mo' },
    { label: '6M', value: '6mo' },
    { label: '1Y', value: '1y' }
  ];

  chartTypes = [
    { label: 'Candlestick', value: 'candlestick' as 'candlestick' | 'line' },
    { label: 'Line', value: 'line' as 'candlestick' | 'line' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private marketDataService: MarketDataService
  ) {}

  ngOnInit(): void {
    // Get symbol from route parameters
    this.route.params.subscribe(params => {
      this.symbol = params['symbol'] || '';
      this.indexName = this.getIndexName(this.symbol);
      if (this.symbol) {
        this.loadLightweightCharts();
      }
    });
  }

  ngAfterViewInit(): void {
    // Chart will be created after library loads
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.chart) {
      this.chart.remove();
    }
  }

  loadLightweightCharts(): void {
    if (this.libraryLoaded) {
      this.loadChartData();
      return;
    }

    // Load Lightweight Charts library from CDN
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/lightweight-charts@4.1.0/dist/lightweight-charts.standalone.production.js';
    script.onload = () => {
      console.log('Lightweight Charts loaded');
      this.libraryLoaded = true;
      this.loadChartData();
    };
    script.onerror = () => {
      console.error('Failed to load Lightweight Charts');
      this.isLoading = false;
    };
    document.head.appendChild(script);
  }

  getIndexName(symbol: string): string {
    const indexMap: { [key: string]: string } = {
      '^NSEI': 'NIFTY 50',
      '^BSESN': 'SENSEX',
      '^NSEBANK': 'NIFTY BANK',
      '^CNXIT': 'NIFTY IT'
    };
    return indexMap[symbol] || symbol.replace('.NS', '');
  }

  loadChartData(): void {
    this.isLoading = true;

    // Load historical data
    const historicalSub = this.marketDataService.getHistoricalData(this.symbol, this.selectedPeriod).subscribe({
      next: (data) => {
        this.historicalData = data;
        if (data.length > 0) {
          const latest = data[data.length - 1];
          const previous = data.length > 1 ? data[data.length - 2] : latest;
          
          this.currentPrice = latest.close;
          this.change = latest.close - previous.close;
          this.changePercent = (this.change / previous.close) * 100;
          
          // Calculate 24h high/low/volume
          this.high24h = Math.max(...data.slice(-1).map(d => d.high));
          this.low24h = Math.min(...data.slice(-1).map(d => d.low));
          this.volume24h = data.slice(-1).reduce((sum, d) => sum + d.volume, 0);
        }
        this.isLoading = false;
        
        // Wait for view to be ready
        setTimeout(() => this.createChart(), 100);
      },
      error: (error) => {
        console.error('Error loading chart data:', error);
        this.isLoading = false;
      }
    });

    this.subscriptions.push(historicalSub);
  }

  createChart(): void {
    if (!this.chartContainer || !this.historicalData.length || typeof LightweightCharts === 'undefined') {
      console.log('Chart prerequisites not met');
      return;
    }

    const container = this.chartContainer.nativeElement;
    
    // Clear existing chart
    container.innerHTML = '';
    
    if (this.chart) {
      this.chart.remove();
    }

    const isPositive = this.change >= 0;

    // Create chart
    this.chart = LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height: 500,
      layout: {
        background: { color: 'transparent' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
        vertLine: {
          color: '#00ffaa',
          width: 1,
          style: LightweightCharts.LineStyle.Dashed,
        },
        horzLine: {
          color: '#00ffaa',
          width: 1,
          style: LightweightCharts.LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    if (this.selectedChartType === 'candlestick') {
      // Create candlestick series
      this.candlestickSeries = this.chart.addCandlestickSeries({
        upColor: '#00ffaa',
        downColor: '#ff4757',
        borderUpColor: '#00ffaa',
        borderDownColor: '#ff4757',
        wickUpColor: '#00ffaa',
        wickDownColor: '#ff4757',
      });

      // Prepare candlestick data
      const candleData = this.historicalData.map(d => ({
        time: d.date,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      this.candlestickSeries.setData(candleData);
    } else {
      // Create line series
      const lineSeries = this.chart.addLineSeries({
        color: isPositive ? '#00ffaa' : '#ff4757',
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 6,
        crosshairMarkerBorderColor: isPositive ? '#00ffaa' : '#ff4757',
        crosshairMarkerBackgroundColor: '#ffffff',
      });

      // Prepare line data
      const lineData = this.historicalData.map(d => ({
        time: d.date,
        value: d.close,
      }));

      lineSeries.setData(lineData);
    }

    // Add volume series
    this.volumeSeries = this.chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Prepare volume data with color based on price change
    const volumeData = this.historicalData.map((d, index) => {
      const prevClose = index > 0 ? this.historicalData[index - 1].close : d.open;
      const color = d.close >= prevClose ? 'rgba(0, 255, 170, 0.3)' : 'rgba(255, 71, 87, 0.3)';
      
      return {
        time: d.date,
        value: d.volume,
        color: color,
      };
    });

    this.volumeSeries.setData(volumeData);

    // Fit content
    this.chart.timeScale().fitContent();

    // Handle resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  handleResize(): void {
    if (this.chart && this.chartContainer) {
      this.chart.applyOptions({
        width: this.chartContainer.nativeElement.clientWidth,
      });
    }
  }

  changePeriod(period: string): void {
    this.selectedPeriod = period;
    this.loadChartData();
  }

  changeChartType(type: 'candlestick' | 'line'): void {
    this.selectedChartType = type;
    this.createChart();
  }

  formatVolume(volume: number): string {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toString();
  }

  getChangeClass(): string {
    return this.change >= 0 ? 'positive' : 'negative';
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}