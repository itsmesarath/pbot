# Fabio Playbook - Quick Reference Card

## 🎯 The Three Pillars (Must ALL Align)

```
┌─────────────────────┐
│  1. MARKET STATE    │  Balanced or Imbalanced?
├─────────────────────┤
│  2. KEY LOCATION    │  POC, HVN, or LVN?
├─────────────────────┤
│  3. AGGRESSION      │  CVD confirms direction?
└─────────────────────┘
         ↓
    SIGNAL GENERATED
    (or FLAT if not aligned)
```

---

## 📊 Volume Profile Levels

| Level | Meaning | Characteristics | Usage |
|-------|---------|-----------------|-------|
| **POC** | Point of Control | Highest volume price | Primary target/reversal |
| **HVN** | High Volume Node | Acceptance area | Support/resistance |
| **LVN** | Low Volume Node | Rejection area | Fast movement zone |

---

## 🔄 Two Trading Models

### Model 1: Trend Continuation
```
Balance → Breakout → Imbalance → New Balance
   (HVN)    (LVN)    (trending)    (new HVN)
                           ↑
                      ENTRY HERE
```
**When**: Price breaks balance with strong aggression  
**Entry**: Pullback to LVN or new HVN  
**Stop**: Below breakout candle  
**Target**: Next POC  

### Model 2: Mean Reversion
```
Balance → Failed Break → Rejection → Return
   (HVN)      (LVN)      (weak CVD)   (POC)
                                        ↑
                                  ENTRY HERE
```
**When**: Breakout fails at LVN  
**Entry**: Return to POC/HVN  
**Stop**: Beyond failed breakout  
**Target**: Opposite side of balance  

---

## 📈 Market States

| State | Characteristics | Trading Approach |
|-------|----------------|------------------|
| **BALANCED** | • Consolidation<br>• HVNs present<br>• Low volatility | Wait for breakout or fade extremes |
| **IMBALANCED** | • Trending<br>• LVNs present<br>• High volatility | Trade with trend or fade failures |

---

## 💹 Order Flow Signals

### CVD (Cumulative Volume Delta)
```
CVD > 0 + Rising  →  Buyers in control  →  Bullish
CVD < 0 + Falling →  Sellers in control →  Bearish
CVD ≈ 0           →  No clear pressure   →  Neutral
```

### Aggression Levels
- **BULL**: Strong buying, CVD rising, buy imbalances
- **BEAR**: Strong selling, CVD falling, sell imbalances  
- **NEUTRAL**: No clear pressure, mixed signals

---

## ⚖️ Risk Management Formula

```
Risk Amount = Account × 0.005 (0.5%)
Stop Distance = |Entry - Stop Loss|
Position Size = Risk Amount ÷ Stop Distance
```

**Example**:
```
Account: $10,000
Risk: 0.5% = $50
Entry: $100
Stop: $99
Position: $50 / $1 = 50 units
```

---

## ✅ Signal Checklist

Before taking ANY trade, verify:

- [ ] **Market State** identified (balanced/imbalanced)
- [ ] **Trend** clear (UP/DOWN/NEUTRAL)
- [ ] At **Key Location** (POC/HVN/LVN)
- [ ] **CVD** confirms direction
- [ ] **Aggression** present (volume spike or imbalance)
- [ ] **Entry** price defined
- [ ] **Stop Loss** calculated (beyond aggressive print)
- [ ] **Target** identified (previous POC)
- [ ] **Risk** < 0.5% of account
- [ ] **Confidence** > 60%

**If ANY box unchecked → DO NOT TRADE**

---

## 🚦 Signal Quality Guide

### HIGH Quality (>75% confidence)
```
✓ All three pillars strongly aligned
✓ Clear market state
✓ Price at major POC/HVN/LVN
✓ Strong CVD (>1000 for BTC)
✓ Multiple confirming factors
```

### MEDIUM Quality (60-75% confidence)
```
✓ Three pillars aligned but weaker
✓ Somewhat clear market state
✓ Price near key level
✓ Moderate CVD
✓ Few confirming factors
```

### LOW Quality (<60% confidence)
```
✗ Pillars not fully aligned
✗ Unclear market state
✗ Price between levels
✗ Weak or conflicting CVD
✗ Missing confirmations
```

**Trade ONLY high-quality setups**

---

## 📍 Entry Rules

### Trend Continuation Entry
1. Wait for breakout from balance (LVN creation)
2. Confirm aggression (strong CVD)
3. Enter on pullback to:
   - Previous LVN (now support/resistance)
   - Newly forming HVN

