import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { StrategySpecSchema } from "./schema";
import { SEED_STRATEGIES } from "./seeds";

/**
 * Keeps seed/strategies/*.json (Appendix A seeds, one file per strategy) in sync with seeds.ts.
 * Regenerate with: UPDATE_SAMPLES=1 npx vitest run src/features/strategies/seedFiles.test.ts
 */
const dir = new URL("../../../seed/strategies/", import.meta.url);

describe("seed strategy files", () => {
  for (const s of SEED_STRATEGIES) {
    const { seedKey, ...spec } = s;
    const file = new URL(`s${seedKey.slice(1).padStart(2, "0")}.json`, dir);
    const text = JSON.stringify(spec, null, 2) + "\n";
    it(`${seedKey} matches seeds.ts and validates`, () => {
      if (process.env.UPDATE_SAMPLES || !existsSync(file)) writeFileSync(file, text);
      expect(readFileSync(file, "utf8")).toBe(text);
      expect(StrategySpecSchema.safeParse(JSON.parse(text)).success).toBe(true);
    });
  }
  it("no stray files", () => {
    expect(readdirSync(dir).filter((f) => f.endsWith(".json"))).toHaveLength(SEED_STRATEGIES.length);
  });
});
