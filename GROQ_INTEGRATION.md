# Groq API Integration

This document describes the Groq API integration for ultra-low latency AI model inference.

## Overview

The trading bot now supports two AI API providers:
- **OpenRouter**: Access to GPT-4, Claude, Gemini, and many other models
- **Groq**: Ultra-fast inference with specialized models

## Groq Models Available

The following Groq models are integrated:

1. **openai/gpt-oss-20b** (via Groq)
   - 20 billion parameter model
   - Ultra-low latency
   - Good balance of speed and quality

2. **openai/gpt-oss-120b** (via Groq)
   - 120 billion parameter model
   - Higher quality analysis
   - Still very fast compared to standard APIs

3. **llama-3.3-70b-versatile** (via Groq)
   - Meta's Llama 3.3 70B model
   - Versatile for various tasks
   - Excellent speed-to-quality ratio

## Setup Instructions

### 1. Get Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `gsk_...`)

### 2. Configure in Trading Bot

1. Open the Control Panel in the bot
2. Find the "Groq API Key" section
3. Click "Set Groq API Key"
4. Paste your API key
5. Click "Save"

### 3. Select a Groq Model

1. In the "AI Model" dropdown, look for the **Groq Models** section
2. Select one of:
   - GPT OSS 20B (Groq)
   - GPT OSS 120B (Groq)
   - Llama 3.3 70B Versatile (Groq)
3. The UI will show "(Groq)" next to the model selector
4. Enable "AI Analysis" toggle

## Technical Details

### API Endpoints

- **Groq API Base**: `https://api.groq.com/openai/v1`
- **Compatible with OpenAI API format**: The Groq API uses the same request/response format as OpenAI

### Model ID Mapping

Internal model IDs are prefixed with `groq/` to distinguish them:
- `groq/openai/gpt-oss-20b` → API model: `openai/gpt-oss-20b`
- `groq/openai/gpt-oss-120b` → API model: `openai/gpt-oss-120b`
- `groq/llama-3.3-70b-versatile` → API model: `llama-3.3-70b-versatile`

### API Key Storage

- Both OpenRouter and Groq API keys are stored in browser localStorage
- They persist across page refreshes
- Each API provider requires its own key
- The bot automatically selects the correct API based on the chosen model

## Performance Benefits

Groq specializes in **ultra-fast inference**:
- **~10-50x faster** than standard cloud APIs
- **Sub-second response times** for most queries
- **Perfect for real-time trading** where latency matters

## Usage Example

```javascript
// The aiService automatically detects which API to use
const analysis = await aiService.analyzeMarket(marketData, 'groq/llama-3.3-70b-versatile');

// Internal flow:
// 1. Check if model starts with 'groq/'
// 2. Use Groq API key instead of OpenRouter key
// 3. Send request to https://api.groq.com/openai/v1/chat/completions
// 4. Convert model ID (remove 'groq/' prefix)
```

## Troubleshooting

### "Groq API key not set" error
- Make sure you've entered your Groq API key in the Control Panel
- Verify the key starts with `gsk_`
- Check that it's saved (you should see "✓ API Key Set")

### Model not available
- Some models may have rate limits on free tier
- Try switching to a different Groq model
- Check Groq's status page for service issues

### Slow responses
- Groq models should respond in <1 second typically
- If slow, check your internet connection
- Verify you're using a Groq model (not OpenRouter)

## Code Files Modified

- `src/services/aiService.js` - Added Groq API support
- `src/store/tradingStore.js` - Added Groq API key storage
- `src/components/ControlPanel.jsx` - Added Groq UI controls
- `src/hooks/useTradingBot.js` - Added Groq API key initialization

## API Comparison

| Feature | OpenRouter | Groq |
|---------|-----------|------|
| Model Selection | 20+ models | 3 models |
| Response Time | 2-10 seconds | 0.5-2 seconds |
| Quality | Excellent (GPT-4, Claude) | Good-Excellent |
| Rate Limits | Varies by plan | Generous free tier |
| Best For | Quality analysis | Real-time trading |

## Recommendation

For **live trading** with the Fabio bot:
- Use **Groq models** for fast signal generation
- The speed advantage helps catch market moves quickly
- **llama-3.3-70b-versatile** offers great balance

For **backtesting or research**:
- Use **OpenRouter** with GPT-4 or Claude
- Higher quality analysis for strategy development
- More detailed reasoning

## Future Enhancements

Potential improvements:
- Add more Groq models as they become available
- Implement automatic failover between APIs
- Add latency monitoring and metrics
- Support model ensembling (combine multiple models)
