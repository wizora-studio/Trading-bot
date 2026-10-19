# Module 3 — Risk management / Risk ka intezam

Phase 1 of the Trading Analytics Handbook. English first, then Roman Urdu for each idea.
Educational only — not financial advice. Formulas are implemented in `src/services/analytics/` (position size, funded rules, risk models, `riskMath.ts`) and the numbers in the examples are checked by tests.

---

## 1. Planned risk

**Planned risk** = the money you lose if your stop-loss is hit (before slippage and costs).
Written as money ($50) and as a percent of the account (0.5% of $10,000).

*Roman Urdu:* Planned risk woh raqam hai jo stop-loss lagne par jaye gi. Paison mein ($50) aur account ke fisad mein (0.5%) likhte hain.

## 2. Stop-loss and take-profit

- **Stop-loss (SL):** closes the trade at a worse price to cap the loss.
- **Take-profit (TP):** closes the trade at a better price to lock the gain.
- A stop is a plan, not a guarantee: in a fast market or over a price gap the fill can be worse (see section 14).

*Roman Urdu:* Stop-loss nuqsan ko hadd mein rakhta hai, take-profit munafa pakka karta hai. Tez market ya gap mein asal fill plan se bura ho sakta hai.

## 3. Risk on balance or on equity?

Risk % can be taken on **balance** (closed trades only) or **equity** (balance + floating P&L). Pick one rule and keep it. This app sizes from the **closed balance**, because equity is not in trade files. On a funded account, also check the **remaining buffer** (section 8).

*Roman Urdu:* Risk % balance par ho sakta hai ya equity par. Ek tareeqa chunein aur us par qaim rahein. Yeh app band balance istemal karti hai.

## 4. Reward-to-risk (RRR) and R-multiples

- **RRR** (planned) = distance to target ÷ distance to stop. Entry 100, stop 99, target 102 → RRR = 2.
- **R-multiple** (realized) = net result ÷ planned risk.
  Risk $50, net result +$100 → **+2R**. Net −$50 → **−1R**. Net −$65 (slippage + costs) → **−1.3R**.

Planned R and realized R differ whenever costs, slippage or early exits happen — that gap is itself useful information.

*Roman Urdu:* RRR plan ka hai (target ÷ stop). R-multiple asal nateeja ÷ planned risk hai: $50 risk par +$100 matlab +2R. Plan aur asal R ka farq khud ek ahem maloomat hai.

## 5. Position sizing (fixed-fractional, Risk Model R1)

**Lots = risk money ÷ (stop in pips × pip value per lot)**, rounded **down** to the lot step.
Example: $10,000 account, risk 0.5% = $50; EURUSD stop 20 pips; $10 per pip per lot → 50 ÷ (20 × 10) = **0.25 lot**.
Rule: never trade a fixed lot size; the size always comes from your risk % and the stop distance. More examples (gold, USDJPY, US30) are in Module 2.

*Roman Urdu:* Lots = risk ÷ (stop ke pips × pip value). Size hamesha risk % aur stop ke faasle se aati hai, kabhi fixed lot nahi.

## 6. Daily loss limits

A **daily loss limit** stops you for the day (or fails a prop account). Firms differ in two things:
1. **What the limit is measured from:** the initial balance, or each day's starting balance (or the higher of balance/equity).
2. **When the day resets:** e.g. 00:00 Prague time, or 17:00 New York. The app lets you set both.

