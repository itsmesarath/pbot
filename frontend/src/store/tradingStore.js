import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTradingStore = create(
  persist(
    (set, get) => ({
  // Market data
  symbol: 'BTCUSDT',
  interval: '5m',
  candlestickData: [],
  currentPrice: 0,
  volumeProfile: [],
  
  // AI settings
  aiEnabled: false,
  selectedModel: 'openai/gpt-4-turbo',
  openRouterApiKey: '',
  groqApiKey: '',
  isAnalyzing: false,
  showSentimentMeter: true,
  analysisInterval: 10, // seconds (1-30)
  
  // Trading signals
  currentSignal: null, // { type: 'LONG' | 'SHORT' | 'FLAT', confidence: number, timestamp: Date }
  signalHistory: [],
  
  // Market state analysis
  marketState: null, // { balanced: boolean, trend: 'UP' | 'DOWN' | 'NEUTRAL' }
  keyLevels: [], // { price: number, type: 'LVN' | 'POC' | 'HVN', volume: number }
  orderFlowData: null, // { cvd: number, imbalances: [], aggression: 'BULL' | 'BEAR' | 'NEUTRAL' }
  
  // Trade management
  activeTrade: null,
  tradeHistory: [],
  accountBalance: 10000,
  riskPerTrade: 0.005, // 0.5%
  
  // Dashboard
  pnl: 0,
  totalTrades: 0,
  winRate: 0,
  
  // Actions
  setSymbol: (symbol) => set({ symbol }),
  setInterval: (interval) => set({ interval }),
  setCandlestickData: (data) => {
    if (!Array.isArray(data)) {
      console.error('❌ Attempted to set non-array data to candlestickData:', typeof data, data);
      return;
    }
    console.log('💾 Store: Setting candlestick data, length:', data.length);
    set({ candlestickData: data });
  },
  setCurrentPrice: (price) => set({ currentPrice: price }),
  
  setAiEnabled: (enabled) => set({ aiEnabled: enabled }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  setOpenRouterApiKey: (key) => set({ openRouterApiKey: key }),
  setGroqApiKey: (key) => set({ groqApiKey: key }),
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setShowSentimentMeter: (show) => set({ showSentimentMeter: show }),
  setAnalysisInterval: (interval) => set({ analysisInterval: Math.max(1, Math.min(30, interval)) }),
  
  setCurrentSignal: (signal) => {
    set({ currentSignal: signal });
    if (signal) {
      set((state) => ({
        signalHistory: [...state.signalHistory, signal].slice(-100)
      }));
    }
  },
  
  setMarketState: (state) => set({ marketState: state }),
  setKeyLevels: (levels) => set({ keyLevels: levels }),
  setOrderFlowData: (data) => set({ orderFlowData: data }),
  
  openTrade: (trade) => {
    const state = get();
    const riskAmount = state.accountBalance * state.riskPerTrade;
    const stopLossDistance = Math.abs(trade.entry - trade.stopLoss);
    const positionSize = riskAmount / stopLossDistance;
    
    set({
      activeTrade: {
        ...trade,
        positionSize,
        riskAmount,
        openTime: new Date()
      }
    });
  },
  
  closeTrade: (exitPrice) => {
    const state = get();
    if (!state.activeTrade) return;
    
    const trade = state.activeTrade;
    const pnl = trade.type === 'LONG'
      ? (exitPrice - trade.entry) * trade.positionSize
      : (trade.entry - exitPrice) * trade.positionSize;
    
    const closedTrade = {
      ...trade,
      exitPrice,
      pnl,
      closeTime: new Date()
    };
    
    set((state) => ({
      activeTrade: null,
      tradeHistory: [closedTrade, ...state.tradeHistory],
      accountBalance: state.accountBalance + pnl,
      pnl: state.pnl + pnl,
      totalTrades: state.totalTrades + 1,
      winRate: ((state.totalTrades * state.winRate + (pnl > 0 ? 100 : 0)) / (state.totalTrades + 1))
    }));
  }
}),
{
  name: 'fabio-trading-storage',
  partialize: (state) => ({
    // Only persist these fields
    openRouterApiKey: state.openRouterApiKey,
    groqApiKey: state.groqApiKey,
    aiEnabled: state.aiEnabled,
    selectedModel: state.selectedModel,
    symbol: state.symbol,
    interval: state.interval,
    showSentimentMeter: state.showSentimentMeter,
    analysisInterval: state.analysisInterval
  })
}
)
);
