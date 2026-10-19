# Module 4 — Essential performance metrics / Zaroori performance numbers

Phase 1 of the Trading Analytics Handbook. Educational only — not financial advice.

**How to read this module.** Every metric has: a plain definition (English), the exact formula, a worked example, how to read it, common mistakes, the data it needs, and the unit test that checks it. All worked examples use **one golden dataset**, so you can recompute everything by hand.

---

## The golden dataset (start balance $1,000, breakeven tolerance $1)

| # | Close (UTC) | Gross | Costs | **Net** | Planned risk | **R** |
|---|---|---|---|---|---|---|
| 1 | Oct 1, 10:00 | +100 | 5 | **+95** | 50 | +1.9 |
| 2 | Oct 1, 12:00 | −50 | 5 | **−55** | 50 | −1.1 |
| 3 | Oct 2, 10:00 | +0.50 | 0 | **+0.50** | – | – |
| 4 | Oct 3, 10:00 | +200 | 10 | **+190** | 50 | +3.8 |
| 5 | Oct 3, 15:00 | −100 | 0 | **−100** | 50 | −2.0 |

Closed balance after each trade: 1,000 → 1,095 → 1,040 → 1,040.50 → 1,230.50 → 1,130.50.
Tests: `src/services/analytics/metrics.test.ts` and `advanced.test.ts` use exactly these trades.

---

## A. Results

### 1. Total net P&L
- **Definition:** what you really made after all costs.
- **Formula:** Σ(gross P&L − commission − swap − fees).
- **Example:** 95 − 55 + 0.5 + 190 − 100 = **+$130.50**.
- **Read it:** the bottom line, but says nothing about risk or luck.
- **Mistakes:** using gross P&L; counting deposits as profit.
- **Data:** gross P&L and costs per trade. **Test:** "net = gross − costs".

### 2. Gross profit and gross loss
- **Definition:** sum of all winning trades / all losing trades (net of costs).
- **Formula:** Σ net of wins; |Σ net of losses|.
- **Example:** 95 + 190 = **$285**; 55 + 100 = **$155**. (The breakeven trade is in neither.)
- **Mistakes:** mixing breakevens into wins. **Test:** "gross profit / loss, profit factor…".

### 3. Total trading costs and costs % of gross profit
- **Formula:** costs = Σ(commission + swap + fees); costs % = costs ÷ Σ(positive gross P&L).
- **Example:** 5 + 5 + 10 = **$20**; positive gross = 100 + 0.5 + 200 = 300.5 → 20 ÷ 300.5 = **6.66%**.
- **Read it:** above ~20–30% means costs eat a large part of your edge (scalpers, small accounts).
- **Mistakes:** forgetting swap; double-counting spread (it is already inside the prices).
- **Test:** "streaks and outlier share" (costs % assertion).

### 4. Win rate, loss rate, breakeven rate
- **Formula:** wins ÷ n; losses ÷ n; breakevens ÷ n. A trade is breakeven when |net| < tolerance ($1).
- **Example:** 2 wins, 2 losses, 1 breakeven (the +$0.50 trade) → **40% / 40% / 20%**.
- **Read it:** never alone — a 40% win rate can be excellent with large wins.
- **Mistakes:** counting +$0.50 as a win; counting each partial close as a trade.
- **Test:** "counts wins, losses and breakevens with tolerance", "breakeven tolerance boundary".

### 5. Average win and average loss (money and % of account)
- **Formula:** gross profit ÷ wins; gross loss ÷ losses. % of account = average ÷ starting balance.
- **Example:** 285 ÷ 2 = **$142.50** (14.25% of $1,000); 155 ÷ 2 = **$77.50** (7.75%).
- **Test:** "gross profit / loss, profit factor, payoff, expectancy".

### 6. Payoff ratio
- **Formula:** average win ÷ average loss.
- **Example:** 142.50 ÷ 77.50 = **1.84**.
- **Read it:** with payoff 1.84 you break even at a win rate of 1 ÷ (1 + 1.84) ≈ 35%.

### 7. Expectancy per trade (money)
- **Formula:** net P&L ÷ n (equivalently: win rate × average win − loss rate × average loss, with breakevens counted as 0).
- **Example:** 130.50 ÷ 5 = **+$26.10**. Check: 0.4 × 142.5 − 0.4 × 77.5 + 0.2 × 0.5 = 57 − 31 + 0.1 = 26.10.
- **Read it:** the average result you can expect per trade *if* the future looks like this sample — shown with a confidence badge and its 95% range.
- **Test:** "gross profit / loss, profit factor, payoff, expectancy".

