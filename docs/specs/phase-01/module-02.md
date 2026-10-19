<!-- Generated from docs/specs/MASTER_PROMPT.md lines 259-274. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

Module 2: Instruments and Trading Costs
Explain the structural and mathematical differences between:
- Forex currency pairs (Majors, Minors, Exotics; base currency vs. quote currency vs. account currency).
- Spot gold (XAUUSD), silver (XAGUSD), and other commodities.
- Futures contracts (Indices, Commodities, Treasury futures), including contract expiry, rollover, and exchange trading-day boundaries.
- Equities / Stocks, including corporate actions (stock splits, dividends) that change historical prices and quantities.
- Spot and perpetual cryptocurrency pairs, including perpetual funding rates.
- CFDs (Contracts for Difference) on indices (e.g., US30, NAS100, GER40).
- Options, where relevant to the data model.
Explain pip, point, tick, tick size, tick value, contract size, point value, bid-ask spread, commission (per lot vs. per side vs. round-turn), overnight swap/rollover, swap-free (Islamic account) fee structures, financing, slippage, and currency conversion to the account's base currency.
Explain broker symbol differences: the same instrument can have different names and specifications at different brokers (e.g., XAUUSD vs GOLD vs XAUUSD.m, US30 vs DJ30), so contract size and tick value must come from a per-broker instrument specification, not from the symbol name alone.
Explain currency minor units and precision (e.g., JPY prices and amounts use different decimal places).
Do not treat all instruments as if they share the same P&L formula.
Show with concrete math why a 10-point move produces different monetary outcomes depending on the instrument, contract size, and position size.
Identify which instrument specifications are required for accurate calculations.
