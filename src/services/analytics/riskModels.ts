import type { Trade } from "@/domain/types";
import { d, type Dec, ZERO } from "./decimal";
import { byCloseTime } from "./metrics";
import { dayKey } from "./time";
import { tradeNet } from "./trade";

/**
 * Risk Model R4 — Drawdown Ladder and Daily Circuit Breaker (Appendix A, Part C).
 * The founder's document used the EQUITY high-water mark; trade files only give closed balance,
 * so this uses the CLOSED-balance high-water mark and says so in the UI.
 */
export interface LadderParams {
  baselineRiskPct: string; // e.g. "0.5"
  cautionAtPct: string; // e.g. "3"  (drawdown from HWM)
  criticalAtPct: string; // e.g. "5"
  cautionRiskPct: string; // e.g. "0.25"
  criticalRiskPct: string; // e.g. "0.125"
  breakerLosses: string; // e.g. "2"
  breakerDailyLossPct: string; // e.g. "1.5"
}

export const DEFAULT_LADDER: LadderParams = {
  baselineRiskPct: "0.5",
  cautionAtPct: "3",
  criticalAtPct: "5",
  cautionRiskPct: "0.25",
  criticalRiskPct: "0.125",
  breakerLosses: "2",
  breakerDailyLossPct: "1.5",
};

export interface LadderState {
  state: "NORMAL" | "CAUTION" | "CRITICAL";
  drawdownPct: Dec;
  highWaterMark: Dec;
  balance: Dec;
  riskPctNow: Dec;
  breakerTripped: boolean;
  todayLosses: number;
  todayNetPct: Dec;
}

export function ladderState(trades: Trade[], startingBalance: string, p: LadderParams, timeZone: string, now = new Date()): LadderState {
  let balance = d(startingBalance);
  let hwm = balance;
  const today = dayKey(now, timeZone);
  let todayLosses = 0;
  let todayStart: Dec | null = null;
  for (const t of byCloseTime(trades)) {
    const isToday = dayKey(new Date(t.closeTime), timeZone) === today;
    if (isToday && todayStart === null) todayStart = balance;
    const net = tradeNet(t);
    balance = balance.plus(net);
    if (balance.gt(hwm)) hwm = balance;
    if (isToday && net.lt(0)) todayLosses += 1;
  }
  const ddPct = hwm.gt(0) ? hwm.minus(balance).div(hwm).times(100) : ZERO;
  const state = ddPct.gte(d(p.criticalAtPct)) ? "CRITICAL" : ddPct.gte(d(p.cautionAtPct)) ? "CAUTION" : "NORMAL";
  const riskPctNow = d(state === "CRITICAL" ? p.criticalRiskPct : state === "CAUTION" ? p.cautionRiskPct : p.baselineRiskPct);
  const start = todayStart ?? balance;
  const todayNetPct = start.gt(0) ? balance.minus(start).div(start).times(100) : ZERO;
  const breakerTripped = todayLosses >= Number(p.breakerLosses) || todayNetPct.lte(d(p.breakerDailyLossPct).neg());
  return { state, drawdownPct: ddPct, highWaterMark: hwm, balance, riskPctNow, breakerTripped, todayLosses, todayNetPct };
}

/**
 * Risk Model R5 — minimum R:R gate.
 * Rejects a discretionary plan if (distance to first target ÷ stop distance) < minimum (document default 1.8).
 */
export function rrGate(entry: string, stop: string, firstTarget: string, minRR: string): { rr: Dec | null; pass: boolean } {
  const e = d(entry);
  const risk = e.minus(d(stop)).abs();
  if (risk.isZero()) return { rr: null, pass: false };
  const rr = d(firstTarget).minus(e).abs().div(risk);
  return { rr, pass: rr.gte(d(minRR)) };
}

/**
 * Risk Model R5 — correlation cap.
 * Instruments that share a currency (or are both USD-quoted metals/indices) are treated as correlated.
 * Total open risk in a correlated group must stay ≤ cap × single-trade risk.
 */
export function correlatedWith(a: string, b: string): boolean {
  if (a === b) return true;
  const ccy = (s: string) => (s.length === 6 ? [s.slice(0, 3), s.slice(3)] : [s]);
  const ca = ccy(a);
  const cb = ccy(b);
  if (ca.some((x) => cb.includes(x) && x.length === 3)) return true;
  const indices = ["US30", "NAS100", "SPX500", "GER40"];
  const crypto = ["BTCUSD", "ETHUSD"];
  return (indices.includes(a) && indices.includes(b)) || (crypto.includes(a) && crypto.includes(b));
}

export function correlationCheck(
  planned: { instrument: string; riskAmount: string },
  open: { instrument: string; riskAmount: string; atBreakeven: boolean }[],
  singleTradeRisk: string,
  capMultiple = "1.5",
): { groupRisk: Dec; cap: Dec; pass: boolean; correlated: string[] } {
  const related = open.filter((o) => correlatedWith(o.instrument, planned.instrument) && !o.atBreakeven);
  const groupRisk = related.reduce((a, o) => a.plus(d(o.riskAmount)), d(planned.riskAmount));
  const cap = d(singleTradeRisk).times(d(capMultiple));
  return { groupRisk, cap, pass: groupRisk.lte(cap), correlated: related.map((r) => r.instrument) };
}
