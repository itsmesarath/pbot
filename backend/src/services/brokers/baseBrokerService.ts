/**
 * Abstract base broker service
 * All brokers must implement these methods
 */

import { Candle, Ticker } from '../../types/broker';

export abstract class BaseBrokerService {
  abstract getName(): string;
  abstract getKlines(symbol: string, interval: string, limit: number): Promise<Candle[]>;
  abstract subscribeToKlines(symbol: string, interval: string, callback: (candle: Candle) => void): string;
  abstract unsubscribe(subscriptionId: string): void;
  abstract getPrice(symbol: string): Promise<number>;
  abstract getTicker24hr(symbol: string): Promise<Ticker>;
  abstract validateCredentials(): Promise<boolean>;
  abstract isConnected(): boolean;
}
