import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { demoTradesAsMt5Csv, generateDemoTrades } from "./generateDemo";

/**
 * Keeps docs/samples/demo-trades-mt5.csv in sync with the generator.
 * Regenerate with: UPDATE_SAMPLES=1 npx vitest run src/features/demo/samples.test.ts
 */
const file = new URL("../../../docs/samples/demo-trades-mt5.csv", import.meta.url);
const csv = demoTradesAsMt5Csv(
  generateDemoTrades({ accountId: "demo", seed: 2026, startingBalance: "10000", riskPct: 0.5, tradingDays: 30, endDate: new Date("2026-10-19T00:00:00Z"), strategies: [] }),
);

describe("demo sample file", () => {
  it("matches the generator", () => {
    if (process.env.UPDATE_SAMPLES || !existsSync(file)) writeFileSync(file, csv);
    expect(readFileSync(file, "utf8")).toBe(csv);
  });
});
