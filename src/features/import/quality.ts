import type { DataQuality, DataQualityIssue } from "@/domain/types";
import type { DraftTrade, RowError } from "./types";

/**
 * Data Quality Score per import (Module B / Phase 1 Module 10).
 * Starts at 100 and loses points for every kind of missing or broken data, weighted by how much
 * it hurts the metrics. Shown next to every affected number.
 */
const WEIGHTS: Record<string, number> = {
  MISSING_STOP_LOSS: 25, // R-multiples, risk %, and R:R rules cannot be calculated
  MISSING_OPEN_TIME: 15, // holding time and the session by entry time are unknown
  MISSING_COMMISSION: 10, // net P&L may be too high
  MISSING_PRICES: 10,
  UNKNOWN_SYMBOL: 10, // contract size and pip value are unknown
  ROW_ERRORS: 30,
};

export function scoreQuality(trades: DraftTrade[], errors: RowError[], extra: { missingCommissionColumn?: boolean } = {}): DataQuality {
  const n = Math.max(trades.length, 1);
  const issues: DataQualityIssue[] = [];
  const add = (code: string, count: number, severity: DataQualityIssue["severity"] = "WARNING") => {
    if (count > 0) issues.push({ code, count, severity });
  };
  add("MISSING_STOP_LOSS", trades.filter((t) => !t.stopLoss && !t.plannedRisk).length);
  add("MISSING_OPEN_TIME", trades.filter((t) => !t.openTime).length);
  add("MISSING_PRICES", trades.filter((t) => !t.entryPrice || !t.exitPrice).length, "INFO");
  add("UNKNOWN_SYMBOL", trades.filter((t) => t.notes.includes("[unknown-symbol]")).length);
  if (extra.missingCommissionColumn) add("MISSING_COMMISSION", trades.length);
  add("ROW_ERRORS", errors.length, "ERROR");

  let score = 100;
  for (const i of issues) {
    const share = i.code === "ROW_ERRORS" ? Math.min(1, i.count / (n + i.count)) : i.count / n;
    score -= (WEIGHTS[i.code] ?? 5) * share;
  }
  return { score: Math.max(0, Math.round(score)), issues };
}

/**
 * Data Quality Score for everything stored in an account (same weights as one import).
 * Costs are treated as missing when EVERY trade has zero commission, swap and fees (a single zero is normal).
 */
export function scoreAccountQuality(trades: DraftTrade[]): DataQuality {
  const allCostsZero = trades.length >= 5 && trades.every((t) => Number(t.commission) === 0 && Number(t.swap) === 0 && Number(t.fees) === 0);
  return scoreQuality(trades, [], { missingCommissionColumn: allCostsZero });
}
