<!-- Generated from docs/specs/MASTER_PROMPT.md lines 334-347. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

Module 5: Expectancy and Probability
Teach the mathematical relationship between win rate, average win, average loss, and expectancy using:
Expectancy per trade = (Win Probability * Average Win) - (Loss Probability * Average Loss)
Explain:
- Why a high win rate (e.g., 80%) can still lose money (negative expectancy).
- Breakeven win rate formula for any given Risk-to-Reward ratio: Breakeven Win Rate = 1 / (1 + RRR).
- Law of Large Numbers, variance, standard deviation, sample size, and sequence risk.
- Why the ratio between a funded account's profit target and its maximum loss limit strongly affects pass probability, even for a positive-expectancy strategy (simple "gambler's ruin" intuition).
- Show worked numerical examples of:
  1. High win rate with negative expectancy.
  2. Low win rate (e.g., 30%-35%) with strong positive expectancy.
  3. A positive-expectancy strategy that still blows a funded account due to excessive risk per trade and drawdown variance.
  4. A strategy that appears profitable only because of one lucky outlier trade.
