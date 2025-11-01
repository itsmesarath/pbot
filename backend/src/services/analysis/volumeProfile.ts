/**
 * Volume Profile Analysis
 * Identifies POC (Point of Control), HVN (High Volume Nodes), LVN (Low Volume Nodes)
 */

import { Candle } from '../../types/broker';

export interface VolumeBin {
  priceLevel: number;
  volume: number;
  percentageOfTotal: number;
}

export interface VolumeProfile {
  POC: { price: number; volume: number };
  HVN: VolumeBin[];
  LVN: VolumeBin[];
  valueArea: { high: number; low: number; volumePercent: number };
  totalVolume: number;
}

export class VolumeProfileAnalyzer {
  /**
   * Calculates volume profile for a set of candles
   * @param candles Array of candles
   * @param binSize Price level bin size (e.g., 10 for Bitcoin, 0.1 for altcoins)
   * @returns VolumeProfile with POC, HVN, LVN
   */
  static calculateVolumeProfile(candles: Candle[], binSize: number): VolumeProfile {
    if (!candles || candles.length === 0) {
      throw new Error('No candles provided for volume profile');
    }

    // Find price range
    const prices = candles.flatMap(c => [c.high, c.low]);
    const minPrice = Math.floor(Math.min(...prices) / binSize) * binSize;
    const maxPrice = Math.ceil(Math.max(...prices) / binSize) * binSize;

    // Create bins and accumulate volume
    const bins: Map<number, number> = new Map();
    let totalVolume = 0;

    for (const candle of candles) {
      // Distribute candle volume across its price range
      const volumePerPrice = candle.volume / (candle.high - candle.low || 1);

      let currentPrice = Math.ceil(candle.low / binSize) * binSize;
      while (currentPrice <= candle.high) {
        const binKey = parseFloat(currentPrice.toFixed(8)); // Avoid floating point issues
        const volumeInBin = Math.min(
          volumePerPrice * Math.min(currentPrice + binSize, candle.high + binSize) -
            volumePerPrice * Math.max(currentPrice, candle.low),
          candle.volume
        );

        bins.set(binKey, (bins.get(binKey) || 0) + volumeInBin);
        totalVolume += volumeInBin;
        currentPrice += binSize;
      }
    }

    // Convert to array and sort by price
    const sortedBins = Array.from(bins.entries())
      .map(([price, volume]) => ({
        priceLevel: price,
        volume,
        percentageOfTotal: (volume / totalVolume) * 100,
      }))
      .sort((a, b) => a.priceLevel - b.priceLevel);

    // Find POC (highest volume)
    const pocBin = sortedBins.reduce((max, bin) =>
      bin.volume > max.volume ? bin : max
    );

    // Calculate average volume per bin
    const averageVolume = totalVolume / sortedBins.length;

    // Identify HVN (>150% avg) and LVN (<50% avg)
    const hvn = sortedBins.filter(bin => bin.volume > averageVolume * 1.5);
    const lvn = sortedBins.filter(bin => bin.volume < averageVolume * 0.5);

    // Calculate value area (levels containing 70% of volume)
    let cumulativeVolume = 0;
    const valueAreaVolume = totalVolume * 0.7;
    let valueAreaHigh = pocBin.priceLevel;
    let valueAreaLow = pocBin.priceLevel;

    // Expand from POC until 70% is captured
    let expandUp = true;
    let expandDown = true;

    while (cumulativeVolume < valueAreaVolume && (expandUp || expandDown)) {
      let nextUpVolume = 0;
      let nextDownVolume = 0;

      if (expandUp) {
        const nextUp = sortedBins.find(b => b.priceLevel > valueAreaHigh);
        nextUpVolume = nextUp ? nextUp.volume : 0;
      }

      if (expandDown) {
        const nextDown = sortedBins.find(b => b.priceLevel < valueAreaLow);
        nextDownVolume = nextDown ? nextDown.volume : 0;
      }

      if (nextUpVolume > nextDownVolume && nextUpVolume > 0) {
        const bin = sortedBins.find(b => b.priceLevel > valueAreaHigh)!;
        cumulativeVolume += bin.volume;
        valueAreaHigh = bin.priceLevel;
        expandUp = cumulativeVolume < valueAreaVolume;
      } else if (nextDownVolume > 0) {
        const bin = sortedBins.find(b => b.priceLevel < valueAreaLow)!;
        cumulativeVolume += bin.volume;
        valueAreaLow = bin.priceLevel;
        expandDown = cumulativeVolume < valueAreaVolume;
      } else {
        break;
      }
    }

    return {
      POC: {
        price: pocBin.priceLevel,
        volume: pocBin.volume,
      },
      HVN: hvn,
      LVN: lvn,
      valueArea: {
        high: valueAreaHigh,
        low: valueAreaLow,
        volumePercent: 70,
      },
      totalVolume,
    };
  }

  /**
   * Calculates POC (Point of Control) - single most active price
   */
  static calculatePOC(candles: Candle[]): number {
    const profile = this.calculateVolumeProfile(candles, this.getBinSize(candles[0]?.close || 1));
    return profile.POC.price;
  }

  /**
   * Determines appropriate bin size based on asset price
   */
  private static getBinSize(price: number): number {
    if (price > 1000) return 10; // Bitcoin-like
    if (price > 1) return 0.1;
    if (price > 0.01) return 0.001;
    return 0.00001;
  }
}
