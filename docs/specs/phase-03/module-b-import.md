<!-- Generated from docs/specs/MASTER_PROMPT.md lines 498-514. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

B. Trade Import & Normalization Center
- Native support for configurable CSV and XLSX imports, plus pre-built parser profiles for MT4, MT5 (Positions/Deals), cTrader, and our Standard Template. Decide, using Phase 2 research, when to add Match-Trader, TradeLocker, DXtrade, and futures platform profiles.
- Downloadable sample CSV template and pre-loaded realistic Demo Dataset (clearly badged as Sample Data).
- Interactive column mapper (saving custom mappings for future uploads).
- Pre-import validation preview: detect missing required fields, invalid timestamps/numbers, currency mismatches, and duplicate trades (via deterministic trade fingerprinting/hashing).
- Explicit timezone declaration during import (converting broker server time, such as GMT+2/GMT+3, into UTC in the database and displaying in the user's selected timezone).
- Accurate handling of partial closes, scale-ins, multiple fills, commissions, swaps, and swap-free fees.
- Netting vs hedging account mode handling.
- Symbol Mapping & Instrument Specification Registry: map broker symbols (with suffixes) to a canonical instrument, and store per-broker contract size, tick size, tick value, and quote currency, with versioning.
- Historical FX conversion rates (with source and date) for accounts whose instruments are quoted in a different currency than the account currency.
- Separation of EA/bot trades (magic number) and copy-trading trades from manual trades.
- Merging histories when a trader's firm moved them from one platform to another.
- A Data Quality Score per import, shown next to every affected metric.
- Large files processed as background jobs with progress shown to the user.
- Immutable raw import audit log and one-click Import Rollback (undoing a faulty import cleanly without corrupting other trades).
- Security rule: Never ask for master trading passwords or unrestricted execution API keys for historical analytics.
