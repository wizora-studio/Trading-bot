import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RuleSchema, StrategySpec11 } from "./schema";

/** Guard for Operating Discipline 14d: the app schema and the Gemini prompt's JSON template must match. */
const prompt = readFileSync(new URL("../../../docs/prompts/STRATEGY_EXTRACTION_PROMPT.md", import.meta.url), "utf8");
const block = /```json\s*([\s\S]*?)```/.exec(prompt)?.[1] ?? "{}";
const template = JSON.parse(block) as Record<string, unknown> & { rules: Record<string, unknown>[]; strategy: Record<string, unknown>; source: { videos: Record<string, unknown>[] } };

describe("Gemini prompt ↔ Zod schema", () => {
  it("same schema version", () => expect(template.schemaVersion).toBe("strategy-spec/1.1"));
  it("same top-level keys", () => expect(Object.keys(template).sort()).toEqual(Object.keys(StrategySpec11.shape).sort()));
  it("same strategy keys", () => expect(Object.keys(template.strategy).sort()).toEqual(Object.keys(StrategySpec11.shape.strategy.shape).sort()));
  it("same rule keys", () => expect(Object.keys(template.rules[0]!).sort()).toEqual(Object.keys(RuleSchema.shape).sort()));
  it("same source keys", () => expect(Object.keys(template.source).sort()).toEqual(["documents", "videos"]));
});
