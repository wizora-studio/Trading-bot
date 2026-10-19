import { z } from "zod";

/**
 * Strategy Spec schema. Must match docs/prompts/STRATEGY_EXTRACTION_PROMPT.md exactly.
 * - strategy-spec/1.0: Gemini output from YouTube videos.
 * - strategy-spec/1.1: adds `source.documents` for strategies taken from documents (Appendix A seeds).
 * If you change this file, update the prompt file and bump the version (Operating Discipline 14d).
 */

const Source = z.enum(["STATED", "SHOWN_ONLY", "INFERRED", "NOT_STATED"]);
const str = z.string().default("");
const nstr = z.string().nullable().default(null);
const nnum = z.union([z.number(), z.string()]).nullable().default(null);
const strArr = z.array(z.string()).default([]);

export const RuleSchema = z.object({
  id: z.string().min(1),
  category: z.enum(["CONTEXT", "SETUP", "ENTRY", "STOP_LOSS", "TAKE_PROFIT", "MANAGEMENT", "RISK", "TIME", "NEWS", "INVALIDATION", "OTHER"]),
  direction: z.enum(["LONG", "SHORT", "BOTH"]),
  setupName: str,
  text: z.string().min(1),
  parameters: z.record(z.string(), z.unknown()).default({}),
  timestamp: str,
  source: Source,
  objectivity: z.enum(["OBJECTIVE", "PARTLY_SUBJECTIVE", "SUBJECTIVE"]),
  measurableVersionSuggestion: nstr,
  measurability: z.enum(["YES", "PARTIAL", "NO"]),
  requiredData: strArr,
  checklistQuestion: str,
});

const VideoSchema = z.object({
  url: str,
  title: str,
  channel: str,
  durationText: str,
  uploadDate: nstr,
  accessMode: z.enum(["FULL", "AUDIO_OR_TRANSCRIPT_ONLY"]),
  coverageNotes: str,
});

const DocumentSchema = z.object({
  title: z.string(),
  author: str,
  date: nstr,
  notes: str,
});

const base = {
  generatedBy: str,
  strategy: z.object({
    name: z.string().min(1),
    aliases: strArr,
    summary: str,
    style: z.enum(["SCALPING", "INTRADAY", "SWING", "POSITION", "OTHER"]),
    methodology: strArr,
    instruments: strArr,
    timeframes: z.object({ bias: strArr, setup: strArr, entry: strArr }).default({ bias: [], setup: [], entry: [] }),
    typicalHoldingTime: nstr,
    typicalTradesPerDay: nnum,
  }),
  terms: z
    .array(z.object({ term: z.string(), definition: str, identificationSteps: strArr, timestamp: str, source: z.enum(["STATED", "SHOWN_ONLY", "INFERRED"]) }))
    .default([]),
  indicators: z
    .array(z.object({ name: z.string(), settings: z.record(z.string(), z.unknown()).default({}), purpose: str, timestamp: str, source: Source }))
    .default([]),
  sessions: z
    .array(
      z.object({
        name: z.string(),
        startTime: nstr,
        endTime: nstr,
        timezoneAsStated: nstr,
        utcStart: nstr,
        utcEnd: nstr,
        dstNote: nstr,
        timestamp: str,
        source: Source,
      }),
    )
    .default([]),
  rules: z.array(RuleSchema).min(1),
  risk: z
    .object({
      riskPerTradePercent: nnum,
      positionSizingMethod: nstr,
      maxTradesPerDay: nnum,
      dailyLossStop: nstr,
      maxConsecutiveLosses: nnum,
      minRiskReward: nnum,
      notes: str,
    })
    .default({ riskPerTradePercent: null, positionSizingMethod: null, maxTradesPerDay: null, dailyLossStop: null, maxConsecutiveLosses: null, minRiskReward: null, notes: "" }),
  management: z
    .object({
      takeProfitTargets: z.array(z.unknown()).default([]),
      partialCloses: z.array(z.unknown()).default([]),
      breakevenRule: nstr,
      trailingRule: nstr,
      timeExitRule: nstr,
    })
    .default({ takeProfitTargets: [], partialCloses: [], breakevenRule: null, trailingRule: null, timeExitRule: null }),
  executionFlow: z.array(z.object({ step: z.number(), description: z.string(), ruleIds: strArr })).default([]),
  examples: z
    .array(
      z.object({
        timestamp: str,
        instrument: nstr,
        timeframe: nstr,
        direction: nstr,
        entry: nnum,
        stopLoss: nnum,
        takeProfit: nnum,
        result: nstr,
        riskReward: nnum,
        ruleIdsApplied: strArr,
        rulesBroken: strArr,
        context: z.enum(["LIVE", "DEMO", "BACKTEST", "HINDSIGHT", "UNKNOWN"]).default("UNKNOWN"),
      }),
    )
    .default([]),
  checklist: z.array(z.object({ ruleId: z.string(), question: z.string() })).default([]),
  mistakeTags: z.array(z.object({ tag: z.string(), meaning: str })).default([]),
  creatorClaims: z.array(z.object({ claim: z.string(), timestamp: str, status: z.literal("UNVERIFIED") })).default([]),
  ambiguities: z
    .array(z.object({ id: z.string(), issue: z.string(), whyItMatters: str, questionForTrader: str, suggestedDefault: nstr }))
    .default([]),
  analystNotes: strArr,
};

