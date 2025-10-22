# Fabio Trading Bot - Project Structure

## 📁 Directory Structure

```
fabio/
├── public/                     # Static assets
├── src/
│   ├── components/            # React components
│   │   ├── TradingChart.jsx   # TradingView chart integration
│   │   ├── ControlPanel.jsx   # Settings and controls
│   │   ├── Dashboard.jsx      # Trade history and stats
│   │   └── SignalPanel.jsx    # AI signals and analysis
│   ├── services/              # Business logic
│   │   ├── binanceService.js  # Market data from Binance
│   │   └── aiService.js       # AI analysis via OpenRouter
│   ├── store/                 # State management
│   │   └── tradingStore.js    # Zustand store
│   ├── hooks/                 # Custom React hooks
│   │   └── useTradingBot.js   # Main trading bot logic
│   ├── App.jsx                # Main application component
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles
├── package.json               # Dependencies and scripts
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── README.md                 # Main documentation
├── GUIDE.md                  # User guide
├── METHODOLOGY.md            # Trading methodology
└── .gitignore                # Git ignore rules
```

## 🧩 Component Architecture

### App.jsx
- **Purpose**: Root component that assembles the layout
- **Dependencies**: All major components
- **Key Features**:
  - Initializes trading bot via `useTradingBot` hook
  - Responsive grid layout
  - Header and footer

### TradingChart.jsx
- **Purpose**: Live price chart with TradingView Lightweight Charts
- **Dependencies**: `lightweight-charts`, `tradingStore`
- **Key Features**:
  - Candlestick visualization
  - Volume histogram
  - Key level markers (POC, HVN, LVN)
  - Signal arrows and trade levels
  - Real-time updates

### ControlPanel.jsx
- **Purpose**: User controls for bot configuration
- **Dependencies**: `tradingStore`
- **Key Features**:
  - Symbol selection
  - Timeframe selection
  - AI model selection
  - API key management
  - AI toggle switch
  - Status indicators

### Dashboard.jsx
- **Purpose**: Trading performance metrics
- **Dependencies**: `tradingStore`, `date-fns`
- **Key Features**:
  - Account balance display
  - P&L tracking
  - Win rate statistics
  - Active trade monitor
  - Trade history list

### SignalPanel.jsx
- **Purpose**: AI analysis and signal display
- **Dependencies**: `tradingStore`, `date-fns`
- **Key Features**:
  - Current signal display
  - Market state indicators
  - Key level list
  - Order flow metrics
  - Signal history log

## 🔧 Services

### binanceService.js
**Responsibilities**:
- Fetch historical candlestick data
- Subscribe to real-time WebSocket updates
- Get current ticker prices
- Handle connection management

**Key Methods**:
```javascript
getKlines(symbol, interval, limit)         // Historical data
subscribeToKlines(symbol, interval, cb)    // Real-time updates
unsubscribe()                              // Close WebSocket
getPrice(symbol)                           // Current price
getTicker24hr(symbol)                      // 24hr statistics
```

### aiService.js
**Responsibilities**:
- Communicate with OpenRouter API
- Build analysis prompts from market data
- Parse AI responses
- Calculate volume profile
- Validate signal conditions

**Key Methods**:
```javascript
analyzeMarket(marketData, model)           // Get AI analysis
calculateVolumeProfile(candlesticks)       // Compute VP
buildAnalysisPrompt(marketData)           // Create prompt
parseAnalysis(analysis)                   // Validate response
```

## 🗄️ State Management (Zustand Store)

### tradingStore.js

**State Structure**:
```javascript
{
  // Market Data
  symbol: 'BTCUSDT',
  interval: '5m',
  candlestickData: [],
  currentPrice: 0,
  volumeProfile: [],
  
  // AI Configuration
  aiEnabled: false,
  selectedModel: 'openai/gpt-4-turbo',
  openRouterApiKey: '',
  isAnalyzing: false,
  
  // Analysis Results
  currentSignal: null,
  signalHistory: [],
  marketState: null,
  keyLevels: [],
  orderFlowData: null,
  
  // Trading
  activeTrade: null,
  tradeHistory: [],
  accountBalance: 10000,
  riskPerTrade: 0.005,
  
  // Performance
  pnl: 0,
  totalTrades: 0,
  winRate: 0
}
```

**Key Actions**:
- `setSymbol(symbol)` - Update trading pair
- `setAiEnabled(enabled)` - Toggle AI analysis
- `setCurrentSignal(signal)` - Update signal
- `openTrade(trade)` - Open position
- `closeTrade(exitPrice)` - Close position

## 🪝 Custom Hooks

### useTradingBot.js
**Purpose**: Main trading bot lifecycle management

**Responsibilities**:
1. Initialize market data from Binance
2. Subscribe to real-time WebSocket updates
3. Manage AI analysis loop
4. Update charts and signals
5. Handle cleanup on unmount

**Key Features**:
- Auto-reconnect on connection loss
- Rate limiting (analysis every 30-60s)
- Efficient data updates
- Memory management (keep last 500 candles)

