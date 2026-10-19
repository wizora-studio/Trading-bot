<!-- Generated from docs/specs/MASTER_PROMPT.md lines 902-913. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

PHASE 14 — FINAL DELIVERABLES
Ensure the finished repository contains:
- Complete documentation in `/docs` (Handbook, Research, Validation Report, PRD, Architecture, Metric Specs, Rule Engine Spec, AI Evals, Security, and Deployment Guide).
- Runbooks: incident response, backup restore, and the monthly prop-firm preset verification process.
- User help center / FAQ content (English + Roman Urdu) and a CHANGELOG.
- Clean, strictly-typed, well-commented source code.
- `docs/prompts/STRATEGY_EXTRACTION_PROMPT.md` (the Gemini prompt) and a sample strategy spec with its expected Strategy Read-Back output.
- `AGENTS.md` (plus CLAUDE.md and GEMINI.md pointers), `docs/specs/` (this prompt split into sections), `docs/TASKS.md`, and `seed/strategies/` (the Appendix A strategies as seed specs).
- `dashboard-preview.html` kept in `docs/design/` as the original visual reference.
- `.env.example` with all required configuration keys documented.
- Realistic synthetic Demo Dataset (`demo-trades-mt5.csv`) plus a sample funded-account rule text and its expected Read-Back output, so anyone cloning the repo can test the full platform in 60 seconds.
