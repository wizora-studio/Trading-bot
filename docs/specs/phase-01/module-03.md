<!-- Generated from docs/specs/MASTER_PROMPT.md lines 275-292. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

Module 3: Risk Management
Explain:
- Initial planned risk (in currency and percentage).
- Stop-loss (SL) and take-profit (TP) mechanics.
- Risk per trade as a percentage of account balance versus current equity.
- Risk-to-Reward ratio (RRR) and R-multiples (Planned R vs. Realized R).
- Position sizing formulas across different asset classes.
- Maximum daily loss limits (and how different reset times and calculation methods work).
- Maximum overall drawdown limits.
- Fixed (static) drawdown versus trailing drawdown (Intraday High-Water Mark trailing vs. End-of-Day / EOD trailing).
- Balance-based versus equity-based drawdown limits.
- Why on a funded account, risk should be sized against the remaining drawdown buffer, not the nominal account size.
- Consecutive losses, probability of losing streaks, and mathematical risk of ruin.
- The Kelly criterion and fractional Kelly, taught as theory only, with a clear warning that it becomes dangerous when the edge estimate is uncertain or the sample is small.
- Exposure across correlated positions (e.g., going long EURUSD and GBPUSD simultaneously, or short USDJPY while long XAUUSD).
Demonstrate all calculations using small, clear numbers.
Clearly distinguish planned stop-loss risk from actual realized loss (explaining how price gaps, news slippage, missing stop-losses, and execution costs cause realized loss to exceed planned risk).
