import type { DraftTrade } from "./types";

/**
 * Deterministic trade fingerprint for duplicate detection.
 * The same closed trade imported twice (same symbol, side, close time, quantity, exit price, gross P&L)
 * gets the same fingerprint, so it is skipped the second time.
 */
export function fingerprint(accountId: string, t: Pick<DraftTrade, "symbol" | "side" | "closeTime" | "quantity" | "exitPrice" | "grossPnl">): string {
  const key = [accountId, t.symbol.toUpperCase(), t.side, t.closeTime, normalize(t.quantity), normalize(t.exitPrice ?? ""), normalize(t.grossPnl)].join("|");
  return fnv1a64(key);
}

function normalize(n: string): string {
  if (!n) return "";
  const x = Number(n);
  return Number.isFinite(x) ? String(x) : n;
}

/** 64-bit FNV-1a hash as hex (two 32-bit halves). Fast, deterministic, not for security. */
export function fnv1a64(text: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0xcbf29ce4;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c ^ (h1 & 0xff), 0x01000193) >>> 0;
  }
  return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}
