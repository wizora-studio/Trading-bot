import { describe, expect, it } from "vitest";
import { confidenceOfMean, levelFromSize } from "./confidence";
import { d } from "./decimal";
import { balanceCurve, bestDayShare, dailyPnl, drawdownStats } from "./equity";
import { computeMetrics, outcomeOf } from "./metrics";
import { mkTrade } from "./testUtils";
import { plannedRR, tradeNet, tradeR } from "./trade";

const opts = { breakevenTolerance: "1" };

// Golden dataset, calculated by hand:
// +100 (cost 5) → net +95 | −50 (cost 5) → −55 | +0.50 → breakeven | +200 (cost 10) → +190 | −100 → −100
const golden = [
  mkTrade({ grossPnl: "100", commission: "5", closeTime: "2026-10-01T10:00:00Z", plannedRisk: "50" }),
  mkTrade({ grossPnl: "-50", commission: "5", closeTime: "2026-10-01T12:00:00Z", plannedRisk: "50" }),
  mkTrade({ grossPnl: "0.5", closeTime: "2026-10-02T10:00:00Z" }),
  mkTrade({ grossPnl: "200", commission: "4", swap: "6", closeTime: "2026-10-03T10:00:00Z", plannedRisk: "50" }),
  mkTrade({ grossPnl: "-100", closeTime: "2026-10-03T15:00:00Z", plannedRisk: "50" }),
];

describe("computeMetrics (golden dataset)", () => {
  const m = computeMetrics(golden, opts);

  it("counts wins, losses and breakevens with tolerance", () => {
    expect([m.n, m.wins, m.losses, m.breakevens]).toEqual([5, 2, 2, 1]);
    expect(m.wins + m.losses + m.breakevens).toBe(m.n);
  });

  it("net = gross − costs", () => {
    // 95 − 55 + 0.5 + 190 − 100 = 130.5
    expect(m.netPnl.toFixed(2)).toBe("130.50");
    expect(m.totalCosts.toFixed(2)).toBe("20.00");
    // gross 100 − 50 + 0.5 + 200 − 100 = 150.5 ; 150.5 − 20 = 130.5
  });

  it("gross profit / loss, profit factor, payoff, expectancy", () => {
    expect(m.grossProfit.toFixed(2)).toBe("285.00"); // 95 + 190
    expect(m.grossLoss.toFixed(2)).toBe("155.00"); // 55 + 100
    expect(m.profitFactor?.toFixed(4)).toBe("1.8387"); // 285 / 155
    expect(m.avgWin?.toFixed(2)).toBe("142.50");
    expect(m.avgLoss?.toFixed(2)).toBe("77.50");
    expect(m.payoffRatio?.toFixed(4)).toBe("1.8387");
    expect(m.expectancy?.toFixed(2)).toBe("26.10"); // 130.5 / 5
    expect(m.winRate?.toFixed(2)).toBe("0.40");
  });

  it("R-multiples only where planned risk exists", () => {
    // 95/50=1.9, −55/50=−1.1, 190/50=3.8, −100/50=−2 → avg 0.65
    expect(m.rCount).toBe(4);
    expect(m.avgR?.toFixed(2)).toBe("0.65");
    expect(m.avgRWinners?.toFixed(2)).toBe("2.85");
    expect(m.avgRLosers?.toFixed(2)).toBe("-1.55");
  });

  it("streaks and outlier share", () => {
    expect(m.maxConsecutiveWins).toBe(1);
    expect(m.maxConsecutiveLosses).toBe(1);
    expect(m.top1Share?.toFixed(4)).toBe("1.4559"); // 190 / 130.5
    expect(m.costsPctOfGrossProfit?.toFixed(4)).toBe("0.0666"); // 20 / 300.5 = 0.06656
  });
});

