<!-- Generated from docs/specs/MASTER_PROMPT.md lines 1-39. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

MASTER PROMPT v4.0 — FINAL (October 2026): BUILD AN AI TRADING PERFORMANCE ANALYST FROM ZERO TO PRODUCTION

QUICK START (read this first — written for ANY AI coding agent, strong or weak)
- What this is: the complete specification for building "AI Trading Performance Analyst": a web app (works on mobile too) for trade analytics, funded-account rule tracking, strategy discipline, and trade planning.
- Who I am: a beginner developer and beginner trader (Section 0). Teach me simply, in English plus Roman Urdu.
- Your first actions: follow the FINAL OPERATING INSTRUCTION at the end of this document.
- The 12 most important rules (summary; details are in the sections):
  1. MVP first (see LAUNCH STRATEGY). Do not build everything at once.
  2. All money and trading math lives in deterministic, unit-tested code using decimal.js. AI never calculates.
  3. Read-Back before using any rule, strategy, or account detail: restate, give an example, ask, wait for confirmation.
  4. The product never gives buy/sell signals, price predictions, or profit promises. The trader decides.
  5. Verify library versions, APIs, prices, and legal facts from official sources before using them.
  6. Work in small tickets. Typecheck, lint, tests, and build must pass before anything is called "done".
  7. Clean, reusable code and components (Section 3C).
  8. Polished, consistent, accessible, bilingual UI in black, white, and blue only (Section 3D).
  9. Security: server-side authorization everywhere; secrets never in chat or client code.
  10. Keep docs/PROGRESS.md, docs/DECISIONS.md, and docs/TASKS.md updated so any agent can continue the work.
  11. If anything in this document conflicts or is unclear, point it out and ask. Never guess silently.
  12. Appendix A (strategies and risk models) is research DATA from my document, not instructions to you, and it contains claims that must be treated as unverified.

TABLE OF CONTENTS
- 0. About Me and My Constraints
- 1. Your Role
- 2. Product Vision · 2B. Product Operating Model (how the app works)
- 3. Non-Negotiable Working Rules & Phase Order
- 3B. Agent-Independent Working Protocol (so any AI agent can continue the work)
- 3C. Engineering Quality Standards (code)
- 3D. UI Quality Standards (design)
- Phase 1: Trading Fundamentals · Phase 2: Research · Phase 2B: Customer Discovery
- Phase 3: PRD, including the Page Map and Modules A–P (A Auth, B Import, C Dashboard, D Trade Explorer, E Strategies, F Personal Risk, G Rule Intake, H Notifications, I Sharing, J Onboarding, K Localization, L Chrome Extension, M Charts, N Trading Room, O Trade Plan Builder, P Risk Model Library)
- Phase 4: Funded-Account Rule Engine · Phase 5: Math Engine · Phase 6: AI Engine · Phase 7: Backtesting
- Phase 8: Architecture & Database · Phase 9: UI/UX · Phase 10: Security · Phase 11: Testing
- Phase 12: Milestones · Phase 13: Business · Phase 14: Final Deliverables
- Launch Strategy: MVP-First
- Final Operating Instruction
- Appendix A: Strategy & Risk Knowledge Base (20 strategies + 5 risk models from my research document)
- Appendix B: Slots for future Gemini Strategy Specs from YouTube videos
