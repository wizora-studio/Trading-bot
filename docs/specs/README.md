# Spec index

The full master prompt (v4.0) is [MASTER_PROMPT.md](MASTER_PROMPT.md). It is the single source of truth.
The files below are generated from it by `scripts/split_master_prompt.py` so an agent can read only what a ticket needs. Do not edit them by hand.

| File | Section |
|---|---|
| [00-quick-start-and-toc.md](00-quick-start-and-toc.md) | MASTER PROMPT v4.0 — FINAL (October 2026): BUILD AN AI TRADING PERFORMANCE ANALYST FROM ZERO TO PRODUCTION |
| [00-about-me.md](00-about-me.md) | 0. ABOUT ME AND MY CONSTRAINTS |
| [01-role.md](01-role.md) | 1. YOUR ROLE |
| [02-product-vision.md](02-product-vision.md) | 2. PRODUCT VISION |
| [02b-operating-model.md](02b-operating-model.md) | 2B. PRODUCT OPERATING MODEL (how the app actually works — keep it simple and honest) |
| [03-working-rules.md](03-working-rules.md) | 3. NON-NEGOTIABLE WORKING RULES & PHASE ORDER |
| [03b-agent-protocol.md](03b-agent-protocol.md) | 3B. AGENT-INDEPENDENT WORKING PROTOCOL (so ANY AI agent, even a weaker one, can continue the work) |
| [03c-engineering-standards.md](03c-engineering-standards.md) | 3C. ENGINEERING QUALITY STANDARDS (the code must be clean, consistent, reusable, and well-tested) |
| [03d-ui-standards.md](03d-ui-standards.md) | 3D. UI QUALITY STANDARDS (the interface must look professional, calm, and trustworthy) |
| [phase-01/00-intro.md](phase-01/00-intro.md) | PHASE 1 — TRADING FUNDAMENTALS FROM ZERO |
| [phase-01/module-01.md](phase-01/module-01.md) | Module 1: What Is a Trade? |
| [phase-01/module-02.md](phase-01/module-02.md) | Module 2: Instruments and Trading Costs |
| [phase-01/module-03.md](phase-01/module-03.md) | Module 3: Risk Management |
| [phase-01/module-04.md](phase-01/module-04.md) | Module 4: Essential Performance Metrics |
| [phase-01/module-05.md](phase-01/module-05.md) | Module 5: Expectancy and Probability |
| [phase-01/module-06.md](phase-01/module-06.md) | Module 6: Equity Curves and Drawdowns |
| [phase-01/module-07.md](phase-01/module-07.md) | Module 7: Statistical Reliability |
| [phase-01/module-08.md](phase-01/module-08.md) | Module 8: Trading Psychology and Observable Rule Compliance |
| [phase-01/module-09.md](phase-01/module-09.md) | Module 9: How Prop Firms (Funded Accounts) Work — Honest Education |
| [phase-01/module-10.md](phase-01/module-10.md) | Module 10: Data Quality |
| [phase-01/deliverable.md](phase-01/deliverable.md) | DELIVERABLE FOR PHASE 1: |
| [phase-02-research.md](phase-02-research.md) | PHASE 2 — DEEP MARKET, COMPETITOR, AND PROP-FIRM RESEARCH |
| [phase-02b-customer-discovery.md](phase-02b-customer-discovery.md) | PHASE 2B — CUSTOMER DISCOVERY & DEMAND VALIDATION |
| [phase-03/00-prd-overview.md](phase-03/00-prd-overview.md) | PHASE 3 — PRODUCT REQUIREMENTS DOCUMENT (PRD) |
| [phase-03/01-page-map.md](phase-03/01-page-map.md) | App Navigation & Page Map (every main feature has its own separate page): |
| [phase-03/module-a-auth.md](phase-03/module-a-auth.md) | Core Application Modules to Specify: |
| [phase-03/module-b-import.md](phase-03/module-b-import.md) | B. Trade Import & Normalization Center |
| [phase-03/module-c-dashboard.md](phase-03/module-c-dashboard.md) | C. Main Analytics Dashboard |
| [phase-03/module-d-trade-explorer.md](phase-03/module-d-trade-explorer.md) | D. Trade Explorer & Interactive Journal |
| [phase-03/module-e-strategies.md](phase-03/module-e-strategies.md) | E. Strategy Library, Strategy Selection & Playbook Analyzer |
| [phase-03/module-f-personal-risk.md](phase-03/module-f-personal-risk.md) | F. Personal Risk & Behavioral Monitor |
| [phase-03/module-g-rule-intake.md](phase-03/module-g-rule-intake.md) | G. Account Setup & Rule Intake Assistant (with Read-Back Confirmation) |
| [phase-03/module-h-notifications.md](phase-03/module-h-notifications.md) | H. Notifications & Reports |
| [phase-03/module-i-sharing.md](phase-03/module-i-sharing.md) | I. Sharing (Should-Have / V2) |
| [phase-03/module-j-onboarding.md](phase-03/module-j-onboarding.md) | J. Onboarding & In-App Education |
| [phase-03/module-k-localization.md](phase-03/module-k-localization.md) | K. Localization & Accessibility |
| [phase-03/module-l-chrome-extension.md](phase-03/module-l-chrome-extension.md) | L. Companion Chrome Extension: "Research Assistant" (NOT in the MVP; built after Version 1 private use works) |
| [phase-03/module-m-charts.md](phase-03/module-m-charts.md) | M. Charts & Live Market (three levels) |
| [phase-03/module-n-trading-room.md](phase-03/module-n-trading-room.md) | N. Trading Room (all-in-one trading page, so I do not need to switch to TradingView) |
| [phase-03/module-o-trade-plan-builder.md](phase-03/module-o-trade-plan-builder.md) | O. Trade Plan Builder (adapted from the "Trade Ticket" template in my research document) |
| [phase-03/module-p-risk-models.md](phase-03/module-p-risk-models.md) | P. Risk Model Library (5 models from my research document, implemented as user-confirmable presets and calculators) |
| [phase-04-funded-rule-engine.md](phase-04-funded-rule-engine.md) | PHASE 4 — FUNDED-ACCOUNT ANALYZER (PROP-FIRM ENGINE) |
| [phase-05-math-engine.md](phase-05-math-engine.md) | PHASE 5 — DETERMINISTIC MATHEMATICAL ENGINE |
| [phase-06-ai-engine.md](phase-06-ai-engine.md) | PHASE 6 — AI ANALYSIS ENGINE & GUARDRAILS |
| [phase-07-backtesting.md](phase-07-backtesting.md) | PHASE 7 — BACKTESTING AND STRATEGY VALIDATION MODULE |
| [phase-08-architecture.md](phase-08-architecture.md) | PHASE 8 — TECHNICAL ARCHITECTURE & DATABASE DESIGN |
| [phase-09-ui-ux.md](phase-09-ui-ux.md) | PHASE 9 — USER INTERFACE (UI) AND USER EXPERIENCE (UX) |
| [phase-10-security.md](phase-10-security.md) | PHASE 10 — SECURITY, PRIVACY, AND COMPLIANCE |
| [phase-11-testing.md](phase-11-testing.md) | PHASE 11 — TESTING AND QUALITY ASSURANCE |
| [phase-12-milestones.md](phase-12-milestones.md) | PHASE 12 — MILESTONE-BY-MILESTONE DEVELOPMENT EXECUTION |
| [phase-13-business.md](phase-13-business.md) | PHASE 13 — SAAS BUSINESS MODEL & COMMERCIAL VALIDATION |
| [phase-14-final-deliverables.md](phase-14-final-deliverables.md) | PHASE 14 — FINAL DELIVERABLES |
| [launch-strategy.md](launch-strategy.md) | LAUNCH STRATEGY: MVP-FIRST (this section overrides the milestone order wherever they conflict) |
| [final-operating-instruction.md](final-operating-instruction.md) | FINAL OPERATING INSTRUCTION TO START NOW: |
| [appendix-a/00-intro.md](appendix-a/00-intro.md) | APPENDIX A — STRATEGY & RISK KNOWLEDGE BASE (from my research document) |
| [appendix-a/part-a-verification-notes.md](appendix-a/part-a-verification-notes.md) | PART A — GLOBAL VERIFICATION NOTES (issues found while preparing this appendix) |
| [appendix-a/part-b-00-intro.md](appendix-a/part-b-00-intro.md) | PART B — THE 20 STRATEGIES |
| [appendix-a/part-b-s01.md](appendix-a/part-b-s01.md) | S1. Moving Average Trend Following (Crossover & Dynamic Pullback) |
| [appendix-a/part-b-s02.md](appendix-a/part-b-s02.md) | S2. Donchian / Turtle Breakout (System 1, System 2, Turtle Soup filter) |
| [appendix-a/part-b-s03.md](appendix-a/part-b-s03.md) | S3. Opening Range Breakout (ORB, 15-minute / 30-minute) |
| [appendix-a/part-b-s04.md](appendix-a/part-b-s04.md) | S4. London Breakout & Asian Range Breakout |
| [appendix-a/part-b-s05.md](appendix-a/part-b-s05.md) | S5. Support & Resistance Bounce and Role Reversal (S&R Flip) |
| [appendix-a/part-b-s06.md](appendix-a/part-b-s06.md) | S6. Fibonacci Golden Pocket Pullback (50% – 61.8% – 78.6% OTE) |
| [appendix-a/part-b-s07.md](appendix-a/part-b-s07.md) | S7. Mean Reversion (Larry Connors RSI(2) & Bollinger Band extremes) |
| [appendix-a/part-b-s08.md](appendix-a/part-b-s08.md) | S8. Institutional Supply & Demand Zones (RBR, DBD, DBR, RBD) |
| [appendix-a/part-b-s09.md](appendix-a/part-b-s09.md) | S9. SMC / ICT (Liquidity Sweep + Market Structure Shift + Order Block / FVG) |
| [appendix-a/part-b-s10.md](appendix-a/part-b-s10.md) | S10. Inside Bar & Pin Bar setups (pure price action) |
| [appendix-a/part-b-s11.md](appendix-a/part-b-s11.md) | S11. VWAP + Standard Deviation Bands |
| [appendix-a/part-b-s12.md](appendix-a/part-b-s12.md) | S12. Volume Profile & Auction Market Theory (POC, VAH, VAL, LVN) |
| [appendix-a/part-b-s13.md](appendix-a/part-b-s13.md) | S13. Order Flow Footprint & Cumulative Volume Delta (CVD) |
| [appendix-a/part-b-s14.md](appendix-a/part-b-s14.md) | S14. ICT Silver Bullet & AMD / Power of 3 |
| [appendix-a/part-b-s15.md](appendix-a/part-b-s15.md) | S15. Bollinger Band Squeeze (TTM Squeeze) |
| [appendix-a/part-b-s16.md](appendix-a/part-b-s16.md) | S16. Wyckoff Spring & Upthrust (UTAD) |
| [appendix-a/part-b-s17.md](appendix-a/part-b-s17.md) | S17. RSI + MACD Divergence (Regular & Hidden) |
| [appendix-a/part-b-s18.md](appendix-a/part-b-s18.md) | S18. Ichimoku Kinko Hyo Cloud |
| [appendix-a/part-b-s19.md](appendix-a/part-b-s19.md) | S19. Pairs Trading / Statistical Arbitrage (Z-score spread) |
| [appendix-a/part-b-s20.md](appendix-a/part-b-s20.md) | S20. Macro News Events (NFP / CPI / FOMC) |
| [appendix-a/part-c-00-intro.md](appendix-a/part-c-00-intro.md) | PART C — THE 5 RISK & CAPITAL MODELS (implemented through Module P) |
| [appendix-a/part-c-r1.md](appendix-a/part-c-r1.md) | R1. Fixed Fractional Position Sizing |
| [appendix-a/part-c-r2.md](appendix-a/part-c-r2.md) | R2. ATR Volatility-Adjusted Sizing & Chandelier Exit |
| [appendix-a/part-c-r3.md](appendix-a/part-c-r3.md) | R3. Fractional Kelly (Quarter-Kelly) |
| [appendix-a/part-c-r4.md](appendix-a/part-c-r4.md) | R4. Drawdown Scaling Ladder & Daily Circuit Breaker (prop-firm shield) |
| [appendix-a/part-c-r5.md](appendix-a/part-c-r5.md) | R5. Asymmetric R-Multiple Scaling, Breakeven Protocol & Correlation Cap |
| [appendix-a/part-d-reference-data.md](appendix-a/part-d-reference-data.md) | PART D — REFERENCE DATA (educational only, UNVERIFIED, never automatic recommendations) |
| [appendix-a/part-e-source-references.md](appendix-a/part-e-source-references.md) | PART E — SOURCE REFERENCES (titles only, as listed in the document; no URLs were included) |
| [appendix-b-gemini-specs.md](appendix-b-gemini-specs.md) | APPENDIX B — SLOTS FOR FUTURE GEMINI STRATEGY SPECS (from YouTube videos) |
