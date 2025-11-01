/**
 * Broker factory pattern for creating broker instances
 */

import { BinanceService } from './binanceService';
import { BaseBrokerService } from './baseBrokerService';
import { BrokerConfig } from '../../types/broker';
import pino from 'pino';

const logger = pino();

export class BrokerFactory {
  static createBroker(config: BrokerConfig): BaseBrokerService {
    switch (config.name.toUpperCase()) {
      case 'BINANCE':
        return new BinanceService(config.apiKey, config.apiSecret, config.testnet || false);
      case 'BYBIT':
        // TODO: Implement BybitService
        throw new Error('Bybit broker not yet implemented');
      case 'KRAKEN':
        // TODO: Implement KrakenService
        throw new Error('Kraken broker not yet implemented');
      case 'OKX':
        // TODO: Implement OKXService
        throw new Error('OKX broker not yet implemented');
      default:
        throw new Error(`Unsupported broker: ${config.name}`);
    }
  }
}
