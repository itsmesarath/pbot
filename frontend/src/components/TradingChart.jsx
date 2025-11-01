import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { useTradingStore } from '../store/tradingStore';

const TradingChart = () => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const priceLinesRef = useRef([]);
  const chartReadyRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const lastCandleCountRef = useRef(0);
  const lastSymbolRef = useRef('');
  const lastIntervalRef = useRef('');

  const { candlestickData, keyLevels, currentSignal, symbol, interval } = useTradingStore();

  useEffect(() => {
    if (!chartContainerRef.current) {
      console.log('⏳ Chart container ref not ready');
      return;
    }

    if (chartRef.current) {
      console.log('⚠️ Chart already exists, skipping creation');
      return;
    }

    console.log('📊 Creating chart...');
    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#1e222d' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2a2e39' },
        horzLines: { color: '#2a2e39' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 600,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
      },
    });

    chartRef.current = chart;
    console.log('✅ Chart created successfully');

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    candlestickSeriesRef.current = candlestickSeries;
    console.log('✅ Candlestick series added');

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;
    chartReadyRef.current = true;
    console.log('✅ Volume series added - CHART READY!');

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      console.log('🧹 Cleaning up chart...');
      chartReadyRef.current = false;
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      candlestickSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);

  // Update candlestick data
  useEffect(() => {
    // Check if symbol or interval changed
    if (symbol !== lastSymbolRef.current || interval !== lastIntervalRef.current) {
      console.log('🔄 Symbol/Interval changed, resetting chart...');
      isInitialLoadRef.current = true;
      lastCandleCountRef.current = 0;
      lastSymbolRef.current = symbol;
      lastIntervalRef.current = interval;
    }

    console.log('📈 Candlestick data update triggered:', {
      chartReady: chartReadyRef.current,
      seriesReady: !!candlestickSeriesRef.current,
      volumeSeriesReady: !!volumeSeriesRef.current,
      dataType: typeof candlestickData,
      isArray: Array.isArray(candlestickData),
      dataLength: candlestickData?.length
    });

    if (!chartReadyRef.current || !candlestickSeriesRef.current || !volumeSeriesRef.current) {
      console.log('⏳ Chart not ready yet, will retry when ready');
      return;
    }

    // Safety check: ensure candlestickData is an array
    if (!Array.isArray(candlestickData)) {
      console.error('❌ candlestickData is not an array!', typeof candlestickData, candlestickData);
      return;
    }

    if (!candlestickData.length) {
      console.log('⏳ No data yet, waiting...');
      return;
    }

    try {
      console.log('🎨 Updating chart with', candlestickData.length, 'candles');
      console.log('📊 Sample candle:', candlestickData[0]);
      
      // Filter out any undefined or invalid candles
      const validCandles = candlestickData.filter(candle => 
        candle && 
        typeof candle.time === 'number' && 
        typeof candle.open === 'number' &&
        typeof candle.high === 'number' &&
        typeof candle.low === 'number' &&
        typeof candle.close === 'number' &&
        typeof candle.volume === 'number'
      );

      if (validCandles.length === 0) {
        console.log('⚠️ No valid candles found!');
        return;
      }

      if (validCandles.length < candlestickData.length) {
        console.warn('⚠️ Filtered out', candlestickData.length - validCandles.length, 'invalid candles');
      }

      console.log('📊 Setting', validCandles.length, 'valid candles to chart');
      
      // On initial load, use setData() and fit content
      if (isInitialLoadRef.current) {
        candlestickSeriesRef.current.setData(validCandles);
        
        // Update volume data
        const volumeData = validCandles.map(candle => ({
          time: candle.time,
          value: candle.volume,
          color: candle.close >= candle.open ? '#26a69a80' : '#ef535080',
        }));
        volumeSeriesRef.current.setData(volumeData);
        
        // Fit content only on initial load
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
          console.log('✅ Initial chart load complete with fitContent');
        }
        
        isInitialLoadRef.current = false;
        lastCandleCountRef.current = validCandles.length;
      } else {
        // On subsequent updates, only update the last candle (or add new ones)
        const previousCount = lastCandleCountRef.current;
        
        if (validCandles.length > previousCount) {
          // New candles added
          console.log('🎆 New candles detected, adding', validCandles.length - previousCount);
          for (let i = previousCount; i < validCandles.length; i++) {
            candlestickSeriesRef.current.update(validCandles[i]);
            
            const candle = validCandles[i];
            volumeSeriesRef.current.update({
              time: candle.time,
              value: candle.volume,
              color: candle.close >= candle.open ? '#26a69a80' : '#ef535080',
            });
          }
          lastCandleCountRef.current = validCandles.length;
        } else if (validCandles.length === previousCount) {
          // Same count, just update the last candle
          const lastCandle = validCandles[validCandles.length - 1];
          console.log('🔄 Updating last candle');
          candlestickSeriesRef.current.update(lastCandle);
          
          volumeSeriesRef.current.update({
            time: lastCandle.time,
            value: lastCandle.volume,
            color: lastCandle.close >= lastCandle.open ? '#26a69a80' : '#ef535080',
          });
        } else {
          // Length decreased (shouldn't happen, but handle it)
          console.log('⚠️ Candle count decreased, doing full refresh');
          candlestickSeriesRef.current.setData(validCandles);
          
          const volumeData = validCandles.map(candle => ({
            time: candle.time,
            value: candle.volume,
            color: candle.close >= candle.open ? '#26a69a80' : '#ef535080',
          }));
          volumeSeriesRef.current.setData(volumeData);
          lastCandleCountRef.current = validCandles.length;
        }
        
        console.log('✅ Chart updated without resetting view');
      }
    } catch (error) {
      console.error('❌ Error updating chart data:', error);
    }
  }, [candlestickData]);

  // Draw key levels
  useEffect(() => {
    if (!candlestickSeriesRef.current || !keyLevels.length) return;

    // Remove old price lines
    priceLinesRef.current.forEach(line => {
      try {
        candlestickSeriesRef.current?.removePriceLine(line);
      } catch (e) {
        // Line might already be removed
      }
    });
    priceLinesRef.current = [];

    // Remove old markers
    candlestickSeriesRef.current?.setMarkers([]);

    // Add price lines for key levels
    keyLevels.forEach(level => {
      const color = level.type === 'POC' ? '#ffeb3b' :
                    level.type === 'HVN' ? '#4caf50' :
                    level.type === 'LVN' ? '#f44336' : '#9e9e9e';

      const priceLine = candlestickSeriesRef.current?.createPriceLine({
        price: level.price,
        color,
        lineWidth: 2,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: level.type,
      });
      
      if (priceLine) {
        priceLinesRef.current.push(priceLine);
      }
    });
  }, [keyLevels]);

  // Draw signal markers
  useEffect(() => {
    if (!candlestickSeriesRef.current || !currentSignal || !candlestickData.length) return;

    // Remove old price lines from previous signals
    priceLinesRef.current.forEach(line => {
      try {
        candlestickSeriesRef.current?.removePriceLine(line);
      } catch (e) {
        // Line might already be removed
      }
    });
    priceLinesRef.current = [];

    if (currentSignal.type === 'FLAT') {
      // Clear markers for FLAT signal
      candlestickSeriesRef.current?.setMarkers([]);
      return;
    }

    const lastCandle = candlestickData[candlestickData.length - 1];
    
    const marker = {
      time: lastCandle.time,
      position: currentSignal.type === 'LONG' ? 'belowBar' : 'aboveBar',
      color: currentSignal.type === 'LONG' ? '#26a69a' : '#ef5350',
      shape: currentSignal.type === 'LONG' ? 'arrowUp' : 'arrowDown',
      text: `${currentSignal.type} ${currentSignal.confidence}%`,
    };

    candlestickSeriesRef.current.setMarkers([marker]);

    // Draw entry, stop loss, and target lines
    if (currentSignal.entry) {
      const entryLine = candlestickSeriesRef.current.createPriceLine({
        price: currentSignal.entry,
        color: '#2196f3',
        lineWidth: 2,
        lineStyle: 0,
        axisLabelVisible: true,
        title: 'Entry',
      });
      if (entryLine) priceLinesRef.current.push(entryLine);
    }

    if (currentSignal.stopLoss) {
      const stopLine = candlestickSeriesRef.current.createPriceLine({
        price: currentSignal.stopLoss,
        color: '#f44336',
        lineWidth: 2,
        lineStyle: 0,
        axisLabelVisible: true,
        title: 'Stop Loss',
      });
      if (stopLine) priceLinesRef.current.push(stopLine);
    }

    if (currentSignal.target) {
      const targetLine = candlestickSeriesRef.current.createPriceLine({
        price: currentSignal.target,
        color: '#4caf50',
        lineWidth: 2,
        lineStyle: 0,
        axisLabelVisible: true,
        title: 'Target',
      });
      if (targetLine) priceLinesRef.current.push(targetLine);
    }
  }, [currentSignal, candlestickData]);

  return (
    <div className="bg-chart-bg rounded-lg p-4">
      {/* Loading overlay */}
      {candlestickData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading market data...</p>
          </div>
        </div>
      )}
      
      {/* Chart container - always rendered */}
      <div ref={chartContainerRef} style={{ minHeight: '600px' }} />
    </div>
  );
};

export default TradingChart;
