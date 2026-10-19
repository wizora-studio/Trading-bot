<!-- Generated from docs/specs/MASTER_PROMPT.md lines 1040-1052. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

S3. Opening Range Breakout (ORB, 15-minute / 30-minute)
- Session breakout | NAS100, US30, SPY, stocks | 5m, 15m, 30m | 9.5/10 | Claims: win rate 45–55%, R:R 1:2–1:3.
- Opening range: high and low of 09:30–09:45 (15m) or 09:30–10:00 (30m), New York time.
- Filters: the range width must be between 25% and 60% of Daily ATR(14). If the first 15 minutes already moved 80% or more of Daily ATR, there is no trade.
- Long: a 5m candle body closes above the range high AND price is above the session VWAP. Aggressive entry at that close; conservative entry with a limit order on a retest of the range high.
- Short: mirror image below the range low and below VWAP.
- Stop-loss: range midpoint (for 1:2+ R:R), or the opposite side of the range if the range is tight.
- Targets: TP1 = 1 × range height; TP2 = 2 × range height, or exit by 11:30 New York time.
- Invalidation example: CPI at 08:30 creates a 250-point first candle (range > 60% of Daily ATR) → blocked.
- Example (illustrative): NAS100 80-point range; 09:50 5m candle closes above the high and above VWAP; stop at the midpoint (40 points); targets +80 (2R) and +160 (4R).
- Measurability (V1): YES: entry time inside the window, exit by 11:30, R. PARTIAL: range levels, VWAP, ATR filter.
- Notes: 09:30 New York = 18:30 Pakistan time during US daylight saving, 19:30 in US winter (V1). VWAP on CFDs depends on broker tick volume (V4).