export const StrategySpec10 = z.object({
  schemaVersion: z.literal("strategy-spec/1.0"),
  source: z.object({ videos: z.array(VideoSchema).min(1) }),
  ...base,
});

export const StrategySpec11 = z.object({
  schemaVersion: z.literal("strategy-spec/1.1"),
  source: z.object({ videos: z.array(VideoSchema).default([]), documents: z.array(DocumentSchema).default([]) }),
  ...base,
});

export const StrategySpecSchema = z.discriminatedUnion("schemaVersion", [StrategySpec10, StrategySpec11]);
export type StrategySpec = z.infer<typeof StrategySpecSchema>;
export type StrategyRule = z.infer<typeof RuleSchema>;

export interface SpecParseResult {
  ok: boolean;
  specs: StrategySpec[];
  /** Beginner-friendly error lines: "Spec 1 → rules[2].source: must be one of STATED, …". */
  errors: string[];
  /** Access warnings, e.g., Gemini only had the transcript. */
  warnings: string[];
}

/**
 * Finds and validates every strategy-spec JSON block in pasted text.
 * Accepts: raw JSON, a JSON array of specs, or the whole Gemini answer with ```json blocks.
 * All text inside is treated as DATA (never as instructions).
 */
export function parseStrategySpecs(text: string): SpecParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const candidates: unknown[] = [];
  const blocks = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)].map((m) => m[1] ?? "");
  const sources = blocks.length ? blocks : [text];
  for (const b of sources) {
    const trimmed = b.trim();
    if (!trimmed.includes("schemaVersion")) continue;
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) candidates.push(...parsed);
      else candidates.push(parsed);
    } catch (e) {
      errors.push(`JSON_SYNTAX: ${(e as Error).message}`);
    }
  }
  if (!candidates.length && !errors.length) errors.push("NO_SPEC_FOUND");
  const specs: StrategySpec[] = [];
  candidates.forEach((c, i) => {
    const version = (c as { schemaVersion?: unknown })?.schemaVersion;
    if (version !== "strategy-spec/1.0" && version !== "strategy-spec/1.1") {
      errors.push(`Spec ${i + 1} → schemaVersion: UNKNOWN_VERSION (${String(version)})`);
      return;
    }
    const r = StrategySpecSchema.safeParse(c);
    if (!r.success) {
      for (const issue of r.error.issues.slice(0, 12)) errors.push(`Spec ${i + 1} → ${issue.path.join(".") || "(root)"}: ${issue.message}`);
      return;
    }
    const ids = new Set(r.data.rules.map((x) => x.id));
    const badRefs = r.data.checklist.filter((c2) => c2.ruleId && !ids.has(c2.ruleId)).map((c2) => c2.ruleId);
    if (badRefs.length) warnings.push(`Spec ${i + 1}: CHECKLIST_UNKNOWN_RULES ${badRefs.join(", ")}`);
    if (r.data.source.videos.some((v) => v.accessMode === "AUDIO_OR_TRANSCRIPT_ONLY")) warnings.push(`Spec ${i + 1}: AUDIO_OR_TRANSCRIPT_ONLY`);
    specs.push(r.data);
  });
  return { ok: errors.length === 0 && specs.length > 0, specs, errors, warnings };
}
