export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  market_cap?: number;
  high?: number;
  low?: number;
  open?: number;
  previous_close?: number;
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  change_percent: number;
}

export interface NewsItem {
  title: string;
  description?: string;
  url: string;
  source: string;
  published_at: string;
  image_url?: string;
}

export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}