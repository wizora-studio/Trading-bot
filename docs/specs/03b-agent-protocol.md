<!-- Generated from docs/specs/MASTER_PROMPT.md lines 172-188. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

3B. AGENT-INDEPENDENT WORKING PROTOCOL (so ANY AI agent, even a weaker one, can continue the work)
1. AGENTS.md at the repository root is the single source of instructions for every AI coding agent (Claude Code, Codex, Gemini CLI, Cursor, or any other). CLAUDE.md and GEMINI.md contain only one line: "Read AGENTS.md." AGENTS.md contains: a 10-line project summary, the stack with pinned versions, every command (install, dev, typecheck, lint, test, e2e, build, db migrate, seed), the folder map, a summary of Sections 3C and 3D, the Definition of Done, and a pointer to the current milestone and ticket.
2. Split this master prompt into small files during Milestone 0: `docs/specs/` with one file per section, phase, module, and appendix, plus an index `docs/specs/README.md`. Keep this full prompt as `docs/specs/MASTER_PROMPT.md`. An agent with a small context window then reads only the files a ticket needs.
3. Work in tickets. `docs/TASKS.md` lists small tickets (about 1–2 hours of work each, touching few files). Every ticket has: goal, spec references, files likely touched, acceptance criteria, tests to add, and what is out of scope. Do exactly one ticket at a time.
4. Session start: read AGENTS.md → docs/PROGRESS.md → the current ticket → only the spec files that ticket references.
5. Session end: run typecheck, lint, tests, and build; update docs/PROGRESS.md, docs/DECISIONS.md, and docs/TASKS.md; and write a short handover note (what changed, how to verify it, what the next ticket is).
6. Limited-agent safety rules (apply to every agent, essential for weaker ones):
   - Never invent library functions or APIs. Check the installed package's types or official docs first.
   - Never change files outside the current ticket's scope. No "drive-by" refactors.
   - Never delete or weaken a test to make it pass. Fix the code, or report the problem.
   - If the same check fails twice, stop and report the exact error output and what you tried.
   - When unsure, ask. Do not guess.
7. Conventions are enforced by tools (lint rules, type checks, tests, CI), not by memory, so every agent is corrected automatically.
8. Decisions recorded in docs/DECISIONS.md must be followed by every later agent unless I approve a change.
9. No project knowledge may exist only in a chat. Everything needed to continue lives in the repository.
10. After every milestone, do a review pass (ideally with a strong model) using the code review checklist in Section 3C.
