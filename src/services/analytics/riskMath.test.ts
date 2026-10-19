import { describe, expect, it } from "vitest";
import { computeMetrics } from "./metrics";
import { breakevenWinRate, challengeOdds, expectancyFromRates, fairWalkTargetFirst, kelly, probabilityOfLossRun, standardError } from "./riskMath";
import { mkTrade } from "./testUtils";

/** The numbers printed in docs/handbook/03-risk-management.md. */
describe("handbook module 3 numbers", () => {
  it("losing streak table", () => {
    expect(probabilityOfLossRun(20, 5, 0.5)).toBeCloseTo(0.25, 2);
    expect(probabilityOfLossRun(100, 5, 0.5)).toBeCloseTo(0.81, 2);
    expect(probabilityOfLossRun(20, 8, 0.5)).toBeCloseTo(0.03, 2);
    expect(probabilityOfLossRun(100, 8, 0.5)).toBeCloseTo(0.17, 2);
    expect(probabilityOfLossRun(100, 5, 0.4)).toBeCloseTo(0.46, 2);
  });
  it("edge cases", () => {
    expect(probabilityOfLossRun(3, 5, 0.5)).toBe(0);
    expect(probabilityOfLossRun(5, 5, 0.5)).toBeCloseTo(0.03125, 6);
    expect(probabilityOfLossRun(10, 0, 0.5)).toBe(1);
  });
  it("gambler's ruin: limit 10, target 8", () => {
    expect(fairWalkTargetFirst(10, 8).toFixed(3)).toBe("0.556");
  });
  it("Kelly examples", () => {
    const k = kelly("0.5", "2.5");
    expect(k.fullKelly?.toFixed(2)).toBe("0.30");
    expect(k.quarterKelly?.toFixed(3)).toBe("0.075");
    expect(kelly("0.4", "2.5").fullKelly?.toFixed(2)).toBe("0.16");
    expect(kelly("0.3", "2.5").fullKelly?.toFixed(2)).toBe("0.02");
    expect(kelly("0.45", "2").fullKelly?.toFixed(3)).toBe("0.175");
  });
  it("no edge → no Kelly (negative expectancy guard)", () => {
    const k = kelly("0.25", "2.5"); // 0.25·2.5 − 0.75 = −0.125
    expect(k.hasEdge).toBe(false);
    expect(k.fullKelly).toBeNull();
  });
});

/** The numbers printed in docs/handbook/05-expectancy-and-probability.md. */
describe("handbook module 5 numbers", () => {
  it("example 1: 80% win rate, wins $10, losses $50 → negative expectancy", () => {
    expect(expectancyFromRates("0.8", "10", "50").toFixed(2)).toBe("-2.00");
    expect(breakevenWinRate("0.2").toFixed(4)).toBe("0.8333");
  });
  it("example 2: 30% win rate, RRR 3 → +0.2R, breakeven 25%", () => {
    expect(expectancyFromRates("0.3", "3", "1").toFixed(2)).toBe("0.20");
    expect(breakevenWinRate("3").toFixed(2)).toBe("0.25");
    expect(probabilityOfLossRun(100, 8, 0.7)).toBeCloseTo(0.86, 2);
    expect(probabilityOfLossRun(100, 10, 0.7)).toBeCloseTo(0.58, 2);
    expect(probabilityOfLossRun(100, 5, 0.7)).toBeCloseTo(1.0, 2);
  });
  it("breakeven win rate table", () => {
    expect(breakevenWinRate("1").toFixed(3)).toBe("0.500");
    expect(breakevenWinRate("1.5").toFixed(3)).toBe("0.400");
    expect(breakevenWinRate("2").toFixed(3)).toBe("0.333");
    expect(breakevenWinRate("4").toFixed(3)).toBe("0.200");
    expect(() => breakevenWinRate("0")).toThrow();
  });
  it("standard error shrinks with √n", () => {
    const sd = "1.8330302779823358"; // std of one trade in example 2 (R)
    expect(standardError(sd, 100)?.toFixed(2)).toBe("0.18");
    expect(standardError(sd, 400)?.toFixed(2)).toBe("0.09");
    expect(standardError(sd, 1000)?.toFixed(2)).toBe("0.06");
    expect(standardError(sd, 0)).toBeNull();
  });
  it("example 3: same edge (45% win, RRR 2 = +0.35R), different risk per trade; target 10%, limit 10%", () => {
    const at = (riskPct: number) => challengeOdds(0.45, 2 * riskPct, riskPct, 10, 10);
    expect(at(1).pass).toBeCloseTo(0.967, 3);
    expect(at(2).pass).toBeCloseTo(0.841, 3);
    expect(at(3).pass).toBeCloseTo(0.789, 3);
    expect(at(5).pass).toBeCloseTo(0.65, 3);
    expect(at(10).pass).toBeCloseTo(0.45, 3);
    expect(at(10).fail).toBeCloseTo(0.55, 3);
    expect(at(1).undecided).toBeLessThan(1e-9);
  });
  it("target-to-limit ratio matters, with the same edge and 1% risk", () => {
    expect(challengeOdds(0.45, 2, 1, 5, 10).pass).toBeCloseTo(0.971, 3);
    expect(challengeOdds(0.45, 2, 1, 10, 5).pass).toBeCloseTo(0.82, 3);
  });
  it("fair coin matches the closed form", () => {
    expect(challengeOdds(0.5, 1, 1, 8, 10).pass).toBeCloseTo(10 / 18, 6);
  });
  it("example 4: one lucky outlier", () => {
    const t = (pnl: string, i: number) => mkTrade({ grossPnl: pnl, closeTime: `2026-10-${String(i + 1).padStart(2, "0")}T10:00:00Z` });
    const pnls = [...Array(8).fill("40"), ...Array(11).fill("-50"), "600"] as string[];
    const trades = pnls.map(t);
    const m = computeMetrics(trades, { breakevenTolerance: "1" });
    expect(m.netPnl.toFixed(0)).toBe("370");
    expect(m.expectancy?.toFixed(1)).toBe("18.5");
    expect(m.top1Share?.toFixed(2)).toBe("1.62");
    const without = computeMetrics(trades.filter((x) => x.grossPnl !== "600"), { breakevenTolerance: "1" });
    expect(without.netPnl.toFixed(0)).toBe("-230");
    expect(without.expectancy?.toFixed(1)).toBe("-12.1");
  });
  it("sequence risk: same trades, different order, same total, different worst point", () => {
    const worst = (rs: number[]) => {
      let c = 0;
      let lo = 0;
      for (const r of rs) {
        c += r;
        lo = Math.min(lo, c);
      }
      return { total: c, lo };
    };
    expect(worst([2, 2, 2, 2, 2, -1, -1, -1, -1, -1])).toEqual({ total: 5, lo: 0 });
    expect(worst([-1, -1, -1, -1, -1, 2, 2, 2, 2, 2])).toEqual({ total: 5, lo: -5 });
  });
});
