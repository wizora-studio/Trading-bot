# Module 9 — How prop firms (funded accounts) work: honest education

Phase 1 of the Trading Analytics Handbook. Written in plain English.
Neutral and educational: this module does not recommend, rank or promote any firm, and it is not financial or legal advice. General patterns below come from how the industry commonly works; **no firm-specific number in this handbook is a current fact for you to rely on** — see Section 8.

---

## 1. The business model in one page

A **proprietary trading firm (prop firm)** that sells "funded accounts" usually works like this:

1. You pay a **challenge fee** (also called an evaluation fee) to attempt a trading test on a simulated account of a stated size (for example $10,000).
2. **Evaluation phase(s):** you must reach a **profit target** without breaking the **rules** (daily loss, maximum loss, minimum days, and so on). Many firms use one or two phases.
3. **Funded stage:** if you pass, you receive a funded account. Depending on the firm, this may be a simulated account that mirrors the market, or it may be linked to real trading by the firm; the terms say which.
4. **Profit split:** you receive an agreed share of the profit (for example 80%), the firm keeps the rest.
5. **Payouts:** you can request a withdrawal when the payout conditions are met.

How firms earn money: challenge fees from all participants, a share of the profits of funded traders, and (for some firms) other fees such as resets and add-ons. Public commentary often says that a large share of revenue comes from fees paid by people who do **not** pass; the real figures are not published in a verified way. Pass rates are not published in a standard, verified way; treat any pass-rate claim cautiously.

**Simple fee arithmetic** (checked in `riskMath.test.ts`): if a $100 challenge passes with probability 40% per attempt, the average spend before one pass is 100 ÷ 0.40 = **$250**; at 10% it is **$1,000**. And an 80% split on a $400 profit pays you $320.

*The honest takeaway:* a challenge is a paid test with a time-and-rules wall around it. Whether it is worth the fee depends on your realistic pass probability (Module 5, Section 8) and on the real payout terms — not on marketing.

## 2. Common rules and why firms use them

| Rule | What it usually means | Why a firm uses it |
|---|---|---|
| **Profit target** | A percentage of the starting balance you must earn to pass | Filters for traders who can make money, not only avoid losing |
| **Daily loss limit** | You may not lose more than X% in one day (from a stated base; may include floating P&L) | Stops a bad day from becoming a disaster |
| **Maximum loss (static)** | The account fails if balance/equity falls X% below the starting balance | Caps the firm's exposure |
| **Trailing drawdown** | The floor rises as your balance (or equity) rises, and never falls; it may lock at a level | Protects profits already made; much harder to trade than a static limit |
| **Consistency rule** | No single day (or trade) may be more than X% of total profit, or similar | Discourages one lucky day or a single huge bet |
| **Minimum trading days** | You must trade on at least N days | Discourages passing in one gamble |
| **Time limit / inactivity rule** | A maximum time, or a maximum time without trading | Keeps accounts active; clears dead accounts |
| **News rule** | Limits on trading (or holding) around major news | Slippage and spread spikes make execution unreliable |
| **Weekend rule** | Positions may need to be closed before the weekend | Gap risk when markets are closed |
| **EA / bot rules** | Some automation allowed, some banned (e.g. high-frequency, arbitrage) | Prevents exploiting platform quirks |
| **Copy-trading rule** | Often banned between accounts or from outside signals | Prevents buying many passes with one set of trades |
| **Lot / exposure limits** | Maximum position size or open risk | Limits concentration of risk |

The same word can mean different things at different firms. "Daily loss", for example, may be measured from the starting balance or from the day's starting equity, include floating P&L or not, and reset at different times. That is why the app asks you to **confirm every rule in plain words** before using it (Section 8).

## 3. Payouts, scaling and common reasons for trouble

- **Payout conditions** commonly include: a minimum number of trading days or profitable days; a minimum profit; a waiting period since the last payout; completed identity verification (KYC); and compliance with all trading rules, including the consistency rule. The consistency rule is frequently cited as a reason for delayed or reduced payouts; one public guide reports that firms set limits somewhere between about 25% and 50% for the largest day's share of profit, but **the exact numbers differ by firm and plan**.
- **Scaling plans** can increase account size after you hit targets over a period; they come with their own conditions.
- **Inactivity rules** can close an account that does not trade for a stated number of days. Check the exact days in the firm's terms.
- **Common reasons for breached accounts or denied payouts** in public reports: breaching the daily or maximum loss (sometimes by a brief floating dip); a trailing floor misunderstood; consistency-rule violation; holding through restricted news or weekends; trading-style rules such as "doubling lots after losses"; identity-verification mismatches; and platform or data issues. A **denial** (a rule is said to be broken) is different from a **delay** (verification or a payout cycle). Ask the firm, in writing, which rule applies.

