/**
 * Core Signal Generator
 * Orchestrates all strategies and synthesizes signals
 */

import { BaseBrokerService } from './brokers/baseBrokerService';
import { BrokerFactory } from './brokers/brokerFactory';
import { VolumeProfileAnalyzer } from './analysis/volumeProfile';
import { OrderFlowAnalyzer } from './analysis/orderFlow';
import { MultiTimeframeAnalyzer } from './analysis/multiTimeframe';
import { KeyLevelsAnalyzer } from './analysis/keyLevels';
import { FabioPlaybookStrategy } from './strategyEngine/fabioPlaybook';
import { GridTradingStrategy } from './strategyEngine/gridTrading';
import { MeanReversionStrategy } from './strategyEngine/meanReversion';
import { BrokerConfig } from '../types/broker';
import { TradingSignal, StrategyResult } from '../types/strategy';
import { v4 as uuidv4 } from 'uuid';
import pino from 'pino';

const logger = pino();

export class SignalGenerator {
  private fabioEngine: FabioPlaybookStrategy;
  private gridEngine: GridTradingStrategy;
  private meanReversionEngine: MeanReversionStrategy;
  private brokerService: BaseBrokerService | null = null;

  constructor() {
    this.fabioEngine = new FabioPlaybookStrategy();
    this.gridEngine = new GridTradingStrategy();
    this.meanReversionEngine = new MeanReversionStrategy();
  }

  async initializeBroker(brokerConfig: BrokerConfig): Promise<void> {
    try {
      this.brokerService = BrokerFactory.createBroker(brokerConfig);
      const isValid = await this.brokerService.validateCredentials();
      if (!isValid) {
        throw new Error('Invalid broker credentials');
      }
      logger.info({ broker: brokerConfig.name }, 'Broker initialized');
    } catch (error) {
      logger.error({ error }, 'Failed to initialize broker');
      throw error;
    }
  }

  async generateSignal(symbol: string, brokerName: string = 'BINANCE'): Promise<TradingSignal> {
    if (!this.brokerService) {
      throw new Error('Broker not initialized');
    }

    try {
      // Fetch multi-timeframe candles
      const candlesByTimeframe = await this.fetchMultiTimeframeCandles(symbol);

      // Calculate analysis data
      const volumeProfile = VolumeProfileAnalyzer.calculateVolumeProfile(
        candlesByTimeframe['1h'],
        this.getBinSize(candlesByTimeframe['1h'][0].close)
      );

      const orderFlow = OrderFlowAnalyzer.analyzeOrderFlow(candlesByTimeframe['1h']);

      const multiTF = MultiTimeframeAnalyzer.analyzeMultiTimeframe(candlesByTimeframe);

      const keyLevels = KeyLevelsAnalyzer.detectKeyLevels(
        volumeProfile,
        candlesByTimeframe,
        multiTF
      );

      // Prepare strategy input
      const strategyInput = {
        symbol,
        broker: brokerName,
        candles: candlesByTimeframe,
        volumeProfile,
        orderFlow,
        multiTimeframe: multiTF,
        keyLevels,
      };

      // Run all strategies in parallel
      const [fabioSignal, gridSignal, meanReversionSignal] = await Promise.all([
        this.fabioEngine.generateSignal(strategyInput),
        this.gridEngine.generateSignal(strategyInput),
        this.meanReversionEngine.generateSignal(strategyInput),
      ]);

      // Synthesize signals
      const finalSignal = this.synthesizeSignals(
        [fabioSignal, gridSignal, meanReversionSignal],
        symbol,
        brokerName,
        multiTF,
        keyLevels,
        orderFlow,
        candlesByTimeframe
      );

      logger.info(
        { signal: finalSignal.signal, symbol, confidence: finalSignal.confidence },
        'Signal generated'
      );

      return finalSignal;
    } catch (error) {
      logger.error({ error, symbol }, 'Signal generation failed');
      throw error;
    }
  }

