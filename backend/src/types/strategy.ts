/**
 * Strategy types for backend
 */

import { Candle } from './broker';

export type AggressionLevel = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
export type VolumeClusters = 'above_average' | 'average' | 'below_average';

export interface OrderFlowData {
  cvd: string;
  deltaImbalance: number;
  buyVolume: number;
  sellVolume: number;
  aggression: AggressionLevel;
  volumeCluster: VolumeClusters;
  lastAggressivePrint?: {
    type: 'BUY' | 'SELL';
    volume: number;
    price: number;
    timestamp: string;
  };
}

export interface VolumeBin {
  priceLevel: number;
  volume: number;
  percentageOfTotal: number;
}

export interface VolumeProfile {
  POC: { price: number; volume: number };
  HVN: VolumeBin[];
  LVN: VolumeBin[];
  valueArea: { high: number; low: number; volumePercent: number };
  totalVolume: number;
}

export interface TimeframeAnalysis {
  timeframe: string;
  trend: 'UP' | 'DOWN' | 'NEUTRAL';
  bias: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  smaAlignment: boolean;
  structure?: 'HigherLows' | 'LowerHighs' | 'DoubleTop' | 'DoubleBottom' | 'Consolidation';
}

export interface MultiTimeframeAnalysis {
  analyses: Map<string, TimeframeAnalysis>;
  conflictCount: number;
  confluenceScore: number;
  dominantTrend: 'UP' | 'DOWN' | 'MIXED';
}

export interface KeyLevel {
  price: number;
  type: string;
  timeframe?: string;
  significance: number;
  touches?: number;
  rejection_rate?: number;
}

export interface StrategyInput {
  symbol: string;
  broker: string;
  candles: { [timeframe: string]: Candle[] };
  volumeProfile: VolumeProfile;
  orderFlow: OrderFlowData;
  multiTimeframe: MultiTimeframeAnalysis;
  keyLevels: KeyLevel[];
}

export interface StrategyResult {
  strategy: string;
  signal: 'Long' | 'Short' | 'Flat';
  confidence: number;
  entry: number;
  stop_loss: number;
  target: number;
  reason: string;
  setup: string;
  market_state: 'Balanced' | 'Out of Balance';
}