Source quality warning: much public commentary on this topic comes from sellers of related tools, affiliate sites, or review pages with opposing accounts of the same dispute. Treat statistics such as "x% of denials are caused by y" as unverified.

## 4. Why rules differ and change

Rules differ between **firms**, between **plans or account sizes of the same firm**, between **phases** (evaluation vs funded), and sometimes between **platforms**. They also **change over time**: firms update programs, launch new plans and retire old ones. The version of the rules that applied when you bought your challenge may not be the version shown on the website today.

Consequences for you and for this app:
- Keep a copy (screenshot or saved text) of the rules **at the time you purchased**.
- The app stores rule sets as **versions** with the date you confirmed them, so an old result is still judged against the rules that applied then.

## 5. Platform migration risk

The platforms prop firms offer have changed in recent years. Public trade-press reports from 2024, for example, describe several firms moving traders away from MetaTrader (MT4/MT5) to alternatives such as Match-Trader, DXtrade, cTrader or TradeLocker after changes in the relationship between firms, brokers and the platform vendor; in some cases traders had to close positions before an account migration. Sources (2024; current line-ups must be checked on each firm's own pages):

- [Funding Pips back online with Match-Trader migration — Finance Magnates](https://www.financemagnates.com/forex/prop-trading-firm-funding-pips-back-online-with-match-trader-migration)
- [MyFundedFX cements DXtrade as MetaQuotes alternative for US traders — Finance Magnates](https://financemagnates.com/forex/myfundedfx-cements-dxtrade-as-metaquotes-alternative-for-us-traders/amp)
- [Goat Funded Trader adds cTrader — Finance Magnates](https://financemagnates.com/forex/prop-firm-goat-funded-trader-adds-ctrader-to-its-platform-lineup/amp)

Why it matters for analytics:
1. **Your history can be spread over several platforms.** One year of trading may sit in an MT5 report, a Match-Trader export and a TradingView paper account.
2. **Export formats differ**, and a migration may change symbol names, time zones, or how partial closes appear.
3. **A migration can reset or re-create the account**: balances, trade IDs and dates may not carry over cleanly.

In the app: create **one account per real account**, import each platform's file into the right account, and use "combined" only for comparison. Currently supported imports: TradingView (two formats), MT5 positions (CSV/HTML), the standard template, and any CSV with column mapping. Other platforms need an export converted to the standard template or mapped CSV. If a parser is missing, the app should say so rather than guess.

## 6. Warning signs when you read a firm's offer

These are questions, not accusations:
- Are the rules written in clear, complete sentences with numbers (not only marketing pages)?
- Is it clear whether the funded account is simulated or live, and how payouts are funded?
- Are there fees after the first purchase (resets, add-ons, platform fees)?
- Are payout conditions stated before you pay?
- Can you find the rules for **your exact plan and date**?
- Is the firm clear about its regulatory status? (Many are not regulated brokers.)

## 7. What the app does and does not do

It **does**: track your results against the rules **you confirmed**; show how much room is left; and say "unverifiable from CSV" when a rule needs data a file does not contain (for example floating P&L).
It **does not**: tell you which firm to use; guarantee a pass; verify a firm's current rules by itself; place trades; or tell you that following the rule board means the firm will pay.

## 8. The verification rule

**Every firm-specific rule must be verified from the firm's current official rules page and confirmed by you before the app uses it.**

The app's workflow enforces this:
1. Pick a preset (when one exists and is marked with a verification date and source) or type/paste the rules from the official page.
2. The app shows a Read-Back: each rule, its value, whether it was stated by you, a preset or a default, and its status (clear / assumed / ambiguous / missing).
3. You correct anything and then confirm. Only a confirmed rule set is used for the rule board, and it is versioned.
4. Anything still ambiguous or missing is shown as "rule unconfirmed" — never as "compliant".

Presets are examples dated at verification time. Re-verify before every new purchase, and again if the firm announces a program change.

## 9. Checklist before you buy a challenge

1. I read the rules page for my exact plan today, and saved a copy.
2. I can state every rule in my own words (and the app's Read-Back matches).
3. I know how daily loss and maximum loss are measured, and when the day resets.
4. I know the payout conditions, the consistency rule (if any) and the inactivity rule (if any).
5. I know the platform, and whether my history can be imported into the app.
6. I accept the fee as a cost that I may not get back, and I have a realistic idea of my pass probability.
