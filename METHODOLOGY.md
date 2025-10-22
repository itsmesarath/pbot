# Fabio Playbook Methodology

This document explains the trading methodology implemented in the AI analysis engine.

## Core Philosophy

The Fabio Playbook is built on three fundamental pillars:

1. **Market State** - Understanding balance and imbalance
2. **Key Locations** - Identifying significant price levels using volume
3. **Aggression** - Confirming institutional participation

**A signal is ONLY generated when all three pillars align.**

---

## 1. Market State Determination

### Balanced Market
A market is considered **BALANCED** when:
- Price is consolidating within a range
- High Volume Nodes (HVNs) are present
- Low volatility
- Participants are in agreement about value

**Trading Approach**: Wait for breakout or fade extremes

### Imbalanced Market
A market is considered **IMBALANCED** when:
- Price is trending strongly in one direction
- Low Volume Nodes (LVNs) are present
- High volatility
- Participants disagree about value (seeking new equilibrium)

**Trading Approach**: Trade with the trend or fade failed breakouts

---

## 2. Volume Profile Analysis

Volume Profile shows **where** price has spent time and **how much** volume has traded at each price level.

### Key Components

#### POC (Point of Control)
- **Definition**: Price level with the highest traded volume
- **Significance**: Most accepted price, strongest support/resistance
- **Usage**: 
  - Primary profit target
  - Major reversal zone
  - Balance center

#### HVN (High Volume Node)
- **Definition**: Price levels with above-average volume
- **Significance**: Areas of acceptance/consolidation
- **Usage**:
  - Support/resistance in balanced markets
  - Slow price movement zones
  - Potential reversal areas

#### LVN (Low Volume Node)
- **Definition**: Price levels with below-average volume
- **Significance**: Areas of rejection/imbalance
- **Usage**:
  - Fast price movement zones
  - Breakout/breakdown levels
  - Continuation signals

### Calculating Volume Profile

```javascript
1. Divide price range into bins (typically 50)
2. Distribute each candle's volume across relevant bins
3. Identify the bin with highest volume (POC)
4. Calculate average volume across all bins
5. HVN = bins with volume > 1.5x average
6. LVN = bins with volume < 0.5x average
```

---

## 3. Order Flow Aggression

Order flow reveals **who** is in control (buyers or sellers) and **how aggressively** they are participating.

### CVD (Cumulative Volume Delta)

**Formula**: `CVD = Σ(Buy Volume - Sell Volume)`

**Interpretation**:
- CVD > 0 and rising → Buyers in control
- CVD < 0 and falling → Sellers in control
- CVD near 0 → No clear pressure

**In this implementation**: We estimate CVD from volume patterns and price action since we don't have tick-by-tick data.

### Footprint Imbalances

**Definition**: Significant mismatch between buying and selling at a specific price level

**Detection**:
- Volume spike on price increase → Buy imbalance
- Volume spike on price decrease → Sell imbalance

**Significance**: Shows institutional/aggressive participation

---

## Trading Models

### Model 1: Trend Continuation (Out of Balance → New Balance)

**Setup**:
1. Market breaks from balance (POC/HVN)
2. Creates imbalance with LVN formation
3. Price moves aggressively (strong CVD)
4. Begins forming new balance at different level

**Entry Criteria**:
- ✓ Market State: IMBALANCED with clear trend
- ✓ Key Location: Price approaching new HVN or previous LVN
- ✓ Aggression: Strong CVD in trend direction

**Entry**: Pullback to previous LVN or new forming HVN

**Stop Loss**: Below/above aggressive print that initiated move

**Target**: Next POC or previous balance area

**Example**:
```
Price at $100 POC (balanced)
↓
Breaks above with high volume → LVN at $100
↓
Rallies to $105 with strong buy CVD (imbalanced)
↓
Forms new HVN at $105
↓
LONG Entry: $105 on pullback
Stop: $104 (below breakout candle)
Target: $110 (next POC)
```

---

### Model 2: Mean Reversion (Failed Breakout → Back Into Balance)

**Setup**:
1. Market attempts breakout from balance
2. Breakout fails at LVN (rejection)
3. Price returns to previous balance (POC/HVN)
4. Weak CVD confirms lack of aggression

**Entry Criteria**:
- ✓ Market State: Return to BALANCED
- ✓ Key Location: Price at POC or HVN
- ✓ Aggression: CVD weakening, rejection at LVN

**Entry**: Return to previous POC or opposite HVN

**Stop Loss**: Beyond failed breakout level

**Target**: Opposite side of balance range

**Example**:
```
Price at $100 POC (balanced range: $98-$102)
↓
Attempts breakout to $103 (LVN)
↓
Weak volume, no buy CVD (imbalanced attempt fails)
↓
Rejects back to $101 HVN
↓
SHORT Entry: $101
Stop: $103.50 (above failed breakout)
Target: $98 (opposite HVN/low of balance)
```

