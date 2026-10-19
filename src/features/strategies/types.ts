import type { StrategySpec } from "./schema";

export type StrategyStatus = "DRAFT" | "UNCONFIRMED" | "CONFIRMED";
export type RuleDecision = "CONFIRMED" | "CHECKLIST_ONLY" | "REJECTED";

/** A saved strategy. Every edit or confirmation creates a new version; old versions are kept. */
export interface StrategyRecord {
  id: string;
  origin: "SEED" | "IMPORT" | "MANUAL";
  seedKey: string | null;
  spec: StrategySpec;
  /** Full pasted Gemini text, stored only as reference. */
  rawText: string;
  status: StrategyStatus;
  version: number;
  createdAt: string;
  confirmedAt: string | null;
  /** Trader's decision per rule id. INFERRED / NOT_STATED rules stay undecided until set. */
  ruleDecisions: Record<string, RuleDecision>;
  /** Trader's answers to the spec's open ambiguities, by ambiguity id. */
  ambiguityAnswers: Record<string, string>;
  history: { version: number; at: string; status: StrategyStatus; note: string }[];
}

/** Rules that make up the per-trade checklist: everything except rejected rules. */
export function checklistRules(s: StrategyRecord) {
  return s.spec.rules.filter((r) => s.ruleDecisions[r.id] !== "REJECTED");
}

/** Share of rules rated OBJECTIVE (shown separately from the source's own rating). */
export function objectivityShare(s: StrategyRecord): number {
  const rules = s.spec.rules;
  return rules.length ? rules.filter((r) => r.objectivity === "OBJECTIVE").length / rules.length : 0;
}

/** How many rules the app can check automatically from trade history alone. */
export function autoCheckable(s: StrategyRecord): number {
  return s.spec.rules.filter((r) => r.measurability === "YES").length;
}

/** Rules that still need a decision before the strategy can be confirmed (INFERRED / NOT_STATED). */
export function undecidedRules(s: StrategyRecord) {
  return s.spec.rules.filter((r) => (r.source === "INFERRED" || r.source === "NOT_STATED") && !s.ruleDecisions[r.id]);
}

/** Ambiguities with no answer yet. */
export function openAmbiguities(s: StrategyRecord) {
  return s.spec.ambiguities.filter((a) => !(s.ambiguityAnswers[a.id] ?? "").trim());
}
