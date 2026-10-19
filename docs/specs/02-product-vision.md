<!-- Generated from docs/specs/MASTER_PROMPT.md lines 80-106. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

2. PRODUCT VISION
Build a professional SaaS web application called:
AI Trading Performance Analyst

Working description:
An evidence-based trading analytics, journaling, and funded-account risk intelligence platform that imports historical trading data (from MT4, MT5, cTrader, Match-Trader, TradeLocker, DXtrade, futures platforms, and custom CSV/XLSX files), calculates deterministic performance metrics, analyzes trading strategies and sessions, measures risk, monitors funded-account constraints, and uses AI to explain findings and recommend testable improvements.

The product must answer questions such as:
- Am I actually profitable after all trading costs (commissions, swaps, spreads, and fees)?
- What is my mathematical expectancy per trade in currency and R-multiples?
- Is my profit caused by a repeatable statistical edge or a small number of lucky outlier trades?
- Which strategy, session (Asian, London, New York), instrument, and setup performs best?
- Which market conditions, days of the week, or behavioral habits cause most of my losses?
- What is my maximum balance drawdown and intratrade equity drawdown (where data allows)?
- Am I taking excessive risk per trade or across correlated positions?
- How long are my winning and losing streaks, and how does my behavior change during drawdowns?
- Does my strategy perform consistently across different time periods?
- Am I following my own trading rules and risk parameters?
- Am I actually following the strategy I chose, and do I perform better when I follow all of its rules?
- Am I approaching a funded-account daily loss limit, maximum loss limit, or consistency rule threshold?
- Which conclusions are statistically reliable, and which are based on insufficient sample sizes?

Core Philosophy:
- The platform must analyze evidence, not manufacture confidence.
- It must never promise profits, guaranteed payouts, a guaranteed funded-account pass, or a guaranteed profitable strategy.
- It must never silently assume a user's rules. It must restate what it understood and get confirmation (see the Read-Back Rule below).
