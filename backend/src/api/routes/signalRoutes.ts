/**
 * Signal API Routes
 * POST /api/signals/analyze - Generate trading signal
 * GET /api/signals - Get signal history
 * GET /api/signals/:signal_id - Get specific signal
 */

import express, { Router, Request, Response } from 'express';
import { SignalGenerator } from '../../services/signalGenerator';
import { BrokerConfig } from '../../types/broker';
import pino from 'pino';

const router = Router();
const logger = pino();
const signalGenerator = new SignalGenerator();

// Initialize with default Binance config (can be overridden)
const defaultBrokerConfig: BrokerConfig = {
  name: 'BINANCE',
  apiKey: process.env.BINANCE_API_KEY || '',
  apiSecret: process.env.BINANCE_API_SECRET || '',
  testnet: process.env.BINANCE_TESTNET === 'true',
};

// Initialize broker on startup
signalGenerator.initializeBroker(defaultBrokerConfig).catch(err => {
  logger.error({ error: err }, 'Failed to initialize broker on startup');
});

/**
 * POST /api/signals/analyze
 * Generate signal for symbol
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { symbol, broker = 'BINANCE' } = req.body;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol is required',
      });
    }

    // Generate signal
    const signal = await signalGenerator.generateSignal(symbol, broker);

    res.json({
      success: true,
      data: signal,
    });
  } catch (error: any) {
    logger.error({ error }, 'Failed to generate signal');
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate signal',
    });
  }
});

/**
 * POST /api/signals
 * Alias for /analyze
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { symbol, broker = 'BINANCE' } = req.body;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol is required',
      });
    }

    const signal = await signalGenerator.generateSignal(symbol, broker);

    res.json({
      success: true,
      data: signal,
    });
  } catch (error: any) {
    logger.error({ error }, 'Failed to generate signal');
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate signal',
    });
  }
});

/**
 * GET /api/signals/current?symbol=BTCUSDT
 * Get most recent signal for a symbol
 */
router.get('/current', async (req: Request, res: Response) => {
  try {
    const { symbol, broker = 'BINANCE' } = req.query;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol query parameter is required',
      });
    }

    const signal = await signalGenerator.generateSignal(symbol as string, broker as string);

    res.json({
      success: true,
      data: signal,
    });
  } catch (error: any) {
    logger.error({ error }, 'Failed to fetch current signal');
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch signal',
    });
  }
});

export default router;
