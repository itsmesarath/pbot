/**
 * Fabio Playbook Strategy Engine
 * Implements Auction Market Theory (AMT) with Volume Profile and Order Flow analysis
 */

import { BaseStrategy } from './baseStrategy';
import { StrategyInput, StrategyResult } from '../../types/strategy';
import pino from 'pino';

const logger = pino();

export class FabioPlaybookStrategy extends BaseStrategy {
  constructor() {
    super('fabio');
  }

  async generateSignal(input: StrategyInput): Promise<StrategyResult> {
    try {
      // 1. Check Daily Trend
      const dailyAnalysis = input.multiTimeframe.analyses.get('1d');
      if (!dailyAnalysis) {
        return this.createFlatSignal(input, 'Daily timeframe data not available');
      }

      // 2. Check 4H Confirmation
      const fourHAnalysis = input.multiTimeframe.analyses.get('4h');
      if (!fourHAnalysis) {
        return this.createFlatSignal(input, '4H timeframe data not available');
      }

      const hasConflict =
        (dailyAnalysis.trend === 'UP' && fourHAnalysis.trend === 'DOWN') ||
        (dailyAnalysis.trend === 'DOWN' && fourHAnalysis.trend === 'UP');

      const isConfirmed =
        dailyAnalysis.trend === fourHAnalysis.trend && dailyAnalysis.trend !== 'NEUTRAL';

      // 3. Check 1H Volume Profile
      const oneHAnalysis = input.multiTimeframe.analyses.get('1h');
      if (!oneHAnalysis) {
        return this.createFlatSignal(input, '1H timeframe data not available');
      }

      // 4. Determine Signal Direction
      let signalDirection: 'Long' | 'Short' | 'Flat' = 'Flat';
      let baseConfidence = 0.5;

      if (dailyAnalysis.trend === 'UP' || (dailyAnalysis.trend === 'NEUTRAL' && dailyAnalysis.bias === 'Bullish')) {
        if (isConfirmed || fourHAnalysis.bias === 'Bullish') {
          signalDirection = 'Long';
          baseConfidence = dailyAnalysis.confidence * 0.7 + fourHAnalysis.confidence * 0.3;
        }
      } else if (dailyAnalysis.trend === 'DOWN' || (dailyAnalysis.trend === 'NEUTRAL' && dailyAnalysis.bias === 'Bearish')) {
        if (isConfirmed || fourHAnalysis.bias === 'Bearish') {
          signalDirection = 'Short';
          baseConfidence = dailyAnalysis.confidence * 0.7 + fourHAnalysis.confidence * 0.3;
        }
      }

      if (signalDirection === 'Flat') {
        return this.createFlatSignal(input, 'Daily and 4H trends do not align for trading signal');
      }

      // 5. Validate with Order Flow
      const orderFlowConfirms = this.validateOrderFlow(input.orderFlow, signalDirection);
      if (!orderFlowConfirms) {
        baseConfidence *= 0.7; // Reduce confidence if order flow doesn't align
      }

      // 6. Check volume profile support
      const volumeProfileSupports = this.validateVolumeProfile(input.volumeProfile, signalDirection);
      if (!volumeProfileSupports) {
        baseConfidence *= 0.6;
      }

      // 7. Calculate entry, stop, target
      const { entry, stopLoss, target } = this.calculatePriceTargets(
        input,
        signalDirection,
        input.candles['5m'] || [],
        input.keyLevels
      );

      // 8. Final validation - min risk-reward of 1:1.5
      const riskReward = this.calculateRiskReward(entry, stopLoss, target);
      if (riskReward < 1.5) {
        baseConfidence *= 0.7;
      }

      // 9. Calculate final confidence
      const confluenceScore = input.multiTimeframe.confluenceScore;
      const finalConfidence = Math.min(0.95, baseConfidence * (0.5 + confluenceScore * 0.5));

      // 10. Determine setup type
      const setupType = input.multiTimeframe.dominantTrend !== 'MIXED' ? 'Trend Model' : 'Mean Reversion';

      return {
        strategy: 'fabio',
        signal: signalDirection,
        confidence: finalConfidence,
        entry,
        stop_loss: stopLoss,
        target,
        reason: this.buildReasoning(input, signalDirection, dailyAnalysis, fourHAnalysis),
        setup: setupType,
        market_state: this.determineMarketState(input),
      };
    } catch (error) {
      logger.error({ error }, 'Fabio strategy error');
      return this.createFlatSignal(input, `Strategy error: ${error}`);
    }
  }

