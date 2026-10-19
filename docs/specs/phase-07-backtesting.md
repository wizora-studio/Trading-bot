<!-- Generated from docs/specs/MASTER_PROMPT.md lines 768-782. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

PHASE 7 — BACKTESTING AND STRATEGY VALIDATION MODULE
Specify the Strategy Validation & Monte Carlo Simulation module:
- Prioritize **Monte Carlo / Bootstrap Trade Resampling** for the MVP+ stage: Take the user's actual historical trades (or backtest log) and run 1,000+ randomized sequence simulations to show:
  - Probability of hitting a 5% Daily Loss or 10% Max Drawdown on a funded account.
  - 95th percentile worst-case losing streak and maximum drawdown.
- Use day-level (block) bootstrap in addition to trade-level resampling, because daily loss limits depend on how trades cluster within a day; trade-level shuffling alone can understate daily-limit risk.
- Funded Challenge Simulator: using the user's confirmed rule set and chosen risk per trade, estimate the probability of reaching the profit target before breaching a limit, and the expected number of trading days. Show strong caveats: past results do not guarantee future results.
- Use a seeded random number generator so results are reproducible, and run simulations in a Web Worker or background job so the UI never freezes.
- Walk-forward and out-of-sample guidance, with overfitting warnings when many parameters are tested.
- For historical OHLCV bar backtesting / replay (Advanced Milestone):
  - Document intrabar ambiguity (why a 1-hour OHLC candle cannot prove whether Stop-Loss or Take-Profit was hit first if both lie inside the candle's High-Low range without lower-timeframe/tick data).
  - Model realistic spread, commission, and slippage deductions.
  - Verify market data licensing before storing or redistributing any price data.
  - Enforce strict separation between Backtest logs, Demo/Paper trades, and Live/Funded trades in the database.
