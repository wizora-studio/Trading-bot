# Module 2 — Instruments and trading costs / Instruments aur trading ke kharche

Phase 1 of the Trading Analytics Handbook. Written in plain English.
Educational only — not financial advice. The numbers below match what the app's calculator gives (tested in `src/services/analytics/tools.test.ts`).

---

## 1. Why this matters

The same price move makes **different money** in different instruments. A calculator that treats every instrument alike gives wrong lot sizes and wrong R-multiples.

## 2. Instrument types

| Type | Examples | Notes |
|---|---|---|
| **Forex** | EURUSD, GBPUSD, USDJPY | Pairs. Majors contain USD; minors do not; exotics include a small currency. |
| **Metals** | XAUUSD (gold), XAGUSD (silver) | Priced in USD per ounce. |
| **Index CFDs** | US30, NAS100, GER40 | Priced in points; names differ by broker (US30 = DJ30 = WS30). |
| **Futures** | ES, NQ, CL | Expiry dates, rollover, exchange trading day. |
| **Stocks** | AAPL | Splits and dividends change history. |
| **Crypto** | BTCUSD | Perpetuals pay or charge a funding rate. |
| **Options** | — | Not supported in Version 1. |

## 3. Base, quote and account currency

In **EURUSD**, EUR is the **base** and USD is the **quote**. The price 1.0850 means 1 EUR = 1.0850 USD. P&L is first calculated in the **quote** currency, then converted to your **account** currency.

- USD account + EURUSD → quote is USD → no conversion.
- USD account + USDJPY → quote is JPY → divide by the USDJPY price.

## 4. Pip, point, tick

- **Pip:** the standard small step. Most pairs: 0.0001. JPY pairs: 0.01. Gold (as the app uses it): 0.10.
- **Point / tick:** the smallest price step the broker allows (often a tenth of a pip: 1.08500 has 5 decimals).
- **Digits** differ: EURUSD 5, USDJPY 3, gold 2.

## 5. Contract size and pip value

**Contract size** = units in 1 standard lot. **Pip value per lot** = contract size × pip size (× conversion to account currency).

| Instrument | Contract size | Pip size | Pip value per lot (USD account) |
|---|---|---|---|
| EURUSD | 100,000 | 0.0001 | $10 |
| XAUUSD | 100 oz | 0.10 | $10 |
| USDJPY | 100,000 | 0.01 | 100,000 × 0.01 ÷ 150 = **$6.67** (at 150.00) |
| US30 | 1 | 1 point | $1 per point |

**The same "10-pip" move, 1 lot:**
- EURUSD: 10 pips = 0.0010 × 100,000 = **$100**
- XAUUSD: 10 pips = $1.00 × 100 oz = **$100**
- USDJPY (at 150): 10 pips = 0.10 × 100,000 = 10,000 JPY ÷ 150 = **$66.67**
- US30: 10 points × $1 = **$10**

## 6. Position size from risk (Risk Model R1)

**Lots = risk money ÷ (stop distance in pips × pip value per lot).** Always round **down** to the lot step, so risk never exceeds your plan.

With $50 risk:

| Instrument | Entry → stop | Stop in pips | Pip value | Lots |
|---|---|---|---|---|
| EURUSD | 1.0850 → 1.0830 | 20 | $10 | 50 ÷ (20 × 10) = **0.25** |
| XAUUSD | 2650 → 2645 | 50 | $10 | 50 ÷ (50 × 10) = **0.10** |
| USDJPY | 150.00 → 149.50 | 50 | $6.67 | 50 ÷ (50 × 6.67) = **0.15** |
| US30 | 42,000 → 41,950 | 50 | $1 | 50 ÷ (50 × 1) = **1.00** |

(The research document's gold example wrote "× $1" and got 1.0 lot. That was wrong: the correct pip value is $10 per lot, so 0.10 lot. See Appendix A, V2.)

## 7. Costs you pay

| Cost | What it is | How the app treats it |
|---|---|---|
| **Spread** | Gap between buy and sell price. You pay it when you open. | Already inside the fill prices; not shown as a separate line. |
| **Commission** | A fee per lot or per side (open + close = round turn). Example: $7 per lot round turn × 0.5 lot = **$3.50**. | Stored as a positive cost. |
| **Swap / rollover** | Fee or credit for holding past the daily rollover. Triple on the weekend rollover for many brokers. | Cost if positive, credit if negative. |
| **Swap-free (Islamic)** | No swap, but sometimes a flat admin fee. | Enter it under Fees. |
| **Slippage** | Fill price different from the price you wanted. | Already inside the fill. |
| **Financing / funding** | Perpetual crypto funding, stock margin interest. | Enter under Fees. |

Example: EURUSD spread 1.2 pips on 0.50 lot → 1.2 × $5 = **$6**, paid at entry.

## 8. Broker symbol differences

The same instrument has different names and sizes at different brokers: `XAUUSD`, `GOLD`, `XAUUSD.m`; `US30`, `DJ30`, `US30.cash`. The app maps names to one canonical instrument (`mapSymbol`) but **contract size and pip size can still differ by broker**. In Tools → Position size calculator you can edit them; the change is used everywhere for that instrument.

## 9. Futures, stocks, crypto specials

- **Futures:** each contract has an expiry; positions are "rolled" to the next contract. The trading day often ends at the exchange close (e.g. 17:00 New York), not midnight — set this as the daily reset in Funded rules.
- **Stocks:** a split changes old prices and quantities; dividends can change P&L.
- **Crypto perpetuals:** every 8 hours (typically) longs pay shorts or the reverse, depending on the funding rate.

## 10. Precision and rounding

JPY amounts and prices use different decimals than USD. The app keeps **full precision** during calculation (decimal.js, never plain floating point) and **rounds only for display**. Example: 0.1 + 0.2 is exactly 0.3 in the app, not 0.30000000000000004.

---

### Data the app needs per instrument / Har instrument ke liye zaroori data
Contract size · pip size · quote currency · digits · conversion rate to your account currency (when the quote is not your currency).

### Quick self-check / Khud ko check karein
1. 0.30 lot EURUSD, price moves 15 pips against you. Loss? → 15 × $10 × 0.30 = **$45**.
2. Gold, stop 40 pips ($4.00), risk $80. Lots? → 80 ÷ (40 × $10) = **0.20**.
3. USDJPY at 140.00, 1 lot, 20 pips. Pip value in USD? → 100,000 × 0.01 ÷ 140 = $7.14 → 20 pips = **$142.86**.
