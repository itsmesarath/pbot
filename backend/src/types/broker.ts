/**
 * Backend-specific broker types (extends shared types)
 */

export type BrokerName = 'BINANCE' | 'BYBIT' | 'KRAKEN' | 'OKX';

export interface BrokerConfig {
  name: BrokerName;
  apiKey: string;
  apiSecret: string;
  apiPassphrase?: string;
  testnet?: boolean;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isFinal: boolean;
}

export interface Ticker {
  price: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  changePercent: number;
}
