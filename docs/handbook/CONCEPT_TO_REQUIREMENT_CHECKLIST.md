# Concept → software requirement checklist (Phase 1 deliverable)

Every handbook concept, where it lives in the app, and its test. "Backlog" = intentionally not built (see `docs/BACKLOG.md`).

| # | Concept | Module | Requirement in the app | Code | Status |
|---|---|---|---|---|---|
| 1 | Trade, long/short, entry/exit | 1 | Import and show trades with side, prices, times | `features/import`, `features/trades` | Done |
| 2 | Order types, partial close, scale in/out | 1 | Group fills into logical trades (TradingView orders) | `features/import/parsers.ts` | Done (TradingView); other platforms Backlog |
| 3 | Gross vs net P&L, costs | 1, 2 | Net = gross − commission − swap − fees everywhere | `analytics/trade.ts` | Done |
| 4 | Balance vs equity, hedging vs netting | 1 | Closed-trade balance only; equity needs floating data | `analytics/equity.ts` | Done (labelled) |
| 5 | Breakeven tolerance | 1 | Setting; outcomes classified with it | `analytics/metrics.ts` | Done |
| 6 | Pips, lots, contract sizes, pip value | 2 | Instrument registry; position-size calculator | `analytics/instruments.ts`, `positionSize.ts` | Done |
| 7 | Spread, commission, swap, slippage | 2 | Cost fields; costs % of gross profit | `analytics/metrics.ts` | Done (slippage not separable from files) |
| 8 | Planned risk, R-multiple, RRR | 3 | Planned risk from SL or manual; R per trade | `analytics/trade.ts` | Done |
| 9 | Position sizing (fixed-fractional) | 3 | Risk Model R1, Tools calculator | `analytics/positionSize.ts`, `riskModels.ts` | Done |
| 10 | Daily loss, max loss (static/trailing) | 3, 6 | Funded rule engine with base, reset time, type | `analytics/funded.ts` | Done |
| 11 | Losing-streak probability, gambler's ruin, Kelly | 3, 5 | Information-only helpers | `analytics/riskMath.ts` | Done |
| 12 | Win rate, profit factor, payoff, expectancy | 4, 5 | Dashboard KPIs with confidence | `analytics/metrics.ts` | Done |
| 13 | Breakeven win rate, expectancy formula | 5 | Teaching helpers and handbook tests | `riskMath.ts` | Done |
| 14 | Max drawdown ($, % of peak, % of start), underwater periods, recovery | 6 | Drawdown stats and periods, closed-trade label | `analytics/equity.ts` | Done |
| 15 | True intratrade drawdown, MAE/MFE | 6 | Needs tick/OHLC data | — | Backlog |
| 16 | SQN, Sharpe, Sortino, Calmar, Ulcer, skew, kurtosis | 4 | "Advanced numbers" section with nulls for thin data | `analytics/advanced.ts` | Done |
| 17 | Confidence levels, CI, standard error | 5, 7 | Badge on every number | `analytics/confidence.ts`, `config/thresholds.ts` | Done |
| 18 | t-test, effect size, runs test | 7 | Helpers | `analytics/statistics.ts` | Done (no screen yet) |
| 19 | Bootstrap / shuffle drawdown distribution | 7 | Helper with seeded generator | `analytics/statistics.ts` | Done (no screen yet) |
| 20 | Bonferroni / Benjamini–Hochberg | 7 | Helpers required by any future multi-segment scan | `analytics/statistics.ts` | Done (scan itself Backlog) |
| 21 | Overfitting, look-ahead, survivorship | 7 | Education; backtests kept in a Backtest account | `docs`, account types | Done (education) |
| 22 | In-sample vs out-of-sample | 7 | Keep backtests in a Backtest account, separate from live/paper | account types | Education + account type; no automatic split yet |
| 23 | Rule compliance (sessions, risk, trades/day, streak, R:R) | 8 | Personal rules + violations + cost of breaking | `analytics/personalRules.ts` | Done |
| 24 | Size escalation, red days, exits vs plan, weekend, streak behavior | 8 | Observed patterns in four-part format | `analytics/behavior.ts`, `features/rules/ObservedPatterns.tsx` | Done |
| 25 | News-window holding | 8 | User-typed windows | `behavior.ts` | Engine done; screen Backlog |
| 26 | Never diagnose emotions | 8 | Hypothesis wording; insufficient data hides interpretation | `ObservedPatterns.tsx` | Done |
| 27 | Prop firm model, rule types, payouts | 9 | Education; funded intake with Read-Back | `features/funded` | Done |
| 28 | Verify firm rules from official page, user confirms | 9 | Read-Back + confirm + versions; preset has source and date | `features/funded/readback.ts`, `presets.ts` | Done |
| 29 | Platform migration | 9 | Account per platform; parsers by platform | `features/import` | Partial (TradingView, MT5) |
| 30 | Data Quality Score per import and per account | 10 | Score with weights, per account view | `features/import/quality.ts`, `features/accounts/AccountQuality.tsx` | Done |
| 31 | Which metrics break when fields are missing | 10 | Coverage list and dependency matrix | `analytics/dataQuality.ts`, [matrix](DATA_DEPENDENCY_MATRIX.md) | Done |
| 32 | Timezone declaration | 10 | Required on import; display timezone setting | `features/import`, `analytics/time.ts` | Done |
| 33 | Duplicate detection and rollback | 10 | Fingerprints; batch rollback | `features/import/fingerprint.ts` | Done |
| 34 | Glossary | all | Learn page glossary | `docs/GLOSSARY.md`, `features/learn/glossary.ts` | Done (English) |

Note: the original Phase 1 brief asks for a bilingual glossary (English + Roman Urdu); the founder later asked to remove Roman Urdu (DECISIONS D-024), so the glossary is English only.
