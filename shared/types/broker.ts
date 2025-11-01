/**
 * Broker integration types and interfaces
 */

export type BrokerName = 'BINANCE' | 'BYBIT' | 'KRAKEN' | 'OKX';

export interface BrokerConfig {
  name: BrokerName;
  apiKey: string;
  apiSecret: string;
  apiPassphrase?: string; // For Kraken, OKX
  testnet?: boolean;
}

export interface Candle {
  time: number; // Unix timestamp in ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isFinal: boolean; // Whether candle is closed
}

export interface Ticker {
  price: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  changePercent: number;
}

export interface BrokerConnection {
  name: BrokerName;
  isConnected: boolean;
  lastChecked: string;
  error?: string;
}
