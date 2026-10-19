import { describe, expect, it } from "vitest";
import { afterStreak, exitDiscipline, heldOverWeekend, newsWindowHolding, redDays, sizeAfterLoss, weekendHolding } from "./behavior";
import { mkTrade } from "./testUtils";

const opts = { breakevenTolerance: "1", timeZone: "Asia/Karachi" };

/** The numbers printed in docs/handbook/08-trading-psychology-and-rule-compliance.md. */
describe("size after a loss", () => {
  const lots = [
    ["1", "-50"],
    ["2", "-100"],
    ["4", "200"],
    ["1", "-30"],
    ["1", "20"],
  ] as const;
  const trades = lots.map(([q, p], i) => mkTrade({ quantity: q, grossPnl: p, closeTime: `2026-10-0${i + 1}T10:00:00Z` }));
  it("finds escalations, the chain, and compares results", () => {
    const r = sizeAfterLoss(trades, opts);
    expect(r.afterLoss).toBe(3);
    expect(r.escalated).toBe(2);
    expect(r.longestChain).toBe(2);
    expect(r.escalatedNetAvg?.toFixed(0)).toBe("50");
    expect(r.otherNetAvg?.toFixed(0)).toBe("20");
    expect(r.confidence).toBe("INSUFFICIENT_DATA");
  });
  it("ignores different instruments", () => {
    const t = [mkTrade({ quantity: "1", grossPnl: "-50", closeTime: "2026-10-01T10:00:00Z" }), mkTrade({ instrument: "XAUUSD", quantity: "5", grossPnl: "10", closeTime: "2026-10-02T10:00:00Z" })];
    expect(sizeAfterLoss(t, opts).afterLoss).toBe(0);
  });
});

describe("trading on red days", () => {
  const t = (open: string, close: string, pnl: string) => mkTrade({ openTime: open, closeTime: close, grossPnl: pnl });
  const trades = [
    t("2026-10-05T06:00:00Z", "2026-10-05T07:00:00Z", "-150"),
    t("2026-10-05T08:00:00Z", "2026-10-05T09:00:00Z", "50"),
    t("2026-10-06T06:00:00Z", "2026-10-06T07:00:00Z", "100"),
    t("2026-10-06T08:00:00Z", "2026-10-06T09:00:00Z", "20"),
  ];
  it("counts red and green days and trades opened while already down 1%", () => {
    const r = redDays(trades, "10000", opts);
    expect([r.redDays, r.greenDays]).toEqual([1, 1]);
    expect(r.avgTradesRedDay?.toFixed(0)).toBe("2");
    expect(r.openedWhileDown).toBe(1);
    expect(r.openedWhileDownNet.toFixed(0)).toBe("50");
  });
  it("trades without open time are reported, not guessed", () => {
    const r = redDays([mkTrade({ grossPnl: "-10", closeTime: "2026-10-05T07:00:00Z" })], "10000", opts);
    expect(r.unplaceable).toBe(1);
    expect(r.openedWhileDown).toBe(0);
  });
});

describe("exits versus the plan", () => {
  const base = { entryPrice: "1.1000", stopLoss: "1.0950", takeProfit: "1.1100", plannedRisk: "50" };
  const trades = [
    mkTrade({ ...base, grossPnl: "100", closeTime: "2026-10-01T10:00:00Z" }),
    mkTrade({ ...base, grossPnl: "25", closeTime: "2026-10-02T10:00:00Z" }),
    mkTrade({ ...base, grossPnl: "-50", closeTime: "2026-10-03T10:00:00Z" }),
    mkTrade({ ...base, grossPnl: "-75", closeTime: "2026-10-04T10:00:00Z" }),
    mkTrade({ grossPnl: "30", closeTime: "2026-10-05T10:00:00Z" }), // no plan → cannot be checked
  ];
  it("winners cut short and losers beyond plan", () => {
    const r = exitDiscipline(trades, opts);
    expect([r.winnersChecked, r.winnersCutShort]).toEqual([2, 1]);
    expect(r.avgCaptureShare?.toFixed(3)).toBe("0.625");
    expect([r.losersChecked, r.losersBeyondPlan]).toEqual([2, 1]);
    expect(r.avgLossR?.toFixed(2)).toBe("-1.25");
    expect(r.n).toBe(4);
  });
});

describe("weekend and news holding", () => {
  it("Friday 5 Oct → Monday: held; same-day Friday and Monday-only: not held; unknown open: null", () => {
    const mk = (o: string | null, c: string) => mkTrade({ openTime: o, closeTime: c, grossPnl: "10" });
    expect(heldOverWeekend(mk("2026-10-09T15:00:00Z", "2026-10-12T08:00:00Z"))).toBe(true);
    expect(heldOverWeekend(mk("2026-10-12T08:00:00Z", "2026-10-12T10:00:00Z"))).toBe(false);
    expect(heldOverWeekend(mk("2026-10-09T10:00:00Z", "2026-10-09T20:00:00Z"))).toBe(false);
    expect(heldOverWeekend(mk("2026-10-10T01:00:00Z", "2026-10-10T03:00:00Z"))).toBe(true);
    expect(heldOverWeekend(mk(null, "2026-10-09T20:00:00Z"))).toBeNull();
    const r = weekendHolding([mk("2026-10-09T15:00:00Z", "2026-10-12T08:00:00Z"), mk("2026-10-12T08:00:00Z", "2026-10-12T10:00:00Z"), mk(null, "2026-10-12T10:00:00Z")]);
    expect([r.checked, r.held, r.unknown]).toEqual([2, 1, 1]);
  });
  it("news window", () => {
    const w = [{ label: "NFP", start: "2026-10-07T12:20:00Z", end: "2026-10-07T12:40:00Z" }];
    const mk = (o: string, c: string) => mkTrade({ openTime: o, closeTime: c, grossPnl: "-20" });
    const r = newsWindowHolding([mk("2026-10-07T12:00:00Z", "2026-10-07T13:00:00Z"), mk("2026-10-07T12:45:00Z", "2026-10-07T13:00:00Z"), mk("2026-10-07T11:00:00Z", "2026-10-07T12:10:00Z")], w);
    expect([r.checked, r.held]).toEqual([3, 1]);
    expect(r.heldNet.toFixed(0)).toBe("-20");
  });
});

describe("results after streaks", () => {
  const nets = ["10", "10", "10", "-5", "10", "10", "10", "10", "-20"];
  const trades = nets.map((p, i) => mkTrade({ grossPnl: p, closeTime: `2026-10-0${i + 1}T10:00:00Z` }));
  it("after 3 wins", () => {
    const r = afterStreak(trades, opts, "WIN", 3);
    expect(r.following).toBe(3);
    expect(r.followingNetAvg?.toFixed(0)).toBe("-5");
    expect(r.otherCount).toBe(6);
    expect(r.otherNetAvg?.toFixed(0)).toBe("10");
  });
  it("no streak of losses → no data, not zero", () => {
    const r = afterStreak(trades, opts, "LOSS", 3);
    expect(r.following).toBe(0);
    expect(r.followingNetAvg).toBeNull();
  });
});
