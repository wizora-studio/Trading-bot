import { describe, expect, it } from "vitest";
import type { FundedRuleSet, FundedRules } from "@/domain/types";
import { evaluateFunded } from "./funded";
import { mkTrade } from "./testUtils";

function ruleSet(over: Partial<FundedRules> = {}, confirmed = true): FundedRuleSet {
  return {
    id: "rs1",
    accountId: "a1",
    version: 1,
    presetId: null,
    effectiveFrom: "2026-01-01T00:00:00Z",
    confirmedAt: confirmed ? "2026-01-01T00:00:00Z" : null,
    fieldStatus: {},
    fieldSource: {},
    rules: {
      firmName: "Test",
      planName: "10K",
      phase: "PHASE_1",
      startingBalance: "10000",
      profitTargetPct: "8",
      dailyLoss: { pct: "5", base: "INITIAL_BALANCE", measuredOn: "BALANCE", resetTimezone: "UTC", resetHour: 0 },
      maxLoss: { pct: "10", type: "STATIC", measuredOn: "BALANCE", lockAtStartingBalance: false },
      minTradingDays: 4,
      consistency: { maxPct: "40", base: "TOTAL_PROFIT" },
      costsIncluded: true,
      newsRule: "",
      weekendRule: "",
      eaAllowed: "UNKNOWN",
      otherNotes: "",
      ...over,
    },
  };
}

const check = (ev: ReturnType<typeof evaluateFunded>, rule: string) => ev.checks.find((c) => c.rule === rule)!;
const now = new Date("2026-10-05T12:00:00Z");

