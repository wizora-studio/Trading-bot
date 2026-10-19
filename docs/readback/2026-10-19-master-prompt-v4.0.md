# Read-Back: Master Prompt v4.0 (2026-10-19)

Status: **waiting for founder confirmation.**

## What I understood (English)
- You want a web app, "AI Trading Performance Analyst", that analyzes trades you upload. It shows honest numbers (profit after costs, expectancy, drawdown, win rate) with a confidence badge, checks prop-firm and personal rules, and checks whether you followed your chosen strategy.
- It never gives buy/sell signals, never predicts prices, never places trades, and never promises profits.
- All math is done by tested code with decimal precision. AI is only allowed later to explain numbers the code already calculated.
- Any rule, strategy, or account detail is first restated back to you ("Read-Back"), with an example and questions, and used only after you confirm. The app does the same for its users.
- Order of work: Milestone 0 setup → teach you trading basics (Phase 1, one module at a time) → research (Phase 2) → validation with real traders (2B) → specs (Phases 3–11, at MVP depth) → build in small tested tickets → private use (you + one friend) → free beta → paid launch only after real demand.
- MVP-first: Stage 1 is a free Prop Firm Calculator; Stage 2 is the MVP (TradingView paper CSV first, MT5 before the wider beta).
- UI: black, white, and blue only, based on `dashboard-preview.html`, English + Roman Urdu, mobile and desktop.
- Your constraints: student, beginner developer and trader, Karachi, small budget, free tiers first, ask before any cost, never ask for secret keys in chat, every step that needs you gets click-by-click instructions.

## Jo main ne samjha (Roman Urdu)
- Aap ek web app chahte hain jo aap ki upload ki hui trades ka analysis kare: kharche kaat kar asal munafa, ausat nateeja fi trade, girawat (drawdown), jeet ki sharah, aur har number ke saath bharose ka badge. Yeh prop firm aur aap ke apne rules check kare, aur dekhe ke aap ne apni strategy follow ki ya nahi.
- App kabhi buy/sell signal nahi degi, qeemat ki peshgoi nahi karegi, trade nahi kholegi, aur munafe ka wada nahi karegi.
- Saara hisaab tested code karega. AI baad mein sirf pehle se nikle hue numbers samjhaye ga.
- Har rule ya strategy pehle aap ko wapas samjhayi jaye gi (Read-Back), misaal aur sawalon ke saath, aur aap ki tasdeeq ke baad hi istemal hogi.
- Kaam ki tarteeb: setup → trading ki buniyadi taleem (ek module ek waqt) → research → asal traders se tasdeeq → specs → chhote tested hisson mein build → pehle aap aur aap ka dost → free beta → maang sabit hone par paid launch.
- Rang sirf kala, safed aur neela. Zabaan English aur Roman Urdu.
- Aap ki pabandiyan: student, naye developer aur trader, kam budget, pehle free tiers, har kharche se pehle ijazat, secret keys kabhi chat mein nahi.

## Conflicts and unclear parts
See `docs/OPEN_QUESTIONS.md`, section B (C1–C10), and the new strategy issues N1–N8 in `docs/strategies/APPENDIX_A_SUMMARY.md`.

## What I did now
Milestone 0, documentation part only (no application code): tracking files, AGENTS.md + pointers, the spec split into `docs/specs/`, the stored source files, and the Appendix A summary.
