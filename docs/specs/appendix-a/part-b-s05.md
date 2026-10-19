<!-- Generated from docs/specs/MASTER_PROMPT.md lines 1066-1076. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

S5. Support & Resistance Bounce and Role Reversal (S&R Flip)
- Price action | all liquid markets | 15m, 1H, 4H | 6.5/10 (8/10 when quantified) | Claims: win rate 50–60%, R:R 1:2–1:3.
- Zone construction: draw a zone, not a line: from a 4H/Daily swing high/low wick to the candle body close, with zone width ≤ 0.5 × ATR(14). Quantified levels: fractal swings with at least 2 touches within 0.3 × ATR. AMBIGUOUS: how the two tolerances work together.
- Freshness: the 2nd or 3rd touch is strongest. No bounce trades on the 5th touch or later.
- Long entry: price enters a higher-timeframe support zone, lower-timeframe (15m/1H) candles shrink (deceleration), then a bullish engulfing or pin bar closes, and RSI(14) turns up from below 35. Short: mirror image (ASSUMED: RSI turning down from above 65; NOT_STATED).
- Stop-loss: 1 × ATR(14) beyond the zone's outer edge.
- Target: nearest opposing structure, minimum 1:2.
- Flip setup: a broken resistance becomes support on the retest (e.g., EURUSD breaks 1.0850, returns two days later, 1H hammer → buy).
- Invalidation: if price approaches faster than 2 × ATR per candle ("falling knife"), cancel blind limit orders and wait for a confirmation candle.
- Measurability (V1): YES: R, planned minimum R:R. PARTIAL: zone, touch count, ATR, RSI. NO: "deceleration" judgement.
