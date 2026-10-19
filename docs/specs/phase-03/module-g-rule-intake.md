<!-- Generated from docs/specs/MASTER_PROMPT.md lines 563-584. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

G. Account Setup & Rule Intake Assistant (with Read-Back Confirmation)
This module is mandatory for the MVP.
G1. Account Type Choice: When creating an account, the user must choose:
    - Normal Account (personal live or demo), or
    - Funded / Prop Account (challenge phase, verification phase, or funded stage), or
    - Backtest Account.
G2. Normal Account setup: broker/platform, base currency, starting balance, timezone, and optional personal trading rules.
G3. Funded Account setup — the app must ask the user to provide ALL rules of the account, in one of two ways:
    a. Choose a firm preset. Presets are versioned (firm, plan, phase, version, source URL, last-verified date). Even with a preset, the user must review and confirm every rule, because firms change rules.
    b. "Write your rules": a free-text box where the user writes or pastes all rules in English, Roman Urdu, or Urdu (for example, pasted text from the firm's rules page, or "daily loss 5%, max loss 10% trailing, consistency 30%, minimum 3 trading days").
G4. Guided questions: The assistant compares the user's input against a checklist of required rule fields and asks short, clear questions for anything missing or unclear. Required fields include at least: firm and plan name, phase, nominal starting balance, profit target, daily loss limit and its calculation method, daily reset time and timezone, maximum loss limit and its type (static, EOD trailing, intraday trailing), whether commissions and swaps count, minimum trading days, consistency rule definition, news/weekend/EA/copy-trading rules, lot or risk limits, payout rules, and inactivity rules. Questions must be grouped and easy to answer (buttons/options where possible).
G5. Read-Back Screen ("Here is what I understood"): Before saving, show:
    - A plain-language summary in simple English and Roman Urdu.
    - A structured table of every rule with: the value, where it came from (user text / preset / default), its status (CLEAR / ASSUMED / AMBIGUOUS / MISSING), and exactly how the engine will calculate it.
    - A worked example using the user's own numbers (e.g., "On a $10,000 account, if yesterday's ending balance was $10,300 and the daily loss limit is 5% of the prior day's ending balance, your equity must not go below $9,785 today").
    - A list of rules the system cannot check automatically (e.g., rules that need tick data or the firm's private data), clearly labeled "Not automatically checked".
G6. Ambiguity handling: Never guess silently. Ambiguous or missing rules are stored as UNCONFIRMED, and every check that depends on them shows a warning badge until the user confirms.
G7. Confirmation & Editing: The user confirms or edits each rule. Nothing becomes active until the user presses an explicit confirm button. Every change creates a new rule-set version with an effective date, so old reports remain reproducible.
G8. Architecture rule: AI may only convert free text into a draft structured rule configuration (validated by a Zod schema). All calculations are done by the deterministic engine. The read-back summary must be generated from the saved structured configuration, not from the AI's memory, so what the user sees is exactly what the engine uses.
G9. "Explain my rules" button: At any time, the user can ask the app to re-explain the currently active rules, generated from the stored configuration.
G10. Acceptance criteria: Include test cases with messy real-world inputs (mixed English/Roman Urdu, abbreviations, pasted rule pages) with the expected parsed configuration and the expected list of follow-up questions.
