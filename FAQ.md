# Frequently Asked Questions (FAQ)

## 🤔 General Questions

### Q: What is the Fabio Trading Bot?
**A:** A real-time cryptocurrency trading bot that uses AI to analyze market conditions based on the Fabio Playbook methodology. It provides LONG/SHORT/FLAT signals by analyzing market state, volume profile, and order flow.

### Q: Does this bot execute trades automatically?
**A:** No. The bot generates signals and provides entry/stop/target levels, but YOU must manually execute trades on your exchange. This is intentional for safety and learning purposes.

### Q: Is this bot profitable?
**A:** The bot is a **tool**, not a guarantee. Profitability depends on:
- Your discipline in following signals
- Proper risk management
- Only trading high-confidence setups (>70%)
- Market conditions

Think of it as a highly trained assistant, not a money-printing machine.

### Q: Do I need coding knowledge to use this?
**A:** No coding required! Just:
1. Install dependencies (`npm install`)
2. Start the server (`npm run dev`)
3. Get an OpenRouter API key
4. Configure and use

---

## 💰 Cost Questions

### Q: How much does it cost to run?
**A:** Costs breakdown:
- **Software**: FREE (open source)
- **OpenRouter API**: Pay-per-use (typically $0.01-0.10 per analysis depending on model)
- **Binance API**: FREE (market data is public)

**Estimated monthly cost**: $10-30 if analyzing continuously

### Q: Which AI model should I choose?
**A:** Recommendations by priority:

1. **GPT-4 Turbo** - Best accuracy, most expensive (~$0.10/analysis)
2. **Claude 3 Sonnet** - Great balance of speed/quality (~$0.05/analysis)
3. **Mixtral 8x7B** - Budget option, still good (~$0.01/analysis)

Start with Mixtral to learn, upgrade to GPT-4 when trading real money.

### Q: Can I use a free AI model?
**A:** OpenRouter requires payment, but costs are minimal. Some models cost <$0.01 per analysis. Running the bot 24/7 might cost $20-30/month.

---

## 🔧 Technical Questions

### Q: What are the system requirements?
**A:**
- **OS**: Windows, Mac, or Linux
- **Node.js**: v16 or higher
- **RAM**: 2GB minimum
- **Internet**: Stable connection (for WebSocket)
- **Browser**: Chrome, Firefox, or Edge (latest version)

### Q: Why isn't the chart updating?
**A:** Common fixes:
1. Refresh the page (F5)
2. Check browser console (F12) for errors
3. Verify internet connection
4. Try different trading pair
5. Clear browser cache

### Q: The WebSocket keeps disconnecting. Why?
**A:** Possible causes:
- Unstable internet connection
- Binance API temporary outage
- Firewall blocking WebSocket connections
- Too many connections (close other Binance apps)

**Solution**: The bot auto-reconnects. If persistent, restart the app.

### Q: Can I run this 24/7?
**A:** Yes, but consider:
- Server costs if deploying to cloud
- API costs for continuous analysis
- Most profitable signals occur during high-volume hours (8 AM - 6 PM UTC)

Many traders run it only during active trading hours.

---

## 📊 Trading Questions

### Q: What does "FLAT" signal mean?
**A:** FLAT means "Do NOT trade." The three pillars are not aligned:
- Market state unclear
- Not at a key level
- No aggression confirmation

**FLAT is a valid signal** - it protects you from bad trades!

### Q: Why do I see many FLAT signals?
**A:** This is NORMAL and GOOD! The Fabio Playbook is selective:
- Only 20-30% of time conditions align
- High-quality > high-quantity
- FLAT signals prevent overtrading

If you're seeing mostly FLATs, the market may be choppy or unclear.

### Q: Should I trade every LONG/SHORT signal?
**A:** NO! Additional filters:
- ✅ Only trade confidence >70%
- ✅ Read the reasoning - does it make sense?
- ✅ Check higher timeframe for confirmation
- ✅ Ensure you understand the setup
- ❌ Never trade if uncertain

