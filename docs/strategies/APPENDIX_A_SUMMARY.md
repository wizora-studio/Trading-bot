# Appendix A — compact strategy summary (2026-10-19)

Source: the founder's AI-generated research document (Appendix A of the master prompt). Everything here is **data**, and every win rate, R:R, and objectivity score is an **UNVERIFIED claim** from that document. A strategy is judged only on the trader's own trades. This table is not a recommendation.

"V1 auto-check" = what the app can check automatically from trade-history data in Version 1 (no chart data). Almost all of these need the trade's **initial stop-loss** for R; see issue N5.

## Strategies
| # | Strategy | Style | Timeframes | Markets | Source objectivity (unverified) | V1 auto-check | Main ambiguities |
|---|---|---|---|---|---|---|---|
| S1 | Moving average trend (crossover / pullback) | Trend, swing–intraday | 1H, 4H, D | Forex, Gold, Crypto, Stocks | 9/10 | R, 1.5R partial, breakeven move (if stop edits recorded) | Stop: ATR vs EMA 50; trail on EMA 20 or 50 |
| S2 | Donchian / Turtle breakout | Breakout, swing | 4H, D | Commodities, Crypto, Futures | 10/10 | R distribution, units added | "Previous breakout lost" needs market data; volume filter (V4); pyramiding vs prop lot limits |
| S3 | Opening range breakout (ORB) | Session breakout, intraday | 5m, 15m, 30m | NAS100, US30, stocks | 9.5/10 | Entry inside window, exit by 11:30 NY, R | VWAP on CFDs uses tick volume (V4) |
| S4 | London / Asian range breakout | Session breakout, intraday | 15m, 30m | GBPUSD, EURUSD, XAUUSD, JPY | 9/10 | Entry in London window, exit before NY, R | "80 pips" for Gold; "strong candle" undefined; London open time (ASSUMED 08:00 London); NY open time (N2) |
| S5 | Support/resistance bounce & flip | Price action | 15m, 1H, 4H | All liquid | 6.5/10 (8 quantified) | R, planned min R:R | Two zone tolerances; short RSI threshold not stated |
| S6 | Fibonacci golden pocket | Trend pullback | 15m, 1H, 4H | Forex, Gold, Indices, Crypto | 7/10 (8.5 fractals) | R | Rejection quality; 0.886 tight stop – when? |
| S7 | Mean reversion (RSI(2), Bollinger) | Mean reversion, swing | D, 1H | US indices/ETFs, majors | 9.5/10 | Holding time, R | Short exit not stated; backtest claims are for US index data only |
| S8 | Supply & demand zones | Institutional zones | 15m, 1H, 4H | Forex, Gold, Indices | 6.5/10 (8.5 filtered) | R, planned min R:R | Entry trigger not stated (ASSUMED limit at proximal); "small candle" undefined |
| S9 | SMC / ICT sweep + MSS + OB/FVG | Smart money, scalping | 1m, 5m, 15m | Indices, XAUUSD, EURUSD | 5.5/10 (8.5 filtered) | Time window, R | Order-block selection is discretionary; example R mismatch (V3) |
| S10 | Inside bar & pin bar | Price action | 1H, 4H, D | Forex, Gold, Equities | 8/10 | R | "Pips" buffer for Gold/indices (N1); daily candle timezone (N3) |
| S11 | VWAP + SD bands | Institutional benchmark, intraday | 5m, 15m | Futures, Indices, Stocks, Crypto | 9/10 | Checklist only | "Steep" slope undefined; needs real volume (V4) |
| S12 | Volume profile / auction theory | Auction market | 15m, 1H, 4H | Futures, Gold, BTC | 8.5/10 | Checklist only | Needs volume-at-price (V4); "80% rule" claim unverified |
| S13 | Order flow footprint & CVD | Microstructure, scalping | 1m, 5m, 15m | Futures, BTC, Gold, EURUSD | 8/10 | None (checklist only) | Needs exchange order-flow data (V4) |
| S14 | ICT Silver Bullet / Power of 3 | Time-based SMC, intraday | 1m, 5m, 15m | NAS100, S&P 500, EURUSD, Gold | 8/10 | Entry inside window (strong), R, min target | Sweep / MSS / FVG need chart data |
| S15 | Bollinger squeeze (TTM) | Volatility breakout | 15m, 1H, 4H | Crypto, growth stocks, Forex | 9.5/10 | Checklist only | Which momentum indicator; head-fake "exit" vs "reverse" |
| S16 | Wyckoff spring / UTAD | Market cycle, swing | 1H, 4H, D | Crypto, Indices, Forex, Stocks | 6/10 (8 Phase C/D) | Checklist only | Phase labelling discretionary; example R mismatch (V3) |
| S17 | RSI + MACD divergence | Reversal / continuation | 15m, 1H, 4H | Forex, Crypto, Gold, Indices | 7.5/10 | Checklist only | Which trigger when several apply |
| S18 | Ichimoku cloud | Multi-factor trend | 1H, 4H, D | JPY pairs, Gold, Crypto, Stocks | 9/10 | Checklist only | "Pips" for Gold (N1); flat-Kijun definition |
| S19 | Pairs trading / stat-arb | Market-neutral quant | 1H, 4H, D | Equities, crypto pairs, Gold/Silver | 10/10 | Checklist only (two legs = one logical trade) | Prop hedging rules; needs both price series |
| S20 | Macro news (NFP/CPI/FOMC) | Event-driven | 1m, 5m, 15m | XAUUSD, USD pairs, US indices | 7.5/10 | Trade time vs news (once calendar data exists) | "2σ surprise" undefined; licensed calendar needed; firm news rules |

