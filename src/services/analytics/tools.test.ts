import { describe, expect, it } from "vitest";
import { mapSymbol, getSpec } from "./instruments";
import { checkPersonalRules } from "./personalRules";
import { positionSize } from "./positionSize";
import { correlationCheck, DEFAULT_LADDER, ladderState, rrGate } from "./riskModels";
import { mkTrade } from "./testUtils";
import { parseExportTime, tradingDayKey, wallTimeToUtc } from "./time";
import { sessionHoursIn, sessionOf } from "./trade";

describe("position size (Risk Model R1)", () => {
  it("EURUSD: $10,000 × 0.5%, 20 pips → 0.25 lots", () => {
    const r = positionSize({
      balance: "10000",
      riskMode: "PERCENT",
      riskValue: "0.5",
      entry: "1.0850",
      stopLoss: "1.0830",
      spec: getSpec("EURUSD")!,
    });
    expect(r.riskAmount.toFixed(2)).toBe("50.00");
    expect(r.stopDistancePips.toFixed(1)).toBe("20.0");
    expect(r.pipValuePerLot.toFixed(2)).toBe("10.00");
    expect(r.lots.toFixed(2)).toBe("0.25");
  });

  it("Gold (corrected example V2): $50 risk, $5 stop → 0.10 lots", () => {
    const r = positionSize({ balance: "10000", riskMode: "MONEY", riskValue: "50", entry: "2650", stopLoss: "2645", spec: getSpec("XAUUSD")! });
    expect(r.stopDistancePips.toFixed(0)).toBe("50");
    expect(r.pipValuePerLot.toFixed(2)).toBe("10.00");
    expect(r.lots.toFixed(2)).toBe("0.10");
  });

  it("rounds DOWN so the risk never exceeds the plan, and respects a rule cap", () => {
    const r = positionSize({ balance: "10000", riskMode: "MONEY", riskValue: "55", entry: "1.1000", stopLoss: "1.0970", spec: getSpec("EURUSD")!, maxRiskAmount: "30" });
    expect(r.cappedByRule).toBe(true);
    expect(r.lots.toFixed(2)).toBe("0.10"); // 30 / (30 × 10) = 0.1
    expect(r.actualRisk.lte(30)).toBe(true);
  });

  it("USDJPY converts the pip value with the entry price", () => {
    const r = positionSize({ balance: "10000", riskMode: "MONEY", riskValue: "100", entry: "150.00", stopLoss: "149.50", spec: getSpec("USDJPY")! });
    // pip value = 100,000 × 0.01 ÷ 150 = 6.6667 USD; 50 pips → 100 / 333.33 = 0.30
    expect(r.pipValuePerLot.toFixed(4)).toBe("6.6667");
    expect(r.lots.toFixed(2)).toBe("0.30");
    expect(r.warnings).toContain("RATE_FROM_ENTRY_PRICE");
  });
});

describe("handbook module 2 examples", () => {
  const lots = (inst: string, entry: string, stop: string) =>
    positionSize({ balance: "10000", riskMode: "MONEY", riskValue: "50", entry, stopLoss: stop, spec: getSpec(inst)! });
  it("USDJPY $50 risk, 50 pips at 150.00 → 0.15 lots", () => {
    const r = lots("USDJPY", "150.00", "149.50");
    expect(r.pipValuePerLot.toFixed(2)).toBe("6.67");
    expect(r.lots.toFixed(2)).toBe("0.15");
  });
  it("US30 $50 risk, 50 points → 1.00 lot", () => {
    expect(lots("US30", "42000", "41950").lots.toFixed(2)).toBe("1.00");
  });
  it("self-check 3: USDJPY at 140, 1 lot, 20 pips = $142.86", () => {
    const pipValue = positionSize({ balance: "10000", riskMode: "MONEY", riskValue: "100", entry: "140.00", stopLoss: "139.80", spec: getSpec("USDJPY")! }).pipValuePerLot;
    expect(pipValue.times(20).toFixed(2)).toBe("142.86");
  });
});

describe("symbol mapping", () => {
  it.each([
    ["FX:EURUSD", "EURUSD"],
    ["OANDA:XAUUSD", "XAUUSD"],
    ["XAUUSD.m", "XAUUSD"],
    ["GOLD", "XAUUSD"],
    ["EURUSDm", "EURUSD"],
    ["US30.cash", "US30"],
    ["USTEC", "NAS100"],
    ["DJ30", "US30"],
  ])("%s → %s", (raw, want) => {
    expect(mapSymbol(raw)).toEqual({ instrument: want, known: true });
  });
  it("unknown symbols are kept and flagged", () => {
    expect(mapSymbol("ABCXYZ.pro")).toEqual({ instrument: "ABCXYZ", known: false });
  });
});

