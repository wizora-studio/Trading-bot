import { describe, expect, it } from "vitest";
import { calmar, dailyReturns, excessKurtosis, sharpe, skewness, sortino, sqn, timeInMarket, ulcerIndex } from "./advanced";
import { d } from "./decimal";
import { balanceCurve, drawdownStats } from "./equity";
import { mkTrade } from "./testUtils";
import { tradeR } from "./trade";

// Same golden dataset as metrics.test.ts (start balance 1,000).
const golden = [
  mkTrade({ grossPnl: "100", commission: "5", closeTime: "2026-10-01T10:00:00Z", plannedRisk: "50" }),
  mkTrade({ grossPnl: "-50", commission: "5", closeTime: "2026-10-01T12:00:00Z", plannedRisk: "50" }),
  mkTrade({ grossPnl: "0.5", closeTime: "2026-10-02T10:00:00Z" }),
  mkTrade({ grossPnl: "200", commission: "4", swap: "6", closeTime: "2026-10-03T10:00:00Z", plannedRisk: "50" }),
  mkTrade({ grossPnl: "-100", closeTime: "2026-10-03T15:00:00Z", plannedRisk: "50" }),
];
const rs = golden.map((t) => tradeR(t)).filter((x) => x !== null);

describe("advanced metrics (golden values computed independently in Python)", () => {
  it("SQN = √4 × 0.65 ÷ 2.6814 = 0.4848", () => expect(sqn(rs)?.toFixed(4)).toBe("0.4848"));
  it("skewness and excess kurtosis of R", () => {
    expect(skewness(rs)?.toFixed(4)).toBe("0.3195");
    expect(excessKurtosis(rs)?.toFixed(4)).toBe("-3.2096");
  });
  it("Ulcer Index from closed balance points", () => {
    expect(ulcerIndex(balanceCurve(golden, "1000"))?.toFixed(4)).toBe("4.8176");
  });
  it("daily returns and Sharpe (annualized, rf = 0)", () => {
    const r = dailyReturns(golden, "1000", "UTC");
    expect(r.map((x) => x.toFixed(6))).toEqual(["0.040000", "0.000481", "0.086497"]);
    expect(sharpe(r)?.toFixed(2)).toBe("15.61");
    expect(sortino(r)).toBeNull(); // no losing days → downside deviation is 0
  });
  it("Sortino with a losing day", () => {
    const r = [d("0.02"), d("-0.01"), d("0.01"), d("-0.02")];
    // mean 0, so Sortino 0
    expect(sortino(r)?.toFixed(4)).toBe("0.0000");
    // downside dev = √((0.0001 + 0.0004)/4) = 0.01118; mean 0.005 for [0.02,-0.01,0.03,-0.02]
    expect(sortino([d("0.02"), d("-0.01"), d("0.03"), d("-0.02")])?.toFixed(3)).toBe(d("0.005").div(d("0.000125").sqrt()).times(d(252).sqrt()).toFixed(3));
  });
  it("Calmar needs at least 90 days; null on a 3-day sample", () => {
    const pts = balanceCurve(golden, "1000");
    expect(calmar(pts, drawdownStats(pts, "1000").maxDrawdownPctOfPeak)).toBeNull();
  });
  it("Calmar on a 1-year sample: +20% with a 10% max drawdown = 2.0", () => {
    const t = [
      mkTrade({ grossPnl: "-100", closeTime: "2025-01-01T00:00:00Z" }),
      mkTrade({ grossPnl: "300", closeTime: "2026-01-01T00:00:00Z" }),
    ];
    const pts = balanceCurve(t, "1000");
    // 1000 → 900 (−10%) → 1200 (+20% over 365 days)
    expect(calmar(pts, drawdownStats(pts, "1000").maxDrawdownPctOfPeak)?.toFixed(2)).toBe("2.00");
  });
  it("time in market merges overlapping trades", () => {
    const t = [
      mkTrade({ grossPnl: "1", openTime: "2026-10-01T00:00:00Z", closeTime: "2026-10-01T02:00:00Z" }),
      mkTrade({ grossPnl: "1", openTime: "2026-10-01T01:00:00Z", closeTime: "2026-10-01T03:00:00Z" }),
      mkTrade({ grossPnl: "1", openTime: "2026-10-01T09:00:00Z", closeTime: "2026-10-01T10:00:00Z" }),
    ];
    // covered 3h + 1h = 4h of 10h
    expect(timeInMarket(t)?.toFixed(2)).toBe("0.40");
    expect(timeInMarket(golden)).toBeNull(); // open times missing
  });
  it("null instead of nonsense on tiny samples", () => {
    expect(sqn([d(1)])).toBeNull();
    expect(skewness([d(1), d(2)])).toBeNull();
    expect(excessKurtosis([d(1), d(2), d(3)])).toBeNull();
    expect(sharpe([d("0.01")])).toBeNull();
    expect(ulcerIndex(balanceCurve([], "1000"))).toBeNull();
  });
});