## 🔄 Data Flow

```
1. User Actions (ControlPanel)
   ↓
2. State Updates (tradingStore)
   ↓
3. Effect Triggers (useTradingBot)
   ↓
4. API Calls
   ├─ Binance (market data)
   └─ OpenRouter (AI analysis)
   ↓
5. State Updates (analysis results)
   ↓
6. UI Updates
   ├─ TradingChart (visual)
   ├─ SignalPanel (analysis)
   └─ Dashboard (metrics)
```

## 🎨 Styling

### Tailwind CSS Classes
- **Colors**: Custom theme with chart colors
- **Layout**: Responsive grid system
- **Components**: Utility-first approach
- **Dark Mode**: Default dark theme

### Custom Styles (index.css)
- Typography
- Scrollbar hiding
- Base element styles

## 🌐 API Integration

### Binance REST API
```
Endpoint: https://api.binance.com/api/v3/klines
Rate Limit: 1200 requests/minute
Data: Historical candlesticks
```

### Binance WebSocket
```
Endpoint: wss://stream.binance.com:9443/ws
Stream: {symbol}@kline_{interval}
Data: Real-time price updates
```

### OpenRouter API
```
Endpoint: https://openrouter.ai/api/v1/chat/completions
Auth: Bearer token
Models: GPT-4, Claude, Mixtral, etc.
```

## 📦 Dependencies

### Core
- `react` - UI framework
- `react-dom` - React DOM rendering
- `zustand` - State management

### Trading
- `lightweight-charts` - TradingView charts
- `binance-api-node` - Binance SDK (not used directly, using REST/WS instead)

### Utilities
- `axios` - HTTP client
- `date-fns` - Date formatting
- `recharts` - (Optional) Additional charts

### Development
- `vite` - Build tool
- `tailwindcss` - CSS framework
- `@vitejs/plugin-react` - React plugin for Vite

## 🚀 Build & Deploy

### Development
```bash
npm run dev          # Start dev server (port 3000)
```

### Production Build
```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

### Output
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── ...
```

## 🧪 Testing Recommendations

### Unit Tests (Not Implemented)
- `aiService.calculateVolumeProfile()` - Volume profile accuracy
- `tradingStore` actions - State mutations
- Signal validation logic

### Integration Tests (Not Implemented)
- Binance API connectivity
- OpenRouter API calls
- WebSocket handling

### E2E Tests (Not Implemented)
- Full user flow
- Signal generation
- Trade execution

## 🔐 Security Considerations

### API Key Storage
- ⚠️ Currently in-memory only (lost on refresh)
- 🔒 Consider: localStorage with encryption
- 🔒 Better: Backend proxy for API calls

### CORS
- Binance API: Public, CORS enabled
- OpenRouter: Requires API key in header

### Rate Limiting
- Binance: Built-in WebSocket throttling
- OpenRouter: 30-60s between AI calls
- Volume profile: Cached, not recalculated every tick

## 📈 Performance Optimization

### Implemented
- WebSocket for real-time data (vs polling)
- Zustand for efficient state updates
- React strict mode for development checks
- Memoization in chart components

### Potential Improvements
- Virtual scrolling for trade history
- Worker threads for volume calculations
- Chart data decimation for older candles
- Lazy loading of components

## 🐛 Debugging

### Browser Console
- Check for WebSocket errors
- Monitor state updates
- View AI prompts and responses

### Network Tab
- Binance API calls
- OpenRouter requests
- WebSocket messages

### React DevTools
- Component tree
- State inspection
- Performance profiling

## 📝 Code Conventions

### Naming
- Components: PascalCase (TradingChart.jsx)
- Services: camelCase (binanceService.js)
- Hooks: usePrefixed (useTradingBot.js)
- Constants: UPPER_SNAKE_CASE

### File Organization
- One component per file
- Co-locate related logic
- Export default for components
- Export singleton for services

### Comments
- JSDoc for functions
- Inline for complex logic
- TODOs for future improvements

## 🛠️ Extension Points

### Adding New Features

**1. New AI Model**:
```javascript
// In ControlPanel.jsx
const AI_MODELS = [
  // ... existing models
  { id: 'new/model-id', name: 'New Model', provider: 'Provider' }
];
```

**2. New Indicator**:
```javascript
// In aiService.js
calculateNewIndicator(candlesticks) {
  // Implementation
  return indicator;
}
```

**3. Backtesting Mode**:
```javascript
// New file: src/services/backtestService.js
class BacktestService {
  async runBacktest(symbol, startDate, endDate) {
    // Fetch historical data
    // Replay with AI analysis
    // Track performance
  }
}
```

## 📚 Additional Resources

- [TradingView Lightweight Charts Docs](https://tradingview.github.io/lightweight-charts/)
- [Binance API Documentation](https://binance-docs.github.io/apidocs/)
- [OpenRouter API Reference](https://openrouter.ai/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)

---

**Last Updated**: 2025-01-21
**Version**: 1.0.0
