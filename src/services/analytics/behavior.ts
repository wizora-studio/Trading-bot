import type { Trade } from "@/domain/types";
import { type ConfidenceLevel, levelFromSize } from "./confidence";
import { d, type Dec, sum, ZERO } from "./decimal";
import { byCloseTime, outcomeOf } from "./metrics";
import { dayKey } from "./time";
import { plannedRR, tradeNet, tradeR } from "./trade";

/**
 * Observable behavior patterns (Phase 1, Module 8). Every function measures something that is visible in the
 * trade data. None of them claims to know why: the UI turns each result into
 * "Observed pattern → Quantitative evidence → Possible interpretation (a hypothesis) → Question for the journal".
 */

type Opts = { breakevenTolerance: string; timeZone: string; accountCurrency?: string };

const avg = (xs: Dec[]): Dec | null => (xs.length ? sum(xs).div(xs.length) : null);

export interface PatternBase {
  /** Number of trades the evidence is based on. */
  n: number;
  confidence: ConfidenceLevel;
}

// ---------- 1. size escalation after a loss ----------

export interface SizeAfterLoss extends PatternBase {
  /** Trades that followed a losing trade of the same instrument and size unit. */
  afterLoss: number;
  /** Of those, trades at least `factor` times bigger than the losing trade. */
  escalated: number;
  escalatedNetAvg: Dec | null;
  otherNetAvg: Dec | null;
  /** Longest run of escalations in a row, each right after a loss (2 or more looks like doubling-up). */
  longestChain: number;
}

export function sizeAfterLoss(trades: Trade[], opts: Opts, factor = 1.5): SizeAfterLoss {
  const sorted = byCloseTime(trades);
  const tol = d(opts.breakevenTolerance);
  let afterLoss = 0;
  const esc: Dec[] = [];
  const other: Dec[] = [];
  let chain = 0;
  let longest = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1] as Trade;
    const cur = sorted[i] as Trade;
    const comparable = prev.instrument === cur.instrument && prev.quantityUnit === cur.quantityUnit && d(prev.quantity).gt(0);
    if (!comparable || outcomeOf(tradeNet(prev), tol) !== "LOSS") {
      chain = 0;
      continue;
    }
    afterLoss += 1;
    if (d(cur.quantity).gte(d(prev.quantity).times(factor))) {
      esc.push(tradeNet(cur));
      chain += 1;
      longest = Math.max(longest, chain);
    } else {
      other.push(tradeNet(cur));
      chain = 0;
    }
  }
  return { n: afterLoss, confidence: levelFromSize(afterLoss), afterLoss, escalated: esc.length, escalatedNetAvg: avg(esc), otherNetAvg: avg(other), longestChain: longest };
}

// ---------- 2. trading on red days ----------

export interface RedDays extends PatternBase {
  redDays: number;
  greenDays: number;
  avgTradesRedDay: Dec | null;
  avgTradesGreenDay: Dec | null;
  /** Trades opened when the day's closed result was already down by `downPct` of the day-start balance. Needs open times. */
  openedWhileDown: number;
  openedWhileDownNet: Dec;
  /** Trades without an open time cannot be placed in the day's timeline. */
  unplaceable: number;
}

export function redDays(trades: Trade[], startingBalance: string, opts: Opts, downPct = 1): RedDays {
  const sorted = byCloseTime(trades);
  const byDay = new Map<string, Trade[]>();
  for (const t of sorted) {
    const k = dayKey(new Date(t.closeTime), opts.timeZone);
    byDay.set(k, [...(byDay.get(k) ?? []), t]);
  }
  let balance = d(startingBalance);
  const redCounts: number[] = [];
  const greenCounts: number[] = [];
  let whileDown = 0;
  let whileDownNet = ZERO;
  let unplaceable = 0;
  for (const day of [...byDay.keys()].sort()) {
    const ts = byDay.get(day) as Trade[];
    const dayStart = balance;
    const net = sum(ts.map(tradeNet));
    (net.lt(0) ? redCounts : greenCounts).push(ts.length);
    const limit = dayStart.times(downPct).div(100);
    for (const t of ts) {
      if (!t.openTime) {
        unplaceable += 1;
        continue;
      }
      const before = sum(ts.filter((o) => o.closeTime <= t.openTime!).map(tradeNet));
      if (before.lte(limit.neg()) && before.lt(0)) {
        whileDown += 1;
        whileDownNet = whileDownNet.plus(tradeNet(t));
      }
    }
    balance = balance.plus(net);
  }
  const mean = (xs: number[]) => (xs.length ? d(xs.reduce((a, b) => a + b, 0)).div(xs.length) : null);
  return {
    n: trades.length,
    confidence: levelFromSize(redCounts.length + greenCounts.length),
    redDays: redCounts.length,
    greenDays: greenCounts.length,
    avgTradesRedDay: mean(redCounts),
    avgTradesGreenDay: mean(greenCounts),
    openedWhileDown: whileDown,
    openedWhileDownNet: whileDownNet,
    unplaceable,
  };
}

// ---------- 3. exits versus the plan ----------

