<!-- Generated from docs/specs/MASTER_PROMPT.md lines 851-864. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

PHASE 11 — TESTING AND QUALITY ASSURANCE
Implement automated verification before declaring any milestone complete:
1. Mathematical Unit Tests (Vitest): Hand-calculated test suites covering net P&L, commissions/swaps, R-multiples, win rate with breakevens, profit factor (including 0-loss edge case), drawdown (closed vs. trailing), consistency rule math, and small-sample flags. Plus property-based tests and differential tests against the reference implementation.
2. Parser & Import Tests: Valid CSVs, malformed rows, duplicate detection, timezone shifts, DST transitions, partial closes, netting vs hedging, symbol suffix mapping, and import rollback verification.
3. Rule Intake Tests: messy bilingual rule text → expected structured draft + expected follow-up questions; confirmation flow; rule versioning; RULE_UNCONFIRMED states.
3b. Strategy Spec Import Tests: valid Gemini output, malformed JSON, missing fields, unknown schema version, instructions hidden inside strategy text (must be ignored), Strategy Read-Back and confirmation flow, strategy versioning, and per-trade strategy assignment.
4. Security & Isolation Tests: Cross-tenant access prevention and prompt-injection sanitization checks.
5. AI Evals: golden datasets, number-grounding validator tests, and scope-guard tests (the AI refuses price predictions and signals).
6. Performance Tests: large imports (e.g., 50,000 rows) and dashboard load times against the PRD targets.
7. Accessibility Tests (e.g., automated axe checks).
8. E2E User Journey Tests (Playwright), including the full "Create Funded Account → Write Rules → Read-Back → Confirm → Import → See Rule Status" journey.
9. Backup Restore Drill before launch.
10. Coverage thresholds enforced in CI.
