/**
 * Market data and analysis types
 */

export interface MarketData {
  symbol: string;
  timestamp: string;
  price: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  changePercent: number;
}

export interface CacheStatus {
  symbol: string;
  interval: string;
  age: number; // seconds since last update
  candles: number;
  isFresh: boolean;
}

export type TradeStatus = 'open' | 'closed' | 'cancelled';
export type TradeClosureReason = 'stop_loss_hit' | 'take_profit_hit' | 'manual_close' | 'expired';

export interface Trade {
  trade_id: string;
  signal_id: string;
  symbol: string;
  broker: string;

  // Entry
  entry_price: number;
  entry_time: string;

  // Exit Targets
  stop_loss: number;
  take_profit: number;

  // Position
  quantity: number;
  side: 'long' | 'short';
  risk_reward_ratio: number;

  // Status
  status: TradeStatus;
  close_price?: number;
  close_time?: string;
  close_reason?: TradeClosureReason;

  // P&L
  pnl: number;
  pnl_percent: number;

  // Metadata
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  totalTrades: number;
  winRate: number; // 0-1
  pnl: number;
  pnlPercent: number;
  accountBalance: number;
  riskPerTrade: number; // 0-1
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  averageWinSize: number;
  averageLossSize: number;
}
