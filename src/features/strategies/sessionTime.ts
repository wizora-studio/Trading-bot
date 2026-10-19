import { wallTimeToUtc, zonedParts } from "@/services/analytics/time";

const IANA = /^[A-Za-z]+\/[A-Za-z_]+$|^UTC$/;

/**
 * Converts a strategy session time ("09:30" in "America/New_York") to the user's timezone for a date.
 * Returns null when the stated timezone is not a real IANA zone (then we show it as stated).
 */
export function convertSessionTime(hhmm: string | null, fromTz: string | null, toTz: string, onDate = new Date()): string | null {
  if (!hhmm || !fromTz || !IANA.test(fromTz)) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  try {
    const p = zonedParts(onDate, fromTz);
    const utc = wallTimeToUtc(p.year, p.month, p.day, Number(m[1]), Number(m[2]), 0, fromTz);
    const q = zonedParts(utc, toTz);
    return `${String(q.hour).padStart(2, "0")}:${String(q.minute).padStart(2, "0")}`;
  } catch {
    return null;
  }
}

/** Is an instant inside a session window stated in its own timezone? (Trading Room "inside my session" indicator.) */
export function insideSession(now: Date, start: string | null, end: string | null, tz: string | null): boolean | null {
  if (!start || !end || !tz || !IANA.test(tz)) return null;
  const p = zonedParts(now, tz);
  const mins = p.hour * 60 + p.minute;
  const toMin = (s: string) => {
    const [h, mi] = s.split(":").map(Number);
    return (h ?? 0) * 60 + (mi ?? 0);
  };
  const a = toMin(start);
  const b = toMin(end);
  return a <= b ? mins >= a && mins < b : mins >= a || mins < b;
}
