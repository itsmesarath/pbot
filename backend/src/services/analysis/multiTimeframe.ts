/**
 * Multi-Timeframe Analysis
 * Analyzes trends across 1d, 4h, 1h, 5m, 1m timeframes
 */

import { Candle } from '../../types/broker';
import { TimeframeAnalysis, MultiTimeframeAnalysis } from '../../types/strategy';

export class MultiTimeframeAnalyzer {
  static timeframeOrder = ['1d', '4h', '1h', '5m', '1m'];
  static smaPeriod = 200;

  static analyzeMultiTimeframe(candlesByTimeframe: {
    [key: string]: Candle[];
  }): MultiTimeframeAnalysis {
    const analyses = new Map<string, TimeframeAnalysis>();

    for (const timeframe of this.timeframeOrder) {
      const candles = candlesByTimeframe[timeframe] || [];
      if (candles.length > 0) {
        analyses.set(timeframe, this.analyzeTimeframe(candles, timeframe));
      }
    }

    const confluenceScore = this.calculateConfluence(analyses);
    const dominantTrend = this.determineDominantTrend(analyses);
    const conflictCount = this.countConflicts(analyses);

    return {
      analyses,
      conflictCount,
      confluenceScore,
      dominantTrend,
    };
  }

  private static analyzeTimeframe(candles: Candle[], timeframe: string): TimeframeAnalysis {
    const trend = this.determineTrend(candles);
    const sma = this.calculateSMA(candles, this.smaPeriod);
    const smaAlignment = this.isSMAAligned(candles, sma, trend);
    const bias = this.determineBias(trend, smaAlignment);
    const confidence = this.calculateConfidence(candles, trend);
    const structure = this.identifyStructure(candles);

    return {
      timeframe,
      trend,
      bias,
      confidence,
      smaAlignment,
      structure,
    };
  }

  private static determineTrend(candles: Candle[]): 'UP' | 'DOWN' | 'NEUTRAL' {
    if (candles.length < 5) return 'NEUTRAL';

    const recent = candles.slice(-5);
    const highs = recent.map(c => c.high);
    const lows = recent.map(c => c.low);
    const closes = recent.map(c => c.close);

    // Check for higher highs and higher lows
    const hasHigherHighs = highs[highs.length - 1] > Math.max(...highs.slice(0, -1));
    const hasHigherLows = lows[lows.length - 1] > Math.max(...lows.slice(0, -1));
    const isAboveAverage = closes[closes.length - 1] > closes.reduce((a, b) => a + b) / closes.length;

    if (hasHigherHighs && hasHigherLows && isAboveAverage) {
      return 'UP';
    }

    // Check for lower highs and lower lows
    const hasLowerHighs = highs[highs.length - 1] < Math.min(...highs.slice(0, -1));
    const hasLowerLows = lows[lows.length - 1] < Math.min(...lows.slice(0, -1));
    const isBelowAverage = closes[closes.length - 1] < closes.reduce((a, b) => a + b) / closes.length;

    if (hasLowerHighs && hasLowerLows && isBelowAverage) {
      return 'DOWN';
    }

    return 'NEUTRAL';
  }

  private static calculateSMA(candles: Candle[], period: number): number {
    const closes = candles.slice(-period).map(c => c.close);
    if (closes.length < period) {
      // Not enough data, use what we have
      return closes.reduce((a, b) => a + b, 0) / closes.length;
    }
    return closes.reduce((a, b) => a + b, 0) / closes.length;
  }

  private static isSMAAligned(candles: Candle[], sma: number, trend: string): boolean {
    const lastClose = candles[candles.length - 1].close;

    if (trend === 'UP') {
      return lastClose > sma;
    } else if (trend === 'DOWN') {
      return lastClose < sma;
    }
    return Math.abs(lastClose - sma) < sma * 0.01; // Within 1% for neutral
  }

