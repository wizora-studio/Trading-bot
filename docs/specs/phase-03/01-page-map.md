<!-- Generated from docs/specs/MASTER_PROMPT.md lines 465-489. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

App Navigation & Page Map (every main feature has its own separate page):
- An account switcher at the top lets the user pick one account or a combined view. The navigation adapts to the selected account type (Normal / Funded / Backtest).
- Pages (MVP = included in version 1; LATER = after the beta):
  1. Landing Page (public) — MVP.
  2. Free Prop Firm Calculator (public lead-magnet tool) — MVP (Stage 1).
  3. Sign Up / Login — MVP.
  4. Onboarding Wizard: "Normal or Funded account?" → import trades or load sample data → set rules with Read-Back → choose a strategy — MVP.
  5. Accounts Page: list of all accounts with type badges (Normal / Funded / Backtest), create, edit, archive — MVP.
  6. Dashboard Page: KPIs and charts for the selected account(s) — MVP.
  7. Import Center Page: upload, column mapping, validation preview, import history, rollback — MVP.
  8. Trades Page: Trade Explorer table with the trade detail drawer and journal — MVP.
  9. Strategies Page: strategy selection, details panel, compare mode, Gemini spec import (Phase 3, E9) — MVP.
  10. Funded Account Page (shown only for Funded accounts): rule status board, daily loss and max loss meters, consistency calculator, minimum trading days, account lifecycle, "How much room do I have?" calculator, and "Explain my rules" — MVP (core rules).
  11. My Rules Page (personal risk rules; main rules page for Normal accounts, also available for Funded accounts): rule list with Read-Back, compliance monitor, and the cost of breaking rules — MVP.
  12. Reports Page: AI reports, PDF exports, Monte Carlo simulators — LATER.
  13. Learn Page: bilingual glossary and short lessons from the Phase 1 Handbook — MVP (basic).
  14. Settings Page: profile, timezone, language, theme, data export, account deletion — MVP.
  15. Tools Page: Position Size Calculator (and the Prop Firm Calculator for logged-in users) — MVP.
  16. Daily Journal Page: Daily Plan & Review — MVP.
  17. Charts Page: live market charts using the free TradingView Advanced Chart widget (Module M1) — MVP. Trades-on-chart (M2) and live account view (M3) — LATER.
  18. Trading Room: chart + strategy panel + calculator + rule meters on one screen (Module N1) — MVP. Built-in practice trading (N2) — Version 2. Real account live (N3) — Version 3.
  19. Trade Planner: the Trade Plan Builder (Module O), also available as a panel inside the Trading Room — MVP.
- Normal account: shows Trading Room, Dashboard, Trades, Strategies, Charts, My Rules, Import Center, Daily Journal, and Tools. Hides the Funded Account Page.
- Funded account: shows everything a Normal account shows, plus the Funded Account Page.
