<!-- Generated from docs/specs/MASTER_PROMPT.md lines 293-333. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

Module 4: Essential Performance Metrics
For each metric below, provide:
1. Plain-language definition (English + Roman Urdu summary).
2. Exact mathematical formula.
3. A step-by-step worked example.
4. Practical interpretation (what is good, bad, or misleading).
5. Common calculation mistakes.
6. Software implementation requirements (including which data fields it needs).
7. Unit test cases.

Cover at least:
- Total Net P&L.
- Gross Profit and Gross Loss.
- Total Trading Costs (Commissions + Swaps + Fees) and Costs as a % of Gross Profit.
- Win Rate, Loss Rate, and Breakeven Rate.
- Average Winning Trade and Average Losing Trade (in currency and % of account).
- Average Win / Average Loss Ratio (Payoff Ratio).
- Expectancy per Trade (in currency).
- Expectancy in R-multiples (Average R), plus Average R of winners and of losers.
- Profit Factor.
- Return on Initial Capital (where meaningful) and Time-Weighted / Money-Weighted Return on Account Balance (handling deposits/withdrawals properly).
- Maximum Drawdown (Monetary and Percentage, explicitly distinguishing Closed-Balance Drawdown from Intratrade Equity Drawdown).
- Maximum Drawdown Duration and Recovery Time (in days and number of trades).
- Recovery Factor.
- Ulcer Index (depth and duration of drawdowns combined).
- Sharpe Ratio (only when a valid periodic return series such as daily returns exists; specify risk-free rate and annualization assumptions).
- Sortino Ratio (using downside deviation on a valid periodic return series).
- Calmar Ratio (where period length and annualization are meaningful).
- System Quality Number (SQN), with its limitations explained.
- MAE / MFE (Maximum Adverse / Favorable Excursion) and Edge Ratio, only when excursion data exists.
- Skewness and kurtosis of the R-multiple distribution (fat tails explained simply).
- Average Holding Duration (overall, for winners, and for losers) and Time-in-Market %.
- Largest Win and Largest Loss (and Outlier Concentration Ratio: % of total profit from the top 1 to 3 trades).
- Maximum Consecutive Wins and Maximum Consecutive Losses.
- Daily, Weekly, Session-based, Day-of-Week, and Monthly Performance aggregations.
- Trade Frequency (trades per day, week, and month).
- Long vs. Short Performance breakdown.
- Performance Stability / Consistency Score across time periods.

Explain clearly why not every metric is valid for every dataset (e.g., why trade-by-trade returns cannot be plugged directly into an annualized daily Sharpe ratio formula without resampling to daily equity/balance returns).