describe("time and sessions (DST-aware)", () => {
  it("wall time to UTC across DST", () => {
    expect(wallTimeToUtc(2026, 7, 1, 9, 30, 0, "America/New_York").toISOString()).toBe("2026-07-01T13:30:00.000Z");
    expect(wallTimeToUtc(2026, 1, 15, 9, 30, 0, "America/New_York").toISOString()).toBe("2026-01-15T14:30:00.000Z");
    expect(wallTimeToUtc(2026, 3, 1, 0, 0, 0, "Asia/Karachi").toISOString()).toBe("2026-02-28T19:00:00.000Z");
  });

  it("parses export timestamps in the declared timezone", () => {
    expect(parseExportTime("2026.10.14 13:22:05", "Europe/Athens")?.toISOString()).toBe("2026-10-14T10:22:05.000Z");
    expect(parseExportTime("2026-10-14 13:22:05", "UTC")?.toISOString()).toBe("2026-10-14T13:22:05.000Z");
    expect(parseExportTime("2026-10-14T13:22:05Z", "Asia/Karachi")?.toISOString()).toBe("2026-10-14T13:22:05.000Z");
    expect(parseExportTime("not a date", "UTC")).toBeNull();
  });

  it("trading day with a reset hour", () => {
    expect(tradingDayKey(new Date("2026-10-01T21:30:00Z"), "America/New_York", 17)).toBe("2026-10-02");
    expect(tradingDayKey(new Date("2026-10-01T20:30:00Z"), "America/New_York", 17)).toBe("2026-10-01");
  });

  it("sessions", () => {
    expect(sessionOf(new Date("2026-07-01T08:30:00Z"))).toBe("LONDON"); // 09:30 BST
    expect(sessionOf(new Date("2026-01-15T13:30:00Z"))).toBe("OVERLAP"); // 13:30 London, 08:30 NY
    expect(sessionOf(new Date("2026-01-15T19:00:00Z"))).toBe("NEW_YORK");
    expect(sessionOf(new Date("2026-10-20T03:00:00Z"))).toBe("ASIAN"); // 12:00 Tokyo
    expect(sessionOf(new Date("2026-10-18T10:00:00Z"))).toBe("OFF_HOURS"); // Sunday
  });

  it("session hours in Pakistan time change with daylight saving", () => {
    expect(sessionHoursIn("LONDON", new Date("2026-07-01T12:00:00Z"), "Asia/Karachi")).toEqual({ start: "12:00", end: "21:00" });
    expect(sessionHoursIn("LONDON", new Date("2026-01-15T12:00:00Z"), "Asia/Karachi")).toEqual({ start: "13:00", end: "22:00" });
    expect(sessionHoursIn("NEW_YORK", new Date("2026-07-01T12:00:00Z"), "Asia/Karachi")).toEqual({ start: "17:00", end: "02:00" });
  });
});

describe("personal rules", () => {
  const rules = {
    maxRiskPerTradePct: "1",
    maxDailyLossPct: null,
    maxTradesPerDay: 2,
    maxConsecutiveLosses: null,
    allowedSessions: [],
    allowedInstruments: ["EURUSD"],
    minRiskReward: null,
  };
  it("flags trades-per-day, instrument and risk, and prices the cost", () => {
    const trades = [
      mkTrade({ id: "a", grossPnl: "50", closeTime: "2026-10-01T09:00:00Z", plannedRisk: "50" }),
      mkTrade({ id: "b", grossPnl: "-50", closeTime: "2026-10-01T10:00:00Z", plannedRisk: "50" }),
      mkTrade({ id: "c", grossPnl: "-80", closeTime: "2026-10-01T11:00:00Z", plannedRisk: "50" }),
      mkTrade({ id: "d", grossPnl: "-200", closeTime: "2026-10-02T11:00:00Z", plannedRisk: "200", instrument: "XAUUSD" }),
    ];
    const res = checkPersonalRules(rules, trades, { startingBalance: "10000", timeZone: "UTC" });
    expect(res.violations.map((v) => `${v.tradeId}:${v.kind}`).sort()).toEqual(["c:TRADES_PER_DAY", "d:INSTRUMENT", "d:RISK_PER_TRADE"]);
    expect(res.costOfViolations.toFixed(2)).toBe("-280.00");
    expect(res.netWithoutViolations.toFixed(2)).toBe("0.00");
  });
});

describe("risk models R4 and R5", () => {
  it("ladder moves to CAUTION at −3% from the closed-balance high", () => {
    const trades = [
      mkTrade({ grossPnl: "500", closeTime: "2026-10-01T10:00:00Z" }),
      mkTrade({ grossPnl: "-400", closeTime: "2026-10-02T10:00:00Z" }),
    ];
    const s = ladderState(trades, "10000", DEFAULT_LADDER, "UTC", new Date("2026-10-05T00:00:00Z"));
    expect(s.highWaterMark.toFixed(0)).toBe("10500");
    expect(s.drawdownPct.toFixed(2)).toBe("3.81");
    expect(s.state).toBe("CAUTION");
    expect(s.riskPctNow.toString()).toBe("0.25");
  });
  it("min R:R gate", () => {
    expect(rrGate("100", "99", "101.5", "1.8").pass).toBe(false);
    expect(rrGate("100", "99", "102", "1.8").pass).toBe(true);
  });
  it("correlation cap", () => {
    const r = correlationCheck({ instrument: "GBPUSD", riskAmount: "50" }, [{ instrument: "EURUSD", riskAmount: "50", atBreakeven: false }], "50");
    expect(r.groupRisk.toFixed(0)).toBe("100");
    expect(r.pass).toBe(false); // 100 > 75
  });
});