export interface ExitDiscipline extends PatternBase {
  winnersChecked: number;
  /** Winners that captured less than `shortShare` of the planned reward. */
  winnersCutShort: number;
  avgCaptureShare: Dec | null;
  losersChecked: number;
  /** Losers whose loss was bigger than `beyondR` times the planned risk (slippage and costs also cause this). */
  losersBeyondPlan: number;
  avgLossR: Dec | null;
}

export function exitDiscipline(trades: Trade[], opts: Opts, shortShare = 0.5, beyondR = 1.25): ExitDiscipline {
  const tol = d(opts.breakevenTolerance);
  const capture: Dec[] = [];
  let cut = 0;
  const lossRs: Dec[] = [];
  let beyond = 0;
  for (const t of trades) {
    const r = tradeR(t, opts.accountCurrency);
    if (!r) continue;
    const out = outcomeOf(tradeNet(t), tol);
    if (out === "WIN") {
      const rr = plannedRR(t);
      if (!rr || rr.lte(0)) continue;
      const share = r.div(rr);
      capture.push(share);
      if (share.lt(shortShare)) cut += 1;
    } else if (out === "LOSS") {
      lossRs.push(r);
      if (r.lte(d(beyondR).neg())) beyond += 1;
    }
  }
  const checked = capture.length + lossRs.length;
  return {
    n: checked,
    confidence: levelFromSize(checked),
    winnersChecked: capture.length,
    winnersCutShort: cut,
    avgCaptureShare: avg(capture),
    losersChecked: lossRs.length,
    losersBeyondPlan: beyond,
    avgLossR: avg(lossRs),
  };
}

// ---------- 4. weekend and news-window holding ----------

const DAY_MS = 86400000;

/** True when the holding period touches a Saturday (UTC). Brokers close for the weekend around Friday 22:00 UTC, so this is an approximation. */
export function heldOverWeekend(t: Trade): boolean | null {
  if (!t.openTime) return null;
  const a = new Date(t.openTime).getTime();
  const b = new Date(t.closeTime).getTime();
  if (b < a) return null;
  // start of the Saturday (UTC) that contains the open or follows it; the trade touches Saturday if it lasts until then
  const openDay = Math.floor(a / DAY_MS);
  const dow = (openDay + 4) % 7; // 1970-01-01 was a Thursday (4); Saturday = 6
  const firstSat = (openDay + ((6 - dow + 7) % 7)) * DAY_MS;
  return b >= firstSat;
}

export interface NewsWindow {
  label: string;
  start: string;
  end: string;
}

export interface Holding extends PatternBase {
  checked: number;
  held: number;
  heldNet: Dec;
  /** Trades without an open time. */
  unknown: number;
}

export function weekendHolding(trades: Trade[]): Holding {
  let held = 0;
  let net = ZERO;
  let unknown = 0;
  let checked = 0;
  for (const t of trades) {
    const h = heldOverWeekend(t);
    if (h === null) {
      unknown += 1;
      continue;
    }
    checked += 1;
    if (h) {
      held += 1;
      net = net.plus(tradeNet(t));
    }
  }
  return { n: checked, confidence: levelFromSize(checked), checked, held, heldNet: net, unknown };
}

/** Trades that were open at any moment inside a window the trader marked as restricted (news time). */
export function newsWindowHolding(trades: Trade[], windows: NewsWindow[]): Holding {
  let held = 0;
  let net = ZERO;
  let unknown = 0;
  let checked = 0;
  for (const t of trades) {
    if (!t.openTime) {
      unknown += 1;
      continue;
    }
    checked += 1;
    const a = t.openTime;
    const b = t.closeTime;
    if (windows.some((w) => a <= w.end && b >= w.start)) {
      held += 1;
      net = net.plus(tradeNet(t));
    }
  }
  return { n: checked, confidence: levelFromSize(checked), checked, held, heldNet: net, unknown };
}

// ---------- 5. results after streaks ----------

export interface AfterStreak extends PatternBase {
  streakLength: number;
  kind: "WIN" | "LOSS";
  /** Trades that came right after a run of at least `streakLength` wins (or losses). */
  following: number;
  followingNetAvg: Dec | null;
  /** Average result of every other trade, for comparison. */
  otherNetAvg: Dec | null;
  otherCount: number;
}

export function afterStreak(trades: Trade[], opts: Opts, kind: "WIN" | "LOSS", streakLength = 3): AfterStreak {
  const sorted = byCloseTime(trades);
  const tol = d(opts.breakevenTolerance);
  const outs = sorted.map((t) => outcomeOf(tradeNet(t), tol));
  const follow: Dec[] = [];
  const rest: Dec[] = [];
  let run = 0;
  for (let i = 0; i < sorted.length; i++) {
    const net = tradeNet(sorted[i] as Trade);
    if (run >= streakLength) follow.push(net);
    else rest.push(net);
    run = outs[i] === kind ? run + 1 : 0;
  }
  return {
    n: follow.length,
    confidence: levelFromSize(follow.length),
    streakLength,
    kind,
    following: follow.length,
    followingNetAvg: avg(follow),
    otherNetAvg: avg(rest),
    otherCount: rest.length,
  };
}
