import { useEffect, useRef } from 'react';
import { useTradingStore } from '../store/tradingStore';
import binanceService from '../services/binanceService';
import aiService from '../services/aiService';

/**
 * Custom hook for managing trading bot lifecycle
 */
export const useTradingBot = () => {
  const {
    symbol,
    interval,
    aiEnabled,
    selectedModel,
    openRouterApiKey,
    groqApiKey,
    analysisInterval,
    setCandlestickData,
    setCurrentPrice,
    setIsAnalyzing,
    setCurrentSignal,
    setMarketState,
    setKeyLevels,
    setOrderFlowData
  } = useTradingStore();

  const analysisIntervalRef = useRef(null);
  const lastAnalysisTime = useRef(0);

  // Initialize market data
  useEffect(() => {
    console.log('🚀 useTradingBot: useEffect triggered!', { symbol, interval });
    let mounted = true;
    let unsubscribed = false;

    const initializeData = async () => {
      try {
        console.log('📊 Initializing market data for', symbol, interval);
        // Fetch historical data
        console.log('📡 About to fetch klines...');
        const klines = await binanceService.getKlines(symbol, interval, 500);
        console.log('✅ Received klines:', klines.length);
        console.log('📦 Sample kline data:', klines[0]);
        if (mounted) {
          console.log('💾 Setting candlestick data in store...');
          setCandlestickData(klines);
          console.log('✅ Candlestick data set! Length:', klines.length);
          if (klines.length > 0) {
            setCurrentPrice(klines[klines.length - 1].close);
            console.log('💰 Current price set to:', klines[klines.length - 1].close);
          }

          // Subscribe to real-time updates AFTER initial data is set
          console.log('🔌 Subscribing to WebSocket updates...');
          binanceService.subscribeToKlines(symbol, interval, (candle) => {
            if (unsubscribed) {
              console.log('⚠️ Subscription closed, ignoring update');
              return;
            }

            console.log('📈 WebSocket update received:', {
              time: new Date(candle.time * 1000).toLocaleTimeString(),
              price: candle.close,
              isFinal: candle.isFinal
            });

            setCurrentPrice(candle.close);

            // Update candlestick data using Zustand's getState()
            const currentState = useTradingStore.getState();
            const prevData = currentState.candlestickData;

            try {
              if (!Array.isArray(prevData) || prevData.length === 0) {
                console.log('⚠️ No previous data, skipping update');
                return;
              }

              // Validate incoming candle data
              if (!candle || typeof candle.time !== 'number' || typeof candle.close !== 'number') {
                console.error('❌ Invalid candle data received:', candle);
                return;
              }

              const newData = [...prevData];
              const lastCandle = newData[newData.length - 1];

              if (!lastCandle || typeof lastCandle.time !== 'number') {
                console.error('❌ Invalid last candle in array:', lastCandle);
                return;
              }

              if (candle.isFinal) {
                // New candle completed
                console.log('✅ New candle completed, adding to data');
                newData.push({
                  time: candle.time,
                  open: candle.open,
                  high: candle.high,
                  low: candle.low,
                  close: candle.close,
                  volume: candle.volume
                });
              } else if (lastCandle && lastCandle.time === candle.time) {
                // Update current candle
                console.log('🔄 Updating current candle');
                newData[newData.length - 1] = {
                  time: candle.time,
                  open: candle.open,
                  high: candle.high,
                  low: candle.low,
                  close: candle.close,
                  volume: candle.volume
                };
              } else {
                // Add new candle (in case of gap)
                console.log('➕ Adding new candle (gap detected)');
                newData.push({
                  time: candle.time,
                  open: candle.open,
                  high: candle.high,
                  low: candle.low,
                  close: candle.close,
                  volume: candle.volume
                });
              }

              // Keep last 500 candles
              const result = newData.slice(-500);
              console.log('✅ Data updated, total candles:', result.length);
              setCandlestickData(result);
            } catch (error) {
              console.error('❌ Error updating candlestick data:', error);
            }
          });
        } else {
          console.log('⚠️ Component unmounted, not setting data');
        }
      } catch (error) {
        console.error('❌ Error initializing data:', error);
        console.error('Symbol:', symbol, 'Interval:', interval);
        console.error('Full error:', error.response?.data || error.message);
        console.error('Stack:', error.stack);
      }
    };

    console.log('🎯 Calling initializeData()...');
    initializeData();
    console.log('✅ initializeData() called');

    return () => {
      console.log('🧹 Cleanup: Unsubscribing from WebSocket...');
      mounted = false;
      unsubscribed = true;
      binanceService.unsubscribe();
    };
  }, [symbol, interval, setCandlestickData, setCurrentPrice]);

  // AI Analysis loop
  useEffect(() => {
    if (!aiEnabled) {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
      setIsAnalyzing(false);
      return;
    }

    // Check if we have the required API key based on selected model
    const isGroqModel = selectedModel.startsWith('groq/');
    const hasRequiredKey = isGroqModel ? groqApiKey : openRouterApiKey;
    
    if (!hasRequiredKey) {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
      setIsAnalyzing(false);
      console.warn(`⚠️ ${isGroqModel ? 'Groq' : 'OpenRouter'} API key required for selected model`);
      return;
    }

    // Set appropriate API keys
    aiService.setOpenRouterApiKey(openRouterApiKey);
    aiService.setGroqApiKey(groqApiKey);

    const runAnalysis = async () => {
      const now = Date.now();
      
      // Rate limiting: analyze based on user-defined interval (1-30 seconds)
      const intervalMs = analysisInterval * 1000;
      if (now - lastAnalysisTime.current < intervalMs) {
        return;
      }

      try {
        console.log('🤖 Starting AI analysis...');
        setIsAnalyzing(true);
        lastAnalysisTime.current = now;

        const state = useTradingStore.getState();
        const candlesticks = state.candlestickData;

        if (candlesticks.length < 50) {
          console.log('Not enough data for analysis');
          setIsAnalyzing(false);
          return;
        }

        // Fetch multi-timeframe data for comprehensive analysis
        let multiTimeframeData = {};
        try {
          console.log('📅 Fetching multi-timeframe candles...');
          
          // Fetch all timeframes in parallel
          const [daily, fourHour, oneHour, fiveMin, oneMin] = await Promise.all([
            binanceService.getKlines(state.symbol, '1d', 1).catch(e => { console.warn('Daily fetch failed:', e.message); return null; }),
            binanceService.getKlines(state.symbol, '4h', 6).catch(e => { console.warn('4H fetch failed:', e.message); return null; }),
            binanceService.getKlines(state.symbol, '1h', 12).catch(e => { console.warn('1H fetch failed:', e.message); return null; }),
            binanceService.getKlines(state.symbol, '5m', 60).catch(e => { console.warn('5M fetch failed:', e.message); return null; }),
            binanceService.getKlines(state.symbol, '1m', 60).catch(e => { console.warn('1M fetch failed:', e.message); return null; })
          ]);
          
          multiTimeframeData = {
            daily,
            fourHour,
            oneHour,
            fiveMin,
            oneMin
          };
          
          console.log('✅ Multi-timeframe data fetched:', {
            daily: daily?.length || 0,
            '4h': fourHour?.length || 0,
            '1h': oneHour?.length || 0,
            '5m': fiveMin?.length || 0,
            '1m': oneMin?.length || 0
          });
        } catch (error) {
          console.warn('⚠️ Could not fetch multi-timeframe data:', error.message);
        }

        // Calculate volume profile from last hour of data
        const volumeProfile = aiService.calculateVolumeProfile(candlesticks);

        // Prepare market data
        const marketData = {
          symbol: state.symbol,
          candlesticks,
          volumeProfile,
          currentPrice: state.currentPrice
        };

        // Get AI analysis with multi-timeframe context
        const analysis = await aiService.analyzeMarket(marketData, selectedModel, multiTimeframeData);

        console.log('✅ AI analysis complete:', {
          trend: analysis.marketState.trend,
          signal: analysis.signal.type,
          confidence: analysis.signal.confidence
        });

        // Update store with analysis results
        setMarketState(analysis.marketState);
        setKeyLevels(analysis.keyLevels);
        setOrderFlowData(analysis.orderFlow);
        setCurrentSignal(analysis.signal);

      } catch (error) {
        console.error('❌ Error during AI analysis:', error);
        console.error('Error details:', error.response?.data || error.message);
        // Don't crash the app, just log the error
      } finally {
        setIsAnalyzing(false);
      }
    };

    // Run initial analysis immediately
    console.log(`🚀 Starting AI analysis loop (every ${analysisInterval}s)...`);
    runAnalysis();

    // Set up interval for continuous analysis (based on user setting)
    analysisIntervalRef.current = setInterval(runAnalysis, analysisInterval * 1000);

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
    };
  }, [
    aiEnabled,
    openRouterApiKey,
    groqApiKey,
    selectedModel,
    analysisInterval,
    setIsAnalyzing,
    setCurrentSignal,
    setMarketState,
    setKeyLevels,
    setOrderFlowData
  ]);
};
