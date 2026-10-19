<!-- Generated from docs/specs/MASTER_PROMPT.md lines 1099-1109. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

S8. Institutional Supply & Demand Zones (RBR, DBD, DBR, RBD)
- Institutional zones | Forex, Gold, Indices | 15m, 1H, 4H | 6.5/10 (8.5/10 with filters) | Claims: win rate 45–55%, R:R 1:3–1:6.
- Patterns: Rally-Base-Rally and Drop-Base-Rally = demand; Drop-Base-Drop and Rally-Base-Drop = supply.
- All 3 required: (1) a tight base of 1–4 small candles (5 or more = invalid); (2) the departure leg is at least 3 × the base height and breaks the previous swing (BOS); (3) the zone is fresh (never retested).
- Zone lines: proximal = base candle bodies; distal = the base's extreme wick.
- Entry: ASSUMED limit order at the proximal line on the first touch (the exact trigger is NOT_STATED).
- Stop-loss: 0.5 × ATR(14) beyond the distal line.
- Target: the opposing zone, minimum 1:3.
- Mitigation: once price taps more than 50% of the zone depth, the zone is "mitigated" and pending orders are cancelled.
- Measurability (V1): YES: R, planned minimum R:R. PARTIAL: base and impulse measurements. NO: "small/boring candle" definition (NOT_STATED; e.g., body ≤ 50% of the range — ASSUMED).
