import axios from 'axios';

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';
const GROQ_API_BASE = 'https://api.groq.com/openai/v1';

class AIService {
  constructor() {
    this.openRouterApiKey = '';
    this.groqApiKey = '';
  }

  setApiKey(key) {
    // Legacy support
    this.openRouterApiKey = key;
  }

  setOpenRouterApiKey(key) {
    this.openRouterApiKey = key;
  }

  setGroqApiKey(key) {
    this.groqApiKey = key;
  }

  /**
   * Analyze market data using AI based on Fabio Playbook
   * @param {Object} marketData - Contains candlesticks, volumeProfile, currentPrice
   * @param {string} model - AI model to use
   * @param {Object} multiTimeframeData - Contains daily, 4h, 1h, 5m, 1m candles
   */
  async analyzeMarket(marketData, model = 'openai/gpt-4-turbo', multiTimeframeData = null) {
    // Determine which API to use based on model
    const isGroqModel = this.isGroqModel(model);
    const apiKey = isGroqModel ? this.groqApiKey : this.openRouterApiKey;
    
    if (!apiKey) {
      throw new Error(`${isGroqModel ? 'Groq' : 'OpenRouter'} API key not set`);
    }

    const prompt = this.buildAnalysisPrompt(marketData, multiTimeframeData);

    try {
      const apiBase = isGroqModel ? GROQ_API_BASE : OPENROUTER_API_BASE;
      const headers = isGroqModel 
        ? {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        : {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Fabio Trading Bot'
          };

      const response = await axios.post(
        `${apiBase}/chat/completions`,
        {
          model: isGroqModel ? this.convertToGroqModel(model) : model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt()
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        },
        { headers }
      );

      const analysis = JSON.parse(response.data.choices[0].message.content);
      return this.parseAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing market:', error);
      throw error;
    }
  }

  /**
   * System prompt based on Fabio Playbook methodology
   */
  getSystemPrompt() {
    return `You are an expert trading analyst specializing in the Fabio Playbook methodology with MULTI-TIMEFRAME ANALYSIS.

**🕰️ TIMEFRAME HIERARCHY & PURPOSE:**
1. **DAILY (1D):** Macro trend & absolute key levels (highest priority)
2. **4-HOUR (4H):** Intermediate structure & trend confirmation
3. **1-HOUR (1H):** Volume profile analysis (POC, HVN, LVN)
4. **5-MINUTE (5M):** Entry precision & micro structure
5. **1-MINUTE (1M):** Execution timing & immediate momentum

**🎯 MULTI-TIMEFRAME CONFLUENCE STRATEGY:**

**Top-Down Analysis Flow:**
1. **Daily:** Identify trend bias (bullish/bearish/neutral) and major S/R
2. **4-Hour:** Confirm daily OR identify reversal patterns
3. **1-Hour:** Find volume-based key levels (POC, HVN, LVN)
4. **5-Minute:** Pinpoint exact entry zones and stops
5. **1-Minute:** Confirm entry timing with momentum

**KEY LEVEL HIERARCHY:**
- **Tier 1 (DAILY):** Daily high, low, open - DO NOT FADE
- **Tier 2 (4H):** 4H swing highs/lows - intermediate pivots
- **Tier 3 (1H):** Volume profile POC, HVN, LVN - value areas
- **Tier 4 (5M):** Recent swing points - entry precision
- **Tier 5 (1M):** Micro levels - execution refinement

**📊 VOLUME PROFILE (1-Hour Data):**
- **POC:** Point of Control - most traded price
- **HVN:** High Volume Node (>150% avg) - acceptance zone
- **LVN:** Low Volume Node (<50% avg) - rejection zone

**⚡ SIGNAL GENERATION (Multi-Timeframe Confluence Required):**
Generate LONG signal when:
1. Daily trend = UP OR price testing daily support
2. 4H confirms uptrend OR shows bullish reversal
3. 1H volume shows support at HVN or POC
4. 5M structure intact (higher lows)
5. 1M momentum bullish (strong buying)
6. Volume > average with buy aggression

Generate SHORT signal when:
1. Daily trend = DOWN OR price testing daily resistance
2. 4H confirms downtrend OR shows bearish reversal
3. 1H volume shows resistance at HVN or POC
4. 5M structure broken (lower highs)
5. 1M momentum bearish (strong selling)
6. Volume > average with sell aggression

Generate FLAT when:
- Timeframes conflict (e.g., daily up, 4H down, 1H neutral)
- No clear volume support/resistance
- Low volume environment
- Price in middle of range on multiple timeframes

**🛡️ RISK MANAGEMENT:**
- **Entry:** 5M or 1M precise level
- **Stop:** Beyond 5M swing OR 1H key level (whichever is closer)
- **Target:** Next 4H level OR daily high/low
- **Position Size:** 0.25%-0.5% risk per trade

Respond in JSON format:
{
  "marketState": {
    "balanced": boolean,
    "trend": "UP" | "DOWN" | "NEUTRAL",
    "confidence": 0-100,
    "dailyBias": "BULLISH" | "BEARISH" | "NEUTRAL",
    "fourHourBias": "BULLISH" | "BEARISH" | "NEUTRAL",
    "oneHourBias": "BULLISH" | "BEARISH" | "NEUTRAL"
  },
  "keyLevels": [
    {
      "price": number,
      "type": "DAILY_HIGH" | "DAILY_LOW" | "DAILY_OPEN" | "4H_HIGH" | "4H_LOW" | "1H_POC" | "1H_HVN" | "1H_LVN" | "5M_HIGH" | "5M_LOW" | "1M_HIGH" | "1M_LOW",
      "timeframe": "DAILY" | "4H" | "1H" | "5M" | "1M",
      "significance": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "orderFlow": {
    "cvd": number,
    "aggression": "BULL" | "BEAR" | "NEUTRAL",
    "volumeProfile": "HIGH" | "AVERAGE" | "LOW",
    "imbalances": [{"price": number, "type": "BUY" | "SELL", "timeframe": "1H" | "5M" | "1M"}]
  },
  "signal": {
    "type": "LONG" | "SHORT" | "FLAT",
    "confidence": 0-100,
    "entry": number,
    "stopLoss": number,
    "target": number,
    "reasoning": "Multi-timeframe analysis: 1) Daily bias, 2) 4H confirmation, 3) 1H volume, 4) 5M structure, 5) 1M momentum"
  }
}`;
  }

  /**
   * Build analysis prompt from market data
   * Uses multi-timeframe analysis: Daily, 4H, 1H, 5M, 1M
   */
  buildAnalysisPrompt(marketData, multiTimeframeData = null) {
    const { candlesticks, volumeProfile, currentPrice } = marketData;

    // Current timeframe candles
    const recentCandles = candlesticks.slice(-50);
    
    // Multi-timeframe analysis sections
    let dailyAnalysis = '';
    let fourHourAnalysis = '';
    let oneHourAnalysis = '';
    let fiveMinAnalysis = '';
    let oneMinAnalysis = '';

    // === DAILY TIMEFRAME (Macro Structure) ===
    if (multiTimeframeData?.daily && multiTimeframeData.daily.length > 0) {
      const daily = multiTimeframeData.daily;
      const dailyHigh = Math.max(...daily.map(c => c.high));
      const dailyLow = Math.min(...daily.map(c => c.low));
      const dailyOpen = daily[0]?.open || 0;
      const dailyClose = daily[daily.length - 1]?.close || 0;
      const dailyChange = ((dailyClose - dailyOpen) / dailyOpen * 100).toFixed(2);

      dailyAnalysis = `
**📅 DAILY TIMEFRAME (Macro Trend & Key Levels):**
- Daily High: ${dailyHigh.toFixed(2)} ⚠️ MAJOR RESISTANCE
- Daily Low: ${dailyLow.toFixed(2)} ⚠️ MAJOR SUPPORT
- Daily Open: ${dailyOpen.toFixed(2)} (Equilibrium)
- Daily Close: ${dailyClose.toFixed(2)}
- Daily Change: ${dailyChange}%
- Daily Range: ${(dailyHigh - dailyLow).toFixed(2)}
- Current vs Daily High: ${((currentPrice - dailyHigh) / dailyHigh * 100).toFixed(2)}%
- Current vs Daily Low: ${((currentPrice - dailyLow) / dailyLow * 100).toFixed(2)}%
`;
    }

    // === 4-HOUR TIMEFRAME (Intermediate Structure) ===
    if (multiTimeframeData?.fourHour && multiTimeframeData.fourHour.length > 0) {
      const fourH = multiTimeframeData.fourHour;
      const fourHHigh = Math.max(...fourH.map(c => c.high));
      const fourHLow = Math.min(...fourH.map(c => c.low));
      const fourHOpen = fourH[0]?.open || 0;
      const fourHClose = fourH[fourH.length - 1]?.close || 0;
      const fourHTrend = fourHClose > fourHOpen ? 'BULLISH' : fourHClose < fourHOpen ? 'BEARISH' : 'NEUTRAL';

      fourHourAnalysis = `
**⏰ 4-HOUR TIMEFRAME (Intermediate Trend):**
- 4H High: ${fourHHigh.toFixed(2)} (Resistance)
- 4H Low: ${fourHLow.toFixed(2)} (Support)
- 4H Trend: ${fourHTrend}
- 4H Range: ${(fourHHigh - fourHLow).toFixed(2)}
`;
    }

    // === 1-HOUR TIMEFRAME (Short-term Structure & Volume Profile) ===
    if (multiTimeframeData?.oneHour && multiTimeframeData.oneHour.length > 0) {
      const oneH = multiTimeframeData.oneHour;
      const oneHHigh = Math.max(...oneH.map(c => c.high));
      const oneHLow = Math.min(...oneH.map(c => c.low));
      const avgVol1H = oneH.reduce((sum, c) => sum + c.volume, 0) / oneH.length;
      const currentVol = oneH[oneH.length - 1]?.volume || 0;

      oneHourAnalysis = `
**📊 1-HOUR TIMEFRAME (Volume Profile & POC):**
- 1H High: ${oneHHigh.toFixed(2)}
- 1H Low: ${oneHLow.toFixed(2)}
- 1H Range: ${(oneHHigh - oneHLow).toFixed(2)}
- Avg Volume (1H): ${avgVol1H.toFixed(0)}
- Current Volume: ${currentVol.toFixed(0)} (${(currentVol / avgVol1H).toFixed(2)}x avg)
- Volume Profile: Use for POC, HVN, LVN identification
`;
    }

    // === 5-MINUTE TIMEFRAME (Entry Precision) ===
    if (multiTimeframeData?.fiveMin && multiTimeframeData.fiveMin.length > 0) {
      const fiveM = multiTimeframeData.fiveMin;
      const fiveMHigh = Math.max(...fiveM.map(c => c.high));
      const fiveMLow = Math.min(...fiveM.map(c => c.low));
      const fiveMSwing = (fiveMHigh - fiveMLow).toFixed(2);

      fiveMinAnalysis = `
**⚡ 5-MINUTE TIMEFRAME (Entry Levels & Micro Structure):**
- 5M High: ${fiveMHigh.toFixed(2)} (Short-term resistance)
- 5M Low: ${fiveMLow.toFixed(2)} (Short-term support)
- 5M Swing: ${fiveMSwing}
- Use for: Entry refinement, stop placement
`;
    }

    // === 1-MINUTE TIMEFRAME (Execution Precision) ===
    if (multiTimeframeData?.oneMin && multiTimeframeData.oneMin.length > 0) {
      const oneM = multiTimeframeData.oneMin;
      const oneMHigh = Math.max(...oneM.map(c => c.high));
      const oneMLow = Math.min(...oneM.map(c => c.low));
      const oneMmomentum = oneM[oneM.length - 1]?.close > oneM[0]?.open ? 'BULLISH' : 'BEARISH';

      oneMinAnalysis = `
**⚡⚡ 1-MINUTE TIMEFRAME (Execution & Momentum):**
- 1M High: ${oneMHigh.toFixed(2)}
- 1M Low: ${oneMLow.toFixed(2)}
- 1M Momentum: ${oneMmomentum}
- Use for: Precise entry timing, immediate stop placement
`;
    }

    return `Analyze the current market conditions using MULTI-TIMEFRAME analysis for trading signal generation.

${dailyAnalysis}${fourHourAnalysis}${oneHourAnalysis}${fiveMinAnalysis}${oneMinAnalysis}
**🎯 CURRENT PRICE & STATUS:**
- Symbol: ${marketData.symbol || 'BTCUSDT'}
- Current Price: ${currentPrice.toFixed(2)}

**📈 RECENT PRICE ACTION (Last 10 candles - Current Timeframe):**
${recentCandles.slice(-10).map((c, i) => 
  `${i + 1}. O:${c.open.toFixed(2)} H:${c.high.toFixed(2)} L:${c.low.toFixed(2)} C:${c.close.toFixed(2)} V:${c.volume.toFixed(0)}`
).join('\n')}

**📊 VOLUME PROFILE (For POC/HVN/LVN Identification):**
${volumeProfile?.slice(0, 15).map(vp => 
  `Price: ${vp.price.toFixed(2)}, Volume: ${vp.volume.toFixed(0)}, Type: ${vp.type || 'Normal'}`
).join('\n') || 'Not available'}

**🎯 MULTI-TIMEFRAME KEY LEVEL IDENTIFICATION:**
1. **DAILY:** Primary trend direction & major S/R levels
2. **4-HOUR:** Intermediate trend confirmation
3. **1-HOUR:** Volume profile analysis (POC, HVN, LVN)
4. **5-MINUTE:** Entry precision & micro support/resistance
5. **1-MINUTE:** Execution timing & immediate momentum

**⚡ SIGNAL GENERATION RULES (Multi-Timeframe Confluence):**
Generate LONG/SHORT signal ONLY when ALL conditions align:
1. **Daily Trend:** Price respecting or testing daily high/low/open
2. **4H Trend:** Confirms daily direction OR shows reversal setup
3. **1H Volume:** Clear POC/HVN/LVN + above average volume
4. **5M Structure:** Clean support/resistance for entry
5. **1M Momentum:** Strong directional pressure
6. **Aggression:** Volume spike + CVD confirmation

**🛡️ RISK MANAGEMENT (Multi-Timeframe Stops):**
- **Entry:** Use 5M or 1M level for precision
- **Stop Loss:** Place beyond 5M low/high OR 1H significant level
- **Target:** Next 4H level OR daily high/low
- **Risk:** 0.25%-0.5% of account

**📋 ANALYSIS INSTRUCTIONS:**
1. Start with DAILY levels - establish macro bias
2. Check 4H trend - confirm or spot divergence
3. Analyze 1H volume profile - find POC, HVN, LVN
4. Identify 5M swing structure - refine entry zone
5. Confirm with 1M momentum - validate timing
6. Generate signal ONLY with multi-timeframe confluence
7. If no clear confluence across timeframes → signal type "FLAT"

Provide detailed multi-timeframe reasoning for your analysis.`;
  }

  /**
   * Parse and validate AI analysis response
   */
  parseAnalysis(analysis) {
    // Validate required fields
    if (!analysis.marketState || !analysis.signal) {
      throw new Error('Invalid analysis response');
    }

    return {
      marketState: {
        balanced: analysis.marketState.balanced ?? true,
        trend: analysis.marketState.trend || 'NEUTRAL',
        confidence: analysis.marketState.confidence || 0
      },
      keyLevels: (analysis.keyLevels || []).map(level => ({
        price: level.price,
        type: level.type,
        significance: level.significance || 'MEDIUM'
      })),
      orderFlow: {
        cvd: analysis.orderFlow?.cvd || 0,
        aggression: analysis.orderFlow?.aggression || 'NEUTRAL',
        imbalances: analysis.orderFlow?.imbalances || []
      },
      signal: {
        type: analysis.signal.type || 'FLAT',
        confidence: analysis.signal.confidence || 0,
        entry: analysis.signal.entry || 0,
        stopLoss: analysis.signal.stopLoss || 0,
        target: analysis.signal.target || 0,
        reasoning: analysis.signal.reasoning || '',
        timestamp: new Date()
      }
    };
  }

  /**
   * Check if a model is from Groq
   */
  isGroqModel(model) {
    return model.startsWith('groq/');
  }

  /**
   * Convert Groq model ID to actual model name for API
   */
  convertToGroqModel(model) {
    const groqModels = {
      'groq/openai/gpt-oss-20b': 'openai/gpt-oss-20b',
      'groq/openai/gpt-oss-120b': 'openai/gpt-oss-120b',
      'groq/llama-3.3-70b-versatile': 'llama-3.3-70b-versatile'
    };
    return groqModels[model] || model.replace('groq/', '');
  }

  /**
   * Calculate volume profile from candlestick data
   */
  calculateVolumeProfile(candlesticks, numBins = 50) {
    if (!candlesticks || candlesticks.length === 0) return [];

    // Find price range
    const prices = candlesticks.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceStep = (maxPrice - minPrice) / numBins;

    // Initialize bins
    const bins = Array.from({ length: numBins }, (_, i) => ({
      price: minPrice + (i + 0.5) * priceStep,
      volume: 0,
      priceRange: [minPrice + i * priceStep, minPrice + (i + 1) * priceStep]
    }));

    // Distribute volume across bins
    candlesticks.forEach(candle => {
      const candleRange = candle.high - candle.low;
      const volumePerPrice = candleRange > 0 ? candle.volume / candleRange : candle.volume;

      bins.forEach(bin => {
        const overlap = Math.max(0,
          Math.min(bin.priceRange[1], candle.high) - 
          Math.max(bin.priceRange[0], candle.low)
        );
        if (overlap > 0) {
          bin.volume += volumePerPrice * overlap;
        }
      });
    });

    // Identify POC, HVNs, and LVNs
    const maxVolume = Math.max(...bins.map(b => b.volume));
    const avgVolume = bins.reduce((sum, b) => sum + b.volume, 0) / bins.length;

    return bins.map(bin => ({
      price: bin.price,
      volume: bin.volume,
      type: bin.volume === maxVolume ? 'POC' :
            bin.volume > avgVolume * 1.5 ? 'HVN' :
            bin.volume < avgVolume * 0.5 ? 'LVN' : 'Normal'
    })).filter(bin => bin.type !== 'Normal');
  }
}

export default new AIService();
