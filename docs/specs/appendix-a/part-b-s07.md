<!-- Generated from docs/specs/MASTER_PROMPT.md lines 1088-1098. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

S7. Mean Reversion (Larry Connors RSI(2) & Bollinger Band extremes)
- Mean reversion | S&P 500, QQQ, ETFs, majors | Daily, 1H | 9.5/10 | Claims: win rate 65–78%, R:R 1:0.8–1:1.5 ("30+ years backtested" refers to US index data, not to the user's instruments).
- Indicators: SMA 200, SMA 5, RSI(2), Bollinger Bands (20, 2.0).
- Long: close above SMA 200; RSI(2) below 10 (or below 5) and/or a close near or outside the lower band; enter at the close or the next open.
- Short: close below SMA 200 and RSI(2) above 90 (or above 95).
- Exit: long exits when a candle closes above SMA 5 or RSI(2) crosses above 70. Short exit: ASSUMED mirror (close below SMA 5 or RSI(2) below 30; NOT_STATED).
- Emergency stop: 2.5 × ATR(14) from entry, or a close below SMA 200.
- Hard rule: never take a long mean-reversion trade below SMA 200.
- Measurability (V1): YES: short holding times, R. PARTIAL: RSI(2), SMAs, bands.
- Notes: the average win is often smaller than the average loss, so expectancy depends on a high win rate. Small samples are very misleading here.
