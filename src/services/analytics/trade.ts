import type { SessionName, Trade } from "@/domain/types";
import { d, dOrNull, type Dec } from "./decimal";
import { getSpec, type InstrumentSpec, unitsOf } from "./instruments";
import { wallTimeToUtc, zonedParts } from "./time";

/** Total costs of a trade (commission + swap + fees), as a positive amount. */
export function tradeCosts(t: Trade): Dec {
  return d(t.commission).plus(d(t.swap)).plus(d(t.fees));
}

/** Net P&L = gross P&L − costs. */
export function tradeNet(t: Trade): Dec {
  return d(t.grossPnl).minus(tradeCosts(t));
}

/**
 * Planned risk in account money.
 * 1) The trader's own planned risk if entered.
 * 2) Otherwise |entry − stop-loss| × units, when the quote currency equals the account currency.
 * Returns null when it cannot be known (then R cannot be calculated).
 */
export function plannedRisk(t: Trade, accountCurrency = "USD", specOverrides?: Record<string, Partial<InstrumentSpec>>): Dec | null {
  const own = dOrNull(t.plannedRisk);
  if (own && own.gt(0)) return own;
  const entry = dOrNull(t.entryPrice);
  const stop = dOrNull(t.stopLoss);
  if (!entry || !stop || entry.eq(stop)) return null;
  const spec = getSpec(t.instrument, specOverrides);
  if (spec && spec.quoteCurrency !== accountCurrency) return null;
  const units = unitsOf(d(t.quantity), t.quantityUnit, spec);
  if (!units) return null;
  return entry.minus(stop).abs().times(units);
}

/** Realized R-multiple = net P&L ÷ planned risk. Null when planned risk is unknown. */
export function tradeR(t: Trade, accountCurrency = "USD", specOverrides?: Record<string, Partial<InstrumentSpec>>): Dec | null {
  const risk = plannedRisk(t, accountCurrency, specOverrides);
  if (!risk || risk.lte(0)) return null;
  return tradeNet(t).div(risk);
}

/** Planned reward-to-risk from entry, stop-loss, and take-profit. Null if any is missing. */
export function plannedRR(t: Pick<Trade, "entryPrice" | "stopLoss" | "takeProfit">): Dec | null {
  const e = dOrNull(t.entryPrice);
  const sl = dOrNull(t.stopLoss);
  const tp = dOrNull(t.takeProfit);
  if (!e || !sl || !tp || e.eq(sl)) return null;
  return tp.minus(e).abs().div(e.minus(sl).abs());
}

/** Holding time in milliseconds, or null when the open time is missing. */
export function holdingMs(t: Trade): number | null {
  if (!t.openTime) return null;
  return new Date(t.closeTime).getTime() - new Date(t.openTime).getTime();
}

/**
 * Session definitions in each market's OWN timezone, so daylight saving is automatic.
 * Asian: 09:00–18:00 Tokyo (no DST). London: 08:00–17:00 London. New York: 08:00–17:00 New York.
 * When London and New York are both open, the trade is in the "OVERLAP" bucket.
 */
export const SESSIONS = {
  ASIAN: { timeZone: "Asia/Tokyo", start: 9, end: 18 },
  LONDON: { timeZone: "Europe/London", start: 8, end: 17 },
  NEW_YORK: { timeZone: "America/New_York", start: 8, end: 17 },
} as const;

function inWindow(date: Date, w: { timeZone: string; start: number; end: number }): boolean {
  const p = zonedParts(date, w.timeZone);
  if (p.weekday === 0 || p.weekday === 6) return false;
  const h = p.hour + p.minute / 60;
  return h >= w.start && h < w.end;
}

/** Which session an instant belongs to. Uses London and New York first, then Asian. */
export function sessionOf(date: Date): SessionName {
  const london = inWindow(date, SESSIONS.LONDON);
  const ny = inWindow(date, SESSIONS.NEW_YORK);
  if (london && ny) return "OVERLAP";
  if (london) return "LONDON";
  if (ny) return "NEW_YORK";
  if (inWindow(date, SESSIONS.ASIAN)) return "ASIAN";
  return "OFF_HOURS";
}

/** Session of a trade, using its open time (or close time when the open time is missing). */
export function tradeSession(t: Trade): SessionName {
  return sessionOf(new Date(t.openTime ?? t.closeTime));
}

/** Converts a session window to wall-clock hours in another timezone for a given date (for display). */
export function sessionHoursIn(
  session: keyof typeof SESSIONS,
  onDate: Date,
  displayTz: string,
): { start: string; end: string } {
  const w = SESSIONS[session];
  const p = zonedParts(onDate, w.timeZone);
  const fmt = (hour: number) => {
    const utc = wallTimeToUtc(p.year, p.month, p.day, hour, 0, 0, w.timeZone);
    const dp = zonedParts(utc, displayTz);
    return `${String(dp.hour).padStart(2, "0")}:${String(dp.minute).padStart(2, "0")}`;
  };
  return { start: fmt(w.start), end: fmt(w.end) };
}
