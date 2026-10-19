<!-- Generated from docs/specs/MASTER_PROMPT.md lines 727-741. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

PHASE 5 — DETERMINISTIC MATHEMATICAL ENGINE
Architect and specify the pure, deterministic TypeScript calculation engine before writing any AI or UI code.
- Zero AI in Math: The LLM must never compute balances, drawdowns, R-multiples, or prop-firm rules. All math must be executed by deterministic, unit-tested TypeScript functions.
- Monetary Precision: Use `decimal.js` (or an equivalent arbitrary-precision decimal library) for all financial arithmetic and `NUMERIC`/`DECIMAL` types in PostgreSQL. Never use raw IEEE 754 floating-point math (`number`) for currency summation or fee deduction.
- Define currency minor units and explicit rounding modes (e.g., keep full precision during aggregation, round only for display, with a documented rounding mode).
- Serialize decimals as strings across the server/client boundary.
- Write a formal Metric Specification Sheet for every formula (Inputs, Exact Equation, Precision/Rounding Rules, Edge Cases such as 0 wins / 0 losses / 0 risk / breakeven trades, Missing-Data Fallback, and Reference Hand-Calculated Test Case).
- Explicitly define how partial closes are aggregated into a parent "Logical Trade" versus individual "Execution Deals" so win rate and trade count are not artificially inflated by scaling out. Define position reconstruction for both netting and hedging account modes.
- Day bucketing rule: define which day a trade belongs to (e.g., by close time) in a configurable timezone. A prop firm's reset timezone may differ from the user's display timezone; both must be supported.
- Session definitions must be DST-aware (London and New York change clocks on different dates).
- Statistical Confidence Framework (single source of truth): define confidence levels (e.g., INSUFFICIENT_DATA, LOW, MODERATE, HIGH) using both sample size and the width of the confidence interval / standard error. Store all thresholds as named constants in one file. The UI badges, Strategy Analyzer, Monte Carlo module, and AI layer must all use this same framework. (This resolves the earlier inconsistency between "<30 trades" and "<20 trades".)
- Engine versioning: stamp every analytics snapshot and AI report with the engine version so old results can be reproduced.
- Performance: support at least 100,000 trades per user; specify incremental recomputation after imports and which heavy calculations run in background jobs.
- Testing approach: hand-calculated golden datasets, property-based tests (e.g., with fast-check) for invariants (net = gross − costs; wins + losses + breakevens = total trades; drawdown is never negative), and differential testing against an independent reference implementation (e.g., a small Python/pandas script) on the same dataset.
