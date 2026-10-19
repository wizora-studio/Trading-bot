import { describe, expect, it } from "vitest";
import { fairWalkTargetFirst, kelly, probabilityOfLossRun } from "./riskMath";

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
