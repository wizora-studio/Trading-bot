# Module 10 — Data quality

Phase 1 of the Trading Analytics Handbook. Written in plain English.
Educational only. The score is in `src/features/import/quality.ts`; which metrics each field supports is in `src/services/analytics/dataQuality.ts`; examples below are checked by `dataQuality.test.ts`. The full table is in [DATA_DEPENDENCY_MATRIX.md](DATA_DEPENDENCY_MATRIX.md).

---

## 1. Garbage in, garbage out

Every number in the app is only as good as the file behind it. A beautiful dashboard built on incomplete data can be confidently wrong. So the app tells you what is missing and which numbers it affects, instead of hiding the gap.

## 2. What makes trade data trustworthy or not

| Problem | What goes wrong | What the app does |
|---|---|---|
| **No stop-loss / planned risk** | R-multiples, risk-per-trade checks, planned reward-to-risk and position-size rules cannot be calculated | Marks R-based numbers "not available" for those trades; −25 points at most |
| **No open time** | Holding time, time in market, weekend check are unknown; session is guessed from the close time | Marks them partial/unavailable; −15 points at most |
| **No commission / swap / fees** | Net P&L is too high | Warns "net P&L may be too high"; −10 points |
| **Server-time confusion** | Broker timestamps are often in a "server time" (for example UTC+2/+3), not your local time; days, sessions and daily-loss checks shift | You must declare the file's timezone on import; the app stores UTC and converts for display |
| **Duplicated rows** | Importing the same file twice doubles your profit | Each trade gets a fingerprint; duplicates are skipped and counted; rollback removes a whole import |
| **Partial-close splitting** | One position closed in pieces shows as several rows; counts, win rate and R change | The TradingView order-history importer groups fills into one logical trade; for other files check whether rows are positions or fills |
| **Unknown symbol** | Contract size and pip value unknown, so costs and R can't be derived | Flagged; you can edit the instrument; −10 points |
| **Missing prices** | Entry/exit prices are missing, so planned reward-to-risk cannot be checked | Info only; −10 points |
| **Edited CSVs** | Hand-edited files can contain typos, wrong signs, or invented rows | Row-level validation shows errors per row; unreadable rows are listed, never silently dropped; −30 points × share |
| **Deposits / withdrawals as rows** | Cash movements are not trades | Importer skips them |
| **Different currencies** | Profit in another currency than the account | R is not calculated when the instrument's quote currency differs from the account currency (shown as unavailable) |

## 3. The Data Quality Score

The score starts at 100 and loses points for each problem, weighted by how many trades it affects (full weight if all trades have the problem):

| Problem | Maximum points lost |
|---|---|
| Missing stop-loss / planned risk | 25 |
| Rows that could not be read | 30 (× share of rows) |
| Missing open time | 15 |
| Missing commission (no commission column, or all costs zero on 5+ trades) | 10 |
| Missing entry/exit prices | 10 |
| Unknown symbol | 10 |

Worked examples (tested):
- 5 trades with every field filled: **100**.
- 4 trades, none with a stop-loss: 100 − 25 × 1.0 = **75**.
- 4 trades, 2 without a stop-loss: 100 − 25 × 0.5 = 87.5 → **88**.
- 5 trades, every cost field zero: 100 − 10 = **90** (a single zero-commission trade is normal and costs nothing).
- 3 readable trades plus 1 unreadable row: 100 − 30 × (1 ÷ 4) = 92.5 → **93**.

Where it shows:
- **Per import:** on the preview before you confirm, and in the import history.
- **Per account:** on the Accounts page (expand the badge) — the same weights over everything stored in the account.
- **Next to numbers:** a notice appears when the last import's score is low.

80 or more is shown as good, 50–79 as a warning, below 50 as poor. The score is a guide, not a guarantee: a perfect score does not mean the file is correct, only that nothing is visibly missing.

## 4. Which metrics become invalid or approximate

Short version (full table in the matrix):

| Missing field | Not available | Approximate |
|---|---|---|
| Stop-loss and planned risk | R-multiples, expectancy in R, SQN, risk-per-trade rule, planned R:R, position-size review | — |
| Take-profit | Planned R:R, "winners cut short" check | — |
| Open time | Holding time, time in market, weekend check, open-day rules | Sessions (uses close time) |
| Commission, swap, fees | — | Net P&L, profit factor, expectancy, drawdown (all too optimistic) |
| Entry / exit prices | Planned R:R, price-based checks | — |
| Floating P&L / tick data (never in trade files) | True intratrade drawdown, MAE/MFE | Daily-loss and max-loss checks use closed trades only |
| Starting balance | Percent returns, percent drawdown, funded rule room | — |
| Correct timezone | — | Day buckets, sessions, daily-loss checks |
| Strategy tag on trades | Followed-vs-broke analysis | — |

Rule: if a number cannot be calculated, the app shows "–" with the reason, never zero or a guess.

## 5. A good import habit

1. Export the **full** history, not a screenshot or a copy-paste.
2. Tell the app the file's **timezone**.
3. Read the preview: the quality score, row errors, duplicates.
4. After importing, fill the missing stop-losses you still remember (the trade drawer keeps an audit trail of what you edited).
5. Keep the original file. Never edit numbers in a CSV by hand; edit in the app so the change is recorded.

## 6. Checklist

1. Which fields are missing, and which numbers depend on them?
2. Did I declare the right timezone?
3. Any duplicates or unreadable rows?
4. Are costs really included?
5. Does the account's score tell me to trust or to doubt the dashboard?
