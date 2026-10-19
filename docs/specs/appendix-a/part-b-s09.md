<!-- Generated from docs/specs/MASTER_PROMPT.md lines 1110-1124. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

S9. SMC / ICT (Liquidity Sweep + Market Structure Shift + Order Block / FVG)
- Smart money | Indices, XAUUSD, EURUSD | 1m, 5m, 15m | 5.5/10 discretionary, 8.5/10 with the filter below | Claims: win rate 45–58%, R:R 1:3–1:5.
- 5-point filter (ALL required):
  1. A higher-timeframe liquidity level was swept: previous day high/low, Asian high/low, or a 1H/4H swing high/low.
  2. Displacement: at least one candle with body ≥ 1.5 × ATR(14) and body ≥ 70% of the candle's range.
  3. Market structure shift: a full body close beyond the most recent lower-timeframe swing that created the sweep.
  4. A 3-candle FVG attached to the order block (the last opposing candle before the displacement).
  5. Premium/discount: bullish entries below 50% of the new dealing range; bearish entries above it.
- Entry: limit order at the FVG's near edge, or at 50% of the FVG/order block.
- Stop-loss: 2–5 pips/ticks beyond the sweep wick (or beyond the order block's far edge).
- Target: the opposing liquidity pool, 1:3–1:5.
- Rejection rule: if point 1 or point 3 is missing, label it a "liquidity inducement trap" and reject the trade.
- Example (illustrative, reconstructed): XAUUSD at the New York open (08:30 New York time) sweeps the London low ($2,640) by $3; the next 5m candle displaces up and closes above the previous 5m swing high ($2,645); an FVG forms at $2,641–$2,643 in discount; price taps $2,642; stop $2,636.50; target the London high $2,658. With these numbers R ≈ 2.9 (the document says 3.2R; see V3).
- Measurability (V1): YES: time window, R. PARTIAL: sweep levels, displacement size, FVG. NO: order-block selection.
