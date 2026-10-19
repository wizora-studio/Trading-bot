import { describe, expect, it } from "vitest";
import { readCsv } from "@/features/import/csv";
import { parseMt5Positions } from "@/features/import/parsers";
import { computeMetrics } from "@/services/analytics/metrics";
import { tradeR } from "@/services/analytics/trade";
import { demoTradesAsMt5Csv, generateDemoTrades } from "./generateDemo";

const opts = {
  accountId: "demo",
  seed: 7,
  startingBalance: "10000",
  riskPct: 0.5,
  tradingDays: 25,
  endDate: new Date("2026-10-19T00:00:00Z"),
  strategies: [{ id: "s4", ruleIds: ["R1", "R2"], instruments: ["EURUSD", "GBPUSD", "XAUUSD"], londonFirst: true }],
};

describe("demo dataset", () => {
  const trades = generateDemoTrades(opts);
  it("is deterministic and realistic", () => {
    expect(generateDemoTrades(opts)).toEqual(trades);
    expect(trades.length).toBeGreaterThan(20);
    const m = computeMetrics(trades, { breakevenTolerance: "1" });
    expect(m.rCount).toBe(trades.length);
    // R stays near the designed range (−1.5R … +2.6R minus costs)
    for (const t of trades) {
      const r = tradeR(t)!.toNumber();
      expect(r).toBeGreaterThan(-1.8);
      expect(r).toBeLessThan(2.8);
    }
  });
  it("round-trips through the MT5 importer", () => {
    const csv = demoTradesAsMt5Csv(trades);
    const res = parseMt5Positions(readCsv(csv), "Europe/Athens");
    expect(res.errors).toEqual([]);
    expect(res.trades).toHaveLength(trades.length);
    const a = computeMetrics(trades, { breakevenTolerance: "1" }).netPnl.toFixed(2);
    const b = computeMetrics(res.trades.map((t, i) => ({ ...trades[i]!, ...t })), { breakevenTolerance: "1" }).netPnl.toFixed(2);
    expect(b).toBe(a);
  });
});