Worked example (from the app's Read-Back): on a $10,000 account, yesterday's closing balance $10,300, limit 5% of the day's starting balance → floor = 10,300 − 515 = **$9,785**.

*Roman Urdu:* Rozana loss ki had din ke liye rukne (ya prop account fail hone) ki had hai. Firms do cheezon mein alag hoti hain: had kis balance se naapi jati hai, aur din kab reset hota hai.

## 7. Maximum loss: static vs trailing

| Type | Floor on a $10,000 account, limit $1,000 | Moves? |
|---|---|---|
| **Static** | $9,000 always | Never |
| **EOD trailing** | highest **end-of-day** balance − $1,000 | Up, once per day |
| **Intraday trailing** | highest **balance/equity at any moment** − $1,000 | Up, immediately |
| **Trailing that locks** | as above, but stops at the starting balance | Up, until it reaches $10,000 |

Example: you reach $10,600 at the end of a day. EOD trailing floor → $9,600. If it "locks at the starting balance", it can never rise above $10,000.

*Roman Urdu:* Static had kabhi nahi hilti. Trailing had account ke naye oonche level ke saath upar jati hai (din ke aakhir ke hisaab se, ya har lamhe). Kuch firms mein yeh shuru ke balance par ruk jati hai.

## 8. Size risk against the remaining buffer, not the account size

A $10,000 funded account with a 10% max loss only has **$1,000** to lose.
If you have already lost $600, the buffer is **$400**. A "1% of nominal" risk ($100) is now **25% of what is left**. Four such losses in a row end the account.

Rule of thumb for planning: *risk per trade ≤ a small share of the remaining buffer*, not just of the nominal balance. The app's "How much room do I have?" calculator caps your lot size at the room left today.

*Roman Urdu:* $10,000 ke funded account mein asal buffer sirf $1,000 hai. $600 ja chuke hon to $400 bacha hai; nominal ka 1% ($100) ab baqi buffer ka 25% hai. Risk hamesha baqi buffer ko dekh kar tay karein.

## 9. Losing streaks are normal

If each trade loses with probability 50%, five losses in a row has probability 0.5⁵ = **3.1%** for one specific sequence, but across many trades it becomes likely:

| Trades | P(at least one run of 5 losses), 50% loss rate | 8 in a row |
|---|---|---|
| 20 | 25% | 3% |
| 100 | **81%** | 17% |

With a 40% loss rate (a 60% win rate) the same run of 5 over 100 trades still has a **46%** chance. (The table values are computed exactly, not simulated.)

So plan your risk for a streak you *will* meet, not the one you hope for.

*Roman Urdu:* Lagatar nuqsan normal hain. 50% haar par 100 trades mein kam az kam ek baar lagatar 5 nuqsan ka imkaan 81% hai. Risk aise tay karein ke yeh streak bardasht ho sake.

## 10. Risk of ruin and the "gambler's ruin" idea

**Risk of ruin** = the chance of hitting your loss limit before your goal. Simple, exact example with a fair coin-flip strategy (win 1R or lose 1R, 50/50) and a risk of 1% per trade:
- Max loss limit = 10 units (10%), profit target = 8 units (8%).
- Chance of reaching +8 before −10 = 10 ÷ (10 + 8) = **55.6%**, even with zero edge.
- A strategy with a *positive* edge does better; a *negative* edge does worse. Bigger risk per trade makes the walk shorter and more random: with 2.5% risk the limit is only 4 trades away.

That is why the ratio between profit target and max loss, and your risk per trade, matter as much as the strategy.

*Roman Urdu:* Risk of ruin yeh hai ke aap target se pehle apni had na chhoo lein. 1% risk, 50/50 sikke jaisi strategy par +8 se pehle −10 chhoone ka imkaan 10 ÷ 18 = 55.6% hai. Risk badhane se ek had tak pohanchna aur bhi qareeb ho jata hai.

## 11. Kelly criterion (theory only)

**Full Kelly f\* = W − (1 − W) ÷ R**, where W = win rate and R = average win ÷ average loss. It is the size that maximizes long-run growth *if you know W and R exactly*.

Example: W = 50%, R = 2.5 → f\* = 0.50 − 0.50 ÷ 2.5 = **0.30 (30%)**. Quarter-Kelly = 7.5% (the research document then caps it at 1–2%).

**Why it is dangerous:** W and R are *estimates*. If the true win rate is 40%, f\* = 0.40 − 0.60 ÷ 2.5 = 16%; at 30% it is only 2%; below that it is negative (no edge, do not trade). Small samples make W very uncertain, so full Kelly can wildly over-bet. This app shows Kelly as information only, never to set your risk automatically.

*Roman Urdu:* Kelly sirf nazariya hai: f* = W − (1 − W) ÷ R. Yeh tabhi theek hai jab W aur R bilkul durust maloom hon. Kam trades par yeh andaze ghalat ho sakte hain, is liye app Kelly sirf maloomat ke taur par dikhati hai.

## 12. Correlated exposure

Two trades that move together are *one bigger bet*. Examples: long EURUSD + long GBPUSD (both short USD), long NAS100 + long SPX500, BTC + ETH. Risk Model R5's rule: total risk on a correlated group should not exceed **1.5 × one trade's risk**, unless the first trade's stop is already at breakeven.

Example: two trades risking $50 each on EURUSD and GBPUSD = $100 > 1.5 × $50 = $75 → the Trade Planner shows **Fail**.

*Roman Urdu:* Jo trades saath chalti hain woh asal mein ek bari shart hain. EURUSD aur GBPUSD dono long = dono mein USD kamzor hone ki shart. Kul risk ek trade ke risk ke 1.5 guna se zyada nahi hona chahiye.

## 13. Copying the same trade onto several funded accounts

Five accounts copying one trade have **one** risk, multiplied by five: one bad trade can breach all of them at once.

*Roman Urdu:* Ek hi trade 5 accounts par copy ho to ek bura trade paanchon ko ek saath tabah kar sakta hai.

## 14. Planned loss vs actual loss

A planned −1R can become −1.5R or worse because of:
- **Slippage / gaps:** news or weekends move price past your stop.
- **No stop-loss** (or a stop that you moved).
- **Costs:** commission and swap add to the loss.
- **Partial fills** at a worse price.

In the app, "Needs stop-loss" appears on trades without a recorded initial stop; R can't be calculated for them, and risk-per-trade rules can't be checked.

*Roman Urdu:* Planned −1R asal mein −1.5R ya is se zyada ban sakta hai: slippage, gap, stop na hona ya hata dena, kharche, aur adhoori fills ki wajah se.

---

### Data the app needs / App ko kya chahiye
Initial stop-loss or planned risk per trade · contract size and pip value · account currency conversion · the firm's rules (limit type, measured-from, reset time).

### Quick self-check / Khud ko check karein
1. Risk $80, net result −$104 after slippage and costs. R? → −104 ÷ 80 = **−1.3R**.
2. Max loss limit $2,000 on a $20,000 account; you have lost $1,500. A risk of 1% of nominal = $200 is what share of the remaining buffer? → 200 ÷ 500 = **40%**.
3. W = 45%, R = 2. Full Kelly? → 0.45 − 0.55 ÷ 2 = 0.45 − 0.275 = **17.5%** (theory only; the true W is uncertain).
4. Risk $40 on EURUSD, stop 16 pips, $10 per pip per lot. Lots? → 40 ÷ (16 × 10) = **0.25 lot**.
