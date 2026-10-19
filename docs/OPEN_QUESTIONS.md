# Open questions (waiting for the founder)

Answer in any language. When a question is answered, move it to `docs/DECISIONS.md` with the date.

## A. Essential starting questions (asked 2026-10-19)
| ID | Question | Why it matters |
|---|---|---|
| Q1 | What computer and OS will you build on (Windows / macOS / Linux)? Is Node.js, Git, or VS Code already installed? | Milestone 0 setup instructions are different for each OS. |
| Q2 | What is your maximum monthly budget for running costs during private use (in PKR or USD)? Is "free tiers only" acceptable until the beta? | Decides hosting, database, and auth choices. |
| Q3 | Which prop firm(s) and plan(s) are you thinking of taking first, and on which platform (MT5, cTrader, Match-Trader, other)? "Not decided yet" is a fine answer. | Decides the first funded-rule fixtures and whether MT5 import moves earlier. |
| Q4 | Which 2–3 strategies from Appendix A do you want to activate first? (Summary: `docs/strategies/APPENDIX_A_SUMMARY.md`.) | Only activated strategies get a full Read-Back. |
| Q5 | Do you already have any Gemini Strategy Specs (from the extraction prompt) to import? If yes, paste them. | They go through the same Read-Back. |
| Q6 | Does your friend trade the same way (TradingView paper, forex/gold), or do they need something different (another platform, a funded account)? | Affects the V1 import priority. |

## B. Conflicts and unclear parts found in the master prompt (v4.0)
| ID | Issue | Proposed rule (needs your OK) |
|---|---|---|
| C1 | **Stage 1 vs "no code before specs".** Final instruction 4 says no application code before the specification phases are confirmed (Milestone 1B), but Launch Strategy Stage 1 (free Prop Firm Calculator, 2–4 weeks) is a coding stage and the Launch Strategy "overrides the milestone order". | Write a short MVP-depth spec for only the calculator (daily loss, max loss, consistency, position size), get your confirmation, then build Stage 1. The full specs continue in parallel. |
| C2 | **MVP size vs beginner time.** The MVP list includes Trading Room, Charts, Trade Plan Builder, 20 seeded strategies, Daily Journal, MT5 import, and more. For one student developer this is many months. | Split the MVP in two cuts: **V1-private** (you + friend: auth, Normal/Funded account + Read-Back, TradingView CSV + manual entry, core metrics, dashboard, trade explorer, funded core rules, position size calculator, 2–3 activated strategies with checklist) and **V1-beta** (MT5, Trading Room, Charts page, Trade Plan Builder, Daily Journal, all 20 seeds, Gemini import UI). |
| C3 | **Confidence thresholds disagree in the preview.** `dashboard-preview.html` uses "<30 trades = low" for KPIs and "<20 trades = low sample" for sessions. Phase 5 says one framework must decide this. | Treat the preview numbers as placeholders. Phase 5 defines the real thresholds once in `src/config/`. |
| C4 | **Fixed Pakistan times in the preview.** The preview shows sessions as fixed Pakistan times (e.g., "London 12 pm – 5 pm"). Appendix A says never store fixed Pakistan times; sessions are DST-aware. | Store sessions in the market's own timezone; the UI converts to Pakistan time per date. |
| C5 | **Gemini prompt version label.** The Gemini prompt says "linked to MASTER PROMPT v2.1"; the master prompt is v4.0. | Update the label to v4.0 the next time the schema changes (see C6). |
| C6 | **Schema needs a document source.** Appendix A seeds need source type "document", but `strategy-spec/1.0` only has `source.videos`. The prompt already says to bump the version. | Bump to `strategy-spec/1.1`: add `source.documents[]` (title, author/tool, date, notes) and keep 1.0 files importable. Update both the Gemini prompt and the Zod schema together. |
| C7 | **R-multiples need a stop-loss.** Most "YES" auto-checks rely on R. TradingView paper exports may not include the initial stop-loss (to be verified in Phase 2). | If the stop is missing, R shows "needs stop-loss" and the trader can enter it in the Trade Drawer (already in Module D). |
| C8 | **Repository name.** The repo is called `trading-bot`, but the product is explicitly not a trading bot. | Optional: rename later (e.g., `trading-analyst`). No action needed now. |
| C9 | **Preview math is not a spec.** The preview's funded-rule code has shortcuts (e.g., daily limit from start balance only, a no-op formula for the consistency meter). | The preview is visual reference only. Rule math comes from Phase 4 + your confirmed rules. |
| C10 | **Touch targets.** The preview's pill buttons and bottom-nav items are smaller than the 44px minimum in Section 3D. | Fix in the real component library. |