  private async fetchMultiTimeframeCandles(symbol: string) {
    if (!this.brokerService) {
      throw new Error('Broker not initialized');
    }

    const timeframes = ['1d', '4h', '1h', '5m', '1m'];
    const limits = { '1d': 100, '4h': 100, '1h': 100, '5m': 200, '1m': 300 };

    const candlesByTimeframe = {};

    for (const timeframe of timeframes) {
      try {
        const candles = await this.brokerService.getKlines(
          symbol,
          timeframe,
          limits[timeframe] || 100
        );
        candlesByTimeframe[timeframe] = candles;
      } catch (error) {
        logger.warn({ error, symbol, timeframe }, 'Failed to fetch candles');
        candlesByTimeframe[timeframe] = [];
      }
    }

    return candlesByTimeframe;
  }

  private synthesizeSignals(
    strategySignals: StrategyResult[],
    symbol: string,
    broker: string,
    multiTF,
    keyLevels,
    orderFlow,
    candlesByTimeframe
  ): TradingSignal {
    // Voting mechanism
    const longVotes = strategySignals.filter(s => s.signal === 'Long').length;
    const shortVotes = strategySignals.filter(s => s.signal === 'Short').length;
    const flatVotes = strategySignals.filter(s => s.signal === 'Flat').length;

    let finalSignal: 'Long' | 'Short' | 'Flat' = 'Flat';
    let primaryStrategy = '';
    let baseConfidence = 0;

    if (longVotes >= 2) {
      finalSignal = 'Long';
      const longStrategies = strategySignals.filter(s => s.signal === 'Long');
      const primary = longStrategies.reduce((prev, curr) =>
        curr.confidence > prev.confidence ? curr : prev
      );
      primaryStrategy = primary.strategy;
      baseConfidence = primary.confidence;
    } else if (shortVotes >= 2) {
      finalSignal = 'Short';
      const shortStrategies = strategySignals.filter(s => s.signal === 'Short');
      const primary = shortStrategies.reduce((prev, curr) =>
        curr.confidence > prev.confidence ? curr : prev
      );
      primaryStrategy = primary.strategy;
      baseConfidence = primary.confidence;
    }

    // Adjust confidence based on vote unanimity
    let confidence = baseConfidence;
    if (longVotes === 3 || shortVotes === 3) {
      confidence = Math.min(0.95, baseConfidence * 1.1);
    } else if (longVotes === 2 || shortVotes === 2) {
      confidence = baseConfidence * 0.9;
    } else {
      confidence = 0.3;
    }

    // Get primary strategy signal for details
    const primaryStrategySignal = strategySignals.find(s => s.strategy === primaryStrategy) ||
      strategySignals[0];

    // Build time frame analysis data
    const timeframeAnalysis = {};
    for (const [tf, analysis] of multiTF.analyses.entries()) {
      timeframeAnalysis[tf] = analysis;
    }

    return {
      signal_id: uuidv4(),
      timestamp: new Date().toISOString(),
      symbol,
      broker,
      timeframes: ['1d', '4h', '1h', '5m', '1m'],
      market_state: primaryStrategySignal.market_state,
      setup: primaryStrategySignal.setup,
      signal: finalSignal,
      reason: primaryStrategySignal.reason,
      entry: primaryStrategySignal.entry,
      stop_loss: primaryStrategySignal.stop_loss,
      target: primaryStrategySignal.target,
      confidence,
      strategy_used: primaryStrategy,
      strategies_consensus: {
        fabio: strategySignals.find(s => s.strategy === 'fabio')?.signal || 'Flat',
        grid: strategySignals.find(s => s.strategy === 'grid')?.signal || 'Flat',
        mean_reversion: strategySignals.find(s => s.strategy === 'mean_reversion')?.signal || 'Flat',
      },
      key_levels: keyLevels.slice(0, 10), // Top 10 levels
      timeframe_analysis: timeframeAnalysis,
      order_flow: orderFlow,
    };
  }

  private getBinSize(price: number): number {
    if (price > 1000) return 10;
    if (price > 1) return 0.1;
    if (price > 0.01) return 0.001;
    return 0.00001;
  }
}
