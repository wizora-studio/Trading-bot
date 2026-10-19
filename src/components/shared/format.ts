import Decimal from "decimal.js";
import type { Dec } from "@/services/analytics/decimal";

/**
 * The ONLY place where numbers are turned into text (Section 3C).
 * Rounding happens here, for display only, with ROUND_HALF_UP.
 */
export const MINUS = "−";

type Num = Dec | string | number | null | undefined;

function toDec(x: Num): Decimal | null {
  if (x === null || x === undefined || x === "") return null;
  try {
    return new Decimal(typeof x === "object" ? x.toString() : x);
  } catch {
    return null;
  }
}

function group(abs: Decimal, dp: number): string {
  const fixed = abs.toFixed(dp, Decimal.ROUND_HALF_UP);
  const [int = "0", frac] = fixed.split(".");
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac !== undefined ? `${withCommas}.${frac}` : withCommas;
}

const SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", PKR: "Rs ", JPY: "¥", AED: "AED ", SAR: "SAR ", INR: "₹" };

/** "+$1,234.50", "−$12.00", or "$0.00". Use sign=false for amounts that are not profits (limits, balances). */
export function formatMoney(x: Num, currency = "USD", opts: { sign?: boolean; dp?: number } = {}): string {
  const v = toDec(x);
  if (!v) return "–";
  const sym = SYMBOLS[currency] ?? `${currency} `;
  const body = sym + group(v.abs(), opts.dp ?? 2);
  if (opts.sign === false) return (v.isNegative() && !v.isZero() ? MINUS : "") + body;
  return (v.gt(0) ? "+" : v.lt(0) ? MINUS : "") + body;
}

/** Share (0.1234) → "12.3%". */
export function formatPct(x: Num, dp = 1, opts: { sign?: boolean } = {}): string {
  const v = toDec(x);
  if (!v) return "–";
  const p = v.times(100);
  const s = group(p.abs(), dp) + "%";
  if (opts.sign) return (p.gt(0) ? "+" : p.lt(0) ? MINUS : "") + s;
  return (p.lt(0) ? MINUS : "") + s;
}

/** Already-a-percent value ("5" → "5%"). */
export function formatPercentValue(x: Num, dp = 2): string {
  const v = toDec(x);
  if (!v) return "–";
  return (v.lt(0) ? MINUS : "") + group(v.abs(), dp).replace(/\.?0+$/, "") + "%";
}

/** R-multiple → "+1.25R". */
export function formatR(x: Num, dp = 2): string {
  const v = toDec(x);
  if (!v) return "–";
  return (v.gt(0) ? "+" : v.lt(0) ? MINUS : "") + group(v.abs(), dp) + "R";
}

/** Plain decimal with grouping, e.g. ratios "1.84". */
export function formatNumber(x: Num, dp = 2): string {
  const v = toDec(x);
  if (!v) return "–";
  return (v.lt(0) ? MINUS : "") + group(v.abs(), dp);
}

/** Price with the instrument's digits, no grouping changes beyond thousands. */
export function formatPrice(x: Num, digits = 5): string {
  const v = toDec(x);
  if (!v) return "–";
  return group(v.abs(), digits).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

export function signOf(x: Num): 1 | -1 | 0 {
  const v = toDec(x);
  if (!v || v.isZero()) return 0;
  return v.gt(0) ? 1 : -1;
}

/** Date/time in the user's timezone: "Oct 14, 13:05". */
export function formatDateTime(iso: string | null, timeZone: string, lang: "en" | "ru" = "en"): string {
  if (!iso) return "–";
  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "en-GB", { timeZone, month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
}

export function formatDate(iso: string, timeZone: string, lang: "en" | "ru" = "en"): string {
  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "en-GB", { timeZone, month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

/** "YYYY-MM-DD" day key → "Oct 14". */
export function formatDayKey(key: string, lang: "en" | "ru" = "en"): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "en-GB", { timeZone: "UTC", month: "short", day: "numeric" }).format(new Date(Date.UTC(y ?? 2000, (m ?? 1) - 1, d ?? 1)));
}

/** Milliseconds → "2h 15m". */
export function formatDuration(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return "–";
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 48) return `${h}h ${min % 60}m`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
}
