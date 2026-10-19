<!-- Generated from docs/specs/MASTER_PROMPT.md lines 638-654. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

N. Trading Room (all-in-one trading page, so I do not need to switch to TradingView)
Goal: one screen that holds everything I need while trading, built around my confirmed strategies (from the Gemini Strategy Specs).
N1. Version 1 (MVP): one page with:
    - The live TradingView Advanced Chart widget (Module M1), with indicators and drawing tools, opening on the symbol and timeframe of my selected strategy.
    - Strategy panel next to the chart: the active strategy's A-to-Z steps, its pre-trade checklist, its session times in Pakistan time, and a clear "Inside my allowed session: yes/no" indicator.
    - Position Size Calculator.
    - Rule meters for the selected account (personal or funded), based on the latest imported data.
    - Today's Daily Plan and a quick note box.
    On mobile, the chart is on top and the panels sit below it in tabs.
N2. Version 2: Built-in Practice Trading (so practice trades no longer need TradingView):
    - I place simulated Buy/Sell trades with stop-loss and take-profit, using live prices from a market-data API (Module M1b).
    - The app tracks open practice trades live (floating P&L), closes them at SL/TP, and applies a configurable spread and commission.
    - Every practice trade is saved to the journal automatically, with its strategy and checklist answers, so no file export is needed.
    - Clearly labeled "Practice — simulated fills". Real broker results differ (spread, slippage, price gaps).
    - Order simulation runs on the server, with tests for fill logic, and the price-data license must allow this use.
N3. Version 3: Real account inside the Trading Room through an official, read-only broker connection (e.g., the cTrader Open API): live open positions, floating P&L, and live rule meters. Placing real orders from our app stays out of scope unless I make an explicit future decision after a legal and broker review.
