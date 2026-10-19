/**
 * Learn page content (from the Phase 1 Handbook, basic version). English.
 * Educational only; not financial advice.
 */
export interface Lesson {
  id: string;
  title: string;
  body: string;
}

export const LESSONS: Lesson[] = [
  {
    id: "trade",
    title: "1. What is a trade?",
    body: "A trade starts when you open a position and ends when you close it. Buy (long) means you profit if price goes up; sell (short) means you profit if price goes down. Entry price is where you opened, exit price is where you closed. Realized P&L is the result of a closed trade. Floating (unrealized) P&L is the changing result of a trade that is still open. Balance counts only closed trades; equity = balance + floating P&L.\n\nExample: you buy 0.10 lots of EURUSD at 1.0850 and close at 1.0870. That is 20 pips × $1 per pip (0.10 lot) = +$20 before costs.",
  },
  {
    id: "costs",
    title: "2. Trading costs: gross vs net",
    body: "Every trade has costs: the spread (gap between buy and sell price), commission (fee per lot), and swap (fee or credit for holding overnight). Gross P&L is before costs; net P&L = gross − costs. Many traders look profitable on gross numbers but lose money after costs. This app always shows net P&L first.",
  },
  {
    id: "r",
    title: "3. Risk and R-multiples",
    body: "Planned risk is the money you lose if your stop-loss is hit. One 'R' = that planned risk. If you risk $50 and make $100, the trade is +2R. If you lose $50, it is −1R. R lets you compare trades of different sizes fairly. The app needs your initial stop-loss (or planned risk) to calculate R; if the file has no stop-loss, add it in the trade drawer.",
  },
  {
    id: "expectancy",
    title: "4. Expectancy: why win rate alone misleads",
    body: "Expectancy = (win rate × average win) − (loss rate × average loss). It is your average result per trade over many trades. A 70% win rate can still lose money if losses are much bigger than wins. Breakeven win rate for a reward-to-risk ratio RRR is 1 ÷ (1 + RRR). Example: at 1:2 you need only 33.3% wins to break even (before costs).",
  },
  {
    id: "drawdown",
    title: "5. Drawdown: closed balance vs equity",
    body: "Drawdown is how far the account fell from its highest point. This app calculates it from CLOSED trades. During an open trade your equity can fall much lower, and most trade files do not contain that floating equity. That is why funded-rule checks say 'cannot be confirmed from the file' when a firm measures equity.",
  },
  {
    id: "prop",
    title: "6. Prop firm rules in simple words",
    body: "Daily loss limit: the most you may lose in one day (often 5%), counted from the day's starting balance or from the initial balance — the firm decides. Max loss: the most you may lose in total (often 10%). Static means the floor never moves; trailing means the floor moves up as your account makes new highs. Consistency rule: your best day may not be more than X% of total profit. Rules differ between firms and change over time — always check the official rules page.",
  },
  {
    id: "sessions",
    title: "7. Sessions and daylight saving (Pakistan time)",
    body: "Pakistan has no daylight saving, but London and New York do (on different dates). So the same New York 09:30 open is 18:30 in Pakistan in US summer and 19:30 in US winter. This app stores session times in each market's own timezone and converts them for you automatically.",
  },
  {
    id: "sample",
    title: "8. Small samples and confidence badges",
    body: "10 or 20 trades prove almost nothing — luck can easily explain them. Every number in this app shows how many trades it is based on and a confidence badge: Not enough data (< 10), Low (10–29), Moderate (30–99), High (100+). If the 95% range of your average result includes zero, we cannot even be sure your edge is positive.",
  },
];

/** Appendix A, Part D — reference data only (UNVERIFIED, never an automatic recommendation). */
export const CAPITAL_TIERS = [
  { tier: "Tier 1 · Micro retail ($100–$500)", risk: "1.0–2.0%", trades: "1 at a time", strategies: "S1, S3, S4, S5, S10", models: "R1 + R2" },
  { tier: "Tier 2 · Standard retail ($1,000–$10,000)", risk: "0.5–1.0%", trades: "2 uncorrelated", strategies: "S1–S18", models: "R1 + R2 + R5" },
  { tier: "Tier 3 · Prop challenge ($10k–$200k)", risk: "0.25–0.50%", trades: "1–2, max 1.5% daily risk", strategies: "S3, S4, S8, S9, S11, S12, S14", models: "R4 + R5" },
  { tier: "Tier 4 · Prop funded ($25k–$500k+)", risk: "0.25–0.75%", trades: "3 uncorrelated strategies", strategies: "S2, S7, S11, S12, S13, S15, S19", models: "R2 + R3 + R4" },
];
