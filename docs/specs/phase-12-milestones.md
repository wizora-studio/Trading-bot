<!-- Generated from docs/specs/MASTER_PROMPT.md lines 865-892. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

PHASE 12 — MILESTONE-BY-MILESTONE DEVELOPMENT EXECUTION
Execute the build in small, verifiable vertical slices:
- MILESTONE 0: Development environment setup for a beginner (Node.js, package manager, Git & GitHub basics, VS Code, Docker for local Postgres), AGENTS.md (with CLAUDE.md and GEMINI.md pointers), the docs/specs/ split of this prompt and docs/TASKS.md (Section 3B), the design tokens file and a /dev/components gallery skeleton (Section 3D), lint/format/pre-commit setup (Section 3C), and a CI skeleton.
- MILESTONE 1A: Phase 1 Curriculum Handbook, Phase 2 Research Report, Phase 2B Validation Report, and Phase 3 PRD + Living Project Tracker (`docs/PROGRESS.md`).
- MILESTONE 1B: Specification documents for Phases 4–11 (Rule Engine, Math Engine, AI, Backtesting, Architecture, UI/UX, Security, Testing). No application code is written before these are confirmed.
- MILESTONE 2: Project Scaffold, TypeScript/Tailwind/shadcn setup, Prisma PostgreSQL Schema, and Authentication.
- MILESTONE 3: Trading Account Manager with Account Type selection (Normal / Funded / Backtest), Personal Risk Rules, Funded-Account Configuration UI + DB CRUD, and the form-based Rule Intake with a deterministic (non-AI) Read-Back Screen and confirmation flow.
- MILESTONE 4: Deterministic Mathematical Engine (`src/services/analytics/`) + 100% Unit Test Coverage on core formulas.
- MILESTONE 5: CSV/MT5/cTrader Import Wizard, Column Mapper, Symbol Mapping, Validation Preview, Duplicate Detection, Data Quality Score, Rollback, and Demo Dataset Loader.
- MILESTONE 6: Main Analytics Dashboard, Equity/Drawdown Charts, Session/Day Breakdowns, and Global Filter Engine.
- MILESTONE 7: Trade Explorer Table, Trade Detail Drawer, R-Multiple Editor, Mistake Tagging, Screenshot Journaling, basic Strategy Library (manual create and templates), the dedicated Strategies Page (selection + details panel), strategy picker per trade (single and bulk), and per-trade Strategy Checklist.
- MILESTONE 8: Funded-Account Rule Engine Dashboard (Daily Loss, Max Drawdown, Consistency Rule Calculator, Lifecycle State, "How much room do I have?" calculator, Multi-Account Scaling View) + Personal Risk Compliance Monitor + Trade Plan Builder (Module O) + Risk Model presets 1, 4, and 5 (Module P).
- MILESTONE 9: Import Strategy Spec (Gemini output, single and multiple specs) with validation, per-strategy Read-Back and confirmation, Strategies Page compare mode, Strategy (Playbook) Analyzer with "followed vs broke rules" analysis + Monte Carlo Drawdown Simulator + Funded Challenge Simulator.
- MILESTONE 10: AI Performance Analyst Engine (Structured Zod Reports, Evidence Grounding, Number-Grounding Validator, Bilingual English + Roman Urdu Explanations, Rate Limiting, Evals) + AI free-text Rule Intake Parser feeding the existing Read-Back Screen + AI Strategy Spec Reviewer.
- MILESTONE 11: Export Center, Subscription/Billing Integration, Security Hardening, Legal Pages, Documentation, and Production Deployment Guide.
- MILESTONE 12: Private Beta with 10–20 real traders, feedback collection, bug fixes, and a launch-readiness checklist.
- MILESTONE 13: Public Launch and Post-Launch Operations (monitoring, support channel, changelog, monthly verification of prop-firm presets).

At the end of every milestone, provide:
1. Summary of what was built (in simple English + Roman Urdu).
2. Files created or modified.
3. Line-by-line explanation of the most important logic for a beginner developer.
4. Exact terminal commands to run and verify.
5. Automated test results.
6. Time spent, any money spent, and the expected monthly running cost.
7. Updated `docs/PROGRESS.md` and `docs/DECISIONS.md`.
8. Known limitations and the exact plan for the next milestone.
