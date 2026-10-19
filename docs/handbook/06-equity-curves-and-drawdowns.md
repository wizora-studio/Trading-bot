# Module 6 — Equity curves and drawdowns

Phase 1 of the Trading Analytics Handbook. Written in plain English.
Educational only — not financial advice. Formulas are implemented in `src/services/analytics/equity.ts` (`balanceCurve`, `drawdownStats`, `underwaterPeriods`, `gainToRecover`, `dailyPnl`); every number below is checked by `equity.test.ts`.

---

## 1. Two kinds of curve

| | Closed-trade balance curve | Mark-to-market equity curve |
|---|---|---|
| What it is | Balance after each **closed** trade | Balance **plus** the floating profit/loss of open trades, at every moment |
| Needs | A trade history (entry, exit, P&L) | Price data during each trade (ticks, candles, or the platform's equity log) |
| Changes | Only when a trade closes | Continuously while a trade is open |
| What the app shows | **Yes**, labelled "closed-trade" | **No** — the data is not in trade files |

**Rule in this app:** a drawdown calculated from closed trades is always labelled as a *closed-trade* drawdown. It is never shown as the "true" or "intratrade equity" drawdown, because the real number can only be equal or **larger**.

## 2. Drawdown, step by step

Start balance $10,000. Seven closed trades (net P&L): +300, −200, −400, +100, +500, −250, +350.

| # | Net P&L | Balance | Highest balance so far (peak) | Drawdown = peak − balance |
|---|---|---|---|---|
| start | | 10,000 | 10,000 | 0 |
| 1 | +300 | 10,300 | 10,300 | 0 |
| 2 | −200 | 10,100 | 10,300 | 200 |
| 3 | −400 | 9,700 | 10,300 | **600** |
| 4 | +100 | 9,800 | 10,300 | 500 |
| 5 | +500 | 10,300 | 10,300 | 0 (new high, equal to the old peak) |
| 6 | −250 | 10,050 | 10,300 | 250 |
| 7 | +350 | 10,400 | 10,400 | 0 |

- **Maximum drawdown (money):** $600 (trade 3).
- **Percentage drawdown:** two styles, see Section 3.
- **Recovery factor** = net profit ÷ max drawdown = 400 ÷ 600 = **0.67**. Below 1 means the account has not yet earned back more than its worst dip.

Method: walk through the trades in close-time order, keep the highest balance seen so far, and at every step subtract the balance from that peak. The maximum of those gaps is the maximum drawdown.

## 3. Money drawdown versus percentage drawdown

Same $600 drop, two different percentages:

- **Rolling-peak %** (used in quant finance and most trading books) = drawdown ÷ **the peak it fell from** = 600 ÷ 10,300 = **5.83%**.
- **Fixed-initial-balance %** (used by most prop firms for their loss limits) = drawdown ÷ **the starting balance** = 600 ÷ 10,000 = **6.00%**.

The gap grows after a good run. Start $10,000, grow to a peak of $12,000, fall to $10,800: the drop is $1,200 = **10%** of the peak, but **12%** of the initial balance. Always check which base a rule uses — the app's funded rules show it in the Read-Back.

Percentages are also not symmetric. After losing a share of your balance you need a *bigger* share to get back:

| Loss from peak | Gain needed to recover |
|---|---|
| 10% | 11.1% |
| 20% | 25% |
| 50% | 100% |

Formula: gain needed = 1 ÷ (1 − loss) − 1. A 100% loss cannot be recovered.

## 4. Recovery time and underwater periods

An **underwater period** starts when the balance falls below its peak and ends when it reaches a new high (equal to the old peak counts as recovered).

In the example above:
1. Peak 10,300 after trade 1 → underwater for **3 trades** (trades 2–4), deepest point $600 → recovered at trade 5.
2. Peak 10,300 after trade 5 → underwater for 1 trade (trade 6), depth $250 → recovered at trade 7.

The app reports the longest underwater stretch in trades and in days, and the current drawdown. A period that is *still open* at the end of the data has no recovery date — it is shown as "not recovered", never guessed.

Why it matters: recovery time is how long you must keep following the plan with a balance below your best. Funded accounts usually have a time limit or a trailing floor, so a long underwater stretch can matter even when its depth looks small.

## 5. Daily loss calculations

A **daily loss limit** compares today's result with a base (see Module 3): the initial balance, or the day's starting balance or equity, depending on the firm. Three details change the answer:

1. **Which day?** The day resets at the firm's reset time and timezone (for example 00:00 in Central Europe). The app buckets a trade into the day it **closed**, in the time zone you chose. A trade closed at 20:30 UTC on 1 Oct belongs to 2 Oct in Karachi (UTC+5).
2. **Closed or floating?** Many firms count **equity** (closed result *plus* open trades' floating P&L) against the daily limit. Example: base $10,000, limit 5% = $500. Closed trades today: −$200. An open trade is −$300 floating. Equity is down $500 → the limit is touched, although the closed-trade number says only −$200.
3. **Does it carry over?** An open trade that crosses the reset time is counted by the firm's own rule. Trade files do not say which.

Because floating P&L is not in a trade file, the app reports the **closed** daily loss and marks funded checks as *potential risk* or *unverifiable from CSV* when it matters — it does not claim you are safe.

## 6. Why exported trade files understate drawdown

A history file records the **entry and the exit** of each trade. It normally does not record how far price moved against you in between:

- **MAE** (maximum adverse excursion) = the worst floating loss during the trade.
- **MFE** (maximum favorable excursion) = the best floating profit during the trade.

Example: a trade opened at 10,000 balance went to −$400 floating, then closed at +$50. The closed-trade curve shows a clean +50 and **no drawdown at all** (tested). The real equity curve dipped $400 below the start. A stop-loss would have been a loss of at least that depth; a prop firm's equity-based limit would have seen the $400.

Without tick or candle data (or MAE/MFE), every closed-trade drawdown is a **lower bound**: the real drawdown is at least this big. Overlapping trades make the gap larger, because floating losses add up. That is why the app labels these figures "closed-trade" everywhere they appear.

## 7. Checklist

1. Which curve is this — closed-trade balance or equity?
2. Money drawdown and percentage drawdown — and which base for the percentage?
3. How long did the worst underwater period last, and is it over?
4. What is the daily-loss base and reset time of the rule I care about?
5. Could floating P&L make the real numbers worse than the closed numbers? (Almost always yes.)

## 8. Where these numbers live in the app

| Idea | Where |
|---|---|
| Balance curve, drawdown strip | Dashboard (closed-trade labels) |
| Max drawdown ($, % of peak, % of start), longest underwater stretch, recovery factor | Dashboard KPIs (`drawdownStats`) |
| Underwater periods (each dip, its depth and recovery) | `underwaterPeriods` (engine function; the dashboard shows the longest stretch and current drawdown) |
| Daily P&L and calendar | Dashboard (`dailyPnl`) |
| Daily loss, max loss, honesty states | Funded rule board (`funded.ts`) |