describe("edge cases", () => {
  it("zero trades gives nulls, not crashes", () => {
    const m = computeMetrics([], opts);
    expect(m.n).toBe(0);
    expect(m.winRate).toBeNull();
    expect(m.profitFactor).toBeNull();
    expect(m.expectancy).toBeNull();
  });

  it("profit factor is null when there are no losses", () => {
    const m = computeMetrics([mkTrade({ grossPnl: "10", closeTime: "2026-01-01T00:00:00Z" })], opts);
    expect(m.profitFactor).toBeNull();
  });

  it("breakeven tolerance boundary", () => {
    expect(outcomeOf(d("0.99"), d("1"))).toBe("BREAKEVEN");
    expect(outcomeOf(d("1"), d("1"))).toBe("WIN");
    expect(outcomeOf(d("-1"), d("1"))).toBe("LOSS");
  });

  it("decimal math avoids float errors (0.1 + 0.2)", () => {
    const t = [
      mkTrade({ grossPnl: "0.1", closeTime: "2026-01-01T00:00:00Z" }),
      mkTrade({ grossPnl: "0.2", closeTime: "2026-01-01T01:00:00Z" }),
    ];
    expect(computeMetrics(t, { breakevenTolerance: "0" }).netPnl.toString()).toBe("0.3");
  });
});

describe("R from stop-loss distance", () => {
  it("EURUSD 1 lot, 20 pip stop = $200 risk", () => {
    const t = mkTrade({ grossPnl: "400", closeTime: "2026-01-01T00:00:00Z", entryPrice: "1.0850", stopLoss: "1.0830" });
    expect(tradeR(t)?.toFixed(2)).toBe("2.00");
  });
  it("units (TradingView) instead of lots", () => {
    const t = mkTrade({
      grossPnl: "-100",
      closeTime: "2026-01-01T00:00:00Z",
      quantity: "10000",
      quantityUnit: "UNITS",
      entryPrice: "1.1000",
      stopLoss: "1.0900",
    });
    expect(tradeR(t)?.toFixed(2)).toBe("-1.00");
  });
  it("planned R:R", () => {
    expect(plannedRR({ entryPrice: "100", stopLoss: "90", takeProfit: "125" })?.toFixed(2)).toBe("2.50");
  });
  it("net helper", () => {
    expect(tradeNet(golden[3]!).toFixed(2)).toBe("190.00");
  });
});

describe("balance curve and drawdown (closed trades)", () => {
  it("peak-to-trough", () => {
    // start 1000: +95 →1095 (peak) −55 →1040 +0.5 →1040.5 +190 →1230.5 (peak) −100 →1130.5
    const pts = balanceCurve(golden, "1000");
    const dd = drawdownStats(pts, "1000");
    expect(pts.at(-1)?.balance.toFixed(2)).toBe("1130.50");
    expect(dd.maxDrawdown.toFixed(2)).toBe("100.00");
    expect(dd.maxDrawdownPctOfPeak?.toFixed(4)).toBe("0.0813"); // 100 / 1230.5
    expect(dd.maxDrawdownPctOfStart?.toFixed(2)).toBe("0.10");
    expect(dd.currentDrawdown.toFixed(2)).toBe("100.00");
    for (const p of pts) expect(p.drawdown.gte(0)).toBe(true);
  });

  it("daily buckets and best-day share", () => {
    const days = dailyPnl(golden, "UTC");
    expect(days.map((x) => [x.day, x.net.toFixed(2)])).toEqual([
      ["2026-10-01", "40.00"],
      ["2026-10-02", "0.50"],
      ["2026-10-03", "90.00"],
    ]);
    const b = bestDayShare(days);
    expect(b.share?.toFixed(4)).toBe("0.6897"); // 90 / 130.5
  });

  it("day bucketing uses the chosen timezone", () => {
    // 21:00 UTC = 02:00 next day in Karachi
    const t = [mkTrade({ grossPnl: "1", closeTime: "2026-10-01T21:00:00Z" })];
    expect(dailyPnl(t, "Asia/Karachi")[0]?.day).toBe("2026-10-02");
    expect(dailyPnl(t, "UTC")[0]?.day).toBe("2026-10-01");
  });
});

describe("confidence framework", () => {
  it("levels by sample size", () => {
    expect(levelFromSize(5)).toBe("INSUFFICIENT_DATA");
    expect(levelFromSize(10)).toBe("LOW");
    expect(levelFromSize(30)).toBe("MODERATE");
    expect(levelFromSize(100)).toBe("HIGH");
  });
  it("HIGH is lowered when the interval includes zero", () => {
    const vals = Array.from({ length: 120 }, (_, i) => d(i % 2 === 0 ? 1 : -1));
    const c = confidenceOfMean(vals);
    expect(c.ciIncludesZero).toBe(true);
    expect(c.level).toBe("MODERATE");
  });
});
