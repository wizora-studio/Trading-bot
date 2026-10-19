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
