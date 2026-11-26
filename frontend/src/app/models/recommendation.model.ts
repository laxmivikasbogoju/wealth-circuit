export type CallType = 'BUY' | 'SELL';
export type RecommendationCategory = 'SHORT_TERM' | 'POSITIONAL' | 'INTRADAY';
export type RecommendationStatus = 'ACTIVE' | 'TARGET_HIT' | 'SL_HIT';

export interface Recommendation {
  id: number;
  symbol: string;
  exchange: string;
  call_type: CallType;
  entry_low: number;
  entry_high: number;
  target1: number;
  target2: number;
  stop_loss: number;
  category: RecommendationCategory;
  status: RecommendationStatus;
  call_date: string;
}

export interface RecommendationStats {
  total: number;
  active: number;
  hit_rate: number;
  avg_return: number;
}

export interface RecommendationListResponse {
  stats: RecommendationStats;
  recommendations: Recommendation[];
}

export interface UploadResult {
  inserted: number;
  skipped_rows: string[];
}
