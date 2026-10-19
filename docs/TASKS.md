# Tasks (tickets)

Each ticket is about 1–2 hours and touches few files. Do exactly one at a time.
Status: TODO · DOING · BLOCKED (reason) · DONE (date).

## Done (2026-10-19)
- M0-01..M0-10 Milestone 0: tracking files, AGENTS.md, spec split, stored sources, Appendix A summary, stack pinned (D-007), setup guide (`docs/SETUP.md`), lint/test/build commands, design tokens + contrast test, CI (`.github/workflows/ci.yml`).
- M4 Deterministic math engine with golden, edge-case and DST tests.
- M5 Importers: TradingView (2 formats), MT5 positions (CSV/HTML), standard template, column mapper, manual entry, duplicates, Data Quality Score, rollback, demo dataset.
- M3 Accounts (Normal/Funded/Backtest), funded rule intake (preset / free text / form) with deterministic Read-Back and confirmation, versioned rule sets; personal rules with Read-Back.
- M6 Dashboard: KPIs with confidence badges, equity + drawdown, daily P&L, calendar, sessions, weekdays, long/short, instruments, global filter bar.
- M7 Trade explorer, trade drawer (SL/TP/risk edits with audit trail, strategy, checklist, tags, notes, screenshot links), bulk actions, strategy library + Strategies page.
- M8 (core) Funded rule board, room calculator, R1/R4/R5 risk models, Trade Plan Builder.
- M9 (part) Gemini spec import (single and multiple), per-strategy Read-Back and confirmation, compare mode, followed-vs-broke analysis.
- Charts (TradingView widget), Trading Room v1, Daily journal, Tools (position size + free prop firm calculator), Learn (8 lessons + glossary), Settings (profile, backup, restore, delete).

## Next tickets
### T-01 Verify TradingView parsers with a real export — BLOCKED (needs a file from the founder, Q1)
- Files: `src/features/import/parsers.ts`, tests. Acceptance: a real Account History and History export import with 0 row errors.

### T-02 Verified preset for the founder's chosen prop firm — BLOCKED (Q2)
- Files: `src/features/funded/presets.ts`. Acceptance: source URL + verified date; Read-Back reviewed by the founder.

### T-03 Full Phase 1 handbook, Module 1 "What is a trade?" — TODO
- Output: `docs/handbook/01-what-is-a-trade.md` (EN + Roman Urdu) and a longer Learn lesson.

### T-04 Online database + login (before the wider beta) — TODO (Q4, costs to be approved)
- Replace the persistence in `src/store/appStore.ts`/`actions.ts` with server actions (Prisma + PostgreSQL + Better Auth or Supabase Auth). Keep the same action names.

### T-05 Seed specs as JSON files in `seed/strategies/` — TODO
- Export `SEED_STRATEGIES` to one JSON per strategy (script + test that they stay in sync).

### T-06 `/dev/components` gallery page (development only) — TODO
