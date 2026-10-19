<!-- Generated from docs/specs/MASTER_PROMPT.md lines 1235-1240. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

R2. ATR Volatility-Adjusted Sizing & Chandelier Exit
- Stop distance = k × ATR(14), with k = 1.5 intraday and 2.0–3.0 swing. Lots = dollar risk ÷ (k × ATR × value per point per lot).
- Chandelier trailing stop (long) = highest high of the last 22 bars − 3.0 × ATR(22).
- Purpose: wider stops and smaller size in volatile markets, keeping dollar risk the same.
- App: ATR typed manually in early versions; computed from market data later.
