import type { PersonalRules, Trade } from "@/domain/types";
import { d, type Dec, sum, ZERO } from "./decimal";
import { byCloseTime } from "./metrics";
import { dayKey } from "./time";
import { plannedRisk, plannedRR, tradeNet, tradeSession } from "./trade";

export type PersonalViolationKind =
  | "RISK_PER_TRADE"
  | "DAILY_LOSS"
  | "TRADES_PER_DAY"
  | "CONSECUTIVE_LOSSES"
  | "SESSION"
  | "INSTRUMENT"
  | "MIN_RR";

export interface PersonalViolation {
  kind: PersonalViolationKind;
  tradeId: string;
  day: string;
  detail: string;
}

export interface PersonalCompliance {
  violations: PersonalViolation[];
  /** Trades with at least one violation. */
  violatingTradeIds: Set<string>;
  /** Net P&L of trades that broke at least one rule. */
  costOfViolations: Dec;
  /** Net P&L you would have had without the rule-breaking trades. */
  netWithoutViolations: Dec;
  /** Trades the app could not check for a rule (e.g., risk unknown because the stop-loss is missing). */
  uncheckable: Record<"RISK_PER_TRADE" | "MIN_RR", number>;
  complianceRate: Dec | null;
}

/**
 * Scans closed trades against the trader's confirmed personal rules (Module F).
 * Balance for risk % is the closed balance before each trade.
 */
export function checkPersonalRules(
  rules: PersonalRules,
  trades: Trade[],
  opts: { startingBalance: string; timeZone: string; accountCurrency?: string },
): PersonalCompliance {
  const sorted = byCloseTime(trades);
  const violations: PersonalViolation[] = [];
  const uncheckable = { RISK_PER_TRADE: 0, MIN_RR: 0 };
  let balance = d(opts.startingBalance);
  const perDay = new Map<string, { count: number; startBalance: Dec; net: Dec; lossStreak: number; stopped: boolean }>();

  for (const t of sorted) {
    const day = dayKey(new Date(t.openTime ?? t.closeTime), opts.timeZone);
    const state = perDay.get(day) ?? { count: 0, startBalance: balance, net: ZERO, lossStreak: 0, stopped: false };
    const add = (kind: PersonalViolationKind, detail: string) => violations.push({ kind, tradeId: t.id, day, detail });

    if (rules.maxTradesPerDay !== null && state.count >= rules.maxTradesPerDay) {
      add("TRADES_PER_DAY", `${state.count + 1} > ${rules.maxTradesPerDay}`);
    }
    if (rules.maxDailyLossPct !== null) {
      const limit = state.startBalance.times(d(rules.maxDailyLossPct)).div(100);
      if (state.net.lte(limit.neg())) add("DAILY_LOSS", `${state.net.toFixed(2)}`);
    }
    if (rules.maxConsecutiveLosses !== null && state.lossStreak >= rules.maxConsecutiveLosses) {
      add("CONSECUTIVE_LOSSES", `${state.lossStreak}`);
    }
    if (rules.allowedSessions.length > 0) {
      const sess = tradeSession(t);
      if (!rules.allowedSessions.includes(sess)) add("SESSION", sess);
    }
    if (rules.allowedInstruments.length > 0 && !rules.allowedInstruments.includes(t.instrument)) {
      add("INSTRUMENT", t.instrument);
    }
    if (rules.maxRiskPerTradePct !== null) {
      const risk = plannedRisk(t, opts.accountCurrency);
      if (!risk) uncheckable.RISK_PER_TRADE += 1;
      else if (balance.gt(0)) {
        const pct = risk.div(balance).times(100);
        if (pct.gt(d(rules.maxRiskPerTradePct))) add("RISK_PER_TRADE", `${pct.toFixed(2)}%`);
      }
    }
    if (rules.minRiskReward !== null) {
      const rr = plannedRR(t);
      if (!rr) uncheckable.MIN_RR += 1;
      else if (rr.lt(d(rules.minRiskReward))) add("MIN_RR", rr.toFixed(2));
    }

    const net = tradeNet(t);
    balance = balance.plus(net);
    state.count += 1;
    state.net = state.net.plus(net);
    state.lossStreak = net.lt(0) ? state.lossStreak + 1 : 0;
    perDay.set(day, state);
  }

  const violatingTradeIds = new Set(violations.map((v) => v.tradeId));
  const bad = sorted.filter((t) => violatingTradeIds.has(t.id));
  const good = sorted.filter((t) => !violatingTradeIds.has(t.id));
  return {
    violations,
    violatingTradeIds,
    costOfViolations: sum(bad.map(tradeNet)),
    netWithoutViolations: sum(good.map(tradeNet)),
    uncheckable,
    complianceRate: sorted.length ? d(good.length).div(sorted.length) : null,
  };
}
