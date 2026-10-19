import { describe, expect, it } from "vitest";
import { scoreAccountQuality, scoreQuality } from "@/features/import/quality";
import { metricCoverage } from "./dataQuality";
import { mkTrade } from "./testUtils";

/** The numbers printed in docs/handbook/10-data-quality.md. */
const full = { openTime: "2026-10-01T08:00:00Z", entryPrice: "1.1000", exitPrice: "1.1050", stopLoss: "1.0950", takeProfit: "1.1100", quantity: "1", commission: "3" };
const T = (over: object, i: number) => mkTrade({ grossPnl: "10", closeTime: `2026-10-0${i + 1}T10:00:00Z`, ...over });

describe("data quality score", () => {
  it("complete data scores 100", () => {
    const trades = Array.from({ length: 5 }, (_, i) => T(full, i));
    expect(scoreAccountQuality(trades).score).toBe(100);
  });
  it("no stop-loss on every trade costs the full 25 points", () => {
    const trades = Array.from({ length: 4 }, (_, i) => T({ ...full, stopLoss: null, takeProfit: null }, i));
    const q = scoreQuality(trades, []);
    expect(q.score).toBe(75);
    expect(q.issues.map((i) => i.code)).toContain("MISSING_STOP_LOSS");
  });
  it("half of the trades missing a stop-loss costs about 13 points", () => {
    const trades = [T(full, 0), T(full, 1), T({ ...full, stopLoss: null }, 2), T({ ...full, stopLoss: null }, 3)];
    expect(scoreQuality(trades, []).score).toBe(88); // 100 − 25 × 0.5 = 87.5 → 88
  });
  it("all costs zero on 5+ trades counts as missing commission", () => {
    const trades = Array.from({ length: 5 }, (_, i) => T({ ...full, commission: "0" }, i));
    const q = scoreAccountQuality(trades);
    expect(q.score).toBe(90);
    expect(q.issues.map((i) => i.code)).toContain("MISSING_COMMISSION");
  });
  it("a single zero-commission trade is normal", () => {
    const trades = [T({ ...full, commission: "0" }, 0), T(full, 1), T(full, 2), T(full, 3), T(full, 4)];
    expect(scoreAccountQuality(trades).score).toBe(100);
  });
  it("row errors weigh 30 × share", () => {
    const trades = Array.from({ length: 3 }, (_, i) => T(full, i));
    const q = scoreQuality(trades, [{ row: 5, code: "BAD", detail: "x" }]);
    expect(q.score).toBe(93); // 100 − 30 × 1/4 = 92.5 → 93
  });
});

describe("metric coverage (data dependency matrix)", () => {
  const get = (c: ReturnType<typeof metricCoverage>, k: string) => c.find((x) => x.key === k)!;
  it("complete data: everything OK", () => {
    const c = metricCoverage(Array.from({ length: 5 }, (_, i) => T({ ...full, plannedRisk: "50", strategyId: "s1" }, i)));
    expect(c.every((x) => x.status === "OK")).toBe(true);
  });
  it("no stop-loss: R multiples unavailable, planned R:R unavailable, rest unaffected", () => {
    const c = metricCoverage(Array.from({ length: 5 }, (_, i) => T({ ...full, stopLoss: null, takeProfit: null }, i)));
    expect(get(c, "R_MULTIPLES").status).toBe("UNAVAILABLE");
    expect(get(c, "PLANNED_RR").status).toBe("UNAVAILABLE");
    expect(get(c, "NET_PNL").status).toBe("OK");
    expect(get(c, "HOLDING_TIME").status).toBe("OK");
  });
  it("some trades missing the open time: partial", () => {
    const c = metricCoverage([T(full, 0), T({ ...full, openTime: null }, 1)]);
    expect(get(c, "HOLDING_TIME")).toMatchObject({ status: "PARTIAL", covered: 1, total: 2 });
  });
  it("all costs zero: net P&L partial", () => {
    const c = metricCoverage(Array.from({ length: 5 }, (_, i) => T({ ...full, commission: "0" }, i)));
    expect(get(c, "NET_PNL").status).toBe("PARTIAL");
  });
  it("no trades: everything unavailable", () => {
    expect(metricCoverage([]).every((x) => x.status === "UNAVAILABLE")).toBe(true);
  });
});
