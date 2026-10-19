# Progress

## Current position (2026-10-19)
- Milestone 0 — setup: **documentation part done**, tooling part waiting for founder answers.
- Phase 1 — teaching: not started.
- No application code has been written (on purpose).

## Done
- 2026-10-19 — Read-Back of Master Prompt v4.0 given to the founder (`docs/readback/2026-10-19-master-prompt-v4.0.md`).
- 2026-10-19 — M0-01 tracking files, AGENTS.md, CLAUDE.md, GEMINI.md.
- 2026-10-19 — M0-02 master prompt split into 86 files under `docs/specs/` (generator: `scripts/split_master_prompt.py`).
- 2026-10-19 — M0-03 Gemini prompt and dashboard preview stored in `docs/prompts/` and `docs/design/`.
- 2026-10-19 — M0-04 Appendix A summary table (`docs/strategies/APPENDIX_A_SUMMARY.md`).

## Waiting for the founder
- Answers to Q1–Q6 and the proposed rules C1–C10 in `docs/OPEN_QUESTIONS.md`.

## Next
1. P1-01 Phase 1, Module 1 "What is a trade?" (can start now).
2. After Q1 and Q2: M0-05 (verify and pin the stack), then M0-06 (setup guide for your OS).

## Handover note (2026-10-19)
- What changed: repository now holds the spec, the Gemini prompt, the design reference, and all tracking files. No code.
- How to verify: run `python3 scripts/split_master_prompt.py` — it should print "Wrote 86 spec files and README.md" and `git status` should show no changes.
- Next ticket: P1-01.