describe("funded rule engine", () => {
  it("spec worked example: 5% of prior day's ending balance 10,300 → floor 9,785", () => {
    const set = ruleSet({
      dailyLoss: { pct: "5", base: "DAY_START_BALANCE", measuredOn: "BALANCE", resetTimezone: "UTC", resetHour: 0 },
    });
    const trades = [mkTrade({ grossPnl: "300", closeTime: "2026-10-04T10:00:00Z" })];
    const ev = evaluateFunded(set, trades, now);
    expect(ev.todayStartBalance.toFixed(2)).toBe("10300.00");
    expect(ev.dailyFloorToday?.toFixed(2)).toBe("9785.00");
  });

  it("daily loss violation is proven from closed trades", () => {
    const trades = [
      mkTrade({ grossPnl: "-300", closeTime: "2026-10-05T09:00:00Z" }),
      mkTrade({ grossPnl: "-250", closeTime: "2026-10-05T10:00:00Z" }),
    ];
    const ev = evaluateFunded(ruleSet(), trades, now);
    const dl = check(ev, "DAILY_LOSS");
    expect(dl.state).toBe("CONFIRMED_VIOLATION");
    expect(dl.violationDay).toBe("2026-10-05");
    expect(ev.lifecycle).toBe("BREACHED");
  });

  it("near the limit → warning; equity-based rule never claims compliance", () => {
    const trades = [mkTrade({ grossPnl: "-400", closeTime: "2026-10-05T09:00:00Z" })];
    const near = evaluateFunded(ruleSet(), trades, now);
    expect(check(near, "DAILY_LOSS").state).toBe("POTENTIAL_RISK_WARNING");
    expect(check(near, "DAILY_LOSS").remaining?.toFixed(2)).toBe("100.00");

    const eq = ruleSet({
      dailyLoss: { pct: "5", base: "INITIAL_BALANCE", measuredOn: "EQUITY", resetTimezone: "UTC", resetHour: 0 },
    });
    const small = [mkTrade({ grossPnl: "-50", closeTime: "2026-10-05T09:00:00Z" })];
    expect(check(evaluateFunded(eq, small, now), "DAILY_LOSS").state).toBe("UNVERIFIABLE_FROM_CSV");
    expect(check(evaluateFunded(ruleSet(), small, now), "DAILY_LOSS").state).toBe("VERIFIED_COMPLIANT");
  });

  it("unconfirmed rule set → RULE_UNCONFIRMED everywhere", () => {
    const ev = evaluateFunded(ruleSet({}, false), [], now);
    expect(ev.checks.every((c) => c.state === "RULE_UNCONFIRMED")).toBe(true);
  });

  it("ambiguous field stays unconfirmed even after confirmation", () => {
    const set = ruleSet();
    set.fieldStatus.consistency = "AMBIGUOUS";
    const ev = evaluateFunded(set, [mkTrade({ grossPnl: "10", closeTime: "2026-10-01T00:00:00Z" })], now);
    expect(check(ev, "CONSISTENCY").state).toBe("RULE_UNCONFIRMED");
    expect(check(ev, "DAILY_LOSS").state).not.toBe("RULE_UNCONFIRMED");
  });

  it("static max loss floor = 9,000", () => {
    const trades = [mkTrade({ grossPnl: "500", closeTime: "2026-10-01T10:00:00Z" })];
    const ev = evaluateFunded(ruleSet(), trades, now);
    expect(ev.maxFloorNow?.toFixed(2)).toBe("9000.00");
    expect(check(ev, "MAX_LOSS").remaining?.toFixed(2)).toBe("1500.00");
  });

  it("EOD trailing floor follows the best END-OF-DAY balance, not the intraday high", () => {
    const set = ruleSet({ maxLoss: { pct: "10", type: "EOD_TRAILING", measuredOn: "BALANCE", lockAtStartingBalance: false } });
    const trades = [
      mkTrade({ grossPnl: "800", closeTime: "2026-10-01T10:00:00Z" }), // intraday 10,800
      mkTrade({ grossPnl: "-300", closeTime: "2026-10-01T15:00:00Z" }), // day 1 ends 10,500
      mkTrade({ grossPnl: "100", closeTime: "2026-10-02T10:00:00Z" }), // day 2 ends 10,600
    ];
    const ev = evaluateFunded(set, trades, now);
    // Highest EOD = 10,600 → floor 10,600 − 1,000 = 9,600
    expect(ev.maxFloorNow?.toFixed(2)).toBe("9600.00");
  });

  it("EOD trailing locks at the starting balance when the rule says so", () => {
    const set = ruleSet({ maxLoss: { pct: "10", type: "EOD_TRAILING", measuredOn: "BALANCE", lockAtStartingBalance: true } });
    const trades = [mkTrade({ grossPnl: "2000", closeTime: "2026-10-01T10:00:00Z" })];
    expect(evaluateFunded(set, trades, now).maxFloorNow?.toFixed(2)).toBe("10000.00");
  });

  it("profit target, minimum days, consistency with extra profit needed", () => {
    const trades = [
      mkTrade({ grossPnl: "600", closeTime: "2026-10-01T10:00:00Z" }),
      mkTrade({ grossPnl: "100", closeTime: "2026-10-02T10:00:00Z" }),
      mkTrade({ grossPnl: "100", closeTime: "2026-10-03T10:00:00Z" }),
    ];
    const ev = evaluateFunded(ruleSet(), trades, now);
    expect(check(ev, "PROFIT_TARGET").state).toBe("VERIFIED_COMPLIANT"); // 800 ≥ 8% of 10,000
    expect(check(ev, "MIN_DAYS").state).toBe("NOT_YET_MET"); // 3 of 4
    const c = check(ev, "CONSISTENCY");
    expect(c.used?.toFixed(2)).toBe("0.75"); // 600 / 800
    expect(c.state).toBe("POTENTIAL_RISK_WARNING");
    // Needs total ≥ 600 / 0.40 = 1,500 → 700 more
    expect(c.remaining?.toFixed(2)).toBe("700.00");
    expect(ev.lifecycle).toBe("IN_PROGRESS");
  });

  it("daily reset at 17:00 New York moves late trades to the next trading day", () => {
    const set = ruleSet({
      dailyLoss: { pct: "5", base: "INITIAL_BALANCE", measuredOn: "BALANCE", resetTimezone: "America/New_York", resetHour: 17 },
      minTradingDays: 2,
    });
    // 20:30 UTC = 16:30 NY (EDT) → day Oct 1; 21:30 UTC = 17:30 NY → day Oct 2
    const trades = [
      mkTrade({ grossPnl: "-300", closeTime: "2026-10-01T20:30:00Z" }),
      mkTrade({ grossPnl: "-300", closeTime: "2026-10-01T21:30:00Z" }),
    ];
    const ev = evaluateFunded(set, trades, now);
    expect(check(ev, "DAILY_LOSS").violationDay).toBeNull();
    expect(ev.tradingDays).toBe(2);
  });

  it("costs excluded when the firm does not count them", () => {
    const trades = [mkTrade({ grossPnl: "100", commission: "20", closeTime: "2026-10-01T10:00:00Z" })];
    expect(evaluateFunded(ruleSet({ costsIncluded: false }), trades, now).profit.toFixed(2)).toBe("100.00");
    expect(evaluateFunded(ruleSet({ costsIncluded: true }), trades, now).profit.toFixed(2)).toBe("80.00");
  });
});
