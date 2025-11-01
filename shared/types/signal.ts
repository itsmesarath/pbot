/**
 * Signal output format - exactly matches user's requested JSON structure
 */

export type MarketStateType = 'Balanced' | 'Out of Balance';
export type SetupType = 'Trend Model' | 'Mean Reversion' | 'Grid Trading' | 'None';
export type SignalType = 'Long' | 'Short' | 'Flat';
export type TrendType = 'UP' | 'DOWN' | 'NEUTRAL' | 'MIXED';
export type BiasType = 'Bullish' | 'Bearish' | 'Neutral';
export type StructureType = 'HigherLows' | 'LowerHighs' | 'DoubleTop' | 'DoubleBottom' | 'Consolidation';
export type AggressionLevel = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
export type VolumeClusters = 'above_average' | 'average' | 'below_average';

export type KeyLevelType =
  | 'DAILY_HIGH' | 'DAILY_LOW' | 'DAILY_OPEN'
  | '4H_SWING_HIGH' | '4H_SWING_LOW'
  | 'POC' | 'HVN' | 'LVN'
  | '5M_SUPPORT' | '5M_RESISTANCE'
  | 'PREVIOUS_SWING_HIGH' | 'PREVIOUS_SWING_LOW';

export interface KeyLevel {
  price: number;
  type: KeyLevelType;
  timeframe?: string;
  significance: number; // 1-5, where 5 is most significant
  touches?: number; // How many times price has tested
  rejection_rate?: number; // 0-1
}

export interface TimeframeAnalysis {
  timeframe: string;
  trend: TrendType;
  bias: BiasType;
  confidence: number; // 0-1
  smaAlignment: boolean;
  structure?: StructureType;
}

export interface OrderFlowData {
  cvd: string; // Cumulative Volume Delta as string with + or -
  deltaImbalance: number; // 0-1 ratio
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

export interface TradingSignal {
  // Identifiers
  signal_id: string; // UUID
  timestamp: string; // ISO 8601

  // Market Data
  symbol: string;
  broker: string;
  timeframes: string[];

  // Signal Content (matches user's output format)
  market_state: MarketStateType;
  setup: SetupType;
  signal: SignalType;
  reason: string;

  // Price Targets
  entry: number;
  stop_loss: number;
  target: number;

  // Confidence & Metadata
  confidence: number; // 0-1
  strategy_used: string; // Which strategy generated signal
  strategies_consensus?: { [key: string]: string }; // All strategies' signals

  // Detailed Analysis
  key_levels: KeyLevel[];
  timeframe_analysis: { [key: string]: TimeframeAnalysis };
  order_flow: OrderFlowData;

  // Trade History (if executed)
  trade_id?: string;
  execution_status?: 'pending' | 'executed' | 'expired' | 'cancelled';
  execution_price?: number;
  pnl?: number;
}

export interface StrategySignal {
  strategy: 'fabio' | 'grid' | 'mean_reversion';
  signal: SignalType;
  confidence: number;
  entry: number;
  stop_loss: number;
  target: number;
  reason: string;
  setup: string;
}
