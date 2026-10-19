import type { Trade } from "@/domain/types";
import { d, type Dec, ZERO } from "./decimal";
import { byCloseTime } from "./metrics";
import { dayKey } from "./time";
import { tradeNet } from "./trade";

export interface EquityPoint {
  /** ISO time of the trade close, or null for the starting point. */
  time: string | null;
  balance: Dec;
  /** Money below the highest balance so far (0 or more). */
  drawdown: Dec;
}

export interface DrawdownStats {
  maxDrawdown: Dec;
  /** Max drawdown as a share of the peak it fell from (rolling-peak % used in quant finance). */
  maxDrawdownPctOfPeak: Dec | null;
  /** Max drawdown as a share of the starting balance (fixed-initial % used by prop firms). */
  maxDrawdownPctOfStart: Dec | null;
  /** Longest stretch below a previous peak, counted in closed trades. */
  longestDrawdownTrades: number;
  /** Longest stretch below a previous peak, in calendar days (null if never recovered and no time). */
  longestDrawdownDays: number | null;
  currentDrawdown: Dec;
  recoveryFactor: Dec | null;
}

/**
 * Closed-trade balance curve. This is NOT an intratrade equity curve:
 * floating P&L during open trades is not in trade-history files, so real equity drawdown can be larger.
 */
export function balanceCurve(trades: Trade[], startingBalance: string): EquityPoint[] {
  let balance = d(startingBalance);
  let peak = balance;
  const points: EquityPoint[] = [{ time: null, balance, drawdown: ZERO }];
  for (const t of byCloseTime(trades)) {
    balance = balance.plus(tradeNet(t));
    if (balance.gt(peak)) peak = balance;
    points.push({ time: t.closeTime, balance, drawdown: peak.minus(balance) });
  }
  return points;
}

/** Drawdown statistics from the closed-trade balance curve. */
export function drawdownStats(points: EquityPoint[], startingBalance: string): DrawdownStats {
  const start = d(startingBalance);
  let maxDD = ZERO;
  let maxDDPeak: Dec | null = null;
  let peak = points[0]?.balance ?? start;
  let peakTime: string | null = null;
  let runTrades = 0;
  let longestTrades = 0;
  let longestDays: number | null = null;
  for (const p of points) {
    if (p.balance.gte(peak)) {
      if (runTrades > 0 && peakTime && p.time) {
        const days = (new Date(p.time).getTime() - new Date(peakTime).getTime()) / 86400000;
        longestDays = Math.max(longestDays ?? 0, Math.round(days));
      }
      peak = p.balance;
      peakTime = p.time;
      runTrades = 0;
    } else {
      runTrades += 1;
      longestTrades = Math.max(longestTrades, runTrades);
    }
    if (p.drawdown.gt(maxDD)) {
      maxDD = p.drawdown;
      maxDDPeak = peak;
    }
  }
  const last = points[points.length - 1];
  const net = last ? last.balance.minus(start) : ZERO;
  return {
    maxDrawdown: maxDD,
    maxDrawdownPctOfPeak: maxDDPeak && maxDDPeak.gt(0) ? maxDD.div(maxDDPeak) : null,
    maxDrawdownPctOfStart: start.gt(0) ? maxDD.div(start) : null,
    longestDrawdownTrades: longestTrades,
    longestDrawdownDays: longestDays,
    currentDrawdown: last?.drawdown ?? ZERO,
    recoveryFactor: maxDD.gt(0) ? net.div(maxDD) : null,
  };
}

export interface DayBucket {
  day: string;
  net: Dec;
  count: number;
}

/**
 * Groups trades into calendar days by CLOSE time in the chosen timezone.
 * (Day bucketing rule from Phase 5: a trade belongs to the day it closed.)
 */
export function dailyPnl(trades: Trade[], timeZone: string): DayBucket[] {
  const map = new Map<string, DayBucket>();
  for (const t of byCloseTime(trades)) {
    const key = dayKey(new Date(t.closeTime), timeZone);
    const b = map.get(key) ?? { day: key, net: ZERO, count: 0 };
    b.net = b.net.plus(tradeNet(t));
    b.count += 1;
    map.set(key, b);
  }
  return [...map.values()].sort((a, b) => a.day.localeCompare(b.day));
}

/**
 * Best-day consistency %: highest single-day profit ÷ total net profit.
 * Null when total profit is zero or negative (the ratio has no meaning then).
 */
export function bestDayShare(days: DayBucket[]): { best: Dec; total: Dec; share: Dec | null } {
  const total = days.reduce((a, b) => a.plus(b.net), ZERO);
  const best = days.reduce((a, b) => (b.net.gt(a) ? b.net : a), ZERO);
  return { best, total, share: total.gt(0) ? best.div(total) : null };
}

export interface UnderwaterPeriod {
  /** Close time of the peak the balance fell from (null = the starting balance). */
  peakTime: string | null;
  /** Close time of the trade that reached a new high again, or null if still underwater. */
  recoveredTime: string | null;
  /** Deepest money drop below that peak. */
  depth: Dec;
  /** Closed trades taken while below the peak. */
  trades: number;
}

/**
 * Every stretch where the closed-trade balance stayed below a previous peak ("underwater").
 * A trade that only equals the old peak counts as recovery. Closed-trade data only.
 */
export function underwaterPeriods(points: EquityPoint[]): UnderwaterPeriod[] {
  const out: UnderwaterPeriod[] = [];
  let peak = points[0]?.balance ?? ZERO;
  let peakTime: string | null = null;
  let current: UnderwaterPeriod | null = null;
  for (const p of points.slice(1)) {
    if (p.balance.gte(peak)) {
      if (current) {
        current.recoveredTime = p.time;
        out.push(current);
        current = null;
      }
      peak = p.balance;
      peakTime = p.time;
    } else {
      current ??= { peakTime, recoveredTime: null, depth: ZERO, trades: 0 };
      current.trades += 1;
      if (p.drawdown.gt(current.depth)) current.depth = p.drawdown;
    }
  }
  if (current) out.push(current);
  return out;
}

/** Share of the peak you must gain to get back after losing `lossShare` (0.5 → 1, i.e. +100%). Null when the loss is 100% or more. */
export function gainToRecover(lossShare: string): Dec | null {
  const l = d(lossShare);
  if (l.gte(1) || l.lt(0)) return null;
  return d(1).div(d(1).minus(l)).minus(1);
}
