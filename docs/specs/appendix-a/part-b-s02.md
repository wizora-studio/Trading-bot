<!-- Generated from docs/specs/MASTER_PROMPT.md lines 1026-1039. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

S2. Donchian / Turtle Breakout (System 1, System 2, Turtle Soup filter)
- Breakout / trend | Commodities, Crypto, Futures | 4H, Daily | 10/10 | Claims: win rate 32–40%, R:R 1:4–1:10.
- Idea: breaks of the 20- or 55-period high/low start big trends; few large winners pay for many small losses.
- Indicators: Donchian 20 (System 1 entry), Donchian 55 (System 2 entry), Donchian 10 (System 1 exit), Donchian 20 (System 2 exit), ATR(20) = "N".
- System 1 long: price breaks the 20-period high by 1 tick, taken only if the previous 20-period breakout was a losing trade.
- System 2 long (fail-safe): if System 1 was skipped because the previous breakout won, buy the 55-period high break.
- Pyramiding: add 1 unit for every 0.5N favorable move, up to 4 units; move all stops to 2N from the latest entry.
- Stop-loss: 2N from entry.
- Exit: long exits at the 10-period low (System 1) or 20-period low (System 2). Short: mirror image.
- Turtle Soup filter (intraday): if price breaks the 20-period high but closes back below it within the same or next 2 candles, cut the trade. Intraday breakouts also need breakout-candle volume > 1.5 × the 20-bar average volume.
- Example (illustrative): BTC or Gold 4H/Daily breaks a 20-day high after 3 weeks of consolidation; 1 unit, add at +0.5N, exit at the 10-day low, capturing 6R–10R.
- Measurability (V1): YES: R distribution, number of added units. PARTIAL: Donchian levels, N, whether the previous breakout won (Turtles also track breakouts they did not trade, which needs market data). NO/PARTIAL: volume filter (see V4).
- Notes: pyramiding increases exposure. Check prop-firm lot and exposure limits.
