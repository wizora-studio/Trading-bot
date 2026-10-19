# Module 7 — Statistical reliability

Phase 1 of the Trading Analytics Handbook. Written in plain English.
Educational only — not financial advice. The helpers are in `src/services/analytics/statistics.ts` (`meanTest`, `tCritical`, `runsTest`, `drawdownDistribution`, `bonferroni`, `benjaminiHochberg`, `chanceOfFalseAlarm`) and `confidence.ts`; the numbers below are checked by `statistics.test.ts`.

---

## 1. The small-sample trap

Ten or twenty trades prove almost nothing, because one trade can swing the average by a lot.

Ten trades, in R: +2, −1, −1, +3, −1, +2, −1, +1.5, −1, +1.5.
Average = **+0.5R**, which looks like a solid edge. But:

- Standard deviation of one trade = 1.63R.
- Standard error of the average = 1.63 ÷ √10 = **0.52R**.
- The 95% interval for the true average is **−0.67R to +1.67R**. It includes zero, and it includes edges that are strongly negative.

Take the same ten results and repeat them ten times (100 trades, same average, same spread): standard error 0.16R, interval **+0.19R to +0.81R**. The same average becomes believable only because there is ten times more data.

## 2. Standard error and confidence intervals

- **Standard error (SE)** = standard deviation ÷ √n. It measures how much the *average* would wobble if you had a different sample of trades.
- **95% confidence interval** = average ± critical value × SE. If you repeated the whole process many times, about 95% of the intervals built this way would contain the true average. It does **not** mean "95% chance the true value is in this one interval" in a strict sense; read it as "the plausible range given this data".
- For small samples the critical value comes from Student's *t* distribution, not 1.96:

| Trades (n) | Critical value (95%) |
|---|---|
| 5 | 2.776 |
| 10 | 2.262 |
| 30 | 2.045 |
| 100 | 1.984 |
| very large | 1.960 |

**How the app does it:** the confidence badge uses the plain 1.96, which is slightly too narrow below ~30 trades. That is deliberate and safe because the badge level also depends on sample size (under 10 = insufficient, 10–29 = low, 30–99 = moderate, 100+ = high), so small samples are never labelled reliable anyway. The t-based interval is available in `meanTest` for exact work.

## 3. A simple t-test on average R

Question: "If my true average were exactly zero, how surprising is the average I got?"

- **t** = average ÷ SE. Example 1: 0.5 ÷ 0.52 = 0.97.
- **p-value** = the chance of seeing an average at least this far from zero (in either direction) *if the true average were zero*. Example 1: **p = 0.36**. Example 2 (100 trades): t = 3.21, **p = 0.002**.

What a p-value **does** say: how compatible the data are with "no edge".
What it does **not** say: the probability that your strategy works, the size of the edge, or that the edge will continue. A p-value of 0.04 is not "96% sure".

Also: the t-test assumes trades are roughly independent and not wildly skewed. Skewed results (one huge winner, see Module 5) make it unreliable.

## 4. Effect size versus statistical significance

