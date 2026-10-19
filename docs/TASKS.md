# Tasks (tickets)

Each ticket is about 1–2 hours and touches few files. Do exactly one at a time.
Status: TODO · DOING · BLOCKED (reason) · DONE (date).

## Milestone 0 — setup

### M0-01 Tracking files, AGENTS.md, pointers — DONE (2026-10-19)
- Goal: create PROGRESS, DECISIONS, OPEN_QUESTIONS, ASSUMPTIONS, RISKS, GLOSSARY, BACKLOG, TASKS, AGENTS.md, CLAUDE.md, GEMINI.md.
- Spec: `03-working-rules.md` (item 4), `03b-agent-protocol.md`.
- Acceptance: all files exist and are linked from AGENTS.md.

### M0-02 Split the master prompt into `docs/specs/` — DONE (2026-10-19)
- Goal: one file per section, phase, module, and appendix item, plus an index.
- Spec: `03b-agent-protocol.md` (item 2).
- Files: `scripts/split_master_prompt.py`, `docs/specs/**`.
- Acceptance: `python3 scripts/split_master_prompt.py` regenerates the same files; every non-empty line of MASTER_PROMPT.md appears in exactly one split file (checked 2026-10-19: 1,178 = 1,178).

### M0-03 Store source files — DONE (2026-10-19)
- Gemini prompt in `docs/prompts/STRATEGY_EXTRACTION_PROMPT.md`; preview in `docs/design/dashboard-preview.html`.

### M0-04 Appendix A summary table — DONE (2026-10-19), waiting for founder choice (Q4)
- File: `docs/strategies/APPENDIX_A_SUMMARY.md`.
- Out of scope: full read-backs (only for the 2–3 strategies the founder activates).

### M0-05 Verify and pin the stack — BLOCKED (needs Q1, Q2)
- Goal: check current stable versions and licenses from official sources (Node.js LTS, pnpm or npm, Next.js, TypeScript, Tailwind, shadcn/ui, Prisma, PostgreSQL, Vitest, Playwright, decimal.js, date-fns-tz, auth options, IBM Plex Sans license). Record version, source URL, and date in DECISIONS.md.
- Spec: `phase-08-architecture.md`, `03c-engineering-standards.md`.
- Acceptance: a DECISIONS.md row per tool. No install yet.

### M0-06 Beginner dev-environment guide — BLOCKED (needs Q1)
- Goal: `docs/SETUP.md`, click-by-click in English + Roman Urdu for the founder's OS: Node.js, package manager, Git, VS Code, Docker (local Postgres).
- Acceptance: the founder runs every step and confirms the version outputs.

### M0-07 Lint, format, pre-commit, commands — TODO (after M0-05, M0-06)
- Goal: minimal `package.json` with typecheck, lint, format, test scripts; ESLint (typescript-eslint strict, jsx-a11y, import order); Prettier; lint-staged + pre-commit hook; conventional commits. Fill in AGENTS.md section 4.
- Acceptance: all commands run green on an empty project.

### M0-08 Design tokens file — TODO (after M0-07)
- Goal: one tokens file (colors from the preview, 4px spacing scale, radii, font sizes, line heights, shadows) in light and dark, with a WCAG AA contrast check of every text/background pair.
- Spec: `03d-ui-standards.md`, `phase-09-ui-ux.md`.
- Acceptance: contrast check script passes; no other file defines a color.

### M0-09 `/dev/components` gallery skeleton — TODO (after Milestone 2 scaffold exists)

### M0-10 CI skeleton — TODO (after M0-07)
- Goal: GitHub Actions running typecheck, lint, test, build on every pull request.
- Acceptance: a test PR shows green checks.

## Phase 1 — teaching (runs in parallel)
### P1-01 Module 1: What is a trade? — TODO (next)
- Output: `docs/handbook/01-what-is-a-trade.md` (English + Roman Urdu) and glossary updates.
- Spec: `phase-01/module-01.md`.
