<!-- Generated from docs/specs/MASTER_PROMPT.md lines 1210-1217. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

S19. Pairs Trading / Statistical Arbitrage (Z-score spread)
- Market-neutral quant | Equities, crypto pairs, Gold/Silver | 1H, 4H, Daily | 10/10 | Claims: win rate 62–72%, R:R 1:1.2–1:2.
- Cointegration test: Augmented Dickey-Fuller p-value < 0.05 over 60–120 bars; hedge ratio β from linear regression; spread = ln(price A) − β × ln(price B); Z = (spread − mean) ÷ standard deviation.
- Entry: Z > +2.0 → short A and buy β units of B. Z < −2.0 → buy A and short β units of B.
- Exit: Z returns to 0. Stop: |Z| ≥ 3.5 (relationship breakdown).
- Notes: two legs must be stored and analysed as ONE logical trade. All statistics are computed by the deterministic engine, never by AI. "Market-neutral" does not mean risk-free. Check prop-firm rules on hedging and correlated positions.
- Measurability (V1): PARTIAL (needs both price series); checklist only in Version 1.
