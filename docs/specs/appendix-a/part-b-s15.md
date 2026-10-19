<!-- Generated from docs/specs/MASTER_PROMPT.md lines 1170-1180. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

S15. Bollinger Band Squeeze (TTM Squeeze)
- Volatility breakout | Crypto, growth stocks, Forex | 15m, 1H, 4H | 9.5/10 | Claims: win rate 45–54%, R:R 1:2.5–1:5.
- Indicators: Bollinger Bands (SMA 20, 2.0 SD), Keltner Channel (EMA 20, 1.5 × ATR(20)), momentum (MACD histogram or 12-period linear-regression momentum). AMBIGUOUS: which momentum indicator.
- Squeeze on: upper BB < upper KC AND lower BB > lower KC for at least 6 consecutive candles.
- Fire: the first candle where a band moves back outside the Keltner Channel.
- Direction: long if momentum > 0 and rising; short if momentum < 0 and falling.
- Stop-loss: EMA 20 (the Keltner midline) or 1.5 × ATR(14).
- Exit: two consecutive shrinking momentum bars, or a close back across EMA 20 against the trade.
- Head-fake rule: if, right after the fire, a candle closes on the opposite side of EMA 20, exit (the document also says "reverse"; AMBIGUOUS).
- Measurability (V1): PARTIAL.
