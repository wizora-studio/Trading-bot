import type { SessionName, Trade } from "@/domain/types";
import { type CoreMetrics, computeMetrics } from "./metrics";
import { zonedParts } from "./time";
import { tradeSession } from "./trade";

export interface Segment<K extends string = string> {
  key: K;
  trades: Trade[];
  metrics: CoreMetrics;
}

type Opts = { breakevenTolerance: string; accountCurrency?: string };

/** Groups trades by any key and computes metrics per group. */
export function segmentBy<K extends string>(trades: Trade[], keyOf: (t: Trade) => K, opts: Opts, order?: K[]): Segment<K>[] {
  const groups = new Map<K, Trade[]>();
  for (const t of trades) {
    const k = keyOf(t);
    groups.set(k, [...(groups.get(k) ?? []), t]);
  }
  const keys = order ?? [...groups.keys()].sort();
  return keys.map((key) => {
    const list = groups.get(key) ?? [];
    return { key, trades: list, metrics: computeMetrics(list, opts) };
  });
}

export const SESSION_ORDER: SessionName[] = ["ASIAN", "LONDON", "OVERLAP", "NEW_YORK", "OFF_HOURS"];

/** Performance per trading session (DST-aware, by open time). */
export function bySession(trades: Trade[], opts: Opts) {
  return segmentBy(trades, tradeSession, opts, SESSION_ORDER);
}

/** Performance per weekday of the open (or close) time in the display timezone. 0 = Sunday. */
export function byWeekday(trades: Trade[], timeZone: string, opts: Opts) {
  return segmentBy(
    trades,
    (t) => String(zonedParts(new Date(t.openTime ?? t.closeTime), timeZone).weekday),
    opts,
    ["1", "2", "3", "4", "5", "6", "0"],
  ).filter((s) => s.trades.length > 0 || Number(s.key) % 6 !== 0);
}

/** Performance per hour of day (0–23) in the display timezone. */
export function byHour(trades: Trade[], timeZone: string, opts: Opts) {
  return segmentBy(
    trades,
    (t) => String(zonedParts(new Date(t.openTime ?? t.closeTime), timeZone).hour).padStart(2, "0"),
    opts,
  );
}

/** Long vs short. */
export function byDirection(trades: Trade[], opts: Opts) {
  return segmentBy(trades, (t) => t.side, opts, ["LONG", "SHORT"]);
}

/** Per instrument. */
export function byInstrument(trades: Trade[], opts: Opts) {
  return segmentBy(trades, (t) => t.instrument, opts);
}

/** Per calendar month "YYYY-MM" in the display timezone. */
export function byMonth(trades: Trade[], timeZone: string, opts: Opts) {
  return segmentBy(
    trades,
    (t) => {
      const p = zonedParts(new Date(t.closeTime), timeZone);
      return `${p.year}-${String(p.month).padStart(2, "0")}`;
    },
    opts,
  );
}
