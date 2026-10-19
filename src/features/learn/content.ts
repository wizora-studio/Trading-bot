/**
 * Learn page content (from the Phase 1 Handbook, basic version). English + Roman Urdu.
 * Educational only; not financial advice.
 */
export interface Lesson {
  id: string;
  title: { en: string; ru: string };
  body: { en: string; ru: string };
}

export const LESSONS: Lesson[] = [
  {
    id: "trade",
    title: { en: "1. What is a trade?", ru: "1. Trade kya hoti hai?" },
    body: {
      en: "A trade starts when you open a position and ends when you close it. Buy (long) means you profit if price goes up; sell (short) means you profit if price goes down. Entry price is where you opened, exit price is where you closed. Realized P&L is the result of a closed trade. Floating (unrealized) P&L is the changing result of a trade that is still open. Balance counts only closed trades; equity = balance + floating P&L.\n\nExample: you buy 0.10 lots of EURUSD at 1.0850 and close at 1.0870. That is 20 pips × $1 per pip (0.10 lot) = +$20 before costs.",
      ru: "Trade tab shuru hoti hai jab aap position kholte hain, aur tab khatam hoti hai jab band karte hain. Buy (long) ka matlab: qeemat upar jaye to faida. Sell (short) ka matlab: qeemat neeche aaye to faida. Entry price woh qeemat hai jahan trade khuli, exit price jahan band hui. Band trade ka nateeja 'realized P&L' hai. Khuli trade ka badalta nateeja 'floating P&L' hai. Balance mein sirf band trades shamil hoti hain; equity = balance + floating P&L.\n\nMisaal: aap ne EURUSD 0.10 lot 1.0850 par kharida aur 1.0870 par band kiya. 20 pips × $1 fi pip = kharchon se pehle +$20.",
    },
  },
  {
    id: "costs",
    title: { en: "2. Trading costs: gross vs net", ru: "2. Trading ke kharche: gross aur net" },
    body: {
      en: "Every trade has costs: the spread (gap between buy and sell price), commission (fee per lot), and swap (fee or credit for holding overnight). Gross P&L is before costs; net P&L = gross − costs. Many traders look profitable on gross numbers but lose money after costs. This app always shows net P&L first.",
      ru: "Har trade ke kharche hote hain: spread (khareed aur farokht ki qeemat ka farq), commission (har lot ki fees) aur swap (raat bhar trade rakhne ki fees ya credit). Gross P&L kharchon se pehle ka nateeja hai; net P&L = gross − kharche. Bohat se traders gross mein munafa dikhate hain magar kharchon ke baad nuqsan mein hote hain. Yeh app hamesha pehle net P&L dikhati hai.",
    },
  },
  {
    id: "r",
    title: { en: "3. Risk and R-multiples", ru: "3. Risk aur R-multiple" },
    body: {
      en: "Planned risk is the money you lose if your stop-loss is hit. One 'R' = that planned risk. If you risk $50 and make $100, the trade is +2R. If you lose $50, it is −1R. R lets you compare trades of different sizes fairly. The app needs your initial stop-loss (or planned risk) to calculate R; if the file has no stop-loss, add it in the trade drawer.",
      ru: "Planned risk woh raqam hai jo stop-loss lagne par jaye gi. Ek 'R' = yehi planned risk. Agar aap ne $50 risk kiye aur $100 kamaye, to trade +2R hai. Agar $50 gaye to −1R. R se mukhtalif size ki trades ka insaaf se muqabla hota hai. R nikalne ke liye app ko shuru ka stop-loss chahiye; file mein na ho to trade drawer mein khud likh dein.",
    },
  },
  {
    id: "expectancy",
    title: { en: "4. Expectancy: why win rate alone misleads", ru: "4. Expectancy: sirf jeet ki sharah kyun dhoka deti hai" },
    body: {
      en: "Expectancy = (win rate × average win) − (loss rate × average loss). It is your average result per trade over many trades. A 70% win rate can still lose money if losses are much bigger than wins. Breakeven win rate for a reward-to-risk ratio RRR is 1 ÷ (1 + RRR). Example: at 1:2 you need only 33.3% wins to break even (before costs).",
      ru: "Expectancy = (jeet ki sharah × ausat jeet) − (haar ki sharah × ausat haar). Yeh bohat si trades ka ausat nateeja fi trade hai. 70% jeet ke bawajood nuqsan ho sakta hai agar haarne wali trades bohat bari hon. Kisi RRR ke liye barabar (breakeven) jeet ki sharah = 1 ÷ (1 + RRR). Misaal: 1:2 par sirf 33.3% jeet se barabar ho jate hain (kharchon se pehle).",
    },
  },
  {
    id: "drawdown",
    title: { en: "5. Drawdown: closed balance vs equity", ru: "5. Drawdown: band balance aur equity" },
    body: {
      en: "Drawdown is how far the account fell from its highest point. This app calculates it from CLOSED trades. During an open trade your equity can fall much lower, and most trade files do not contain that floating equity. That is why funded-rule checks say 'cannot be confirmed from the file' when a firm measures equity.",
      ru: "Drawdown yeh hai ke account apni sab se oonchi satah se kitna neeche gira. Yeh app ise BAND trades se nikalti hai. Khuli trade ke dauran equity is se bohat neeche ja sakti hai, aur aksar files mein woh floating equity nahi hoti. Isi liye jab firm equity par rule lagati hai to app kehti hai 'file se confirm nahi ho sakta'.",
    },
  },
  {
    id: "prop",
    title: { en: "6. Prop firm rules in simple words", ru: "6. Prop firm ke rules aasan alfaaz mein" },
    body: {
      en: "Daily loss limit: the most you may lose in one day (often 5%), counted from the day's starting balance or from the initial balance — the firm decides. Max loss: the most you may lose in total (often 10%). Static means the floor never moves; trailing means the floor moves up as your account makes new highs. Consistency rule: your best day may not be more than X% of total profit. Rules differ between firms and change over time — always check the official rules page.",
      ru: "Daily loss limit: ek din mein zyada se zyada nuqsan (aksar 5%), din ke shuru ke balance ya account ke shuru ke balance se — yeh firm tay karti hai. Max loss: kul zyada se zyada nuqsan (aksar 10%). Static ka matlab had kabhi nahi hilti; trailing ka matlab account ke naye oonche level ke saath had bhi upar chalti hai. Consistency rule: sab se acha din kul munafe ka X% se zyada na ho. Har firm ke rules alag hain aur badalte rehte hain — hamesha official page check karein.",
    },
  },
  {
    id: "sessions",
    title: { en: "7. Sessions and daylight saving (Pakistan time)", ru: "7. Sessions aur daylight saving (Pakistan ka waqt)" },
    body: {
      en: "Pakistan has no daylight saving, but London and New York do (on different dates). So the same New York 09:30 open is 18:30 in Pakistan in US summer and 19:30 in US winter. This app stores session times in each market's own timezone and converts them for you automatically.",
      ru: "Pakistan mein daylight saving nahi hota, magar London aur New York mein hota hai (alag tareekhon par). Is liye New York ka 09:30 open US garmiyon mein Pakistan ke 18:30 aur US sardiyon mein 19:30 hota hai. Yeh app session ka waqt har market ke apne timezone mein rakhti hai aur khud aap ke waqt mein badal deti hai.",
    },
  },
  {
    id: "sample",
    title: { en: "8. Small samples and confidence badges", ru: "8. Kam trades aur bharose ke badge" },
    body: {
      en: "10 or 20 trades prove almost nothing — luck can easily explain them. Every number in this app shows how many trades it is based on and a confidence badge: Not enough data (< 10), Low (10–29), Moderate (30–99), High (100+). If the 95% range of your average result includes zero, we cannot even be sure your edge is positive.",
      ru: "10 ya 20 trades se taqreeban kuch sabit nahi hota — yeh qismat bhi ho sakti hai. Is app ka har number batata hai ke woh kitni trades par mabni hai, aur bharose ka badge dikhata hai: Kafi data nahi (< 10), Kam (10–29), Darmiyana (30–99), Zyada (100+). Agar aap ke ausat nateeje ki 95% range mein zero aata hai, to yeh bhi pakka nahi ke aap ka edge musbat hai.",
    },
  },
];

/** Appendix A, Part D — reference data only (UNVERIFIED, never an automatic recommendation). */
export const CAPITAL_TIERS = [
  { tier: "Tier 1 · Micro retail ($100–$500)", risk: "1.0–2.0%", trades: "1 at a time", strategies: "S1, S3, S4, S5, S10", models: "R1 + R2" },
  { tier: "Tier 2 · Standard retail ($1,000–$10,000)", risk: "0.5–1.0%", trades: "2 uncorrelated", strategies: "S1–S18", models: "R1 + R2 + R5" },
  { tier: "Tier 3 · Prop challenge ($10k–$200k)", risk: "0.25–0.50%", trades: "1–2, max 1.5% daily risk", strategies: "S3, S4, S8, S9, S11, S12, S14", models: "R4 + R5" },
  { tier: "Tier 4 · Prop funded ($25k–$500k+)", risk: "0.25–0.75%", trades: "3 uncorrelated strategies", strategies: "S2, S7, S11, S12, S13, S15, S19", models: "R2 + R3 + R4" },
];
