# Module 1 — What is a trade? / Trade kya hoti hai?

Phase 1 of the Trading Analytics Handbook. Simple English. Every term is also in `docs/GLOSSARY.md`.
Educational only — not financial advice.

---

## 1. A trade from start to end

A **trade** is one position from the moment you open it until you close it.

1. **Order placement** — you tell the platform what you want (buy or sell, how much, at what price).
2. **Execution (fill)** — the broker fills your order at a price. This is your **entry price**.
3. **Open position** — the trade is now live; its result moves with the market.
4. **Closure** — you close (or your stop-loss / take-profit closes it). The fill price is the **exit price**.

## 2. Long (buy) and short (sell)

- **Long / Buy:** you profit when price goes **up**. Result = (exit − entry) × size.
- **Short / Sell:** you profit when price goes **down**. Result = (entry − exit) × size.

Example: buy 10,000 EUR (EURUSD) at 1.0850, sell at 1.0870 → (1.0870 − 1.0850) × 10,000 = **+$20**.
Example: sell 10,000 EUR at 1.0850, buy back at 1.0870 → (1.0850 − 1.0870) × 10,000 = **−$20**.

## 3. Order types

| Order | What it does |
|---|---|
| **Market** | Fill now at the best available price. Fast, but the price can slip. |
| **Limit** | Fill only at your price or better (buy below / sell above the current price). |
| **Stop** | Becomes a market order when price reaches a level (used for stop-loss and breakout entries). |

Execution events you will see in history files: **open**, **close**, **partial close** (closing only part of the size), **scale-in** (adding size), **scale-out** (removing size step by step), and **reversal** (closing a long and opening a short in one go).

## 4. Position size: lots, units, contracts

- **Units:** the actual amount (10,000 EUR, 20 ounces of gold). TradingView Paper Trading shows units.
- **Lots:** a standard package. Forex: 1 standard lot = 100,000 units; 0.1 = mini lot; 0.01 = micro lot. MT5 shows lots.
- **Gold (XAUUSD):** often 1 lot = 100 ounces — **but brokers differ**. Always check your broker's contract size (the app lets you edit it).
- **Indices / futures:** contracts or points; the money value of 1 point depends on the instrument.

Example: 0.10 lot EURUSD = 10,000 units. A 1-pip move (0.0001) = $1.

## 5. Realized vs unrealized (floating) P&L

- **Realized P&L:** the result of a **closed** trade. It is final.
- **Unrealized / floating P&L:** the changing result of an **open** trade.

## 6. Balance, equity, margin

- **Balance** = starting money + all realized P&L (closed trades only).
- **Equity** = balance + floating P&L of open trades.
- **Margin** = money the broker locks to keep your positions open. **Free margin** = equity − margin.
- **Leverage** lets you open a position bigger than your money (1:100 means $1,000 controls $100,000). It makes both profits and losses bigger.
- **Margin level** = equity ÷ margin × 100%. If it falls too low you get a **margin call**, and at the **stop-out** level the broker closes positions for you.

Why it matters for this app: trade-history files contain closed trades, so the app knows your **balance** curve, but not the lowest **equity** during open trades. That is why funded checks say "can't confirm from file" when a firm measures equity.

## 7. Netting vs hedging accounts (MT5)

- **Hedging:** you can hold a buy and a sell on the same symbol at the same time; each is a separate position.
- **Netting:** only one position per symbol; a sell reduces or reverses your buy.

The same trading can look different in the history file depending on the mode. The app rebuilds positions "flat to flat" for fills and reads MT5's Positions table for MT5.

## 8. Gross vs net P&L

- **Gross P&L** = result from price movement only.
- **Net P&L** = gross − commission − swap − fees. (Spread is already inside the fill prices.)

Example: gross +$100, commission $7, swap $2 → net **+$91**.

## 9. Wins, losses, breakevens

A trade that ends at $0.30 after costs is not really a "win". The app uses a **breakeven tolerance** (default $1, change it in Settings): |net| below the tolerance counts as **breakeven**, so win rate is not inflated by tiny results.

## 10. Deposits, withdrawals, bonuses, payouts

These change the balance but are **not trading results**. If they were counted as profit, your returns would look wrong. The importers skip them (you will see "rows were not trades" in the preview).

## 11. EA / bot and copy trades

Trades opened by an Expert Advisor (identified by a "magic number") or by a copy-trading service should be analysed separately from your manual trades — otherwise you cannot know whether **you** follow your rules. Many prop firms also have EA and copy-trading rules.

## 12. Three kinds of data

| Level | Example | What it is good for |
|---|---|---|
| **Execution / deal** | each fill, partial close | exact costs, scaling behaviour |
| **Trade / position** | one row per closed position | win rate, R, expectancy |
| **Account** | balance history, deposits | drawdown, returns |

---

### Quick self-check / Khud ko check karein
1. You buy 0.20 lot EURUSD at 1.1000 and close at 1.0980. Gross result? → (1.0980 − 1.1000) × 20,000 = **−$40**.
2. Gross +$60, commission $4, swap −$1 (a credit). Net? → 60 − 4 + 1 = **+$57**.
3. Balance $10,000, an open trade is −$300. Equity? → **$9,700**.
