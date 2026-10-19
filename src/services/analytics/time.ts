/**
 * Timezone helpers built only on the browser's Intl API (no extra library).
 * Daylight saving time is handled by Intl, so London and New York change clocks on their own dates.
 */

export interface ZonedParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number; // 0 = Sunday ... 6 = Saturday
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string): Intl.DateTimeFormat {
  let f = formatterCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "short",
    });
    formatterCache.set(timeZone, f);
  }
  return f;
}

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Returns the wall-clock date and time of an instant in a timezone (e.g., "Asia/Karachi"). */
export function zonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = formatter(timeZone).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    second: Number(get("second")),
    weekday: WEEKDAYS[get("weekday")] ?? 0,
  };
}

/** Minutes the timezone is ahead of UTC at that instant (Karachi = +300). */
export function offsetMinutes(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

/**
 * Converts a wall-clock time in a timezone into a real UTC instant.
 * Example: 2026-07-01 09:30 in America/New_York → 2026-07-01T13:30:00Z.
 * During the DST "gap" (a time that does not exist) the result moves forward, which is the usual convention.
 */
export function wallTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  let result = guess - offsetMinutes(new Date(guess), timeZone) * 60000;
  // A second pass fixes the case where the offset differs on the other side of a DST change.
  const second2 = guess - offsetMinutes(new Date(result), timeZone) * 60000;
  if (second2 !== result) result = second2;
  return new Date(result);
}

/** Calendar day key "YYYY-MM-DD" of an instant in a timezone. */
export function dayKey(date: Date, timeZone: string): string {
  const p = zonedParts(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/**
 * Trading-day key for a prop firm whose day resets at `resetHour` in `timeZone`.
 * Example: reset 17:00 New York → a trade at 18:00 New York belongs to the next day.
 */
export function tradingDayKey(date: Date, timeZone: string, resetHour: number): string {
  const p = zonedParts(date, timeZone);
  const base = new Date(Date.UTC(p.year, p.month - 1, p.day));
  if (resetHour > 0 && p.hour >= resetHour) base.setUTCDate(base.getUTCDate() + 1);
  return base.toISOString().slice(0, 10);
}

/**
 * Parses timestamps found in trading exports as wall-clock time in the declared timezone.
 * Accepts "2026-10-14 13:22:05", "2026.10.14 13:22:05", "2026-10-14T13:22", and ISO strings with an offset or "Z".
 * Returns null when the text cannot be read.
 */
export function parseExportTime(text: string, timeZone: string): Date | null {
  const t = text.trim();
  if (!t) return null;
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(t) && t.includes("T")) {
    const date = new Date(t);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const m = /^(\d{4})[-./](\d{1,2})[-./](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(t);
  if (!m) return null;
  const [, y, mo, da, h = "0", mi = "0", se = "0"] = m;
  const year = Number(y);
  const month = Number(mo);
  const day = Number(da);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return wallTimeToUtc(year, month, day, Number(h), Number(mi), Number(se), timeZone);
}

/** Timezones offered in import and settings forms. */
export const COMMON_TIMEZONES = [
  "Asia/Karachi",
  "UTC",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Athens",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Kolkata",
  "America/New_York",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const;

/** Broker server time is often a fixed "GMT+2 in winter / GMT+3 in summer" (New York close at midnight). */
export const BROKER_SERVER_TZ_NOTE =
  "Many MT5 brokers use GMT+2 in winter and GMT+3 in summer. Europe/Athens follows the same clock changes.";
