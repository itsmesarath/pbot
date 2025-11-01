/**
 * Abstract base class for all trading strategies
 */

import { StrategyInput, StrategyResult } from '../../types/strategy';

export abstract class BaseStrategy {
  protected strategyName: string;

  constructor(strategyName: string) {
    this.strategyName = strategyName;
  }

  abstract generateSignal(input: StrategyInput): Promise<StrategyResult>;

  /**
   * Helper to create a FLAT signal
   */
  protected createFlatSignal(input: StrategyInput, reason: string): StrategyResult {
    return {
      strategy: this.strategyName,
      signal: 'Flat',
      confidence: 0.1,
      entry: input.candles['1h']?.[input.candles['1h'].length - 1]?.close || 0,
      stop_loss: 0,
      target: 0,
      reason,
      setup: 'None',
      market_state: 'Balanced',
    };
  }

  /**
   * Helper to calculate risk-reward ratio
   */
  protected calculateRiskReward(entry: number, stopLoss: number, target: number): number {
    const riskPoints = Math.abs(entry - stopLoss);
    const rewardPoints = Math.abs(target - entry);

    if (riskPoints === 0) return 0;
    return rewardPoints / riskPoints;
  }
}