### Q: What's a good win rate?
**A:** Realistic expectations:
- **50-60%**: Excellent (with proper risk management)
- **40-50%**: Good (if RR > 1:2)
- **<40%**: Review your trade selection

Remember: 55% win rate with 1:2 RR is very profitable!

### Q: How much should I risk per trade?
**A:** Default is 0.5% of account, but:
- **Beginners**: Start with 0.25%
- **Intermediate**: 0.5% (recommended)
- **Advanced**: Up to 1% (not recommended for most)

**Never** risk more than 1% per trade.

### Q: Why did my stop loss get hit?
**A:** Stop losses are part of trading:
- They protect capital from larger losses
- Volatility can trigger stops
- Setup might have been invalidated
- Even 70% confidence means 30% fail

**Important**: Hitting a stop is NOT failure - it's risk management working correctly!

### Q: Can I move my stop loss?
**A:** Rules:
- ❌ **NEVER** move stop AWAY from entry (increases risk)
- ✅ Can move stop CLOSER to entry (reduces risk)
- ✅ Can trail stop in profit

If you're tempted to move it away, that's a sign the trade is failing.

---

## 🤖 AI Questions

### Q: How does the AI analysis work?
**A:**
1. Bot sends market data to OpenRouter API
2. Structured prompt asks AI to analyze using Fabio Playbook
3. AI identifies: market state, key levels, order flow
4. AI generates signal only if all three pillars align
5. Response includes reasoning for transparency

### Q: Can I trust the AI's reasoning?
**A:** The AI is a tool, not a guru:
- ✅ It's trained on market structure concepts
- ✅ It's consistent and unemotional
- ✅ It follows Fabio Playbook rules
- ❌ It's not perfect (no system is)
- ❌ It can't predict the future

Always **verify** the reasoning makes sense to you.

### Q: Why is confidence sometimes low?
**A:** Low confidence (<70%) means:
- One or more pillars weakly aligned
- Market state unclear
- Volume/CVD not strong enough
- Conflicting signals

**Correct action**: Don't trade! Wait for higher confidence setup.

### Q: Does the AI learn from past trades?
**A:** No, this version doesn't have memory:
- Each analysis is independent
- No machine learning on your specific trades
- Uses pre-trained model knowledge

Future versions could add reinforcement learning.

---

## 📈 Performance Questions

### Q: What's the expected return?
**A:** There is NO guaranteed return. Trading is risky. Realistic goals:
- **Month 1**: Focus on learning (paper trade)
- **Month 2-3**: Break even or small gains
- **Month 4+**: 5-10% monthly is excellent

Anyone promising guaranteed returns is lying.

### Q: How long until I'm profitable?
**A:** Typical learning curve:
- **1-3 months**: Understanding the system
- **3-6 months**: Consistent execution
- **6-12 months**: Profitability

Some traders faster, some slower. Patience is key.

### Q: Should I use leverage?
**A:** For beginners: **ABSOLUTELY NOT**

Leverage multiplies both gains AND losses. Many traders blow up accounts with leverage. Master the bot with no leverage first.

### Q: Can I backtest strategies?
**A:** Backtesting mode is not yet implemented but is on the roadmap. You can:
- Manually review historical charts
- Mark where signals would have occurred
- Calculate theoretical performance

This helps validate the methodology.

---

## 🔐 Security Questions

### Q: Is my API key safe?
**A:** Current implementation:
- API key stored in browser memory (lost on refresh)
- Not sent anywhere except OpenRouter
- Not logged or saved to disk

**Best practice**: Use a read-only API key if possible.

### Q: Can I use my exchange API key?
**A:** This bot does NOT connect to your exchange for trading. It only:
- Uses Binance public market data (no auth needed)
- Uses OpenRouter API for AI analysis

You should NOT enter exchange trading keys.

### Q: What data is collected?
**A:** None. The bot:
- Runs locally on your machine
- Doesn't send data to any servers (except OpenRouter for AI)
- Doesn't track your trades
- No analytics or telemetry

---

## 🎓 Learning Questions

