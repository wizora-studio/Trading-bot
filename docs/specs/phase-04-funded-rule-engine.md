<!-- Generated from docs/specs/MASTER_PROMPT.md lines 675-726. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

PHASE 4 — FUNDED-ACCOUNT ANALYZER (PROP-FIRM ENGINE)
Design the Funded-Account Analyzer as a dedicated, highly configurable rule engine.

Agent behavior before writing this phase:
- Ask me which funded/prop accounts and which normal accounts I personally trade or want to support first.
- For each funded account, ask me to write all of its rules in my own words.
- Apply the Read-Back Rule: restate what you understood with a worked example using my numbers, list questions, and wait for my confirmation.
- Use my confirmed rules as the first real test fixtures for the engine.

Entry point: Every funded account's rules come from the Module G Rule Intake & Read-Back flow (preset or free text), and are stored as a versioned, user-confirmed rule set.

Support presets and custom configurations for:
- Firm Name, Plan Name, and Phase (Evaluation Step 1, Step 2, Step 3, Instant Funding, Funded Master Account).
- Preset metadata: source URL, last-verified date, effective-from date, and version. Presets are never assumed to be current.
- Nominal Starting Balance (e.g., $5,000, $10,000, $25,000, $50,000, $100,000, $200,000).
- Challenge Fee Paid and Fee Refund Eligibility (and when the refund is paid).
- Profit Target ($ and %).
- Maximum Daily Loss Limit ($ and %), specifying the exact method:
  - Prior Day's Ending Balance vs. Prior Day's Ending Equity vs. Initial Balance (or the higher of balance/equity, if a firm uses that).
  - Exact Daily Reset Time and Timezone (e.g., 00:00 Server Time / CE(S)T or EST; for futures firms, the exchange session close time).
- Maximum Overall Loss Limit ($ and %), specifying:
  - Static (Fixed from initial balance).
  - End-of-Day (EOD) Trailing Drawdown.
  - Intraday High-Water Mark Trailing Drawdown (with clear warnings if intratrade floating equity data is missing).
  - Trailing drawdown that stops trailing once it reaches a defined level (common at futures firms).
- Cost Inclusion Rules (whether commissions and swaps are included in drawdown and profit targets; Swap-Free / Islamic account status).
- Minimum Profitable Trading Days (and minimum daily profit threshold, e.g., 0.5% per day to count as a trading day).
- Consistency Rule Calculator:
  - Formula: `(Highest Single Day Profit / Total Cumulative Profit) * 100 <= Max Consistency %` (e.g., 30% or 40%).
  - Support other definitions used by firms (e.g., best day measured against the profit target instead of total profit), selected during rule intake.
  - Dynamically calculate how much additional total profit is required if a single big winning day breaches the consistency percentage.
- Lot Size / Exposure Consistency Limits, Maximum Risk per Trade, Maximum Lots per Instrument, and Maximum Open Positions.
- Minimum trade duration / tick-scalping restrictions.
- Prohibited strategies where a firm defines them (e.g., high-frequency/latency arbitrage, grid/martingale, hedging across accounts, copy trading between users). Mark checks that cannot be proven from CSV data as UNVERIFIABLE_FROM_CSV.
- Expert Advisor (EA) permission rules.
- Weekend Holding Restrictions and News-Trading Window Warnings (window size and affected instruments).
- Inactivity limits (e.g., account closed after N days without a trade).
- Payout rules: first payout timing, payout frequency, minimum payout, payout caps, and profit split changes after scaling.
- Profit Split % (e.g., 80/20, 90/10) and True Withdrawable Payout vs. Remaining Drawdown Buffer math.
- Scaling plan criteria and maximum total allocation per trader.
- Account Lifecycle State Machine: NOT_STARTED → PHASE_1 → PHASE_2 → FUNDED → PAYOUT_ELIGIBLE, and terminal states PASSED / BREACHED / EXPIRED, with every transition logged.
- "How much room do I have?" calculator: remaining daily loss, remaining max loss, and the maximum position size for a given stop-loss that keeps the next trade within both limits (educational, not advice).
- Multi-Account Portfolio View: Track multiple funded accounts simultaneously (e.g., scaling from 1 to 5 accounts) and view combined capital, combined payouts, and individual account risk headroom. Warn that the same trade copied across several accounts creates correlated risk: one bad trade can breach all of them together.

Strict Honesty Rules for Phase 4:
- Clearly distinguish Nominal Account Size ($5,000) from Actual Riskable Drawdown Buffer ($500 at 10% max loss).
- Categorize every rule check into one of these states:
  1. `VERIFIED_COMPLIANT` / `CONFIRMED_VIOLATION` (when closed trade data is 100% sufficient to prove it).
  2. `POTENTIAL_RISK_WARNING` (approaching limit).
  3. `UNVERIFIABLE_FROM_CSV` (e.g., intratrade floating equity drawdown or exact second-by-second news execution when only closed trade timestamps exist).
  4. `RULE_UNCONFIRMED` (the user has not yet confirmed the rule this check depends on).
