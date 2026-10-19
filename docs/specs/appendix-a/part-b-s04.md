<!-- Generated from docs/specs/MASTER_PROMPT.md lines 1053-1065. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

S4. London Breakout & Asian Range Breakout
- Session breakout | GBPUSD, EURUSD, XAUUSD, JPY pairs | 15m, 30m | 9/10 | Claims: win rate 48–56%, R:R 1:2–1:3.5.
- Asian box: high and low from 00:00 to 06:00 UTC (05:00–11:00 Pakistan time; UTC has no daylight saving).
- Box filter: EURUSD/GBPUSD box 15–45 pips; Gold box $8–$22. If the Asian session already moved about 80 pips, skip. AMBIGUOUS: what "80 pips" means for Gold.
- Method 1 (break and retest, safest): after the London open, a 15m candle closes above the Asian high, then price retests the Asian high → buy on the retest. Short: mirror image.
- Method 2 (Judas swing): with a bullish 4H trend, in the first 30 minutes of the Frankfurt/London open, price wicks below the Asian low, then a strong 15m bullish candle closes back inside the range → buy, targeting the Asian high and 2 × the range.
- Trend filter: 15m candle body close plus alignment with the 4H EMA 50. No blind pending stop orders.
- Stop-loss: Method 1, below the Asian range midpoint; Method 2, 5 pips beyond the sweep wick.
- Targets: 1.5 × and 2.5 × the box height, or exit before the New York open (08:00 New York time).
- Example (illustrative): GBPUSD 28-pip box, bullish 4H; a 15m candle closes 5 pips above the high, light retest, +65 pips in 2 hours (the document says 2.3R).
- Measurability (V1): YES: entry time in the London window, exit before the New York open, R. PARTIAL: box size, retest, sweep. NO: what counts as a "strong" candle (NOT_STATED; define it).
- Notes: the document gives the London open as "2:00–4:00 AM EST / 12:00–2:00 PM Pakistan time", which is correct only in US winter (V1). ASSUMED: define the London open in Europe/London time (e.g., 08:00 London); confirm with the trader.
