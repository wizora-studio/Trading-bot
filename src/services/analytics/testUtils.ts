import type { Trade } from "@/domain/types";

let counter = 0;

/** Builds a test trade with sensible defaults. Only for unit tests. */
export function mkTrade(p: Partial<Trade> & { grossPnl: string; closeTime: string }): Trade {
  counter += 1;
  return {
    id: p.id ?? `t${counter}`,
    accountId: "a1",
    importBatchId: null,
    source: "MANUAL",
    fingerprint: `f${counter}`,
    symbol: p.instrument ?? "EURUSD",
    instrument: "EURUSD",
    side: "LONG",
    quantity: "1",
    quantityUnit: "LOTS",
    openTime: null,
    entryPrice: null,
    exitPrice: null,
    stopLoss: null,
    takeProfit: null,
    plannedRisk: null,
    commission: "0",
    swap: "0",
    fees: "0",
    notes: "",
    mistakeTags: [],
    strategyId: null,
    checklist: {},
    userEdited: [],
    tradePlanId: null,
    ...p,
  };
}
