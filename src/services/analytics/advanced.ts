import type { Trade } from "@/domain/types";
import { d, Dec, sum, ZERO } from "./decimal";
import type { EquityPoint } from "./equity";
import { byCloseTime } from "./metrics";
import { dayKey } from "./time";
import { tradeNet } from "./trade";

type DecT = Dec;

/**
 * Advanced metrics (Phase 1, Module 4). Each returns null when the data cannot support it,
 * instead of a misleading number. See docs/handbook/04-performance-metrics.md.
 */

const mean = (xs: DecT[]) => sum(xs).div(xs.length);

/** Sample standard deviation (n − 1). Null for fewer than 2 values. */
export function sampleStd(xs: DecT[]): DecT | null {
  if (xs.length < 2) return null;
  const m = mean(xs);
  return sum(xs.map((x) => x.minus(m).pow(2)))
    .div(xs.length - 1)
    .sqrt();
}

/** System Quality Number = √n × mean R ÷ std R. Null when n < 2 or all R are equal. */
export function sqn(rs: DecT[]): DecT | null {
  const sd = sampleStd(rs);
  if (!sd || sd.isZero()) return null;
  return new Dec(rs.length).sqrt().times(mean(rs)).div(sd);
}

/** Sample skewness (adjusted Fisher–Pearson). Positive = a long tail of big winners. Null for n < 3. */
export function skewness(xs: DecT[]): DecT | null {
  const n = xs.length;
  if (n < 3) return null;
  const m = mean(xs);
  const m2 = sum(xs.map((x) => x.minus(m).pow(2))).div(n);
  if (m2.isZero()) return null;
  const m3 = sum(xs.map((x) => x.minus(m).pow(3))).div(n);
  const g1 = m3.div(m2.pow(1.5));
  return g1.times(new Dec(n * (n - 1)).sqrt()).div(n - 2);
}

/** Sample excess kurtosis. Above 0 = "fat tails" (more extreme results than a normal curve). Null for n < 4. */
export function excessKurtosis(xs: DecT[]): DecT | null {
  const n = xs.length;
  if (n < 4) return null;
  const m = mean(xs);
  const m2 = sum(xs.map((x) => x.minus(m).pow(2))).div(n);
  if (m2.isZero()) return null;
  const m4 = sum(xs.map((x) => x.minus(m).pow(4))).div(n);
  const g2 = m4.div(m2.pow(2)).minus(3);
  return g2
    .times(n + 1)
    .plus(6)
    .times(n - 1)
    .div((n - 2) * (n - 3));
}

/**
 * Ulcer Index: √(average of squared % drawdowns) over the closed-trade balance points.
 * It combines HOW DEEP and HOW LONG the account stayed below its peak. Null without trades.
 */
export function ulcerIndex(points: EquityPoint[]): DecT | null {
  const after = points.slice(1);
  if (!after.length) return null;
  let peak = points[0]!.balance;
  const sq: DecT[] = [];
  for (const p of after) {
    if (p.balance.gt(peak)) peak = p.balance;
    const pct = peak.gt(0) ? peak.minus(p.balance).div(peak).times(100) : ZERO;
    sq.push(pct.pow(2));
  }
  return mean(sq).sqrt();
}

/**
 * Daily returns: each trading day's net P&L ÷ the closed balance at the start of that day.
 * Only days with closed trades are included (flat days are 0% and would add little), so
 * annualized ratios are approximate. Needed because trade-by-trade returns must not be fed into Sharpe.
 */
export function dailyReturns(trades: Trade[], startingBalance: string, timeZone: string): DecT[] {
  let balance = d(startingBalance);
  const out: DecT[] = [];
  let currentKey: string | null = null;
  let dayStart = balance;
  let dayNet = ZERO;
  for (const t of byCloseTime(trades)) {
    const key = dayKey(new Date(t.closeTime), timeZone);
    if (key !== currentKey) {
      if (currentKey !== null && dayStart.gt(0)) out.push(dayNet.div(dayStart));
      currentKey = key;
      dayStart = balance;
      dayNet = ZERO;
    }
    const net = tradeNet(t);
    dayNet = dayNet.plus(net);
    balance = balance.plus(net);
  }
  if (currentKey !== null && dayStart.gt(0)) out.push(dayNet.div(dayStart));
  return out;
}

const SQRT_252 = new Dec(252).sqrt();

/** Annualized Sharpe ratio from daily returns (risk-free rate assumed 0, 252 trading days). Null for n < 2 or no variation. */
export function sharpe(daily: DecT[], riskFreeDaily: DecT = ZERO): DecT | null {
  const sd = sampleStd(daily);
  if (!sd || sd.isZero()) return null;
  return mean(daily).minus(riskFreeDaily).div(sd).times(SQRT_252);
}

/** Annualized Sortino ratio: like Sharpe but divides by downside deviation only. Null when there are no losing days. */
export function sortino(daily: DecT[]): DecT | null {
  if (daily.length < 2) return null;
  const downside = mean(daily.map((r) => (r.lt(0) ? r.pow(2) : ZERO))).sqrt();
  if (downside.isZero()) return null;
  return mean(daily).div(downside).times(SQRT_252);
}

/**
 * Calmar ratio = annualized return ÷ max drawdown % (of peak). Only meaningful over a long period,
 * so it returns null when the trades span fewer than `minDays` calendar days (default 90).
 */
export function calmar(points: EquityPoint[], maxDrawdownPctOfPeak: DecT | null, minDays = 90): DecT | null {
  const first = points[1]?.time;
  const last = points[points.length - 1]?.time;
  const start = points[0]?.balance;
  const end = points[points.length - 1]?.balance;
  if (!first || !last || !start || !end || !maxDrawdownPctOfPeak || maxDrawdownPctOfPeak.isZero() || start.lte(0) || end.lte(0)) return null;
  const days = (new Date(last).getTime() - new Date(first).getTime()) / 86400000;
  if (days < minDays) return null;
  const annual = end.div(start).pow(new Dec(365).div(days)).minus(1);
  return annual.div(maxDrawdownPctOfPeak);
}

/** Share of the period (first open → last close) when at least one trade was open. Null if open times are missing. */
export function timeInMarket(trades: Trade[]): DecT | null {
  const spans = trades
    .filter((t) => t.openTime)
    .map((t) => [new Date(t.openTime!).getTime(), new Date(t.closeTime).getTime()] as const)
    .sort((a, b) => a[0] - b[0]);
  if (!spans.length || spans.length < trades.length) return null;
  let covered = 0;
  let [curStart, curEnd] = spans[0]!;
  for (const [s, e] of spans.slice(1)) {
    if (s <= curEnd) curEnd = Math.max(curEnd, e);
    else {
      covered += curEnd - curStart;
      [curStart, curEnd] = [s, e];
    }
  }
  covered += curEnd - curStart;
  const total = Math.max(...spans.map((x) => x[1])) - spans[0]![0];
  return total > 0 ? d(covered).div(total) : null;
}
