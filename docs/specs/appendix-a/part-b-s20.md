<!-- Generated from docs/specs/MASTER_PROMPT.md lines 1218-1226. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

S20. Macro News Events (NFP / CPI / FOMC)
- Event-driven | XAUUSD, USD pairs, US indices | 1m, 5m, 15m | 7.5/10 | Claims: win rate 48–58%, R:R 1:2.5–1:5.
- Pre-news protection: cancel resting limit orders 10 minutes before CPI/NFP/FOMC. With a prop-firm news rule, wait at least until the firm's confirmed restriction window ends (the document says 5 minutes; use the user's confirmed firm rules).
- Playbook 1 (post-news whipsaw fade, mixed or as-expected data): the first 1–3 minutes sweep a major 4H level, then a 5m candle closes back beyond the pre-news price → enter in the reversal direction, targeting the other side of the spike. Stop beyond the spike's extreme.
- Playbook 2 (true surprise, actual vs forecast beyond 2σ): the first 5m candle moves one way with a 15m break of structure and an FVG; do not chase; wait 15–30 minutes for a 50% retrace of the impulse candle or the 5m FVG, then enter in the surprise direction. Stop beyond the pre-news price.
- Targets: 2R–4R.
- Notes: needs an economic calendar with actual and forecast values from a properly licensed source. "2σ surprise" needs a historical surprise distribution (NOT_STATED; define it). News times are in New York time (V1).
- Measurability (V1): YES: trade timing versus news events (once calendar data exists). PARTIAL: everything else.
