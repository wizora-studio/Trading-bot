<!-- Generated from docs/specs/MASTER_PROMPT.md lines 1138-1144. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

S11. VWAP + Standard Deviation Bands
- Institutional benchmark | Futures, Indices, Stocks, Crypto | 5m, 15m | 9/10 | Claims: win rate 52–62%, R:R 1:2–1:3.
- Mode A (trend-day pullback): price holds beyond ±1 SD and VWAP slopes steeply; on the first return to the session VWAP (or an anchored VWAP) with a 5m rejection candle, enter in the trend direction. Stop beyond the opposite ±1 SD band; target ±2 SD.
- Mode B (balanced-day fade): VWAP is flat; when price touches ±2.0 or ±2.5 SD and a 5m reversal candle forms, fade back toward VWAP. Stop at ±3 SD; target the VWAP line.
- Lock rule: if the VWAP slope is greater than 0.25 × ATR per bar, fades are blocked and only pullbacks are allowed.
- Measurability (V1): PARTIAL (needs intraday OHLCV). NOT_STATED: an exact definition of "steep" apart from the lock threshold. See V4 for volume.
