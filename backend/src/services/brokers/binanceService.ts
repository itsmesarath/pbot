/**
 * Binance broker service implementation
 */

import axios, { AxiosInstance } from 'axios';
import WebSocket from 'ws';
import { BaseBrokerService } from './baseBrokerService';
import { Candle, Ticker } from '../../types/broker';
import pino from 'pino';

const logger = pino();

export class BinanceService extends BaseBrokerService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api.binance.com/api/v3';
  private wsBaseUrl = 'wss://stream.binance.com:9443/ws';
  private axiosInstance: AxiosInstance;
  private subscriptions: Map<string, WebSocket> = new Map();
  private subscriptionCallbacks: Map<string, (candle: Candle) => void> = new Map();

  constructor(apiKey: string, apiSecret: string, testnet = false) {
    super();
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;

    if (testnet) {
      this.baseUrl = 'https://testnet.binance.vision/api/v3';
      this.wsBaseUrl = 'wss://stream.testnet.binance.vision:9443/ws';
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    });
  }

  getName(): string {
    return 'Binance';
  }

  async getKlines(symbol: string, interval: string, limit: number = 500): Promise<Candle[]> {
    try {
      const response = await this.axiosInstance.get('/klines', {
        params: {
          symbol: symbol.toUpperCase(),
          interval,
          limit: Math.min(limit, 1000), // Binance max is 1000
        },
      });

      return response.data.map((kline: any[]) => ({
        time: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[7]),
        isFinal: true,
      }));
    } catch (error) {
      logger.error({ error, symbol, interval }, 'Failed to fetch klines');
      throw error;
    }
  }

  subscribeToKlines(symbol: string, interval: string, callback: (candle: Candle) => void): string {
    const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
    const subscriptionId = `${symbol}:${interval}:${Date.now()}`;

    this.subscriptionCallbacks.set(subscriptionId, callback);

    const ws = new WebSocket(`${this.wsBaseUrl}/${streamName}`);

    ws.on('open', () => {
      logger.info({ streamName }, 'WebSocket connected');
    });

    ws.on('message', (data: string) => {
      try {
        const message = JSON.parse(data);
        const kline = message.k;

        const candle: Candle = {
          time: kline.t,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
          volume: parseFloat(kline.v),
          isFinal: kline.x, // x indicates if candle is closed
        };

        callback(candle);
      } catch (error) {
        logger.error({ error, data }, 'Failed to parse WebSocket message');
      }
    });

    ws.on('error', (error: Error) => {
      logger.error({ error, streamName }, 'WebSocket error');
    });

    ws.on('close', () => {
      logger.info({ streamName }, 'WebSocket closed');
      this.subscriptions.delete(subscriptionId);
    });

    this.subscriptions.set(subscriptionId, ws);
    return subscriptionId;
  }

  unsubscribe(subscriptionId: string): void {
    const ws = this.subscriptions.get(subscriptionId);
    if (ws) {
      ws.close();
      this.subscriptions.delete(subscriptionId);
      this.subscriptionCallbacks.delete(subscriptionId);
    }
  }

  async getPrice(symbol: string): Promise<number> {
    try {
      const response = await this.axiosInstance.get('/ticker/price', {
        params: { symbol: symbol.toUpperCase() },
      });
      return parseFloat(response.data.price);
    } catch (error) {
      logger.error({ error, symbol }, 'Failed to get price');
      throw error;
    }
  }

  async getTicker24hr(symbol: string): Promise<Ticker> {
    try {
      const response = await this.axiosInstance.get('/ticker/24hr', {
        params: { symbol: symbol.toUpperCase() },
      });

      return {
        price: parseFloat(response.data.lastPrice),
        volume24h: parseFloat(response.data.volume),
        high24h: parseFloat(response.data.highPrice),
        low24h: parseFloat(response.data.lowPrice),
        changePercent: parseFloat(response.data.priceChangePercent),
      };
    } catch (error) {
      logger.error({ error, symbol }, 'Failed to get 24hr ticker');
      throw error;
    }
  }

  async validateCredentials(): Promise<boolean> {
    try {
      await this.axiosInstance.get('/account');
      return true;
    } catch (error) {
      logger.error({ error }, 'Failed to validate credentials');
      return false;
    }
  }

  isConnected(): boolean {
    // Check if any subscriptions are active
    for (const ws of this.subscriptions.values()) {
      if (ws.readyState === WebSocket.OPEN) {
        return true;
      }
    }
    return false;
  }
}
