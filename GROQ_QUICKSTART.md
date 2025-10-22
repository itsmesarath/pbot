# Quick Start: Groq API Setup

## 3-Step Setup Guide

### Step 1: Get Your Groq API Key
1. Visit **https://console.groq.com**
2. Sign up (or log in)
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy the key (format: `gsk_...`)

### Step 2: Configure in Bot
1. Run the bot: `npm run dev`
2. Open **Control Panel** in the UI
3. Find **"Groq API Key"** section
4. Click **"Set Groq API Key"**
5. Paste your key
6. Click **Save**

### Step 3: Select Groq Model
1. In **AI Model** dropdown, find **"Groq Models"** section
2. Choose one:
   - ⚡ **GPT OSS 20B** - Fastest, good quality
   - ⚡⚡ **GPT OSS 120B** - Slower but better quality
   - 🦙 **Llama 3.3 70B Versatile** - Best overall balance
3. Enable **"AI Analysis"** toggle
4. Watch the signals come in! 🚀

## Model Comparison

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| GPT OSS 20B | ⚡⚡⚡⚡⚡ | ⭐⭐⭐ | Scalping, quick decisions |
| GPT OSS 120B | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | Swing trading |
| Llama 3.3 70B | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | All-purpose trading |

## Typical Response Times

- **Groq Models**: 0.5 - 2 seconds ⚡
- **OpenRouter Models**: 2 - 10 seconds 🐢

## Troubleshooting

### ❌ "Groq API key not set"
→ Enter your key in Control Panel

### ❌ Model not responding
→ Check Groq service status at https://status.groq.com

### ❌ Rate limit errors
→ Groq free tier has generous limits, but wait a minute and try again

## UI Indicators

When Groq is active, you'll see:
- **"(Groq)"** next to the AI Model selector
- **"API: Groq"** in the status info panel
- Ultra-fast signal updates (typically <1 second)

## Example Trading Flow

```
1. Set Groq API Key ✅
2. Select "Llama 3.3 70B Versatile (Groq)" ✅
3. Choose symbol: BTCUSDT ✅
4. Choose timeframe: 5m ✅
5. Enable AI Analysis ✅
6. Wait for first signal (~10 seconds) ✅
7. See "LONG/SHORT/FLAT" appear in Signal Panel ✅
8. Signals update every 10 seconds ✅
```

## Pro Tips

💡 **Tip 1**: Use Groq for live trading (speed matters)
💡 **Tip 2**: Use OpenRouter/GPT-4 for backtesting (quality matters)
💡 **Tip 3**: Llama 3.3 70B gives best speed/quality ratio
💡 **Tip 4**: Keep both API keys configured to switch easily
💡 **Tip 5**: Groq's free tier is very generous for hobby trading

## Need Help?

- **Groq Docs**: https://console.groq.com/docs
- **Model List**: https://console.groq.com/docs/models
- **Rate Limits**: https://console.groq.com/docs/rate-limits

---

**Ready to trade with lightning-fast AI? 🚀**

Now you have access to both:
- 🐢 **OpenRouter**: 20+ models, highest quality
- ⚡ **Groq**: 3 optimized models, blazing speed

Choose the right tool for the right job! 🎯