### 8. Expectancy in R (average R), average R of winners and losers
- **Formula:** R = net ÷ planned risk; average over trades that **have** planned risk.
- **Example:** R = 1.9, −1.1, 3.8, −2.0 (trade 3 has no stop) → mean **+0.65R**; winners (1.9 + 3.8) ÷ 2 = **+2.85R**; losers (−1.1 − 2.0) ÷ 2 = **−1.55R**.
- **Read it:** losers averaging −1.55R (worse than −1R) means stops were moved, slipped, or costs were large.
- **Mistakes:** dividing by the *actual* loss instead of the planned risk; ignoring trades without a stop silently (the app says "only 4 of 5 trades have a stop").
- **Test:** "R-multiples only where planned risk exists".

### 9. Profit factor
- **Formula:** gross profit ÷ gross loss. No losses → undefined (shown as "–", not infinity).
- **Example:** 285 ÷ 155 = **1.84**.
- **Read it:** above 1 = profitable. With few trades it jumps around a lot.
- **Test:** "profit factor is null when there are no losses".

### 10. Return on initial capital; time- and money-weighted returns
- **Formula:** return = net ÷ starting balance = 130.50 ÷ 1,000 = **13.05%**.
- **Deposits and withdrawals:** a simple return becomes wrong when money is added or taken out. Time-weighted return (TWR) chains the returns between cash flows; money-weighted return (MWR, like IRR) weights by how much money was in the account.
- **In the app today:** imports skip deposit/withdrawal rows, so returns are trading-only. TWR/MWR are **not calculated yet** (Backlog).

---

## B. Risk and drawdown

### 11. Maximum drawdown (money, % of peak, % of start)
- **Definition:** the biggest fall from a balance peak. **Closed-balance** drawdown uses closed trades only; **intratrade** (equity) drawdown also includes floating losses and is usually larger — trade files don't contain it, so the app never claims it.
- **Example:** peak 1,230.50 → 1,130.50 = **$100**; 100 ÷ 1,230.50 = **8.13%** of peak; 100 ÷ 1,000 = **10%** of start (the prop-firm style).
- **Test:** "peak-to-trough".

### 12. Drawdown duration and recovery time
- **Formula:** number of trades (and calendar days) from a peak until a new peak.
- **Example:** after trade 1 (peak 1,095) it takes 2 trades to reach a new high at trade 4; the last drawdown (trade 5) has not recovered yet.
- **In the app:** "Longest drawdown: N trades" in Advanced numbers.

### 13. Recovery factor
- **Formula:** net P&L ÷ max drawdown = 130.50 ÷ 100 = **1.31**.
- **Read it:** above 1 means profits outweigh the worst fall.

### 14. Ulcer Index
- **Formula:** √(average of squared % drawdowns at each closed-balance point).
- **Example:** % below peak after each trade: 0, 5.02, 4.98, 0, 8.13 → √((0 + 25.23 + 24.77 + 0 + 66.04) ÷ 5) = **4.82**.
- **Read it:** combines depth *and* duration; lower is calmer.
- **Test:** "Ulcer Index from closed balance points".

### 15. Sharpe ratio (only on daily returns)
- **Why daily:** trades have different lengths and sizes; plugging trade returns into an annualized formula is wrong. The app first turns trades into **daily returns** (day net ÷ balance at day start).
- **Formula:** mean(daily) ÷ std(daily) × √252, risk-free rate 0.
- **Example:** daily returns 4.000%, 0.048%, 8.650% → **15.61** — a meaningless number from 3 days; the app warns below 30 days.
- **Test:** "daily returns and Sharpe (annualized, rf = 0)".

### 16. Sortino ratio
- **Formula:** mean(daily) ÷ downside deviation × √252, where downside deviation = √(mean of squared negative daily returns).
- **Example:** golden set has no losing day → **undefined** (shown as "–"), not "infinite".
- **Test:** "Sortino with a losing day".

### 17. Calmar ratio
- **Formula:** annualized return ÷ max drawdown (% of peak). Only when trades span ≥ 90 days.
- **Example (test):** 1,000 → 900 → 1,200 over one year → +20% ÷ 10% = **2.0**. Golden set (3 days) → undefined.
- **Test:** "Calmar on a 1-year sample".