  private static determineBias(trend: string, smaAligned: boolean): 'Bullish' | 'Bearish' | 'Neutral' {
    if (trend === 'UP' && smaAligned) return 'Bullish';
    if (trend === 'DOWN' && smaAligned) return 'Bearish';
    if (trend === 'UP') return 'Bullish'; // Even if not SMA aligned
    if (trend === 'DOWN') return 'Bearish';
    return 'Neutral';
  }

  private static calculateConfidence(candles: Candle[], trend: string): number {
    if (trend === 'NEUTRAL') return 0.3;

    const recent = candles.slice(-10);
    let confluencePoints = 0;

    // Check if all recent candles move in the right direction
    if (trend === 'UP') {
      const closingUp = recent.filter(c => c.close > c.open).length;
      confluencePoints = (closingUp / recent.length) * 100;
    } else {
      const closingDown = recent.filter(c => c.close < c.open).length;
      confluencePoints = (closingDown / recent.length) * 100;
    }

    // Map to 0-1 confidence
    if (confluencePoints >= 80) return 0.9;
    if (confluencePoints >= 70) return 0.85;
    if (confluencePoints >= 60) return 0.75;
    if (confluencePoints >= 50) return 0.65;
    return 0.5;
  }

  private static identifyStructure(
    candles: Candle[]
  ): 'HigherLows' | 'LowerHighs' | 'DoubleTop' | 'DoubleBottom' | 'Consolidation' {
    if (candles.length < 5) return 'Consolidation';

    const recent = candles.slice(-5);
    const lows = recent.map(c => c.low);
    const highs = recent.map(c => c.high);

    const isHigherLows = lows[lows.length - 1] > lows[lows.length - 2];
    const isLowerHighs = highs[highs.length - 1] < highs[highs.length - 2];

    if (isHigherLows && !isLowerHighs) return 'HigherLows';
    if (isLowerHighs && !isHigherLows) return 'LowerHighs';
    if (Math.abs(highs[0] - highs[highs.length - 1]) < highs[0] * 0.01) return 'DoubleTop';
    if (Math.abs(lows[0] - lows[lows.length - 1]) < lows[0] * 0.01) return 'DoubleBottom';
    return 'Consolidation';
  }

  private static calculateConfluence(analyses: Map<string, TimeframeAnalysis>): number {
    if (analyses.size === 0) return 0;

    let alignedCount = 0;
    const allTrends = Array.from(analyses.values()).map(a => a.trend);

    // Determine dominant trend
    const upCount = allTrends.filter(t => t === 'UP').length;
    const downCount = allTrends.filter(t => t === 'DOWN').length;
    const dominantTrend = upCount > downCount ? 'UP' : downCount > upCount ? 'DOWN' : 'NEUTRAL';

    // Count aligned timeframes
    for (const analysis of analyses.values()) {
      if (dominantTrend === 'NEUTRAL') {
        alignedCount += 0.5;
      } else if (analysis.trend === dominantTrend) {
        alignedCount++;
      }
    }

    return alignedCount / analyses.size;
  }

  private static determineDominantTrend(
    analyses: Map<string, TimeframeAnalysis>
  ): 'UP' | 'DOWN' | 'MIXED' {
    const trends = Array.from(analyses.values()).map(a => a.trend);
    const upCount = trends.filter(t => t === 'UP').length;
    const downCount = trends.filter(t => t === 'DOWN').length;

    if (upCount > downCount) return 'UP';
    if (downCount > upCount) return 'DOWN';
    return 'MIXED';
  }

  private static countConflicts(analyses: Map<string, TimeframeAnalysis>): number {
    const daily = analyses.get('1d');
    const fourH = analyses.get('4h');

    if (!daily || !fourH) return 0;

    // Count as conflict if daily and 4h trends are opposite
    if (
      (daily.trend === 'UP' && fourH.trend === 'DOWN') ||
      (daily.trend === 'DOWN' && fourH.trend === 'UP')
    ) {
      return 1;
    }

    return 0;
  }
}
