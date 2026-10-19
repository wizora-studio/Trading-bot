<!-- Generated from docs/specs/MASTER_PROMPT.md lines 668-674. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

P. Risk Model Library (5 models from my research document, implemented as user-confirmable presets and calculators)
- Each model is a preset the user can turn on, adjust, and confirm through the Read-Back flow. Configurations are versioned.
- The app computes each model's state from the user's own data and shows what the user's OWN confirmed rule says to do (e.g., "Your rule: risk 0.25% now"). The app cannot block trading on external platforms; it shows stop signals and records violations.
- Full formulas, examples, and corrections are in Appendix A, Part C.
- Version 1: Model 1 (fixed fractional sizing), Model 4 (drawdown ladder and daily circuit breaker), and Model 5 (minimum R:R gate, partial + breakeven plan, correlation cap for planned trades).
- Later: Model 2 (ATR sizing with automatic ATR from market data; manual ATR entry is allowed earlier) and Model 3 (quarter-Kelly, shown only as information once the user's own sample is large enough under the Phase 5 Statistical Confidence Framework).