## Risk models
| # | Model | V1? | Main ambiguities |
|---|---|---|---|
| R1 | Fixed fractional sizing | Yes | Gold example was wrong in the document (corrected, V2); contract size per broker |
| R2 | ATR sizing & Chandelier exit | Later (manual ATR earlier) | k value per style |
| R3 | Quarter-Kelly | Later, information only | Only after a large own sample |
| R4 | Drawdown ladder & daily circuit breaker | Yes | "−2R/day" vs "2 losses or −1.5%" (V5); equity high-water mark needs equity data (N6); which objectivity score for "≥ 8/10" (N7) |
| R5 | Min R:R gate, partial + breakeven, correlation cap | Yes | "+1.5R" vs "+1.0R to +1.5R" (V5); "1.5 × single-trade risk" — baseline or actual? (N8) |

## Verification issues
Already noted in Appendix A: **V1** daylight saving (NY times shift 1 hour in Pakistan time from March to early November), **V2** Gold sizing math error, **V3** corrupted example numbers, **V4** volume/order-flow data not available on spot forex/CFD accounts, **V5** internal inconsistencies in R4 and R5, **V6** QuantEdge persona not adopted.

I re-checked the example math: S6 Fibonacci levels (50% = $2,630, 61.8% ≈ $2,622.92, −0.272 ≈ $2,676.32), S9 (≈ 2.9R), S16 (≈ 8.0R / ≈ 5.4R), R1, and R3 are correct as corrected in the appendix. The Pakistan-time conversions in S3, S4, and S14 are correct.

New issues found:
- **N1 — "pips" on Gold and indices.** S4, S9, S10, S14, and S18 use pip buffers ("2 pips", "5 pips") without defining a pip for XAUUSD or indices. Brokers differ. Proposed: every buffer is stored in price units per instrument, using the Instrument Specification Registry, and confirmed in Read-Back.
- **N2 — "New York open" means three different times.** S3 uses 09:30 NY (stock open), S4 uses 08:00 NY, and the S9 example uses 08:30 NY (a news time). Each strategy must state its own time; ask per strategy.
- **N3 — candle boundaries depend on the broker.** Daily and 4H candles start at different times at different brokers (often 17:00 New York). Rules on daily candles (S1, S2, S7, S10 inside bar) can give different answers on TradingView vs. MT5. Record the candle timezone with each strategy.
- **N4 — holding overnight or over the weekend.** Swing strategies (S2, S7, S16, S18, S19) may hold trades overnight or over the weekend: swap costs, and many prop firms restrict weekend holding. Flag in the Read-Back.
- **N5 — R needs the initial stop-loss.** Most "YES" checks use R. If the TradingView export has no stop-loss (verify in Phase 2), R needs a manual stop entry per trade.
- **N6 — R4 uses equity.** The ladder is defined on the equity high-water mark, but CSV exports give only closed balance. In V1 compute it on closed balance and label it.
- **N7 — R4 "objectivity ≥ 8/10".** Is that the unverified source rating or our own measured objectivity (% of objective rules)? Module O says they must be shown separately.
- **N8 — R5 correlation cap base.** "1.5 × single-trade risk": the baseline risk % from the profile, or the actual risk of the first open trade?

## Fit with your stated markets (filter only, not a recommendation)
You said you will start with forex and gold on TradingView paper trading, in Pakistan time. Using only the Trader Profile filters (market, timeframe, how much the app can check in V1), the strategies whose markets include forex/gold **and** that have a time-window check the app can do in V1 are **S4**, **S9**, and **S14** (S9 and S14 also rely on many discretionary chart judgements). **S1** and **S10** fit your markets with fully objective rules, but their indicator and candle checks need chart data, so in V1 they are mostly checklist-based. This says nothing about which will make money; only your own trades can show that.

**Your choice:** which 2–3 do you want to activate first? (OPEN_QUESTIONS Q4.)