- **Statistical significance** answers "is it distinguishable from zero?" and grows with the number of trades.
- **Effect size** answers "how big is it?". A simple one is average ÷ standard deviation (Cohen's d for one sample): Example 1 = 0.31, Example 2 = 0.32 — **the same**, because the underlying edge is the same. Only the certainty changed.

A huge number of trades can make a +0.01R edge "significant", yet the edge may vanish after costs. A real but tiny edge is not necessarily worth trading; a large edge on 12 trades is not necessarily real. Look at both.

## 5. Do wins and losses cluster? The runs test

A **run** is an unbroken streak of the same outcome. WWWLLWL has 4 runs.
If outcomes were independent, the expected number of runs with `w` wins and `l` losses (n = w + l) is

expected runs = 2·w·l ÷ n + 1.

The runs test turns the gap between actual and expected runs into a z-score:
- Much **fewer** runs than expected (z strongly negative) → streaky: wins and losses come in clumps.
- Much **more** runs than expected (z strongly positive) → alternating more than chance.

Example: 20 wins first, then 20 losses → 2 runs vs 21 expected, z = −6.1, p ≈ 0.000000001. Strictly alternating W L W L … → 40 runs, z = +6.1.

The app only runs this when there are **at least 10 wins and 10 losses**; otherwise the normal approximation is not valid and the answer is "not enough data". A streaky result is a hint (maybe tilt, maybe changing markets), not a proof — see Module 8.

## 6. Resampling: how bad could the drawdown have been?

Your drawdown depends on the **order** of trades, and order is luck. Two simple methods, both seeded so a result can be reproduced:

- **Shuffle:** keep exactly your trades, re-order them randomly many times, record each max drawdown.
- **Bootstrap:** draw the same number of trades *with replacement* from your trades, many times.

Example: 12 trades with P&L +300, −200, −400, +100, +500, −250, +350, −100, +200, −300, +150, −50 on $10,000. The real order gave a max drawdown of **$600**. Across 2,000 shuffles: median **$700**, 90th percentile **$1,000**, 95th percentile **$1,100**; 77% of orderings had a drawdown at least as large as the real one. So the real order was a *kind* one, and a drawdown near $1,100 would not have been unusual with the same trades.

Limits: these methods assume the trades are independent and the future resembles the past. They give a rough range, not a guarantee. With under 10 trades the app does not run them.

## 7. Outliers and skewness

Averages are sensitive to extreme values. **Skewness** (Module 4) shows whether a long tail of big winners (positive) or big losers (negative) dominates. Always look at the average **without the best trade** and at the best-trade share (Module 5). A strategy that makes small wins and rare huge losses can look perfect until the rare loss arrives.

## 8. Biases and traps

| Trap | What it means | Example |
|---|---|---|
| **Survivorship bias** | Only seeing what survived | Reading about traders who passed a challenge, not those who failed |
| **Look-ahead bias** | Using information that was not known at the time | Backtesting with the day's high/low to place an entry earlier that day |
| **Data leakage** | Test information leaking into the rules | Choosing the strategy's settings after seeing the test period |
| **Curve-fitting (overfitting)** | Rules tuned so tightly to the past that they only describe noise | 14 indicator settings fitted to 40 trades |
| **Multiple testing (p-hacking)** | Trying many things until one looks good | Checking 50 filters and reporting the best |

## 9. Many tests at once

If you test one idea at the 5% level, a false alarm has a 5% chance. If you test many:

| Number of independent tests | Chance of at least one false alarm |
|---|---|
| 1 | 5.0% |
| 10 | 40.1% |
| 20 | 64.2% |
| 50 | 92.3% |

Slicing results by session × weekday × instrument × direction gives dozens of segments — so some will look "significant" by luck alone. Two standard corrections:

- **Bonferroni:** call a result significant only if **p ≤ 0.05 ÷ m**. Very strict; protects against any false alarm.
- **Benjamini–Hochberg (BH):** sort p-values smallest to largest; find the largest rank k with p(k) ≤ k ÷ m × 0.05; everything up to rank k is a discovery. Controls the *share* of false discoveries; less strict.

Example with 10 p-values: 0.001, 0.008, 0.012, 0.03, 0.04, 0.2, 0.35, 0.5, 0.7, 0.9.
- Without correction, five are "below 0.05".
- Bonferroni (limit 0.005): only **1** survives.
- BH: **3** survive (0.012 ≤ 3 ÷ 10 × 0.05 = 0.015, but 0.03 > 0.02).

**What the app does today:** segment tables (sessions, weekdays, instruments, directions) mark any segment with fewer than **10 trades** with a "low sample" badge, and the app does not publish "you should only trade X" conclusions. Treat every segment difference as a question to test, not a finding. Any future automatic "leak detector" that scans many segments **must** apply BH or Bonferroni (`statistics.ts` has both) and show the corrected result.

## 10. Market regimes

Markets change between **trending** and **ranging**, and between **high** and **low volatility**. A strategy tested in one regime can fail in another. The app does not classify regimes from price data. A practical habit: split your trade list into chunks of time and check whether the result is stable, or note the conditions in the journal.

## 11. In-sample versus out-of-sample, backtest versus forward test

- **In-sample:** the data used to build or tune the rules. Results here are always flattering.
- **Out-of-sample:** data the rules never saw. Honest, and almost always worse.
- **Backtest:** run the rules on past data. **Forward test:** run them on new data in real time (paper trading counts), which removes look-ahead bias and tuning.

Rule of thumb for this app: a strategy is evidence-ready only after a forward test with enough trades (confidence at least moderate) — keep backtest results in a separate **Backtest** account (account types are Normal, Funded and Backtest) so they are never mixed with live or paper results.

## 12. Advanced concepts (for later, concepts only)

- **Deflated Sharpe Ratio:** adjusts a Sharpe ratio for the number of strategies tried and for non-normal returns, so "the best of 100 backtests" is not taken at face value.
- **Probability of Backtest Overfitting:** the chance that the best in-sample strategy ranks below median out-of-sample.

The app does not calculate these yet.

## 13. The confidence framework in the app

Every number or insight carries a level, from one set of thresholds (`src/config/thresholds.ts`):

| Trades | Level | What the app does |
|---|---|---|
| Under 10 | Insufficient data | Shows the number but no conclusion or comparison |
| 10–29 | Low | Shows with a warning |
| 30–99 | Moderate | Shows normally |
| 100+ | High | Shows normally; lowered to Moderate if the 95% interval includes zero |

Segments with fewer than 10 trades carry a "low sample" badge and are never presented as findings. Every summary must say how many trades it is based on.

## 14. Checklist

1. How many trades, and what level is the badge?
2. Does the 95% interval include zero?
3. Effect size, not just p-value.
4. Is the result still there without the best trade?
5. How many things did I look at before I found this? (Correct for it.)
6. Is this result out-of-sample, or the same data I tuned on?
