<!-- Generated from docs/specs/MASTER_PROMPT.md lines 655-667. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

O. Trade Plan Builder (adapted from the "Trade Ticket" template in my research document)
Purpose: help the trader plan THEIR OWN trade before placing it. The app never suggests a direction, an entry, or which trade to take. It checks the trader's plan against their own confirmed strategy and risk rules.
Note: my research document also contained an AI persona called "QuantEdge AI" that picks strategies and gives exact live entries. That persona is NOT adopted, because the product does not give trading signals (Phase 6 scope guard). This module keeps the useful structure (diagnostic, checklist, position size, scenarios) in a safe form.
O1. Inputs: account (balance, type, confirmed rules), the active strategy, instrument, direction, planned entry, stop-loss, take-profit levels (or R targets), optional ATR value (typed manually in Version 1), "high-impact news within 30 minutes?" (answered manually in Version 1, from an economic calendar later), and currently open positions (entered manually in Version 1, from a live connection later).
O2. Output, the Trade Ticket (all numbers come from the deterministic engine):
   1. Capital & risk diagnostic: balance and account type, active risk models and the current Drawdown Ladder state (Module P), dollar risk, remaining daily and max loss if the stop-loss is hit, correlation exposure with open positions, and the news check.
   2. Strategy match: the strategy's checklist with the trader's answers, unmet rules clearly flagged, and the strategy's objectivity information (the source rating shown separately from our own measurement).
   3. Execution blueprint: position size from Risk Model 1 (or Model 2 when ATR is used), R:R to each target, a pass/fail result for the minimum R:R gate (Risk Model 5), and the TP1 partial + breakeven plan and runner plan from the strategy.
   4. Three scenarios taken from the strategy spec: Scenario A (valid execution), Scenario B (invalidation conditions before or after entry), Scenario C (response to news or a volatility shock, from the strategy or from the global news rule).
O3. The plan is saved as a planned trade and later linked to the executed trade from the import, so the app can show "plan vs actual" (did I follow my plan?).
O4. Labels: "Your plan, your decision — not financial advice." AI may only explain the ticket in simple words; it never changes numbers.
O5. Version 1 includes the Trade Plan Builder with manual inputs. Live prices, ATR, and calendar data are added later.
