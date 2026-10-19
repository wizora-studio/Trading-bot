import type { FundedRuleField, FundedRules, RuleFieldStatus } from "@/domain/types";

/**
 * Deterministic (non-AI) draft parser for free-text funded rules, in English or Roman Urdu.
 * Example: "daily loss 5%, max loss 10% trailing, consistency 30%, minimum 3 trading days".
 * It only creates a DRAFT. Anything unclear is marked AMBIGUOUS or MISSING and becomes a question.
 * The trader must confirm the Read-Back before any rule is used (Module G).
 */
export interface RuleTextDraft {
  rules: Partial<FundedRules>;
  status: Partial<Record<FundedRuleField, RuleFieldStatus>>;
  /** Question codes for the guided-questions step (see i18n "q_*"). */
  questions: FundedRuleField[];
  /** Text pieces we recognized, for transparency in the Read-Back. */
  matched: string[];
}

const PCT = String.raw`(\d+(?:[.,]\d+)?)\s*(?:%|percent|fisad|feesad)`;

function pctAfter(text: string, keywords: string[]): string | null {
  for (const k of keywords) {
    const re = new RegExp(String.raw`${k}[^%\d]{0,30}?${PCT}`, "i");
    const m = re.exec(text);
    if (m?.[1]) return m[1].replace(",", ".");
    const reBefore = new RegExp(String.raw`${PCT}[^%\d]{0,20}?${k}`, "i");
    const m2 = reBefore.exec(text);
    if (m2?.[1]) return m2[1].replace(",", ".");
  }
  return null;
}

export function parseRuleText(input: string): RuleTextDraft {
  const text = input.replace(/\s+/g, " ").trim();
  const rules: Partial<FundedRules> = {};
  const status: Partial<Record<FundedRuleField, RuleFieldStatus>> = {};
  const matched: string[] = [];

  // Starting balance: "$10,000", "10k", "10000 account"
  const bal = /\$?\s?(\d{1,3}(?:[,\s]\d{3})+|\d+(?:\.\d+)?)\s*(k|K|thousand|hazar)?\s*(?:account|acc|balance|challenge|ka account)?/i.exec(
    text.match(/(?:\$\s?\d[\d,\s]*k?|\d+\s?k\b|\d{4,7}\s*(?:account|acc|balance|challenge))/i)?.[0] ?? "",
  );
  if (bal?.[1]) {
    const base = Number(bal[1].replace(/[,\s]/g, ""));
    const value = bal[2] ? base * 1000 : base;
    if (value >= 1000) {
      rules.startingBalance = String(value);
      status.startingBalance = "CLEAR";
      matched.push(`balance ${value}`);
    }
  }

  const target = pctAfter(text, ["profit target", "target", "hadaf", "profit"]);
  if (target) {
    rules.profitTargetPct = target;
    status.profitTargetPct = "CLEAR";
    matched.push(`target ${target}%`);
  }

  const daily = pctAfter(text, ["daily loss", "daily drawdown", "daily dd", "daily", "rozana loss", "rozana", "din ka loss"]);
  if (daily) {
    const fromPrior = /(prior|previous|yesterday|pichle din|kal ka|day start|starting balance of the day)/i.test(text);
    const fromInitial = /(initial|starting balance|shuru ke balance|initial balance)/i.test(text);
    const onBalance = /(balance based|on balance|closed balance)/i.test(text) && !/equity/i.test(text);
    rules.dailyLoss = {
      pct: daily,
      base: fromPrior ? "DAY_START_BALANCE" : "INITIAL_BALANCE",
      measuredOn: onBalance ? "BALANCE" : "EQUITY",
      resetTimezone: /\b(est|new york|ny)\b/i.test(text) ? "America/New_York" : /\b(cet|cest|prague|europe)\b/i.test(text) ? "Europe/Prague" : "UTC",
      resetHour: /\b5\s?pm\b|17:00/i.test(text) ? 17 : 0,
    };
    // How the daily limit is measured and when it resets is almost never fully written → ask.
    status.dailyLoss = fromPrior || fromInitial ? "ASSUMED" : "AMBIGUOUS";
    matched.push(`daily loss ${daily}%`);
  }

  const max = pctAfter(text, ["max loss", "maximum loss", "max drawdown", "max dd", "overall", "total loss", "kul loss", "maximum"]);
  if (max) {
    const trailing = /trail/i.test(text);
    const eod = /\b(eod|end of day|end-of-day)\b/i.test(text);
    const intraday = /intraday|real[- ]?time|high[- ]water/i.test(text);
    const isStatic = /\b(static|fixed|fix)\b/i.test(text);
    rules.maxLoss = {
      pct: max,
      type: trailing ? (intraday ? "INTRADAY_TRAILING" : "EOD_TRAILING") : "STATIC",
      measuredOn: "EQUITY",
      lockAtStartingBalance: /lock|stops? trailing|ruk jata/i.test(text),
    };
    status.maxLoss = trailing ? (eod || intraday ? "CLEAR" : "AMBIGUOUS") : isStatic ? "CLEAR" : "ASSUMED";
    matched.push(`max loss ${max}%${trailing ? " trailing" : ""}`);
  }

  const cons = pctAfter(text, ["consistency", "best day", "sab se acha din"]);
  if (cons) {
    rules.consistency = { maxPct: cons, base: /target/i.test(text.slice(text.toLowerCase().indexOf("consisten"))) ? "PROFIT_TARGET" : "TOTAL_PROFIT" };
    status.consistency = "AMBIGUOUS"; // firms define consistency differently; always confirm
    matched.push(`consistency ${cons}%`);
  } else if (/no consistency|consistency nahi|without consistency/i.test(text)) {
    rules.consistency = null;
    status.consistency = "CLEAR";
  }

  const days = /(?:min(?:imum)?|kam az kam|at least)?\s*(\d{1,2})\s*(?:trading\s*)?(?:days?|din)/i.exec(text);
  if (days?.[1]) {
    rules.minTradingDays = Number(days[1]);
    status.minTradingDays = "CLEAR";
    matched.push(`min days ${days[1]}`);
  }

  if (/news/i.test(text)) {
    rules.newsRule = (/[^.;,]*news[^.;,]*/i.exec(text)?.[0] ?? "").trim();
    status.newsRule = "CLEAR";
  }
  if (/weekend|hafta/i.test(text)) {
    rules.weekendRule = (/[^.;,]*(weekend|hafta)[^.;,]*/i.exec(text)?.[0] ?? "").trim();
    status.weekendRule = "CLEAR";
  }
  if (/\b(ea|expert advisor|bot)s?\b/i.test(text)) {
    rules.eaAllowed = /(no|not|nahi|prohibited|forbidden|banned)[^.]{0,20}\b(ea|bot|expert)|\b(ea|bot)s?\b[^.]{0,20}(not allowed|nahi|prohibited|forbidden|banned)/i.test(text)
      ? "NO"
      : "YES";
    status.eaAllowed = "ASSUMED";
  }
  if (/commission|swap/i.test(text)) {
    rules.costsIncluded = !/(not|excluding|without|nahi)[^.]{0,15}(commission|swap)/i.test(text);
    status.costsIncluded = "CLEAR";
  }

  const required: FundedRuleField[] = ["startingBalance", "profitTargetPct", "dailyLoss", "maxLoss", "minTradingDays", "consistency", "costsIncluded", "newsRule", "weekendRule", "eaAllowed"];
  for (const f of required) if (!status[f]) status[f] = "MISSING";
  const questions = required.filter((f) => status[f] === "MISSING" || status[f] === "AMBIGUOUS");
  return { rules, status, questions, matched };
}
