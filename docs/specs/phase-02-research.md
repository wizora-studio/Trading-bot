<!-- Generated from docs/specs/MASTER_PROMPT.md lines 403-445. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

PHASE 2 — DEEP MARKET, COMPETITOR, AND PROP-FIRM RESEARCH
Conduct thorough research using current primary sources and official documentation wherever accessible.
Investigate existing trading journals, performance analytics platforms, broker reporting formats, funded-account dashboards, and quantitative libraries:
- Competitors: TradeZella, TraderSync, Edgewonk, TradesViz, Tradervue, Journalytix, Stonk Journal, RizeTrade, MyFxBook, FX Blue, TradersCasa, Kinfo, FX Replay (bar replay / backtesting), and QuantConnect/QuantStats. Also study prop firms' own built-in account dashboards.
- Important: Several competitors already ship AI insights, auto-tagging, broker auto-sync, and prop-firm support. Research exactly what their AI does, so our differentiation is real and not "we also have AI".
- Trading Platforms & Export Formats: MetaTrader 4 (MT4), MetaTrader 5 (MT5 — specifically distinguishing Orders, Deals, and Positions tables in HTML/XLSX/CSV exports, and netting vs hedging modes), cTrader, Match-Trader, TradeLocker, DXtrade, and TradingView paper/broker exports.
- Futures stack: Tradovate, NinjaTrader, Rithmic, CQG, and prop-firm proprietary futures platforms (e.g., ProjectX-based platforms).
- Research the MetaQuotes licensing changes affecting prop firms since 2023 and the resulting platform migrations. Many firms now offer several platforms, so the importer must handle multi-platform histories for one trader.
- Funded Account / Prop Firms: FTMO, FundingPips, The5ers, Maven Trading, Alpha Capital Group, FundedNext, E8 Markets, Goat Funded Trader, Hola Prime, Blue Guardian, and futures firms such as Topstep, Apex Trader Funding, and Take Profit Trader.
- Broker sync options (for later versions): read-only investor-password bridges offered by third-party services, cTrader Open API (OAuth), and futures platform APIs. Document security risks, cost, terms-of-service limits, and whether they are allowed by each firm.
- Market data sources for historical OHLC/tick data (needed later for MAE/MFE reconstruction and backtesting), including licensing and redistribution terms.
- Payment providers that a Pakistan-based solo founder can actually use: verify onboarding eligibility, payout methods, and fees for Paddle, Lemon Squeezy, Stripe Managed Payments, Stripe, and other Merchant of Record options. Note: Lemon Squeezy is owned by Stripe and Stripe has launched its own Merchant of Record product; verify the current status before choosing.

For each competitor and platform, investigate and document:
- Target users and supported asset classes.
- Trade import methods (file upload, read-only investor password, broker sync) and their security/privacy trade-offs.
- Core analytics, strategy tagging, mistake tagging, and screenshot journaling features.
- Backtesting or bar-replay features.
- AI capabilities (what they actually do vs. marketing hype).
- Funded-account rule tracking capabilities.
- Current pricing tiers and subscription limits.
- Strengths, limitations, and unmet user pain points (especially for prop-firm traders and developing-market traders).

For each prop firm, also document:
- The source URL of every rule and the date it was verified.
- Known rule changes over time (a firm's rules today may differ from last year).

Citation and Honesty Rules:
- Cite the source, URL, access date, and exact claim supported by the source.
- Clearly separate verified facts from assumptions and recommendations.
- Do not fabricate URLs, prices, or features if live browsing is restricted for a specific site; explicitly label what was verified live versus what relies on baseline domain knowledge.
- Do not copy proprietary UI designs, code, or copyrighted text.

DELIVERABLES FOR PHASE 2:
1. Competitor Comparison Matrix.
2. Broker/Platform Export Format Specification (how MT4/MT5/cTrader/Match-Trader/TradeLocker/DXtrade/futures/CSV files are structured in the real world).
3. Prop-Firm Rule Variations Matrix (with source URL and verification date per rule).
4. Customer Pain Points & Prioritized Feature Gap Analysis.
5. Realistic Product Differentiation Strategy.
6. Data Source & Integration Options Matrix (file import, sync APIs, market data, payment providers).
7. Regulation & Privacy Landscape for target markets (Pakistan, EU/UK, Saudi Arabia, UAE, India, USA).
8. Unresolved Research Questions list.
