<!-- Generated from docs/specs/MASTER_PROMPT.md lines 1153-1160. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

S13. Order Flow Footprint & Cumulative Volume Delta (CVD)
- Microstructure | Futures, BTC, Gold, EURUSD | 1m, 5m, 15m | 8/10 | Claims: win rate 58–68%, R:R 1:2–1:4.
- Bullish absorption: price makes a lower low while CVD makes a higher low, or price makes an equal low while CVD drops sharply (passive buyers absorbing selling), followed by a positive-delta candle closing above the footprint POC.
- Stacked imbalance trigger: 3+ consecutive price levels with ≥ 300% ask-over-bid diagonal imbalance.
- Stop-loss: 3–5 ticks beyond the absorption / trapped-seller level. Target: VWAP or the opposing high-volume node (1:2.5–1:4).
- Rule: no delta spike or CVD divergence → no trade.
- Measurability (V1): NO (needs exchange bid/ask order-flow data, not available for spot forex or most CFD prop accounts; see V4).
