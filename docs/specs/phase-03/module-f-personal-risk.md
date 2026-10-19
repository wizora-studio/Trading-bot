<!-- Generated from docs/specs/MASTER_PROMPT.md lines 558-562. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

F. Personal Risk & Behavioral Monitor
- User-configurable personal trading rules: Max Risk per Trade (%/$), Max Daily Loss, Max Trades per Day, Max Consecutive Losses before mandatory stop, Allowed Trading Hours/Sessions, Allowed Instruments, and Minimum RRR.
- Personal rules are entered through the same Rule Intake & Read-Back flow described in Module G.
- Automated Rule Compliance Engine that scans historical trades against the user's rules, flags exact violations, and calculates the financial cost of breaking rules ("How much money would you have saved if you stopped after your daily trade limit?").
