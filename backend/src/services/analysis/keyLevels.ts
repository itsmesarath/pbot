/**
 * Key Levels Detection
 * Identifies support, resistance, and key price levels across timeframes
 */

import { Candle } from '../../types/broker';
import { KeyLevel, VolumeProfile, MultiTimeframeAnalysis } from '../../types/strategy';

export class KeyLevelsAnalyzer {
  static detectKeyLevels(
    volumeProfile: VolumeProfile,
    candlesByTimeframe: { [key: string]: Candle[] },
    multiTF: MultiTimeframeAnalysis
  ): KeyLevel[] {
    const levels: KeyLevel[] = [];

    // Tier 1: Daily levels (highest significance)
    const dailyCandles = candlesByTimeframe['1d'] || [];
    if (dailyCandles.length > 0) {
      const lastDaily = dailyCandles[dailyCandles.length - 1];
      levels.push({
        price: lastDaily.high,
        type: 'DAILY_HIGH',
        timeframe: '1d',
        significance: 5,
      });
      levels.push({
        price: lastDaily.low,
        type: 'DAILY_LOW',
        timeframe: '1d',
        significance: 5,
      });
      levels.push({
        price: lastDaily.open,
        type: 'DAILY_OPEN',
        timeframe: '1d',
        significance: 4,
      });
    }

    // Tier 2: 4H swing levels
    const fourHCandles = candlesByTimeframe['4h'] || [];
    if (fourHCandles.length >= 5) {
      const swings = this.identifySwingPoints(fourHCandles, 5);
      swings.forEach(swing => {
        levels.push({
          price: swing.price,
          type: swing.isHigh ? '4H_SWING_HIGH' : '4H_SWING_LOW',
          timeframe: '4h',
          significance: 4,
          touches: swing.touches,
        });
      });
    }

    // Tier 3: Volume profile levels (POC, HVN, LVN)
    if (volumeProfile.POC) {
      levels.push({
        price: volumeProfile.POC.price,
        type: 'POC',
        timeframe: '1h',
        significance: 3,
      });
    }

    volumeProfile.HVN.slice(0, 3).forEach(hvn => {
      levels.push({
        price: hvn.priceLevel,
        type: 'HVN',
        timeframe: '1h',
        significance: 3,
      });
    });

    volumeProfile.LVN.slice(0, 2).forEach(lvn => {
      levels.push({
        price: lvn.priceLevel,
        type: 'LVN',
        timeframe: '1h',
        significance: 2,
      });
    });

    // Tier 4: 5M support/resistance
    const fiveMinCandles = candlesByTimeframe['5m'] || [];
    if (fiveMinCandles.length >= 10) {
      const highestHigh = Math.max(...fiveMinCandles.map(c => c.high));
      const lowestLow = Math.min(...fiveMinCandles.map(c => c.low));

      levels.push({
        price: highestHigh,
        type: '5M_RESISTANCE',
        timeframe: '5m',
        significance: 2,
      });
      levels.push({
        price: lowestLow,
        type: '5M_SUPPORT',
        timeframe: '5m',
        significance: 2,
      });
    }

    // Sort by price and remove duplicates
    return this.removeDuplicates(levels.sort((a, b) => a.price - b.price));
  }

  /**
   * Identifies swing highs and lows
   */
  private static identifySwingPoints(
    candles: Candle[],
    lookbackBars: number
  ): { price: number; isHigh: boolean; touches: number }[] {
    const swings: { price: number; isHigh: boolean; touches: number }[] = [];

    for (let i = lookbackBars; i < candles.length - lookbackBars; i++) {
      // Check for swing high
      const isSwingHigh = candles[i].high >= Math.max(...candles.slice(i - lookbackBars, i).map(c => c.high)) &&
        candles[i].high >= Math.max(...candles.slice(i + 1, i + lookbackBars + 1).map(c => c.high));

      if (isSwingHigh) {
        swings.push({
          price: candles[i].high,
          isHigh: true,
          touches: 1,
        });
      }

      // Check for swing low
      const isSwingLow = candles[i].low <= Math.min(...candles.slice(i - lookbackBars, i).map(c => c.low)) &&
        candles[i].low <= Math.min(...candles.slice(i + 1, i + lookbackBars + 1).map(c => c.low));

      if (isSwingLow) {
        swings.push({
          price: candles[i].low,
          isHigh: false,
          touches: 1,
        });
      }
    }

    return swings;
  }

  /**
   * Removes duplicate levels (within 0.5% price range)
   */
  private static removeDuplicates(levels: KeyLevel[]): KeyLevel[] {
    const result: KeyLevel[] = [];
    const tolerance = 0.005; // 0.5%

    for (const level of levels) {
      const isDuplicate = result.some(
        l => Math.abs(l.price - level.price) / l.price < tolerance
      );

      if (!isDuplicate) {
        result.push(level);
      }
    }

    return result;
  }

  /**
   * Identifies supports and resistances relative to current price
   */
  static identifySupportsResistances(keyLevels: KeyLevel[], currentPrice: number): {
    supports: KeyLevel[];
    resistances: KeyLevel[];
  } {
    const supports = keyLevels.filter(l => l.price < currentPrice).sort((a, b) => b.price - a.price);
    const resistances = keyLevels.filter(l => l.price > currentPrice).sort((a, b) => a.price - b.price);

    return { supports, resistances };
  }
}
