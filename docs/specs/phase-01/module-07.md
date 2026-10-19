<!-- Generated from docs/specs/MASTER_PROMPT.md lines 358-373. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

Module 7: Statistical Reliability
Explain:
- Small sample size traps (why 10 or 20 trades prove nothing).
- Confidence intervals and standard error.
- A simple t-test on mean R: what a p-value does and does not mean.
- Effect size versus statistical significance.
- Runs test / Z-score for checking whether wins and losses cluster (streak dependency).
- Bootstrap resampling methods (shuffling trade sequences to estimate probable drawdown distributions and confidence bounds).
- Outliers and skewness.
- Survivorship bias, look-ahead bias, data leakage, curve-fitting (overfitting), and multiple-hypothesis testing (p-hacking across 50 filters).
- Multiple-comparison corrections (Bonferroni, Benjamini-Hochberg) and why the app's leak detector must use them when it scans many segments.
- Market regime changes (trending vs. ranging, high vs. low volatility).
- In-sample versus out-of-sample evaluation, backtesting versus forward testing.
- (Advanced, later) Deflated Sharpe Ratio and Probability of Backtest Overfitting as concepts.
Build a concrete framework for reporting statistical confidence levels on every insight in the app. The exact thresholds are defined once in the Phase 5 Statistical Confidence Framework.
