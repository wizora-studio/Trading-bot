<!-- Generated from docs/specs/MASTER_PROMPT.md lines 530-557. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

E. Strategy Library, Strategy Selection & Playbook Analyzer
E1. Add a strategy in three ways:
    a. Manually (name, description, rules, checklist).
    b. From generic built-in templates that we write ourselves (e.g., "Breakout", "Pullback to moving average"). Never copy any creator's paid or proprietary course material.
    c. "Import Strategy Spec": paste the output of the Gemini Strategy Extraction Prompt (`docs/prompts/STRATEGY_EXTRACTION_PROMPT.md`) that the user ran on a YouTube strategy video. The JSON block is the primary input; the full text report is stored as reference.
E2. Import validation: validate the JSON against the Strategy Spec Zod schema (`strategy-spec/1.0`), show clear, beginner-friendly error messages, treat every imported text field as untrusted data (prompt-injection safe), and store the video URLs and timestamps.
E3. Strategy Read-Back (same Read-Back Rule as Module G): before saving, the app explains the strategy back in simple English and Roman Urdu: a short summary, the step-by-step A-to-Z execution flow, and a rules table showing each rule's category, direction, source (STATED / SHOWN_ONLY / INFERRED / NOT_STATED), video timestamp, objectivity, and measurability. It lists assumptions and ambiguities as questions. INFERRED and NOT_STATED rules remain UNCONFIRMED until the user decides. The user edits or confirms; every change creates a new strategy version.
E4. Strategy Selection:
    - Choose one or more active strategies per account, with a default strategy.
    - Select the strategy for each trade in the Trade Drawer, or for many trades at once in the Trade Explorer (bulk).
    - Optional auto-suggestion based on measurable rules (instrument, session, time window). It is only a suggestion; the user must confirm.
    - A "No strategy / Unplanned trade" option, tracked separately so unplanned trades can be measured.
E5. Per-trade Strategy Checklist generated from the strategy's rules. The user ticks it per trade, and the app calculates Strategy Adherence % per trade and per period.
E6. Automatic rule checks only where measurable from trade data (session/time window, instrument, direction, minimum RR, stop-loss size, risk %, max trades per day, partial-close behavior). Rules marked PARTIAL need chart/OHLC market data and are shown as "needs market data" until a later milestone. Rules marked NO are checklist-only. Never claim to automatically verify chart-pattern rules (e.g., order blocks, fair value gaps, liquidity sweeps) from trade-history files.
E7. Strategy Analytics:
    - Compare strategies side-by-side across Sample Size, Net P&L, Expectancy, Profit Factor, Win Rate, Average R, Max Drawdown, Outlier Dependency, and Rule Compliance %.
    - "Followed all rules" vs "Broke one or more rules" performance split for each strategy.
    - Per-rule impact analysis, with sample-size badges and multiple-comparison caution.
E8. Source traceability and honesty: each imported rule links back to the video URL and timestamp. The creator's performance claims are stored as "Unverified claims" and never shown as facts. A strategy is judged only on the user's own trades.
E9. Dedicated "Strategies" Page (separate page in the main navigation):
    a. Top section, "Choose your strategies": all available strategies (imported Gemini specs, manual strategies, and built-in templates) shown as cards. Each card shows: name, style (scalping / intraday / swing), instruments, timeframes, session times converted to the user's timezone, status (Draft / Unconfirmed / Confirmed), an objectivity score (% of rules that are objective), how many rules the app can check automatically, and, if trades exist, sample size, expectancy (R), and win rate with a confidence badge. Strategies with no trades show "No data yet".
    b. Selection: the user ticks which strategies they want to work with ("My Active Strategies") and can set a default strategy per account. Only active strategies appear in the trade strategy picker. Inactive strategies stay saved but hidden from the picker.
    c. Bottom section, "Strategy Details": when a strategy card is clicked, its full details open below the cards: A-to-Z explanation in simple English and Roman Urdu, step-by-step execution flow, rules table grouped by category (Context, Setup, Entry, Stop-Loss, Take-Profit, Management, Risk, Time/News), terms glossary, indicator settings, session times in the user's timezone, pre-trade checklist, mistake tags, example trades from the video with clickable timestamps, unverified creator claims, open ambiguities with their questions, and the user's own performance with this strategy.
    d. Compare mode: select 2–3 strategies to see their rules and the user's own results side by side.
    e. Activation read-back: when the user activates a strategy, show a short "Here is what you chose and what the app will check" summary. Open ambiguities must be answered or explicitly accepted as "checklist-only" before activation.
    f. Guardrails: never show a "Best strategy" badge and never recommend which strategy to trade based on video claims. Any ranking uses only the user's own trade data, with sample-size and confidence badges.
- Guardrail: Never rank a strategy as "Best" based solely on total profit; flag small samples (using the Phase 5 confidence thresholds) and outlier-skewed results prominently.