### Mean Reversion Entry
1. Identify failed breakout at LVN
2. Confirm rejection (weak CVD, volume drop)
3. Enter on return to:
   - Previous POC
   - Opposite HVN

---

## 🛑 Stop Loss Rules

**Placement**:
- Must be beyond the aggressive print
- Add 1-2 tick buffer for volatility
- Never < 0.25% of price (too tight)
- Never > 2× risk amount (too wide)

**Management**:
- ❌ NEVER move stop away from entry
- ✅ Can trail stop in profit
- ✅ Honor original stop always

---

## 🎯 Take Profit Rules

**Primary Target**: Previous balance POC

**Trailing Conditions**:
- Strong CVD continues
- No LVN rejection
- Volume supports continuation

**Early Exit Signals**:
- CVD reverses
- Rejected at major LVN
- Market state changes
- Volume drops significantly

---

## ⏰ Timeframe Guide

| Timeframe | Trading Style | Signal Quality | Frequency |
|-----------|--------------|----------------|-----------|
| 1m - 5m | Scalping | Lower | High |
| 15m - 1h | Swing | Better | Medium |
| 4h - 1d | Position | Highest | Low |

**Recommendation**: Start with 15m or 1h for best signal quality

---

## 🚫 Common Mistakes

| ❌ Don't | ✅ Do Instead |
|---------|--------------|
| Trade without aggression | Wait for CVD confirmation |
| Ignore market state | Trade with state, not against |
| Enter at random prices | Only at POC/HVN/LVN |
| Force trades (FLAT signal) | Wait for all pillars to align |
| Move stop loss away | Honor original stop |
| Overtrade | Focus on quality over quantity |
| Risk > 0.5% per trade | Keep risk controlled |

---

## 🎓 Learning Path

### Week 1: Foundation
- Study volume profile concepts
- Learn POC/HVN/LVN identification
- Practice market state recognition

### Week 2: Order Flow
- Understand CVD calculation
- Identify footprint imbalances
- Recognize aggression patterns

### Week 3: Models
- Master trend continuation setups
- Learn mean reversion patterns
- Practice entry timing

### Week 4: Risk Management
- Calculate position sizes
- Place proper stop losses
- Manage profit targets

### Week 5+: Live Practice
- Paper trade with bot signals
- Review every trade
- Build consistency

---

## 💡 Pro Tips

1. **Multi-Timeframe**: Check higher TF for market state, lower TF for entry
2. **Volume First**: If volume doesn't confirm, don't trade
3. **Patience Pays**: Best traders take 2-3 high-quality trades/day max
4. **Journal Everything**: Track why you took each trade
5. **Review Weekly**: Analyze wins AND losses
6. **Trust the Process**: Follow rules even when difficult

---

## 🔢 Key Numbers

- **Risk per trade**: 0.25% - 0.5%
- **Minimum confidence**: 60%
- **Analysis frequency**: Every 30-60 seconds
- **Max open trades**: 1 (for beginners)
- **Daily loss limit**: 2% of account
- **Volume profile bins**: 50
- **Historical candles**: 500

---

## 🎯 Daily Trading Routine

**Pre-Market (5 min)**:
- [ ] Check previous day's balance areas
- [ ] Identify overnight POC changes
- [ ] Note key support/resistance levels

**During Session**:
- [ ] Monitor AI signal panel
- [ ] Wait for high-confidence setups
- [ ] Execute only when all pillars align
- [ ] Manage active trades per rules

**Post-Market (10 min)**:
- [ ] Review all trades taken
- [ ] Journal reasons for each
- [ ] Calculate daily P&L
- [ ] Plan for next session

---

## 📞 When to Exit Immediately

Exit ANY trade if:
- Technical issue (platform crash, internet loss)
- Major news event (not priced in)
- Stop loss hit (no exceptions)
- Market state suddenly changes
- You feel emotional (fear/greed)

---

## 🏆 Success Metrics

Track these weekly:
- **Win Rate**: Goal >50%
- **Risk:Reward**: Goal >1:1.5
- **Max Drawdown**: Keep <10%
- **Avg Trade Duration**: Track for optimization
- **Signals Taken vs. Generated**: Quality filter

---

**Remember**: 
> "The goal is not to trade more, it's to trade better."

**Core Principle**: 
> "If all three pillars don't align, the signal is FLAT. No exceptions."

---

*Print this and keep near your trading desk!*
