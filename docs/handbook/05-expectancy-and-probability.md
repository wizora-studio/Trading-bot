# Module 5 — Expectancy and probability / Expectancy aur imkaan

Phase 1 of the Trading Analytics Handbook. Written in plain English.
Educational only — not financial advice, and nothing here predicts what any market will do. Formulas are implemented in `src/services/analytics/riskMath.ts` (`expectancyFromRates`, `breakevenWinRate`, `standardError`, `challengeOdds`) and `metrics.ts`; every number in the worked examples is checked by tests in `riskMath.test.ts`.

---

## 1. Expectancy: the average result of one trade

**Expectancy per trade = (win probability × average win) − (loss probability × average loss)**

Average loss is written as a positive number here, so you subtract it.
Expectancy in money ($ per trade) is what the dashboard shows. Expectancy in **R** (see Module 3) is the same idea in risk units, which makes accounts of different sizes comparable.

If expectancy is above zero, the *past* trades averaged a profit per trade; if below zero, a loss. It describes the data you have. It is not a promise about the next trade.

## 2. Why an 80% win rate can still lose money — Example 1

| | Value |
|---|---|
| Win rate | 80% |
| Average win | +$10 |
| Average loss | −$50 |

Expectancy = 0.80 × 10 − 0.20 × 50 = 8 − 10 = **−$2.00 per trade**.

Out of 100 trades: 80 wins × $10 = +$800 and 20 losses × $50 = −$1,000 → **−$200**, even though 4 trades in 5 were winners.
The average win is only 0.2 times the average loss (RRR = 0.2). The breakeven win rate for that RRR is 1 ÷ 1.2 = **83.3%**, and 80% is below it.

Lesson: win rate alone says nothing. Always read it together with average win and average loss.

## 3. Breakeven win rate

For a reward-to-risk ratio (RRR = average win ÷ average loss):

**Breakeven win rate = 1 ÷ (1 + RRR)**

| RRR | Breakeven win rate |
|---|---|
| 0.2 | 83.3% |
| 0.5 | 66.7% |
| 1 | 50.0% |
| 1.5 | 40.0% |
| 2 | 33.3% |
| 3 | 25.0% |
| 4 | 20.0% |

This ignores costs (spread, commission, swap). With costs the real breakeven is a little **higher**, and your net RRR is lower than the planned RRR. Use *net* average win and loss, as the dashboard does.

## 4. Low win rate, strong edge — Example 2

| | Value |
|---|---|
| Win rate | 30% |
| Average win | +3R |
| Average loss | −1R |

Expectancy = 0.30 × 3 − 0.70 × 1 = 0.9 − 0.7 = **+0.2R per trade**. The breakeven win rate for RRR 3 is 25%, so 30% is above it.

Over 100 trades the average outcome is about +20R. But the path is rough:

- Standard deviation of a single trade is about 1.83R (much bigger than the 0.2R edge).
- In 100 trades with a 70% chance of a loss each time, the chance of **at least one run of 5 losses in a row** is about 100%, of **8 in a row** about 86%, and of **10 in a row** about 58% (exact calculation, `probabilityOfLossRun`).

So a real strategy with this profile feels bad most of the time. Whether you can follow the rules through 8 losses in a row is a question about *you* and your risk size, not about the formula.

## 5. The Law of Large Numbers, variance and sample size

- **Law of Large Numbers:** the more trades you have, the closer the *average* result gets to the true underlying average — **if** the conditions stayed the same.
- **Variance / standard deviation (std):** how spread out single-trade results are around their average.
- **Standard error** = std ÷ √n. It says how uncertain your *average* is. Using the std of Example 2 (1.83R):

| Trades (n) | Standard error of average R |
|---|---|
| 30 | 0.33R |
| 100 | 0.18R |
| 400 | 0.09R |
| 1,000 | 0.06R |

With 100 trades the uncertainty (±0.18R, and roughly twice that for a 95% range) is as big as the whole +0.2R edge. Four times more trades only **halve** the uncertainty.

This is why the app shows a **confidence level** next to every number: under 10 trades = "insufficient", 10–29 = "low", 30–99 = "moderate", 100+ = "high", and a "high" is lowered to "moderate" when the 95% range includes zero.

## 6. Sequence risk

Two traders with the **same trades in a different order** end with the same total, but not the same experience.

