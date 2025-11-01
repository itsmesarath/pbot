/**
 * Strategy configuration and analysis types
 */

import { KeyLevel, TimeframeAnalysis, OrderFlowData, SignalType, MarketStateType } from './signal';

export interface StrategyConfig {
  name: 'fabio' | 'grid' | 'mean_reversion';
  enabled: boolean;
  confidence_threshold: number; // Default 0.7
  parameters: {
    risk_per_trade?: number; // Default 0.5%
    grid_levels?: number; // For grid trading
    lookback_period?: number; // For mean reversion
    [key: string]: any;
  };
}

export interface AnalysisInput {
  symbol: string;
  broker: string;
  candles: { [timeframe: string]: any[] };
  volumeProfile: VolumeProfile;
  orderFlow: OrderFlowData;
  multiTimeframeAnalysis: MultiTimeframeAnalysis;
  keyLevels: KeyLevel[];
}

export interface VolumeProfile {
  POC: {
    price: number;
    volume: number;
  };
  HVN: Array<{
    priceLevel: number;
    volume: number;
    percentageOfTotal: number;
  }>;
  LVN: Array<{
    priceLevel: number;
    volume: number;
    percentageOfTotal: number;
  }>;
  valueArea: {
    high: number;
    low: number;
    volumePercent: number;
  };
  totalVolume: number;
}

export interface MultiTimeframeAnalysis {
  analyses: Map<string, TimeframeAnalysis>;
  conflictCount: number;
  confluenceScore: number; // 0-1
  dominantTrend: 'UP' | 'DOWN' | 'MIXED';
}

export interface StrategyResult {
  strategy: string;
  signal: SignalType;
  confidence: number;
  entry: number;
  stop_loss: number;
  target: number;
  reason: string;
  setup: string;
  market_state: MarketStateType;
}

export interface GridLevel {
  price: number;
  order_type: 'BUY' | 'SELL';
  size: string; // Percentage like "1%"
  sequence: number;
}

export interface GridSetup {
  grid_levels: GridLevel[];
  stop_loss: number;
  take_profit: number;
}
