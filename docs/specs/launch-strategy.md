<!-- Generated from docs/specs/MASTER_PROMPT.md lines 914-977. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

LAUNCH STRATEGY: MVP-FIRST (this section overrides the milestone order wherever they conflict)
Goal: launch a small, useful, trustworthy product for forex traders early, learn from real users, and only then build the advanced features. Do not wait until all 14 phases and 13 milestones are finished before launching.

Target users for the first launch:
- Forex and gold (XAUUSD) funded / prop-firm traders, plus normal retail forex traders.
- First markets: Pakistan / South Asia and global online trading communities.

How the phases apply under MVP-first:
- The phases are still followed in order, but at "MVP depth": research and specifications cover what the MVP needs. Deeper specifications for later features are written when those features are scheduled.
- Phase 1 teaching continues module by module and may run in parallel with building.
- Phase 2 research focuses first on: the MT5 export format, the rules of the most popular forex prop firms used by my target users, competitor pricing, and which payment provider I can actually use from Pakistan.

STAGE 1 — Free Lead-Magnet Tool (target: 2–4 weeks)
- A free Prop Firm Calculator: remaining daily loss, remaining max drawdown, consistency rule calculator, and position size for a given stop-loss.
- Simple email capture for a waitlist.
- Purpose: Phase 2B demand validation and building an early audience.

STAGE 2 — MVP (free private beta). Strict scope cut-line:
IN the MVP:
- Authentication and user workspace (basic).
- Account types: Normal / Funded, with the Rule Intake form and a deterministic (non-AI) Read-Back and confirmation.
- Imports, in this priority order (all with validation preview, duplicate detection, timezone declaration, and rollback):
  1. TradingView Paper Trading CSV export (and TradingView broker-panel exports where available). Verify the current export format first. The "History" export is order/fill-level and must be reconstructed into logical trades; the "Account history" export lists closed positions with entry price, close price, and realized P&L. Columns can differ by connected broker. Missing fields (e.g., commissions, SL/TP) must lower the Data Quality Score and be shown to the user.
  2. Our Standard CSV Template.
  3. Manual trade entry form (for traders who log trades by hand).
  4. MT5 (Deals/Positions): required before the wider beta, because most forex prop-firm traders use MT5.
- Demo dataset.
- Deterministic engine core metrics: net P&L, costs, win rate, expectancy ($ and R), profit factor, average win/loss, max closed-balance drawdown, best-day consistency %, with sample-size/confidence badges.
- Funded rule engine core: profit target, daily loss limit, max loss (static and EOD trailing), minimum trading days, consistency rule, with the honesty states (VERIFIED_COMPLIANT / CONFIRMED_VIOLATION / POTENTIAL_RISK_WARNING / UNVERIFIABLE_FROM_CSV / RULE_UNCONFIRMED).
- Dashboard: KPI cards, equity and drawdown curve, daily P&L chart, calendar heatmap, session and day-of-week breakdown.
- Trade Explorer with notes, mistake tags, and manual SL/TP editing.
- Position Size Calculator: risk (% or $) + stop-loss distance → lot size, using the Instrument Specification Registry.
- Daily Plan & Review: a short pre-session plan (market bias, planned setups, maximum trades and risk for the day) and an end-of-day review (what went well, mistakes, lessons), linked to that day's trades.
- Charts page with the free TradingView Advanced Chart widget for live market viewing (Module M1).
- Trading Room, Version 1 (Module N1): chart, strategy panel with checklist, position size calculator, rule meters, and daily plan on one screen.
- Trader Profile intake in onboarding (Module J).
- Trade Plan Builder with manual inputs (Module O) and Risk Model presets 1, 4, and 5 (Module P).
- Strategy Library seeded with the 20 strategies from Appendix A as Draft/Unconfirmed specs (the user activates and confirms the ones they want).
- Strategies Page: manual strategies, Gemini Strategy Spec import (JSON paste, so no AI cost inside the app) with per-strategy Read-Back, strategy selection, details panel, per-trade checklist, and "followed all rules vs broke rules" results.
- Financial disclaimer, privacy policy, terms, and data deletion.
OUT of the MVP (move to `docs/BACKLOG.md`, build later based on beta demand):
- AI analyst reports and AI free-text rule parsing.
- Monte Carlo and funded challenge simulators.
- Broker sync, and parsers for cTrader, Match-Trader, TradeLocker, DXtrade, and futures platforms.
- Billing, multi-account portfolio view, mentor sharing, PDF reports, OHLC backtesting, intraday trailing drawdown with tick data.

Milestone mapping for the MVP: Milestones 0, 1A and 1B (MVP depth), 2, 3, 4 (core metrics only), 5 (TradingView + Standard CSV + manual entry; MT5 before the wider beta), 6, 7, 8 (core funded rules only), and the Gemini import and strategy analytics part of 9. Then go to the beta.

STAGE 3 — Private Use, then Beta
- Version 1 private use: me (Abdullah) and one friend, using paper/demo trading data. Fix bugs and confirm key calculations by hand.
- Then the wider beta: 10–20 real forex / prop-firm traders, free.
- Weekly feedback; track sign-up to first-import rate (activation), weekly active users, import errors, and the most requested features.

STAGE 3B — AI Chat + Research Assistant Extension, Level 1 (after Version 1 private use works)
- Add the AI Q&A assistant (Phase 6) and the Chrome extension "Capture this page" (Module L, Level 1) together, because both use the same AI layer.
- Then Level 2 "Research task" after Level 1 is stable and tested.

STAGE 4 — Paid Launch (only when the go criteria are met)
- Suggested go criteria (to be confirmed with me): at least 10 beta users actively using it weekly for 3 or more weeks, and at least 3–5 users saying they would pay (or pre-paying).
- Then add billing (with the payment provider verified for Pakistan), pricing below the main competitors, and regional pricing for South Asia.

STAGE 5 — Grow
- Build backlog features in order of real user demand (likely first: AI analyst reports, more platform parsers, Monte Carlo).
