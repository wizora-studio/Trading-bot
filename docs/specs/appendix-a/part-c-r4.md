<!-- Generated from docs/specs/MASTER_PROMPT.md lines 1248-1256. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

R4. Drawdown Scaling Ladder & Daily Circuit Breaker (prop-firm shield)
- Normal state (0% to −2.9% from the equity high-water mark): baseline risk (e.g., 0.50% per trade).
- Caution state (−3.0% to −4.9%): risk per trade cut by 50% (e.g., 0.25%), and only setups with objectivity ≥ 8/10.
- Critical state (−5.0% or worse): risk 0.125% per trade until equity recovers above −3.0%.
- Daily circuit breaker: 2 losing trades in a day OR −1.5% daily loss → stop trading for 16 hours (AMBIGUOUS vs "−2R/day", V5).
- Equity curve filter: if equity falls below its 20-trade moving average, switch to paper trading or 0.10% risk until it crosses back above.
- App: a user-confirmable personal rule preset. The app computes the current state from imported data and shows what the rule says. It cannot block external platforms; violations are logged.
- Note: the document's claim that "90% of prop traders fail because of revenge trading" is unverified.