---

## Signal Generation Logic

The AI uses this decision tree:

```
START
  ↓
Is market state clear? (Balanced/Imbalanced)
  ↓ YES
Are we at a key location? (POC/HVN/LVN)
  ↓ YES
Is there aggression confirmation? (CVD/Imbalances)
  ↓ YES
Which model applies?
  ├─ Trend Continuation?
  │    ↓ YES
  │  Generate LONG/SHORT signal
  │
  └─ Mean Reversion?
       ↓ YES
     Generate LONG/SHORT signal
  
If ANY step is NO → Signal = FLAT
```

---

## Risk Management Rules

### Position Sizing
```
Risk Amount = Account Balance × Risk % (0.25% - 0.5%)
Stop Distance = |Entry - Stop Loss|
Position Size = Risk Amount / Stop Distance
```

**Example**:
- Account: $10,000
- Risk: 0.5% = $50
- Entry: $100
- Stop: $99
- Position Size: $50 / $1 = 50 units

### Stop Loss Placement

**Rules**:
1. Must be beyond the aggressive print that validated the setup
2. Add 1-2 tick buffer for volatility
3. Never too tight (< 0.25% of price)
4. Never too wide (> 1% of account risk)

**Trend Continuation**: Below/above breakout candle low/high

**Mean Reversion**: Beyond failed breakout level

### Take Profit

**Primary Target**: Previous balance POC

**Trailing**: On strong trend days when:
- CVD remains strong
- No LVN rejection
- Volume supports continuation

**Early Exit**: When:
- CVD reverses
- Rejected at major LVN
- Market state changes (balanced → imbalanced or vice versa)

---

## AI Prompt Engineering

The AI receives structured data:

### Input Format
```json
{
  "currentPrice": 43850.50,
  "high": 44200.00,
  "low": 43500.00,
  "avgVolume": 1250.5,
  "currentVolume": 1580.2,
  "recentCandles": [...],
  "volumeProfile": [...]
}
```

### Expected Output
```json
{
  "marketState": {
    "balanced": false,
    "trend": "UP",
    "confidence": 75
  },
  "keyLevels": [
    {"price": 43500, "type": "LVN", "significance": "HIGH"},
    {"price": 43850, "type": "POC", "significance": "HIGH"},
    {"price": 44100, "type": "HVN", "significance": "MEDIUM"}
  ],
  "orderFlow": {
    "cvd": 1250.5,
    "aggression": "BULL",
    "imbalances": [
      {"price": 43800, "type": "BUY"}
    ]
  },
  "signal": {
    "type": "LONG",
    "confidence": 75,
    "entry": 43850,
    "stopLoss": 43450,
    "target": 44500,
    "reasoning": "Market broke from balance at $43500 LVN with strong volume..."
  }
}
```

---

## Model Comparison

| Aspect | Trend Continuation | Mean Reversion |
|--------|-------------------|----------------|
| Market State | Imbalanced → New Balance | Failed Imbalance → Balanced |
| Entry Location | Pullback in trend | Return to POC/HVN |
| CVD Direction | Strong, aligned with trend | Weakening, reversal |
| Win Rate | Lower (~45%) | Higher (~55%) |
| Risk:Reward | Higher (1:3+) | Lower (1:1.5) |
| Frequency | Lower | Higher |

---

## Common Pitfalls

### 1. Trading Without Aggression
❌ Price at POC but no volume spike
✅ Wait for CVD confirmation

### 2. Ignoring Market State
❌ Taking mean reversion in strong trend
✅ Trade with market state, not against it

### 3. Wrong Key Level
❌ Entering at random price
✅ Only enter at POC, HVN, or LVN

### 4. Forcing Trades
❌ Taking signal when confidence < 60%
✅ Wait for all three pillars to align

### 5. Moving Stop Loss
❌ Giving "more room" when trade goes against you
✅ Honor original stop loss always

---

## Advanced Concepts

### Multi-Timeframe Alignment
- Use higher timeframe (4h/1d) for market state
- Use lower timeframe (5m/15m) for entry timing
- Signals stronger when both align

### Volume Profile Evolution
- Balance areas shift over time
- Old POC becomes resistance/support
- Track how POC migrates

### Order Flow Divergence
- Price makes new high, CVD doesn't → Bearish
- Price makes new low, CVD doesn't → Bullish
- Powerful reversal signal

---

## Conclusion

The Fabio Playbook is a **systematic, rule-based approach** to trading that removes emotion and guesswork.

**Key Takeaways**:
1. Never trade without all three pillars aligned
2. Market state dictates strategy (trend vs. mean reversion)
3. Volume Profile reveals key battle zones
4. Order flow confirms who's winning
5. Risk management is non-negotiable

**Remember**: The AI is a tool to help identify setups faster. Final decision is always yours.

---

*"Trade the market you see, not the market you want to see."* - Fabio Playbook