### 18. System Quality Number (SQN)
- **Formula:** √n × mean R ÷ std R.
- **Example:** √4 × 0.65 ÷ 2.681 = **0.48**.
- **Limits:** it grows with √n, so a big sample looks "better"; compare only similar sample sizes. Popular rating scales are rules of thumb, not science.
- **Test:** "SQN = √4 × 0.65 ÷ 2.6814 = 0.4848".

### 19. MAE / MFE and edge ratio
- **Definition:** Maximum Adverse / Favourable Excursion — how far price went against / for you during the trade.
- **In the app:** **not available**: trade files don't contain the price path. Needs OHLC data (Module M2, later).

### 20. Skewness and kurtosis of R ("fat tails")
- **Skewness > 0:** a few big winners pull the average up. **< 0:** a few big losers pull it down.
- **Excess kurtosis > 0:** more extreme results than a normal bell curve.
- **Example:** skewness **0.32**, excess kurtosis **−3.21** — with 4 values these are noise; shown only for large samples.
- **Test:** "skewness and excess kurtosis of R".

---

## C. Behaviour and concentration

### 21. Holding time and time in market
- **Formula:** average (close − open) for all / winners / losers; time in market = union of open periods ÷ total period.
- **Example:** golden trades have no open time → **unknown**, and the app says so. Test example: trades 00:00–02:00, 01:00–03:00, 09:00–10:00 → covered 4h of 10h = **40%**.
- **Read it:** winners held much shorter than losers often means "cutting winners, letting losers run".
- **Test:** "time in market merges overlapping trades".

### 22. Largest win / loss and outlier concentration
- **Formula:** top-1 share = best trade ÷ net P&L; top-3 share likewise.
- **Example:** largest win **$190**, largest loss **−$100**; 190 ÷ 130.50 = **146%** — the best trade made *more* than the total, so without it you would be negative.
- **Read it:** above 50% means results depend on one lucky trade (the app shows a warning badge).
- **Test:** "streaks and outlier share".

### 23. Maximum consecutive wins and losses
- **Example:** W, L, BE, W, L → **1 / 1**. A breakeven ends a streak.
- See Module 3 for how likely long streaks are.

### 24. Aggregations: daily, weekly, session, weekday, monthly
- **Rule:** a trade belongs to the day it **closed**, in your display timezone (Asia/Karachi by default). Sessions use the **entry** time and each market's own clock (DST-aware).
- **Example:** daily net Oct 1 **+$40**, Oct 2 **+$0.50**, Oct 3 **+$90**; best-day share 90 ÷ 130.50 = **69%**.
- **Test:** "daily buckets and best-day share", "day bucketing uses the chosen timezone".

### 25. Trade frequency
- **Formula:** trades ÷ active days (or weeks, months). Example: 5 trades over 3 days ≈ **1.7 per day**.

### 26. Long vs short
- **Example:** golden set is all long; the dashboard table splits any sample by side and by instrument.

### 27. Consistency across periods
- **In the app:** best-day share (prop-firm consistency) and the monthly / weekday tables. A single "stability score" across periods is **not calculated yet** — it needs many months to mean anything.

---

## Why not every metric fits every dataset / Har number har data par sahi nahi

| Metric | Needs | Without it |
|---|---|---|
| R, average R, SQN | initial stop-loss or planned risk | "Needs stop-loss", excluded from R |
| Holding time, time in market | open time | "unknown" |
| Sharpe, Sortino | ≥ 30 daily returns (better 100+) | warning, still shown |
| Calmar | ≥ 90 days | not shown |
| Intratrade drawdown, MAE/MFE | floating equity / price path | not available |
| Net P&L | commission and swap | Data Quality warning (net may be too high) |

### Quick self-check / Khud ko check karein
1. Trades net: +40, −20, −20, +60. Win rate, profit factor, expectancy? → **50%**, 100 ÷ 40 = **2.5**, 60 ÷ 4 = **+$15**.
2. Risk $25 on each, results +50, −25, −30. Average R? → (2 − 1 − 1.2) ÷ 3 = **−0.07R**.
3. Net P&L $300, best trade $240. Top-1 share? → **80%** — results depend heavily on one trade.
