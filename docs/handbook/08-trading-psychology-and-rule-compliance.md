# Module 8 — Trading psychology and observable rule compliance

Phase 1 of the Trading Analytics Handbook. Written in plain English.
Educational only — not financial advice, not psychological advice. Calculations are in `src/services/analytics/behavior.ts` and `personalRules.ts`; the examples below are checked by `behavior.test.ts`.

---

## 1. The one rule of this module

The app measures **what is visible in the data**. It never says what you *felt*. It never says "you were tilting", "you were greedy" or "you have a revenge-trading problem" as a fact.

Every behavior finding is shown in four parts:

1. **Observed pattern** — what happened, in plain words.
2. **Quantitative evidence** — the numbers, with how many trades they are based on and a confidence level.
3. **Possible interpretation (a hypothesis)** — one or more explanations that *might* fit, phrased as possibilities.
4. **Question for your journal** — a question only you can answer.

Why: a number can show that trade size doubled after a loss; only you know whether that was a plan, an error, or a decision made under stress. Treating a hypothesis as a diagnosis would be wrong and unkind.

## 2. Rules you set yourself ("My rules")

These are checked by `personalRules.ts` once you confirm them in the Read-Back:

| Rule | What the app checks | What it cannot check |
|---|---|---|
| Allowed sessions / hours | The session of each trade's open time | Whether the session labels match your own definition (you can change the hours) |
| Risk per trade | Planned risk ÷ balance before the trade, against your limit | Trades with no stop-loss or planned risk: reported as "could not be checked" |
| Max trades per day | Count of trades per day (day = the open day in your timezone) | Orders you cancelled before they filled |
| Max daily loss | Closed result so far today | Floating loss on open trades |
| Max consecutive losses | Losses in a row before the trade | |
| Allowed instruments | The instrument of each trade | |
| Minimum reward-to-risk | Planned reward ÷ planned risk | Trades with no take-profit |

The app also shows the **cost of rule-breaking trades**: the net P&L of the trades that broke at least one rule, and what the account would be without them. That is a fact about the past, not advice.

## 3. Patterns beyond your own rules

### 3.1 Size after a loss

**Observed:** the next trade (same instrument, same unit) was at least 1.5 times bigger than a trade that lost.
**Example (lots, net P&L):** 1.0 (−50), 2.0 (−100), 4.0 (+200), 1.0 (−30), 1.0 (+20).
**Evidence:** 3 trades followed a loss; 2 of them were at least 1.5 times bigger; the biggest chain of escalations was 2 in a row. Average result of the bigger trades +50, of the others +20. Confidence: insufficient (3 trades).
**Possible interpretation:** a planned increase after a loss streak; an attempt to win the loss back; or a different setup that simply needed more size. A chain of 2 or more escalations looks like "doubling up" (martingale), which grows risk fast.
**Journal question:** "What did I plan the size to be before the previous trade closed?"

### 3.2 Trading on red days

**Observed:** how many trades you take on days that end negative, and trades opened *after* the day was already down by 1% of the day-start balance (needs open times).
**Example ($10,000 start):** day 1: −150 then +50 (the second trade opened when the day was already −150, more than 1%); day 2: +100, +20.
**Evidence:** 1 red day and 1 green day, 2 trades on each; 1 trade was opened while the day was already down 1%, its result was +50.
**Possible interpretation:** a daily stop that you do not follow; or a rule-based recovery plan. Many trades on red days is not proof of anything alone.
**Journal question:** "At the moment the day turned red, what was my plan for the rest of the day?"

### 3.3 Exits versus the plan

**Observed:** winners that captured less than half of the planned reward, and losers that lost more than 1.25 times the planned risk.
**Example (planned risk $50, planned reward-to-risk 2):** wins of +100 (2R, full target) and +25 (0.5R, a quarter of the target); losses of −50 (−1R) and −75 (−1.5R).
**Evidence:** 2 winners checked, 1 cut short (average capture 62.5% of the target); 2 losers checked, 1 beyond the plan (average loss −1.25R). A trade without a stop-loss and take-profit cannot be checked and is not counted.
**Possible interpretation:** taking profit early because of nerves, or a deliberate scale-out; a stop moved farther away, or just slippage/commission/spread on the exit. Costs alone can push a −1R loss to −1.1R.
**Journal question:** "Did I change my stop or target after entering? Why?"

### 3.4 Weekend and news holding

**Observed:** trades that stayed open over a Saturday (UTC), and (calculation only, no screen yet) trades that were open inside a news window you marked.
**Example:** a trade from Friday 15:00 to Monday 08:00 is held over the weekend; a trade on Monday only is not.
**Evidence:** counts of checked / held trades and their combined result. Trades with no open time are listed as "unknown".
**Possible interpretation:** a deliberate swing trade; forgetting to close; a rule you set and ignored. Brokers close around Friday 22:00 UTC, so the weekend test is an approximation. News windows would be **typed by you** — the app has no news feed. The calculation (`newsWindowHolding`) exists and is tested, but the Rules page has no screen to enter windows yet, so only the weekend check is shown there.
**Journal question:** "Did I check my calendar for this window before I entered?"

### 3.5 Results after streaks

**Observed:** the trade right after a run of at least 3 wins (possible overconfidence) or at least 3 losses (possible tilt), compared with all other trades.
**Example:** +10, +10, +10, −5, +10, +10, +10, +10, −20.
**Evidence:** 3 trades followed a 3-win run; their average was −5 versus +10 for the other 6 trades. Confidence: insufficient (3 trades). With few trades this is noise.
**Possible interpretation:** relaxed rules after a win streak; or nothing: streaks happen by chance (Module 7, runs test).
**Journal question:** "What did I do differently on the trades after a streak?"

## 4. How much to trust a pattern

- Under 10 trades behind a pattern: shown as **insufficient data** and no interpretation.
- Several patterns checked at once: some will appear by chance (Module 7, multiple testing). Treat them as questions.
- Correlation is not cause: a bad result after a streak does not show that the streak caused it.
- Data limits: missing open times, stops, and take-profits make several checks impossible — the app says so instead of guessing.

## 5. What the app will never do

- Diagnose a mental or emotional state.
- Tell you to stop trading or to see a professional based on a number.
- Present a hypothesis as a fact, or a guess as an alert.

If trading is causing you real stress or financial harm, talk to someone you trust or a qualified professional. The app is a mirror for your data, not a therapist.

## 6. Where these numbers live in the app

| Idea | Where |
|---|---|
| Your own rules and violations, cost of breaking them | My rules page (`personalRules.ts`) |
| Observed patterns in the four-part format | My rules page → "Observed patterns" (`behavior.ts`) |
| Followed vs broke the strategy's own rules | Strategies → Details (`adherence.ts`) |
