/**
 * Order Flow Analysis
 * Analyzes CVD (Cumulative Volume Delta), delta imbalance, and aggression levels
 */

import { Candle } from '../../types/broker';
import { OrderFlowData, AggressionLevel, VolumeClusters } from '../../types/strategy';

export interface CandleWithDelta extends Candle {
  delta: number; // Buy volume - Sell volume estimate
}

export class OrderFlowAnalyzer {
  /**
   * Analyzes order flow from candles
   * Estimates buy/sell volume based on close > open (buy) or close < open (sell)
   */
  static analyzeOrderFlow(candles: Candle[]): OrderFlowData {
    if (!candles || candles.length === 0) {
      throw new Error('No candles provided for order flow analysis');
    }

    const candlesWithDelta = this.calculateDeltas(candles);
    const cvd = this.calculateCVD(candlesWithDelta);
    const { buyVolume, sellVolume } = this.estimateBuySellVolume(candlesWithDelta);
    const deltaImbalance = this.calculateDeltaImbalance(buyVolume, sellVolume);
    const volumeCluster = this.determineVolumeCluster(candles);
    const aggression = this.determineAggression(cvd, candlesWithDelta, volumeCluster);

    return {
      cvd: cvd > 0 ? `+${cvd}` : `${cvd}`,
      deltaImbalance,
      buyVolume,
      sellVolume,
      aggression,
      volumeCluster,
      lastAggressivePrint: this.getLastAggressivePrint(candlesWithDelta),
    };
  }

  /**
   * Calculates delta (buy - sell) for each candle
   * Estimation: if close > open = more buying, if close < open = more selling
   */
  private static calculateDeltas(candles: Candle[]): CandleWithDelta[] {
    return candles.map(candle => ({
      ...candle,
      delta: this.estimateCandleDelta(candle),
    }));
  }

  /**
   * Estimates candle delta based on close vs open
   * Close > Open = buying pressure (positive delta)
   * Close < Open = selling pressure (negative delta)
   */
  private static estimateCandleDelta(candle: Candle): number {
    const bodySizePercent = (Math.abs(candle.close - candle.open) / candle.open) * 100;

    if (candle.close > candle.open) {
      // Bullish candle - estimate buy volume
      return candle.volume * (0.5 + bodyPercent / 100); // More buy volume as body gets larger
    } else if (candle.close < candle.open) {
      // Bearish candle - estimate sell volume
      return -candle.volume * (0.5 + bodySizePercent / 100);
    } else {
      // Doji - neutral
      return 0;
    }

    function bodyPercent() {
      return bodySizePercent;
    }
  }

  /**
   * Calculates Cumulative Volume Delta
   */
  private static calculateCVD(candlesWithDelta: CandleWithDelta[]): number {
    return Math.round(candlesWithDelta.reduce((sum, candle) => sum + candle.delta, 0));
  }

  /**
   * Estimates buy and sell volumes
   */
  private static estimateBuySellVolume(candlesWithDelta: CandleWithDelta[]): {
    buyVolume: number;
    sellVolume: number;
  } {
    let buyVolume = 0;
    let sellVolume = 0;

    for (const candle of candlesWithDelta) {
      if (candle.delta > 0) {
        buyVolume += Math.abs(candle.delta);
      } else {
        sellVolume += Math.abs(candle.delta);
      }
    }

    return { buyVolume: Math.round(buyVolume), sellVolume: Math.round(sellVolume) };
  }

  /**
   * Calculates delta imbalance ratio (0-1)
   * 0.5 = balanced, >0.65 = strong bias
   */
  private static calculateDeltaImbalance(buyVolume: number, sellVolume: number): number {
    const total = buyVolume + sellVolume;
    if (total === 0) return 0.5; // Neutral if no volume

    return buyVolume / total;
  }

  /**
   * Determines if volume is above, at, or below average
   */
  private static determineVolumeCluster(candles: Candle[]): VolumeClusters {
    const avgVolume = candles.reduce((sum, c) => sum + c.volume, 0) / candles.length;
    const recentAvgVolume = candles
      .slice(-5)
      .reduce((sum, c) => sum + c.volume, 0) / 5;

    if (recentAvgVolume > avgVolume * 1.2) {
      return 'above_average';
    } else if (recentAvgVolume < avgVolume * 0.8) {
      return 'below_average';
    }
    return 'average';
  }

  /**
   * Determines aggression level based on CVD, recent candles, and volume
   */
  private static determineAggression(
    cvd: number,
    candlesWithDelta: CandleWithDelta[],
    volumeCluster: VolumeClusters
  ): AggressionLevel {
    const recent3 = candlesWithDelta.slice(-3);
    const bullishCount = recent3.filter(c => c.close > c.open).length;
    const recentVolume = recent3.reduce((sum, c) => sum + c.volume, 0);
    const avgVolume = candlesWithDelta.reduce((sum, c) => sum + c.volume, 0) / candlesWithDelta.length;

    const isBullish = bullishCount >= 2 && recentVolume > avgVolume * 1.5;
    const isBearish = bullishCount <= 1 && recentVolume > avgVolume * 1.5;

    if (cvd > 20000 && isBullish) {
      return 'STRONG_BUY';
    } else if (cvd > 10000 && isBullish) {
      return 'BUY';
    } else if (cvd < -20000 && isBearish) {
      return 'STRONG_SELL';
    } else if (cvd < -10000 && isBearish) {
      return 'SELL';
    }
    return 'NEUTRAL';
  }

  /**
   * Gets the last aggressive print
   */
  private static getLastAggressivePrint(
    candlesWithDelta: CandleWithDelta[]
  ): OrderFlowData['lastAggressivePrint'] {
    const lastCandle = candlesWithDelta[candlesWithDelta.length - 1];

    if (!lastCandle) return undefined;

    const absDelta = Math.abs(lastCandle.delta);
    if (absDelta > 0) {
      return {
        type: lastCandle.delta > 0 ? 'BUY' : 'SELL',
        volume: Math.round(absDelta),
        price: lastCandle.close,
        timestamp: new Date(lastCandle.time).toISOString(),
      };
    }

    return undefined;
  }
}
