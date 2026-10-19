import type { FundedRuleField, FundedRuleSet, Trade } from "@/domain/types";
import { RULE_WARNING_REMAINING_SHARE } from "@/config/thresholds";
import { d, type Dec, ZERO } from "./decimal";
import { byCloseTime } from "./metrics";
import { tradingDayKey } from "./time";
import { tradeNet } from "./trade";

/**
 * Honesty states for every funded-rule check (Master Prompt, Phase 4).
 * NOT_YET_MET is used for objectives (profit target, minimum days) that are simply not reached yet.
 */
export type RuleState =
  | "VERIFIED_COMPLIANT"
  | "CONFIRMED_VIOLATION"
  | "POTENTIAL_RISK_WARNING"
  | "UNVERIFIABLE_FROM_CSV"
  | "RULE_UNCONFIRMED"
  | "NOT_YET_MET";

export interface RuleCheck {
  rule: "PROFIT_TARGET" | "DAILY_LOSS" | "MAX_LOSS" | "MIN_DAYS" | "CONSISTENCY";
  state: RuleState;
  /** Extra facts for the UI, all already calculated. */
  limit: Dec | null;
  used: Dec | null;
  remaining: Dec | null;
  /** 0..1 progress or usage, for meters. */
  ratio: Dec | null;
  /** When a violation happened: the trading day key. */
  violationDay: string | null;
  notes: string[];
}

export interface FundedEvaluation {
  checks: RuleCheck[];
  balance: Dec;
  profit: Dec;
  todayKey: string;
  todayStartBalance: Dec;
  dailyFloorToday: Dec | null;
  maxFloorNow: Dec | null;
  /** Money that can still be lost today before the closer of the two limits is hit (closed-trade view). */
  roomToday: Dec | null;
  lifecycle: "IN_PROGRESS" | "PASSED" | "BREACHED";
  tradingDays: number;
}

const pctOf = (pct: string, base: Dec) => d(pct).div(100).times(base);

function fieldUnconfirmed(set: FundedRuleSet, field: FundedRuleField): boolean {
  if (!set.confirmedAt) return true;
  const st = set.fieldStatus[field];
  return st === "AMBIGUOUS" || st === "MISSING";
}

/**
 * Evaluates a confirmed funded-account rule set against closed trades.
 * All checks use CLOSED trades only. A violation found in closed trades is certain;
 * "compliant" is certain only when the firm measures the rule on balance (not floating equity).
 */