  private validateOrderFlow(orderFlow, direction: 'Long' | 'Short'): boolean {
    const isBullish = orderFlow.cvd.startsWith('+');
    const hasVolume = orderFlow.volumeCluster === 'above_average';

    if (direction === 'Long') {
      return isBullish && orderFlow.deltaImbalance > 0.5 && hasVolume;
    } else {
      return !isBullish && orderFlow.deltaImbalance < 0.5 && hasVolume;
    }
  }

  private validateVolumeProfile(volumeProfile, direction: 'Long' | 'Short'): boolean {
    // Check if we have significant volume nodes
    return volumeProfile.HVN.length > 0 || volumeProfile.LVN.length > 0;
  }

  private calculatePriceTargets(
    input: StrategyInput,
    direction: 'Long' | 'Short',
    fiveMinCandles,
    keyLevels
  ): { entry: number; stopLoss: number; target: number } {
    const currentPrice = input.candles['1h']?.[input.candles['1h'].length - 1]?.close || 0;

    if (direction === 'Long') {
      // Entry: current price or pullback to support
      const entry = currentPrice;

      // Stop: below swing low or support level
      const fiveMinLow = Math.min(...(fiveMinCandles.map(c => c.low) || [currentPrice]));
      const stopLoss = Math.min(fiveMinLow, ...keyLevels.filter(l => l.price < currentPrice).map(l => l.price));

      // Target: next resistance or POC
      const resistances = keyLevels.filter(l => l.price > currentPrice);
      const target = resistances.length > 0 ? resistances[0].price : currentPrice * 1.02;

      return { entry, stopLoss: stopLoss * 0.99, target: target * 1.01 };
    } else {
      // Entry: current price
      const entry = currentPrice;

      // Stop: above swing high or resistance
      const fiveMinHigh = Math.max(...(fiveMinCandles.map(c => c.high) || [currentPrice]));
      const stopLoss = Math.max(fiveMinHigh, ...keyLevels.filter(l => l.price > currentPrice).map(l => l.price));

      // Target: next support
      const supports = keyLevels.filter(l => l.price < currentPrice);
      const target = supports.length > 0 ? supports[0].price : currentPrice * 0.98;

      return { entry, stopLoss: stopLoss * 1.01, target: target * 0.99 };
    }
  }

  private buildReasoning(input, direction, daily, fourH): string {
    const trends = `Daily ${daily.trend}, 4H ${fourH.trend}`;
    const volume =
      input.volumeProfile.POC ?
        `POC at ${input.volumeProfile.POC.price}`
        : 'No volume profile';
    const flow = `CVD ${input.orderFlow.cvd}, ${input.orderFlow.aggression}`;

    return `Multi-timeframe analysis: ${trends}, confluence score ${(input.multiTimeframe.confluenceScore * 100).toFixed(0)}%. Volume: ${volume}. Order flow: ${flow}.`;
  }

  private determineMarketState(input): 'Balanced' | 'Out of Balance' {
    // If confluence score is high and trend is strong, market is imbalanced
    if (input.multiTimeframe.confluenceScore > 0.7 && input.multiTimeframe.dominantTrend !== 'MIXED') {
      return 'Out of Balance';
    }
    return 'Balanced';
  }
}
