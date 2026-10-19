<!-- Generated from docs/specs/MASTER_PROMPT.md lines 521-529. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

D. Trade Explorer & Interactive Journal
- Fast, paginated, sortable, and filterable data table of all trades.
- Columns: Open/Close timestamps, Instrument, Direction, Lot/Size, Entry/Exit Price, SL/TP, Planned Risk ($/%), Gross P&L, Commissions/Swaps, Net P&L, Realized R-Multiple, Holding Duration, Session, Strategy Tag, Mistake Tag, and Data Quality Warning badges.
- Bulk tagging of multiple trades at once.
- Trade Detail Drawer/Modal:
  - Full execution breakdown (including partial fills if available).
  - Ability to input/edit Initial Stop-Loss, Take-Profit, or Planned Risk (with an audit trail showing user-edited vs. broker-imported fields) so R-multiples can be calculated even if the broker CSV omitted SL/TP.
  - Rich Journaling: Structured setup checklist, mistake tags (e.g., FOMO, Revenge Trade, Early Exit, Widened SL, News Gamble), free-text notes, and Before/After Chart Screenshot URLs or image uploads (e.g., TradingView snapshot links).
