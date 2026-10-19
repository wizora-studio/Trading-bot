<!-- Generated from docs/specs/MASTER_PROMPT.md lines 348-357. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

Module 6: Equity Curves and Drawdowns
Teach:
- Closed-trade balance curves versus mark-to-market (intratrade) equity curves.
- Peak-to-trough drawdown calculation step by step.
- Percentage drawdown versus monetary drawdown (and fixed-initial-balance % drawdown used by prop firms vs. rolling-peak % drawdown used in quant finance).
- Recovery time and underwater periods.
- Daily loss calculations (including floating P&L vs. closed P&L at daily reset).
- Why historical trade CSV exports that lack tick/OHLC or MAE/MFE data underestimate true intratrade drawdown.
Rule: The application must never label a closed-trade balance drawdown as a true intratrade equity drawdown when floating P&L / excursion data is missing.
