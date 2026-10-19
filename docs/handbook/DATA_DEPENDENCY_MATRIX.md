# Data Dependency Matrix (Phase 1 deliverable)

Which metric needs which data fields, and what the app does when a field is missing.
Legend: **R** = required (without it the number is not calculated) · **P** = preferred (without it the number is approximate or covers fewer trades) · – = not used.

Fields: `grossPnl` (gross profit/loss), `costs` (commission, swap, fees), `closeTime`, `openTime`, `entry/exit` (prices), `SL` (stop-loss or planned risk), `TP` (take-profit), `qty` (size), `instr` (known instrument), `start` (account starting balance), `tz` (declared timezone), `strat` (strategy tag), `rules` (confirmed rule set), `float` (floating P&L / tick data; **never** in a trade file).

| Metric | grossPnl | costs | closeTime | openTime | entry/exit | SL | TP | qty | instr | start | tz | strat | rules | float | If a required field is missing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Net P&L | R | P | R | – | – | – | – | – | – | – | – | – | – | – | Costs missing: net too high (warning, quality −10) |
| Win rate, wins/losses, profit factor, payoff | R | P | R | – | – | – | – | – | – | – | – | – | – | – | As above |
| Expectancy ($ per trade) | R | P | R | – | – | – | – | – | – | – | – | – | – | – | As above |
| R-multiple, expectancy R, SQN | R | P | – | – | P | R | – | P | P | – | – | – | – | – | Trade excluded from R metrics; coverage shown (n of N) |
| Planned R:R | – | – | – | – | R | R | R | – | – | – | – | – | – | – | "–" for that trade |
| Closed-trade balance curve, drawdown | R | P | R | – | – | – | – | – | – | R | – | – | – | – | Without `start`: percent figures "–"; always labelled closed-trade |
| True (intratrade) drawdown, MAE/MFE | – | – | – | R | – | – | – | – | – | – | – | – | – | R | **Never calculated** from trade files |
| Daily P&L, calendar, best-day share | R | P | R | – | – | – | – | – | – | – | R | – | – | – | Wrong tz shifts days |
| Sessions (Asian/London/NY) | – | – | P | P | – | – | – | – | – | – | – | – | – | – | Uses close time if open time is missing (approximate) |
| Weekday / hour breakdown | – | – | R | – | – | – | – | – | – | – | R | – | – | – | Wrong tz shifts buckets |
| Holding time, time in market | – | – | R | R | – | – | – | – | – | – | – | – | – | – | "–" for trades without open time |
| Instrument breakdown | R | P | R | – | – | – | – | – | R | – | – | – | – | – | Unknown symbols grouped under their raw name; flagged |
| Sharpe, Sortino, Calmar | R | P | R | – | – | – | – | – | – | R | R | – | – | – | Under the minimum days: "–" |
| Confidence level, confidence interval | R | P | R | – | – | – | – | – | – | – | – | – | – | – | Under 10 trades: insufficient data |
| Risk-per-trade rule (personal) | – | – | – | – | P | R | – | P | P | R | – | – | R | – | Counted under "could not be checked" |
| Max trades/day, daily loss, loss streak, session, instrument rules (personal) | R | P | R | P | – | – | – | – | P | R | R | – | R | – | Day uses the open day; daily loss uses closed trades |
| Funded rule board: profit target, max loss, min days, consistency | R | P | R | – | – | – | – | – | – | R | R | – | R | – | Rule unconfirmed → not checked; floating not in file → "unverifiable from CSV"/"potential risk" |
| Funded daily loss | R | P | R | – | – | – | – | – | – | R | R | – | R | R | Closed-only result plus a warning when floating could matter |
| Behavior: size after loss | – | – | R | – | – | – | – | R | R | – | – | – | – | – | Different instrument/unit pairs are not compared |
| Behavior: red days / trades while down | R | P | R | R | – | – | – | – | – | R | R | – | – | – | Trades without open time listed as "could not be placed" |
| Behavior: exits vs plan | R | P | R | – | R | R | R | – | – | – | – | – | – | – | Trades without SL/TP not checked |
| Behavior: weekend holding | – | – | R | R | – | – | – | – | – | – | – | – | – | – | Trades without open time "unknown" |
| Followed-vs-broke analysis | R | P | R | – | – | – | – | – | – | – | – | R | – | – | Unanswered checklist items are a separate group |
| Statistical tests (t-test, runs test, resampling) | R | P | R | – | – | P | – | – | – | – | – | – | – | – | Runs test needs ≥10 wins and ≥10 losses; resampling ≥10 trades |

Notes
- Where a file cannot contain a field (`float`), the app states the limit instead of estimating it.
- The same table, in code form for coverage, is `metricCoverage()` in `src/services/analytics/dataQuality.ts`.
