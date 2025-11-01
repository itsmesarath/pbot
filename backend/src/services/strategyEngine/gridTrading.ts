/**
 * Grid Trading Strategy Engine
 * Trades range-bound markets with grid orders
 */

import { BaseStrategy } from './baseStrategy';
import { StrategyInput, StrategyResult } from '../../types/strategy';
import pino from 'pino';

const logger = pino();

export class GridTradingStrategy extends BaseStrategy {
  private gridLevels = 10;

  constructor(gridLevels = 10) {
    super('grid');
    this.gridLevels = gridLevels;
  }

  async generateSignal(input: StrategyInput): Promise<StrategyResult> {
    try {
      // Grid trading works in balanced/consolidation markets
      const oneHAnalysis = input.multiTimeframe.analyses.get('1h');
      if (!oneHAnalysis) {
        return this.createFlatSignal(input, '1H data not available for grid analysis');
      }

      // Only trade grids in consolidation/balanced market
      if (
        oneHAnalysis.structure !== 'Consolidation' &&
        input.multiTimeframe.confluenceScore > 0.6
      ) {
        return this.createFlatSignal(input, 'Market not in consolidation - grid trading not ideal');
      }

      // Identify range
      const oneHCandles = input.candles['1h'] || [];
      if (oneHCandles.length < 20) {
        return this.createFlatSignal(input, 'Insufficient 1H data for grid analysis');
      }

      const high = Math.max(...oneHCandles.map(c => c.high));
      const low = Math.min(...oneHCandles.map(c => c.low));
      const range = high - low;

      // ATR check - want tight consolidation
      const atr = this.calculateATR(oneHCandles);
      const atrPercent = (atr / oneHCandles[oneHCandles.length - 1].close) * 100;

      if (atrPercent > 2) {
        return this.createFlatSignal(input, `ATR ${atrPercent.toFixed(2)}% too high for grid trading`);
      }

      // Check current position in range
      const currentPrice = oneHCandles[oneHCandles.length - 1].close;
      const positionInRange = (currentPrice - low) / range;

      let signal: 'Long' | 'Short' | 'Flat' = 'Flat';
      let confidence = 0.65;

      // Grid LONG if at lower half of range and volume is low (consolidation)
      if (positionInRange < 0.5 && input.orderFlow.volumeCluster === 'below_average') {
        signal = 'Long';
        confidence = 0.7;
      }
      // Grid SHORT if at upper half of range and volume is low
      else if (positionInRange > 0.5 && input.orderFlow.volumeCluster === 'below_average') {
        signal = 'Short';
        confidence = 0.7;
      }

      if (signal === 'Flat') {
        return this.createFlatSignal(input, 'Position not ideal for grid trading');
      }

      return {
        strategy: 'grid',
        signal,
        confidence,
        entry: currentPrice,
        stop_loss: signal === 'Long' ? low * 0.98 : high * 1.02,
        target: signal === 'Long' ? high * 0.99 : low * 1.01,
        reason: `Grid trading setup: price at ${positionInRange.toFixed(0)}% of range, ATR ${atrPercent.toFixed(2)}%, consolidation detected`,
        setup: 'Grid Trading',
        market_state: 'Balanced',
      };
    } catch (error) {
      logger.error({ error }, 'Grid strategy error');
      return this.createFlatSignal(input, `Strategy error: ${error}`);
    }
  }

  private calculateATR(candles, period = 14): number {
    if (candles.length < period) {
      return 0;
    }

    let sumTR = 0;
    for (let i = 1; i < period; i++) {
      const tr = this.calculateTrueRange(candles[i - 1], candles[i]);
      sumTR += tr;
    }

    return sumTR / period;
  }

  private calculateTrueRange(prev, current): number {
    const highLow = current.high - current.low;
    const highClose = Math.abs(current.high - prev.close);
    const lowClose = Math.abs(current.low - prev.close);

    return Math.max(highLow, highClose, lowClose);
  }
}
