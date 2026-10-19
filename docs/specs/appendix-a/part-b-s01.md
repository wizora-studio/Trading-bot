<!-- Generated from docs/specs/MASTER_PROMPT.md lines 1013-1025. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

S1. Moving Average Trend Following (Crossover & Dynamic Pullback)
- Trend following | Forex, Gold, Crypto, Stocks | 1H, 4H, Daily | Source objectivity 9/10 (crossover 10/10, pullback 8.5/10) | Claims: win rate 40–48%, R:R 1:2.5–1:5.
- Idea: trade in the trend's direction, entering on a fresh crossover or on a pullback into the 20–50 EMA "value zone".
- Indicators: EMA 20, EMA 50, EMA 200, ADX(14).
- Long, Variant A (crossover): price above EMA 200, ADX(14) > 20, EMA 20 crosses above EMA 50 → buy at candle close.
- Long, Variant B (pullback): EMA 20 > EMA 50 > EMA 200; price pulls back between EMA 20 and EMA 50 with no candle closing below EMA 50; buy when a bullish engulfing or pin bar closes above EMA 20.
- Short: mirror image (EMA 20 < 50 < 200, ADX > 20, pullback into the 20–50 zone, bearish close below EMA 20).
- Stop-loss: 1 × ATR(14) beyond the swing low, or beyond EMA 50. AMBIGUOUS: which one, and when.
- Management: at +1.5R close 50% and move the stop to breakeven; trail the rest until a candle closes on the other side of EMA 20 or EMA 50. AMBIGUOUS: which EMA.
- No-trade filter: ADX < 20, or EMA 200 flat (less than 0.15% change over the last 20 candles) → strategy disabled. The document suggests switching to S7 or S5 (suggestion only).
- Example (illustrative): XAUUSD 1H, EMAs stacked bullish, ADX 28; price dips to EMA 20, next hour forms a bullish engulfing → buy.
- Measurability (V1): YES: R results, 1.5R partial, breakeven move (if stop edits are recorded). PARTIAL: EMA stack, ADX, ATR stop distance. NO: candle-pattern quality.
