<!-- Generated from docs/specs/MASTER_PROMPT.md lines 1241-1247. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

R3. Fractional Kelly (Quarter-Kelly)
- Full Kelly f* = W − (1 − W) ÷ R, where W = win rate and R = average win ÷ average loss.
- Safe allocation = min(cap, 0.25 × f*). The document's cap is 1.0–2.0% for retail/prop accounts (e.g., A+ setups 1.0%, B setups 0.4%).
- Example (checked): W = 0.50, R = 2.5 → f* = 0.50 − 0.20 = 0.30 (30%); quarter-Kelly = 7.5% → capped at 1–2%.
- Guard: if (W × R) − (1 − W) ≤ 0, show "Negative expectancy: no mathematical edge. Do not trade this live."
- App rules: computed only from the user's own confirmed trade statistics, only after the sample is large enough under the Phase 5 Statistical Confidence Framework, shown with uncertainty ranges, and never used to set risk automatically.