Same ten results (in R): +2, +2, +2, +2, +2, −1, −1, −1, −1, −1 → total +5R.
- Wins first: the equity curve only goes up, then down to +5R. Maximum drawdown: 5R from the peak of +10R.
- Losses first (−1 ×5, then +2 ×5): the curve falls to −5R before recovering. On a funded account with a 5R loss limit this is a **failed challenge**, with exactly the same total.

Order is luck; it cannot be controlled, only survived — with small risk per trade (Module 3).

## 7. Profit target versus loss limit ("gambler's ruin" intuition)

A funded challenge is a race: reach **+target** before touching **−limit**.

- With **zero edge** (a fair coin, equal ±1 steps) the chance of reaching the target first is **limit ÷ (limit + target)**. Limit 10, target 8 → 10 ÷ 18 = **55.6%**. Target 10, limit 10 → 50%. A target bigger than the limit means worse than even odds even for a fair game.
- With a **real edge** the same race tilts in your favor, but the *target-to-limit ratio* still matters. Example: 45% win rate, RRR 2 (edge +0.35R), risking 1% of the account per trade (so a win is +2%, a loss −1%), exact calculation, no costs or daily limit:

| Target | Loss limit | Chance to reach target first |
|---|---|---|
| 5% | 10% | 97.1% |
| 10% | 10% | 96.7% |
| 10% | 5% | 82.0% |

A tight loss limit relative to the target is the dangerous setup — and the traders' own risk per trade decides how many "steps" fit into that limit (next section).

## 8. A positive edge that still blows the account — Example 3

Same strategy every time: **45% win rate, RRR 2** → expectancy +0.35R per trade (breakeven win rate is 33.3%).
Funded rules: profit target **10%**, maximum loss **10%** of the initial balance.
Only the **risk per trade** changes (exact calculation, no costs, no daily limit, no time limit, and assuming the 45% is the *true* win rate):

| Risk per trade | Win / loss size | Chance to hit +10% first | Chance to hit −10% first |
|---|---|---|---|
| 1% | +2% / −1% | 96.7% | 3.3% |
| 2% | +4% / −2% | 84.1% | 15.9% |
| 3% | +6% / −3% | 78.9% | 21.1% |
| 5% | +10% / −5% | 65.0% | 35.0% |
| 10% | +20% / −10% | 45.0% | 55.0% |

Same strategy, same edge — and the more you risk per trade, the more likely the account fails first. At 10% risk, a single loss fails the account.

Reality is harsher than this table: the true win rate is never known (Section 5), costs lower the edge, and a **daily loss limit** (often 5%) can fail you earlier than the maximum loss limit.

## 9. Profit that comes from one lucky trade — Example 4

20 trades, in dollars:

- 8 wins of +$40 = +$320
- 11 losses of −$50 = −$550
- 1 win of +$600

Total = 320 − 550 + 600 = **+$370**, expectancy **+$18.50 per trade**, so the dashboard looks profitable. But:

- The best trade is **162%** of the net profit (the app's "Outlier" KPI, `top1Share`).
- Without that single trade: 19 trades, **−$230**, expectancy **−$12.10 per trade**.
- 19 ordinary trades lost money; one lucky trade hid it.

What to do: look at the top-1 / top-3 share and "net profit without the best trade" before trusting any average. One outlier can be a real edge (a rare large move your rules capture) but you cannot tell that from one observation.

## 10. Checklist before believing an expectancy number

1. How many trades? (Confidence badge.)
2. Win rate **and** average win / loss, net of costs.
3. Expectancy without the best trade.
4. Is the 95% range around the average above zero?
5. Does the position size let you survive the losing streaks in Section 4 and the loss limits in Section 7?

## 11. Where these numbers live in the app

| Idea | Where |
|---|---|
| Expectancy ($ and R), win rate, payoff | Dashboard KPIs (`metrics.ts`) |
| Top-1 / top-3 share ("single best trade" share of profit) | Dashboard KPI "Outlier" (`top1Share`, `top3Share`) |
| Confidence badge | Every KPI (`confidence.ts`) |
| Breakeven win rate, challenge odds | `riskMath.ts` (teaching functions, information only) |
| Losing-streak chances, Kelly | Tools / Module 3 (`riskMath.ts`) |

These functions are information. The app never sets your risk for you and never predicts results.
