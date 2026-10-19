# Progress

## Current position (2026-10-19)
**The MVP web app is built, tested, and runs.** It works fully in the browser with no server and no cost (DECISIONS D-010).

## What is done
| Area | Status | Where |
|---|---|---|
| Milestone 0: AGENTS.md, tracking docs, spec split, CI, lint, tests | Done | `AGENTS.md`, `docs/`, `.github/workflows/ci.yml` |
| Design tokens (black/white/blue, light/dark) with WCAG AA contrast test | Done | `src/app/tokens.css`, `src/config/contrast.test.ts` |
| Deterministic math engine (decimal.js): net P&L, costs, win/loss/breakeven, expectancy $ and R, profit factor, payoff, drawdown (closed), streaks, outlier share, holding time, sessions (DST), weekdays, long/short, instruments, best-day consistency, confidence framework | Done + tested | `src/services/analytics/` |
| Funded rule engine: profit target, daily loss (initial/day-start base, reset time/zone), max loss (static / EOD trailing / intraday trailing, lock), min days, consistency (+ extra profit needed), honesty states, lifecycle, room calculator | Done + tested | `src/services/analytics/funded.ts` |
| Personal rule compliance + cost of breaking rules; Risk models R1, R4 (ladder + circuit breaker), R5 (R:R gate, correlation cap) | Done + tested | `personalRules.ts`, `riskModels.ts`, `positionSize.ts` |
| Imports: TradingView Account History, TradingView order history (fills → logical trades), MT5 Positions (CSV or HTML report), standard template, any CSV with column mapper, manual entry; timezone declaration, validation preview, Data Quality Score, duplicate detection, rollback | Done + tested | `src/features/import/` |
| Demo dataset + `docs/samples/demo-trades-mt5.csv` | Done | `src/features/demo/` |
| Pages: Dashboard, Trades (explorer + drawer), Strategies (cards, Read-Back, Gemini import, compare, activation), Funded (preset / free-text intake → Read-Back → confirm → rule board), My rules, Trading room, Trade planner (Trade Ticket), Daily journal, Charts (TradingView widget), Tools (position size + free prop firm calculator), Import, Accounts, Learn, Settings (profile, backup, delete) | Done | `src/features/*`, `src/app/*` |
| Bilingual UI: English + Roman Urdu (TypeScript checks every key exists in both) | Done | `src/i18n/` |
| 20 Appendix A strategies as Draft seed specs (strategy-spec/1.1) | Done | `src/features/strategies/seeds.ts` |
| Seed specs as JSON (`seed/strategies/`), component gallery (`/dev/components`, dev only), Handbook Modules 1–3 (`docs/handbook/`) | Done | |
| Tests: 125 unit tests, 5 E2E flows, screenshot gate at 375/768/1280 light+dark | Passing | `npm test`, `npm run e2e`, `npm run screens` |

## Not built (Backlog, by design)
AI reports and AI chat, Monte Carlo / challenge simulator, broker sync, cTrader/Match-Trader/TradeLocker/DXtrade parsers, billing, mentor sharing, PDF reports, OHLC backtesting, Chrome extension, online database + login. See `docs/BACKLOG.md`.

## Known limitations (honest list)
- TradingView export formats come from third-party guides (D-020). Please test with a real file.
- Data lives in one browser; use Settings → Export backup to move or keep it.
- Drawdown and funded checks use closed trades only; floating equity is not in trade files.
- Live prices are not used anywhere; ATR and news are typed by the user.
- Phase 1 handbook: Modules 1–3 written; Modules 4–10 still to do (Learn page has 8 short lessons).

## Next
1. Founder: follow `docs/SETUP.md`, open the app, load sample data, then import a real TradingView paper file.
2. Answer the optional questions in `docs/OPEN_QUESTIONS.md` when ready.
3. Before the wider beta: online database + login (D-010), MT5 tested with real prop-firm reports, more verified firm presets.

## Handover note (2026-10-19)
- How to verify: `npm install && npm run check && npm run e2e` (e2e needs a build first; `check` builds).
- Entry points: `src/app/*/page.tsx` → `src/features/*/…Page.tsx`; all math in `src/services/analytics/`; all state changes in `src/store/actions.ts`.
