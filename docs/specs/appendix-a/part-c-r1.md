<!-- Generated from docs/specs/MASTER_PROMPT.md lines 1229-1234. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

R1. Fixed Fractional Position Sizing
- Dollar risk = account equity × risk %. Lots = dollar risk ÷ (stop distance in pips/points × pip/point value per standard lot).
- Example (checked): $10,000 × 0.5% = $50. EURUSD buy 1.0850, stop 1.0830 (20 pips), $10 per pip per lot → $50 ÷ (20 × $10) = 0.25 lots.
- Gold example (CORRECTED, V2): stop $5.00 = 50 pips of $0.10. With a 100-ounce contract the pip value is $10 per lot → $50 ÷ (50 × $10) = 0.10 lots. (The document's "× $1" would give 1.0 lots.)
- Rule: never trade a fixed lot size. Size always comes from the risk %.
