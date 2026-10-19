import { describe, expect, it } from "vitest";
import { balanceCurve, dailyPnl, drawdownStats, gainToRecover, underwaterPeriods } from "./equity";
import { mkTrade } from "./testUtils";

/** The numbers printed in docs/handbook/06-equity-curves-and-drawdowns.md. */
const pnls = ["300", "-200", "-400", "100", "500", "-250", "350"];
const trades = pnls.map((p, i) => mkTrade({ grossPnl: p, closeTime: `2026-10-0${i + 1}T10:00:00Z` }));
const points = balanceCurve(trades, "10000");

describe("handbook module 6: drawdown step by step", () => {
  it("balance curve", () => {
    expect(points.map((p) => p.balance.toFixed(0))).toEqual(["10000", "10300", "10100", "9700", "9800", "10300", "10050", "10400"]);
    expect(points.map((p) => p.drawdown.toFixed(0))).toEqual(["0", "0", "200", "600", "500", "0", "250", "0"]);
  });
  it("max drawdown in money and in both percentage styles", () => {
    const s = drawdownStats(points, "10000");
    expect(s.maxDrawdown.toFixed(0)).toBe("600");
    expect(s.maxDrawdownPctOfPeak?.toFixed(4)).toBe("0.0583"); // 600 / 10,300
    expect(s.maxDrawdownPctOfStart?.toFixed(4)).toBe("0.0600"); // 600 / 10,000
    expect(s.longestDrawdownTrades).toBe(3);
    expect(s.currentDrawdown.toFixed(0)).toBe("0");
    expect(s.recoveryFactor?.toFixed(2)).toBe("0.67"); // net 400 / 600
  });
  it("underwater periods", () => {
    const u = underwaterPeriods(points);
    expect(u).toHaveLength(2);
    expect(u[0]).toMatchObject({ trades: 3, recoveredTime: "2026-10-05T10:00:00Z", peakTime: "2026-10-01T10:00:00Z" });
    expect(u[0]?.depth.toFixed(0)).toBe("600");
    expect(u[1]?.depth.toFixed(0)).toBe("250");
    expect(u[1]?.trades).toBe(1);
  });
  it("still underwater at the end", () => {
    const p = balanceCurve([mkTrade({ grossPnl: "-100", closeTime: "2026-10-01T10:00:00Z" })], "1000");
    const u = underwaterPeriods(p);
    expect(u).toHaveLength(1);
    expect(u[0]?.recoveredTime).toBeNull();
    expect(u[0]?.peakTime).toBeNull();
  });
  it("percent drawdown depends on the base: peak 12,000, trough 10,800, start 10,000", () => {
    const p = balanceCurve([mkTrade({ grossPnl: "2000", closeTime: "2026-10-01T10:00:00Z" }), mkTrade({ grossPnl: "-1200", closeTime: "2026-10-02T10:00:00Z" })], "10000");
    const s = drawdownStats(p, "10000");
    expect(s.maxDrawdownPctOfPeak?.toFixed(2)).toBe("0.10");
    expect(s.maxDrawdownPctOfStart?.toFixed(2)).toBe("0.12");
  });
  it("recovery needs more than the loss", () => {
    expect(gainToRecover("0.1")?.toFixed(4)).toBe("0.1111");
    expect(gainToRecover("0.2")?.toFixed(2)).toBe("0.25");
    expect(gainToRecover("0.5")?.toFixed(2)).toBe("1.00");
    expect(gainToRecover("1")).toBeNull();
  });
  it("closed-trade curve hides intratrade swings: a trade that dipped −400 and closed +50 shows no drawdown", () => {
    const p = balanceCurve([mkTrade({ grossPnl: "50", closeTime: "2026-10-01T10:00:00Z" })], "10000");
    expect(drawdownStats(p, "10000").maxDrawdown.toFixed(0)).toBe("0");
  });
  it("daily P&L is bucketed by close time in the chosen zone", () => {
    const days = dailyPnl([mkTrade({ grossPnl: "10", closeTime: "2026-10-01T20:30:00Z" })], "Asia/Karachi");
    expect(days[0]?.day).toBe("2026-10-02"); // 20:30 UTC = 01:30 next day in Karachi (UTC+5)
  });
});
