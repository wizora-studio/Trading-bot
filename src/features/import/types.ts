import type { DataQuality, Trade, TradeSource } from "@/domain/types";

/** A trade parsed from a file, before it is given an id and saved to an account. */
export type DraftTrade = Omit<Trade, "id" | "accountId" | "importBatchId" | "fingerprint" | "tradePlanId">;

export interface RowError {
  /** 1-based row number in the file (header = row 1). */
  row: number;
  code: string;
  detail: string;
}

export interface ParseResult {
  format: ImportFormat;
  source: TradeSource;
  trades: DraftTrade[];
  errors: RowError[];
  /** Non-blocking notes such as "commission rows that could not be matched". */
  warnings: string[];
  quality: DataQuality;
}

export type ImportFormat =
  | "TRADINGVIEW_ACCOUNT_HISTORY"
  | "TRADINGVIEW_ORDER_HISTORY"
  | "STANDARD_TEMPLATE"
  | "MT5_POSITIONS"
  | "MAPPED"
  | "UNKNOWN";

export function emptyDraft(over: Partial<DraftTrade> & Pick<DraftTrade, "symbol" | "instrument" | "side" | "closeTime" | "grossPnl">): DraftTrade {
  return {
    source: "MANUAL",
    quantity: "0",
    quantityUnit: "UNITS",
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
    ...over,
  };
}