export function evaluateFunded(set: FundedRuleSet, trades: Trade[], now: Date = new Date()): FundedEvaluation {
  const r = set.rules;
  const start = d(r.startingBalance);
  const sorted = byCloseTime(trades);
  const pnlOf = (t: Trade) => (r.costsIncluded ? tradeNet(t) : d(t.grossPnl));
  const resetTz = r.dailyLoss?.resetTimezone ?? "UTC";
  const resetHour = r.dailyLoss?.resetHour ?? 0;
  const dayOf = (iso: string) => tradingDayKey(new Date(iso), resetTz, resetHour);

  // Walk through trades once, recording per-day start balance and running lows.
  type Day = { key: string; startBalance: Dec; endBalance: Dec; low: Dec; profit: Dec; opened: boolean };
  const days: Day[] = [];
  let balance = start;
  for (const t of sorted) {
    const key = dayOf(t.closeTime);
    let day = days[days.length - 1];
    if (!day || day.key !== key) {
      day = { key, startBalance: balance, endBalance: balance, low: balance, profit: ZERO, opened: true };
      days.push(day);
    }
    balance = balance.plus(pnlOf(t));
    day.endBalance = balance;
    day.profit = day.profit.plus(pnlOf(t));
    if (balance.lt(day.low)) day.low = balance;
  }
  const profit = balance.minus(start);
  const todayKey = dayOf(now.toISOString());
  const lastDay = days[days.length - 1];
  const todayStartBalance = lastDay && lastDay.key === todayKey ? lastDay.startBalance : balance;

  const checks: RuleCheck[] = [];
  let breached = false;

  // ---------- Daily loss ----------
  let dailyFloorToday: Dec | null = null;
  if (r.dailyLoss) {
    const dl = r.dailyLoss;
    const limitFor = (dayStart: Dec) => pctOf(dl.pct, dl.base === "INITIAL_BALANCE" ? start : dayStart);
    let violationDay: string | null = null;
    for (const day of days) {
      const floor = day.startBalance.minus(limitFor(day.startBalance));
      if (day.low.lte(floor)) {
        violationDay = day.key;
        break;
      }
    }
    const limitToday = limitFor(todayStartBalance);
    dailyFloorToday = todayStartBalance.minus(limitToday);
    const usedToday = lastDay && lastDay.key === todayKey ? Dec0(todayStartBalance.minus(lastDay.low)) : ZERO;
    const remaining = limitToday.minus(usedToday);
    const notes: string[] = [];
    if (dl.measuredOn === "EQUITY") notes.push("EQUITY_NOT_IN_FILE");
    const state = stateFor(set, "dailyLoss", violationDay !== null, remaining, limitToday, dl.measuredOn === "EQUITY");
    if (violationDay) breached = true;
    checks.push({
      rule: "DAILY_LOSS",
      state,
      limit: limitToday,
      used: usedToday,
      remaining,
      ratio: limitToday.gt(0) ? usedToday.div(limitToday) : null,
      violationDay,
      notes,
    });
  }

  // ---------- Max loss ----------
  let maxFloorNow: Dec | null = null;
  if (r.maxLoss) {
    const ml = r.maxLoss;
    const limit = pctOf(ml.pct, start);
    let floor = start.minus(limit);
    let eodPeak = start;
    let peak = start;
    let violationDay: string | null = null;
    let running = start;
    let currentDay: string | null = null;
    for (const t of sorted) {
      const key = dayOf(t.closeTime);
      if (ml.type === "EOD_TRAILING" && currentDay !== null && key !== currentDay) {
        // A new day starts: the floor trails the highest END-OF-DAY balance so far.
        if (running.gt(eodPeak)) eodPeak = running;
        floor = trail(eodPeak, limit, start, ml.lockAtStartingBalance);
      }
      currentDay = key;
      running = running.plus(pnlOf(t));
      if (ml.type === "INTRADAY_TRAILING") {
        if (running.gt(peak)) peak = running;
        floor = trail(peak, limit, start, ml.lockAtStartingBalance);
      }
      if (!violationDay && running.lte(floor)) violationDay = key;
    }
    if (ml.type === "EOD_TRAILING" && currentDay !== null && currentDay !== todayKey) {
      if (running.gt(eodPeak)) eodPeak = running;
      floor = trail(eodPeak, limit, start, ml.lockAtStartingBalance);
    }
    maxFloorNow = floor;
    const remaining = balance.minus(floor);
    const unverifiable = ml.measuredOn === "EQUITY" || ml.type === "INTRADAY_TRAILING";
    const notes: string[] = [];
    if (ml.measuredOn === "EQUITY") notes.push("EQUITY_NOT_IN_FILE");
    if (ml.type === "INTRADAY_TRAILING") notes.push("INTRADAY_TRAILING_APPROX");
    if (violationDay) breached = true;
    checks.push({
      rule: "MAX_LOSS",
      state: stateFor(set, "maxLoss", violationDay !== null, remaining, limit, unverifiable),
      limit,
      used: Dec0(limit.minus(remaining)),
      remaining,
      ratio: limit.gt(0) ? Dec0(limit.minus(remaining)).div(limit) : null,
      violationDay,
      notes,
    });
  }

  // ---------- Profit target ----------
  let targetReached = r.profitTargetPct === null;
  const targetAmount = r.profitTargetPct !== null ? pctOf(r.profitTargetPct, start) : null;
  if (targetAmount) {
    targetReached = profit.gte(targetAmount);
    checks.push({
      rule: "PROFIT_TARGET",
      state: fieldUnconfirmed(set, "profitTargetPct") ? "RULE_UNCONFIRMED" : targetReached ? "VERIFIED_COMPLIANT" : "NOT_YET_MET",
      limit: targetAmount,
      used: Dec0(profit),
      remaining: Dec0(targetAmount.minus(profit)),
      ratio: targetAmount.gt(0) ? Dec0(profit).div(targetAmount) : null,
      violationDay: null,
      notes: [],
    });
  }

  // ---------- Minimum trading days ----------
  const openedDays = new Set(sorted.map((t) => dayOf(t.openTime ?? t.closeTime)));
  const tradingDays = openedDays.size;
  let daysMet = r.minTradingDays === null;
  if (r.minTradingDays !== null) {
    daysMet = tradingDays >= r.minTradingDays;
    const notes = sorted.some((t) => !t.openTime) ? ["OPEN_TIME_MISSING_USED_CLOSE"] : [];
    checks.push({
      rule: "MIN_DAYS",
      state: fieldUnconfirmed(set, "minTradingDays") ? "RULE_UNCONFIRMED" : daysMet ? "VERIFIED_COMPLIANT" : "NOT_YET_MET",
      limit: d(r.minTradingDays),
      used: d(tradingDays),
      remaining: d(Math.max(0, r.minTradingDays - tradingDays)),
      ratio: r.minTradingDays > 0 ? d(Math.min(tradingDays, r.minTradingDays)).div(r.minTradingDays) : null,
      violationDay: null,
      notes,
    });
  }

  // ---------- Consistency ----------
  let consistencyOk = r.consistency === null;
  if (r.consistency) {
    const c = r.consistency;
    const best = days.reduce((a, b) => (b.profit.gt(a) ? b.profit : a), ZERO);
    const base = c.base === "TOTAL_PROFIT" ? profit : targetAmount ?? ZERO;
    const share = base.gt(0) ? best.div(base) : null;
    const max = d(c.maxPct).div(100);
    consistencyOk = share !== null && share.lte(max);
    // Extra total profit needed so that best day ÷ total ≤ max.
    const needed = c.base === "TOTAL_PROFIT" && share !== null && share.gt(max) ? best.div(max).minus(profit) : ZERO;
    checks.push({
      rule: "CONSISTENCY",
      state: fieldUnconfirmed(set, "consistency")
        ? "RULE_UNCONFIRMED"
        : share === null
          ? "NOT_YET_MET"
          : share.gt(max)
            ? "POTENTIAL_RISK_WARNING"
            : "VERIFIED_COMPLIANT",
      limit: max,
      used: share,
      remaining: needed,
      ratio: share !== null && max.gt(0) ? share.div(max) : null,
      violationDay: null,
      notes: [best.toFixed(2)],
    });
  }

  const dailyRoom = dailyFloorToday ? balance.minus(dailyFloorToday) : null;
  const maxRoom = maxFloorNow ? balance.minus(maxFloorNow) : null;
  const roomToday =
    dailyRoom && maxRoom ? Dec0(dailyRoom.lt(maxRoom) ? dailyRoom : maxRoom) : dailyRoom ? Dec0(dailyRoom) : maxRoom ? Dec0(maxRoom) : null;

  return {
    checks,
    balance,
    profit,
    todayKey,
    todayStartBalance,
    dailyFloorToday,
    maxFloorNow,
    roomToday,
    lifecycle: breached ? "BREACHED" : targetReached && daysMet && consistencyOk && r.profitTargetPct !== null ? "PASSED" : "IN_PROGRESS",
    tradingDays,
  };
}

/** Never below zero. */
function Dec0(x: Dec): Dec {
  return x.lt(0) ? ZERO : x;
}

function trail(peak: Dec, limit: Dec, start: Dec, lock: boolean): Dec {
  const f = peak.minus(limit);
  return lock && f.gt(start) ? start : f;
}

function stateFor(
  set: FundedRuleSet,
  field: FundedRuleField,
  violated: boolean,
  remaining: Dec,
  limit: Dec,
  unverifiable: boolean,
): RuleState {
  if (fieldUnconfirmed(set, field)) return "RULE_UNCONFIRMED";
  if (violated) return "CONFIRMED_VIOLATION";
  if (limit.gt(0) && remaining.div(limit).lt(RULE_WARNING_REMAINING_SHARE)) return "POTENTIAL_RISK_WARNING";
  if (unverifiable) return "UNVERIFIABLE_FROM_CSV";
  return "VERIFIED_COMPLIANT";
}
