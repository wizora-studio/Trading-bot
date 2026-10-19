import type { Trade } from "@/domain/types";
import { plannedRR, tradeR } from "./trade";

/**
 * Data Dependency Matrix in code (Phase 1, Module 10): for each group of metrics, how many trades have the fields it needs.
 * "PARTIAL" = the number is shown but is approximate or covers only some trades. "UNAVAILABLE" = no trade has the fields.
 */
export type Availability = "OK" | "PARTIAL" | "UNAVAILABLE";

export interface MetricCoverage {
  key: "NET_PNL" | "R_MULTIPLES" | "SESSIONS" | "HOLDING_TIME" | "PLANNED_RR" | "WEEKEND_CHECK" | "STRATEGY_ADHERENCE";
  status: Availability;
  covered: number;
  total: number;
}

const statusOf = (covered: number, total: number): Availability => (total === 0 || covered === 0 ? "UNAVAILABLE" : covered < total ? "PARTIAL" : "OK");

export function metricCoverage(trades: Trade[], accountCurrency = "USD"): MetricCoverage[] {
  const total = trades.length;
  const count = (f: (t: Trade) => boolean) => trades.filter(f).length;
  const costsSeen = count((t) => Number(t.commission) !== 0 || Number(t.swap) !== 0 || Number(t.fees) !== 0);
  const allCostsZero = total >= 5 && costsSeen === 0;
  const rs = count((t) => tradeR(t, accountCurrency) !== null);
  const opens = count((t) => t.openTime !== null);
  const rr = count((t) => plannedRR(t) !== null);
  const strat = count((t) => t.strategyId !== null);
  const make = (key: MetricCoverage["key"], covered: number): MetricCoverage => ({ key, status: statusOf(covered, total), covered, total });
  return [
    // Net P&L always exists; if no trade shows any cost, the net figure is probably too high.
    { key: "NET_PNL", status: total === 0 ? "UNAVAILABLE" : allCostsZero ? "PARTIAL" : "OK", covered: allCostsZero ? 0 : total, total },
    make("R_MULTIPLES", rs),
    make("SESSIONS", opens), // without an open time the session uses the close time: approximate
    make("HOLDING_TIME", opens),
    make("PLANNED_RR", rr),
    make("WEEKEND_CHECK", opens),
    make("STRATEGY_ADHERENCE", strat),
  ];
}