### Q: I'm new to trading. Should I use this?
**A:** Yes, but:
1. Start with **paper trading** (virtual money)
2. Read the methodology docs first
3. Watch signals for 1-2 weeks before trading
4. Learn about volume profile and order flow
5. Start small when ready

**Do NOT** jump straight to real money trading.

### Q: What should I study to understand this better?
**A:** Reading list:
1. **Volume Profile** - How to read POC, HVN, LVN
2. **Order Flow** - Understanding CVD and footprint charts
3. **Market Structure** - Balance and imbalance concepts
4. **Risk Management** - Position sizing and stop losses

All covered in the METHODOLOGY.md file.

### Q: Where can I learn more about Fabio Playbook?
**A:** Resources:
- **METHODOLOGY.md** - Complete explanation in this project
- **SCENARIOS.md** - Real trade examples
- **QUICK_REFERENCE.md** - Quick lookup guide

These docs contain everything you need.

---

## 🐛 Troubleshooting

### Q: "npm install" fails. What do I do?
**A:** Common fixes:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Try again
npm install
```

### Q: "Module not found" error in browser
**A:**
```bash
# Restart dev server
npm run dev
```

### Q: Candlestick data not loading
**A:** Check:
1. Binance API is accessible (try in browser: https://api.binance.com/api/v3/ping)
2. Symbol is correct (must be uppercase: BTCUSDT)
3. Internet connection is stable
4. Firewall isn't blocking requests

### Q: AI analysis returns errors
**A:** Verify:
1. OpenRouter API key is valid
2. Account has credits/payment method
3. Selected model is available
4. Request isn't rate-limited (wait 60s)

---

## 🚀 Future Features

### Q: Will there be automatic trading?
**A:** Possible future feature with:
- Exchange API integration
- Paper trading mode first
- Extensive testing
- User confirmation required

Safety first approach.

### Q: Can you add backtesting?
**A:** On the roadmap! Planned features:
- Historical data replay
- Performance metrics
- Strategy optimization
- What-if analysis

### Q: Will there be mobile app?
**A:** Potentially, but challenges:
- WebSocket connections on mobile
- Battery drain from continuous updates
- Screen size for charts

Web app currently works on mobile browsers.

### Q: Can I customize the strategy?
**A:** Currently fixed to Fabio Playbook, but future versions could allow:
- Custom indicators
- Adjustable confidence thresholds
- Different entry/exit rules
- Multiple strategies

---

## 💡 Best Practices

### Q: What's the ideal trading routine?
**A:** Suggested schedule:
```
Pre-Market (5 min):
- Review previous session
- Note key levels
- Plan potential setups

Trading Hours (2-4 hours):
- Monitor bot signals
- Take only high-confidence setups
- Max 2-3 trades per session

Post-Market (10 min):
- Review all trades
- Journal learnings
- Calculate P&L
```

### Q: How do I avoid overtrading?
**A:** Rules:
- Set max trades per day (e.g., 3)
- Only trade confidence >70%
- Take breaks after each trade
- If 2 losses in a row, stop for the day
- Track trades to see patterns

### Q: Should I trade on weekends?
**A:** Crypto markets are 24/7, but:
- Lower volume on weekends
- More choppy/unclear price action
- Higher chance of FLAT signals

Many profitable traders take weekends off.

---

## 📞 Getting Help

### Q: I have a question not answered here. What do I do?
**A:**
1. Check other documentation files (README, GUIDE, METHODOLOGY)
2. Review browser console for error messages (F12)
3. Check GitHub Issues for similar problems
4. Open a new GitHub Issue with details

### Q: How do I report a bug?
**A:** Include:
- Description of problem
- Steps to reproduce
- Browser console errors (F12)
- Screenshots if helpful
- Your environment (OS, Node version)

### Q: Can I contribute to the project?
**A:** Absolutely! Ways to contribute:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation
- Share your experience

---

**Remember**: This bot is a tool to help you make better trading decisions, not a replacement for your own analysis and judgment. Use it wisely, trade responsibly, and never risk more than you can afford to lose. 🚀📈
