/**
 * Mean Reversion Strategy Engine
 * Trades failed breakouts returning to balance
 */

import { BaseStrategy } from './baseStrategy';
import { StrategyInput, StrategyResult } from '../../types/strategy';
import pino from 'pino';

const logger = pino();

export class MeanReversionStrategy extends BaseStrategy {
  constructor() {
    super('mean_reversion');
  }

  async generateSignal(input: StrategyInput): Promise<StrategyResult> {
    try {
      // Mean reversion works when breakouts fail
      const oneHAnalysis = input.multiTimeframe.analyses.get('1h');
      if (!oneHAnalysis) {
        return this.createFlatSignal(input, '1H data not available');
      }

      const oneHCandles = input.candles['1h'] || [];
      if (oneHCandles.length < 20) {
        return this.createFlatSignal(input, 'Insufficient 1H data');
      }

      // Look for failed breakout pattern
      const { isFailed, direction, strength } = this.detectFailedBreakout(oneHCandles);

      if (!isFailed) {
        return this.createFlatSignal(input, 'No failed breakout detected');
      }

      // Direction is opposite of the failed breakout
      let signal: 'Long' | 'Short' = direction === 'UP' ? 'Short' : 'Long';
      let confidence = 0.65 + strength * 0.2;

      // Validate with order flow
      const flowConfirms = this.validateOrderFlowForReversion(input.orderFlow, signal);
      if (!flowConfirms) {
        confidence *= 0.7;
      }

      // Calculate mean (support/resistance from which price broke out)
      const currentPrice = oneHCandles[oneHCandles.length - 1].close;
      const support = Math.min(...oneHCandles.slice(-10).map(c => c.low));
      const resistance = Math.max(...oneHCandles.slice(-10).map(c => c.high));

      let entry, stopLoss, target;

      if (signal === 'Long') {
        // Price failed to go below support, revert upward
        entry = Math.max(support, input.volumeProfile.POC?.price || support);
        stopLoss = support * 0.98;
        target = resistance * 1.01;
      } else {
        // Price failed to go above resistance, revert downward
        entry = Math.min(resistance, input.volumeProfile.POC?.price || resistance);
        stopLoss = resistance * 1.02;
        target = support * 0.99;
      }

      const reason = `Failed ${direction} breakout detected. Price rejecting ${direction === 'UP' ? 'resistance' : 'support'} with ${(strength * 100).toFixed(0)}% strength.`;

      return {
        strategy: 'mean_reversion',
        signal,
        confidence: Math.min(0.85, confidence),
        entry,
        stop_loss: stopLoss,
        target,
        reason,
        setup: 'Mean Reversion',
        market_state: 'Balanced',
      };
    } catch (error) {
      logger.error({ error }, 'Mean reversion strategy error');
      return this.createFlatSignal(input, `Strategy error: ${error}`);
    }
  }

  private detectFailedBreakout(
    candles
  ): { isFailed: boolean; direction: 'UP' | 'DOWN'; strength: number } {
    if (candles.length < 10) {
      return { isFailed: false, direction: 'UP', strength: 0 };
    }

    // Look at last 5 candles for breakout attempt
    const recent = candles.slice(-5);
    const older = candles.slice(-10, -5);

    const oldHigh = Math.max(...older.map(c => c.high));
    const oldLow = Math.min(...older.map(c => c.low));

    // Check for up breakout attempt
    const hasUpBreakout = recent.some(c => c.high > oldHigh);
    const breakoutFailed = recent[recent.length - 1].close < oldHigh;

    if (hasUpBreakout && breakoutFailed) {
      // Calculate how close it got to failure
      const strength = 1 - (recent[recent.length - 1].high - oldHigh) / (oldHigh * 0.02 + 1);
      return { isFailed: true, direction: 'UP', strength: Math.max(0, strength) };
    }

    // Check for down breakout attempt
    const hasDownBreakout = recent.some(c => c.low < oldLow);
    const downFailed = recent[recent.length - 1].close > oldLow;

    if (hasDownBreakout && downFailed) {
      const strength = 1 - (oldLow - recent[recent.length - 1].low) / (oldLow * 0.02 + 1);
      return { isFailed: true, direction: 'DOWN', strength: Math.max(0, strength) };
    }

    return { isFailed: false, direction: 'UP', strength: 0 };
  }

  private validateOrderFlowForReversion(orderFlow, signal: 'Long' | 'Short'): boolean {
    // For reversion, we want diminishing volume on the failed breakout
    // and volume increasing in the reversal direction
    return orderFlow.volumeCluster !== 'above_average';
  }
}
