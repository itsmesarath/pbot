# Fabio Trading Bot - Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd fabio
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 🔧 Initial Setup

### Step 1: Get OpenRouter API Key
1. Visit https://openrouter.ai/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-...`)

### Step 2: Configure the Bot
1. Click "Set API Key" in the Control Panel
2. Paste your OpenRouter API key
3. Click "Save"

### Step 3: Choose Your Settings
- **Trading Pair**: Select BTCUSDT (or any preferred pair)
- **Timeframe**: Start with 5m or 15m for better signals
- **AI Model**: GPT-4 Turbo recommended for best analysis

### Step 4: Enable AI Analysis
- Toggle the "AI Analysis" switch to ON
- Wait for the first analysis to complete (~30 seconds)

## 📊 Understanding the Interface

### Control Panel (Left Sidebar)
- **Trading Pair**: Symbol to analyze
- **Timeframe**: Candlestick interval
- **API Key**: Your OpenRouter credentials
- **AI Model**: Choose analysis engine
- **AI Toggle**: Enable/disable automated analysis

### Trading Chart (Center)
- **Candlesticks**: Price action visualization
- **Volume**: Bottom histogram
- **Key Levels**: Colored lines
  - 🟡 Yellow = POC (Point of Control)
  - 🟢 Green = HVN (High Volume Node)
  - 🔴 Red = LVN (Low Volume Node)
- **Signal Markers**: Arrows showing LONG/SHORT signals
- **Trade Levels**: Entry, Stop Loss, and Target lines

### Signal Panel (Right Sidebar - Top)
- **Current Signal**: Latest AI recommendation
- **Market State**: Balanced or Imbalanced
- **Key Levels**: Important price zones
- **Order Flow**: CVD and aggression metrics
- **Signal History**: Past recommendations

### Dashboard (Right Sidebar - Bottom)
- **Account Balance**: Virtual trading capital ($10,000 starting)
- **Total P&L**: Cumulative profit/loss
- **Total Trades**: Number of completed trades
- **Win Rate**: Percentage of profitable trades
- **Active Trade**: Current open position
- **Recent Trades**: Last 10 trade results

## 🎯 How to Trade

### When You Get a LONG Signal:
1. **Check Signal Confidence**: Look for >60% confidence
2. **Review Reasoning**: Read the AI's explanation
3. **Verify Levels**:
   - Entry: Where to open position
   - Stop Loss: Where to exit if wrong
   - Target: Where to take profit
4. **Calculate Risk**: Default is 0.5% of account
5. **Execute**: Open trade manually on your exchange

### When You Get a SHORT Signal:
Same process as LONG, but selling instead of buying.

### When Signal is FLAT:
- **Do NOT trade**
- Conditions not aligned for entry
- Wait for next analysis cycle

## 📈 Reading AI Analysis

### Market State
```
✅ BALANCED + NEUTRAL = Consolidation, prepare for breakout
✅ IMBALANCED + UP = Strong uptrend, look for pullbacks
✅ IMBALANCED + DOWN = Strong downtrend, look for bounces
```

### Key Levels
```
POC = Most accepted price, strong support/resistance
HVN = High volume area, expect slow movement
LVN = Low volume area, expect fast movement
```

### Order Flow
```
CVD > 0 + BULL Aggression = Buyers in control
CVD < 0 + BEAR Aggression = Sellers in control
CVD ≈ 0 + NEUTRAL = No clear pressure
```

## ⚠️ Risk Management Rules

### Position Sizing
- Never risk more than 0.5% per trade
- Default calculation: `Risk Amount = Account * 0.005`
- Position Size = `Risk Amount / (Entry - Stop Loss)`

### Stop Loss Placement
- Always honor the stop loss level
- Placed just beyond aggressive print + buffer
- Never move stop loss away from entry

### Take Profit
- Primary target: Previous balance POC
- Trail stops on strong trend days
- Exit early if invalidation occurs

## 🔄 Analysis Cycle

```
Every 30-60 seconds:
1. Fetch latest candlestick data
2. Calculate volume profile
3. Send data to AI model
4. Receive market analysis
5. Generate signal if conditions align
6. Update dashboard and charts
```

## 💡 Tips for Success

### 1. Wait for High-Quality Signals
- Only trade when confidence > 60%
- All three conditions must align:
  ✓ Market State identified
  ✓ Key Location confirmed
  ✓ Aggression detected

### 2. Use Appropriate Timeframes
- **1m-5m**: Scalping (high frequency, lower reliability)
- **15m-1h**: Swing trading (moderate frequency, better reliability)
- **4h-1d**: Position trading (low frequency, highest reliability)

### 3. Understand Market Context
- Balanced markets: Wait for breakout
- Imbalanced markets: Trade with the trend
- Failed breakouts: Fade the move

### 4. Monitor Order Flow
- Strong CVD = Trust the signal more
- Weak CVD = Be cautious
- Imbalances at key levels = Higher probability

### 5. Practice First
- Use the paper trading dashboard
- Track hypothetical trades
- Build confidence before risking real money

## 🐛 Common Issues

### "No signal generated yet"
- **Solution**: Wait 30-60 seconds for first analysis
- Ensure AI is enabled and API key is set

### "WebSocket connection closed"
- **Solution**: Refresh the page
- Check internet connection
- Binance API might be temporarily down

### "Error analyzing market"
- **Solution**: Check API key is valid
- Ensure you have OpenRouter credits
- Try a different AI model

### Chart not updating
- **Solution**: Clear browser cache
- Try different browser
- Check console for errors (F12)

## 📚 Learning Resources

### Fabio Playbook Concepts
- **Balance**: Price consolidating, HVN formation
- **Imbalance**: Price trending, LVN creation
- **Aggression**: Institutional buying/selling
- **Volume Profile**: Market structure visualization

### Key Principles
1. **Market Structure**: Identify balance and imbalance
2. **Volume Profile**: Find POC, HVN, LVN levels
3. **Order Flow**: Confirm aggression with CVD
4. **Risk Management**: Always protect capital first

## 🎓 Example Trade Walkthrough

### Scenario: Trend Continuation Setup
```
1. Market State: IMBALANCED + UP trend
   → Price breaking above previous balance

2. Key Levels: LVN at $43,500
   → Low volume area = fast rejection zone

3. Order Flow: CVD +15,000, BULL aggression
   → Strong buying pressure confirmed

4. Signal: LONG
   - Entry: $43,800 (pullback to support)
   - Stop Loss: $43,450 (below LVN)
   - Target: $44,500 (previous POC)
   - Risk: $10,000 * 0.005 = $50
   - Position Size: $50 / ($43,800 - $43,450) = 0.143 BTC

5. Execute: Open 0.143 BTC LONG at $43,800
```

## 🚨 Important Reminders

- This is educational software, not financial advice
- Always start with small positions
- Never trade with borrowed money
- Keep emotions in check
- Review every trade to learn
- The AI is a tool, not a crystal ball

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review console logs (F12 in browser)
3. Check README.md for troubleshooting
4. Open GitHub issue with details

---

**Happy Trading! 🚀**

Remember: The best trade is often no trade. Wait for high-quality setups!
