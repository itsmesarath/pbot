import axios from 'axios';

const BINANCE_API_BASE = 'https://api.binance.com';
const BINANCE_WS_BASE = 'wss://stream.binance.com:9443';

class BinanceService {
  constructor() {
    this.ws = null;
  }

  /**
   * Fetch historical candlestick data
   */
  async getKlines(symbol, interval, limit = 500) {
    try {
      console.log(`Fetching klines for ${symbol} ${interval}...`);
      const response = await axios.get(`${BINANCE_API_BASE}/api/v3/klines`, {
        params: {
          symbol: symbol.toUpperCase(),
          interval,
          limit
        }
      });

      console.log(`Received ${response.data.length} candles`);
      const klines = response.data.map(candle => ({
        time: candle[0] / 1000, // Convert to seconds
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5])
      }));
      
      console.log('First candle:', klines[0]);
      console.log('Last candle:', klines[klines.length - 1]);
      return klines;
    } catch (error) {
      console.error('Error fetching klines:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Subscribe to real-time candlestick updates
   */
  subscribeToKlines(symbol, interval, callback) {
    const stream = `${symbol.toLowerCase()}@kline_${interval}`;
    const wsUrl = `${BINANCE_WS_BASE}/ws/${stream}`;

    console.log(`Connecting to WebSocket: ${wsUrl}`);
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected successfully');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const candle = data.k;

        const candleData = {
          time: candle.t / 1000,
          open: parseFloat(candle.o),
          high: parseFloat(candle.h),
          low: parseFloat(candle.l),
          close: parseFloat(candle.c),
          volume: parseFloat(candle.v),
          isFinal: candle.x
        };

        console.log('📊 WebSocket candle received:', {
          time: new Date(candleData.time * 1000).toLocaleTimeString(),
          close: candleData.close,
          isFinal: candleData.isFinal
        });

        callback(candleData);
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  /**
   * Unsubscribe from websocket
   */
  unsubscribe() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Get current ticker price
   */
  async getPrice(symbol) {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/api/v3/ticker/price`, {
        params: { symbol: symbol.toUpperCase() }
      });
      return parseFloat(response.data.price);
    } catch (error) {
      console.error('Error fetching price:', error);
      throw error;
    }
  }

  /**
   * Get 24hr ticker statistics
   */
  async getTicker24hr(symbol) {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/api/v3/ticker/24hr`, {
        params: { symbol: symbol.toUpperCase() }
      });
      return {
        priceChange: parseFloat(response.data.priceChange),
        priceChangePercent: parseFloat(response.data.priceChangePercent),
        volume: parseFloat(response.data.volume),
        quoteVolume: parseFloat(response.data.quoteVolume),
        high: parseFloat(response.data.highPrice),
        low: parseFloat(response.data.lowPrice)
      };
    } catch (error) {
      console.error('Error fetching 24hr ticker:', error);
      throw error;
    }
  }
}

export default new BinanceService();
