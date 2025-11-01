# Trading Signal Platform - Backend

Professional trading signal generation backend using Fabio Playbook, Auction Market Theory (AMT), Volume Profile, and Order Flow analysis.

## Architecture

Multi-strategy trading signal generator with real-time market data streaming:

- **Fabio Playbook Strategy**: AMT-based multi-timeframe analysis
- **Grid Trading Strategy**: Range-based scalping
- **Mean Reversion Strategy**: Failed breakout detection
- **Broker Integration**: Binance (extensible to Bybit, Kraken, OKX)

## Features

- Real-time signal generation
- Multi-timeframe analysis (1d, 4h, 1h, 5m, 1m)
- Volume Profile calculations (POC, HVN, LVN)
- Order Flow analysis (CVD, delta imbalance, aggression)
- Key level detection with tier-based significance
- Three parallel strategies with voting mechanism
- REST API + WebSocket streaming
- Production-grade error handling

## Setup

### Requirements

- Node.js 18+
- npm or yarn
- Binance API keys (with Market Data permissions)

### Installation

```bash
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update environment variables:
```env
BINANCE_API_KEY=your_key
BINANCE_API_SECRET=your_secret
PORT=3000
NODE_ENV=development
```

### Development

```bash
npm run dev
```

Server starts on `http://localhost:3000`

### Build

```bash
npm run build
npm start
```

## API Endpoints

### POST /api/signals/analyze
Generate trading signal for a symbol.

**Request:**
```json
{
  "symbol": "BTCUSDT",
  "broker": "BINANCE"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "signal_id": "uuid",
    "timestamp": "2025-11-01T13:10:00Z",
    "symbol": "BTCUSDT",
    "signal": "Long",
    "confidence": 0.85,
    "entry": 27000,
    "stop_loss": 26840,
    "target": 27200,
    "reason": "Multi-timeframe bullish alignment",
    "market_state": "Out of Balance",
    "setup": "Trend Model"
  }
}
```

### GET /health
Health check endpoint.

## Strategy Details

### Fabio Playbook
Implements complete Auction Market Theory methodology:
- Market State detection (Balanced/Imbalanced)
- Key Location identification (POC, HVN, LVN)
- Aggression confirmation (CVD, volume spikes)
- Multi-timeframe confluence scoring

### Grid Trading
Scalps consolidation ranges:
- Identifies tight consolidation (ATR < 0.5%)
- Places grid orders at equal intervals
- Exits on breakout

### Mean Reversion
Trades failed breakouts:
- Detects breakout attempts with low volume
- Entries on pullback to balance
- Targets opposite side of range

## Project Structure

```
backend/
├── src/
│   ├── services/
│   │   ├── strategyEngine/     # Trading strategy implementations
│   │   ├── brokers/            # Broker integrations
│   │   ├── analysis/           # Market analysis engines
│   │   └── signalGenerator.ts  # Core orchestration
│   ├── api/
│   │   ├── app.ts              # Express application
│   │   └── routes/             # API endpoints
│   ├── types/                  # TypeScript type definitions
│   └── index.ts                # Server entry point
├── tests/                       # Test suites
├── package.json
├── tsconfig.json
└── Dockerfile
```

## Error Handling

The system implements comprehensive error handling:
- Broker connection failures with retry logic
- API validation and rate limiting
- Graceful degradation for missing data
- Detailed error logging with Pino

## Performance

- Sub-second signal generation
- Efficient volume profile binning
- Parallel strategy execution
- In-memory candle caching

## Future Enhancements

- [ ] Database persistence (PostgreSQL)
- [ ] Redis caching layer
- [ ] WebSocket real-time feeds
- [ ] Additional brokers (Bybit, Kraken, OKX)
- [ ] LLM-enhanced analysis
- [ ] Trade execution integration
- [ ] Performance metrics dashboard

## License

MIT
