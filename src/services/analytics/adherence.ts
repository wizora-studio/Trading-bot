import type { Trade } from "@/domain/types";
import { type CoreMetrics, computeMetrics } from "./metrics";

export type AdherenceGroup = "FOLLOWED" | "BROKE" | "UNANSWERED";

/**
 * Did the trader follow all checklist rules of the assigned strategy on this trade?
 * FOLLOWED: every rule ticked. BROKE: at least one rule answered "no". UNANSWERED: checklist not filled.
 */
export function adherenceOf(t: Trade, ruleIds: string[]): AdherenceGroup {
  if (!ruleIds.length) return "UNANSWERED";
  const answers = ruleIds.map((id) => t.checklist[id]);
  if (answers.some((a) => a === false)) return "BROKE";
  if (answers.every((a) => a === true)) return "FOLLOWED";
  return "UNANSWERED";
}

/** Adherence % of one trade: ticked rules ÷ checklist rules. */
export function adherencePct(t: Trade, ruleIds: string[]): number | null {
  if (!ruleIds.length) return null;
  return ruleIds.filter((id) => t.checklist[id] === true).length / ruleIds.length;
}

export interface AdherenceSplit {
  followed: { trades: Trade[]; metrics: CoreMetrics };
  broke: { trades: Trade[]; metrics: CoreMetrics };
  unanswered: number;
  /** Average adherence % across answered trades. */
  avgAdherence: number | null;
  /** Per-rule: results when the rule was ticked vs. not ticked. */
  perRule: { ruleId: string; yes: CoreMetrics; no: CoreMetrics }[];
}

/** "Followed all rules" vs "broke one or more rules" for a strategy (Module E7). */
export function adherenceSplit(trades: Trade[], ruleIds: string[], opts: { breakevenTolerance: string }): AdherenceSplit {
  const followed = trades.filter((t) => adherenceOf(t, ruleIds) === "FOLLOWED");
  const broke = trades.filter((t) => adherenceOf(t, ruleIds) === "BROKE");
  const pcts = trades.map((t) => adherencePct(t, ruleIds)).filter((p): p is number => p !== null && trades.length > 0);
  const answered = trades.filter((t) => ruleIds.some((id) => t.checklist[id] !== undefined));
  return {
    followed: { trades: followed, metrics: computeMetrics(followed, opts) },
    broke: { trades: broke, metrics: computeMetrics(broke, opts) },
    unanswered: trades.length - followed.length - broke.length,
    avgAdherence: answered.length ? pcts.reduce((a, b) => a + b, 0) / Math.max(pcts.length, 1) : null,
    perRule: ruleIds.map((ruleId) => ({
      ruleId,
      yes: computeMetrics(trades.filter((t) => t.checklist[ruleId] === true), opts),
      no: computeMetrics(trades.filter((t) => t.checklist[ruleId] === false), opts),
    })),
  };
}
