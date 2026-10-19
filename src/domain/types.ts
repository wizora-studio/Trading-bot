import type { DecimalString } from "@/services/analytics/decimal";

/**
 * Core data models. All money and price values are decimal strings (never JS numbers),
 * all times are ISO-8601 strings in UTC.
 */

export type AccountType = "NORMAL" | "FUNDED" | "BACKTEST";
export type Side = "LONG" | "SHORT";
export type QuantityUnit = "LOTS" | "UNITS";
export type TradeSource = "TRADINGVIEW" | "STANDARD_CSV" | "MT5" | "MAPPED_CSV" | "MANUAL" | "SAMPLE";

export interface TradingAccount {
  id: string;
  name: string;
  type: AccountType;
  platform: string;
  baseCurrency: string;
  startingBalance: DecimalString;
  createdAt: string;
  archived: boolean;
  isSample: boolean;
  activeStrategyIds: string[];
  defaultStrategyId: string | null;
}

export interface Trade {
  id: string;
  accountId: string;
  importBatchId: string | null;
  source: TradeSource;
  fingerprint: string;
  /** Symbol as written by the broker, e.g. "FX:EURUSD" or "XAUUSD.m". */
  symbol: string;
  /** Canonical instrument from the registry, e.g. "EURUSD", or the cleaned symbol when unknown. */
  instrument: string;
  side: Side;
  quantity: DecimalString;
  quantityUnit: QuantityUnit;
  openTime: string | null;
  closeTime: string;
  entryPrice: DecimalString | null;
  exitPrice: DecimalString | null;
  stopLoss: DecimalString | null;
  takeProfit: DecimalString | null;
  /** Money the trader planned to risk. If empty, it is derived from stop-loss distance when possible. */
  plannedRisk: DecimalString | null;
  /** Profit or loss before costs. */
  grossPnl: DecimalString;
  /** Costs are stored as positive amounts that reduce profit. */
  commission: DecimalString;
  swap: DecimalString;
  fees: DecimalString;
  notes: string;
  mistakeTags: string[];
  strategyId: string | null;
  /** Checklist answers for the assigned strategy: rule id → ticked. */
  checklist: Record<string, boolean>;
  /** Fields the trader edited by hand after import (audit trail). */
  userEdited: string[];
  tradePlanId: string | null;
  /** Before/after chart screenshot links (e.g., TradingView snapshot URLs). */
  screenshotUrls?: string[];
}

export interface DataQualityIssue {
  code: string;
  severity: "INFO" | "WARNING" | "ERROR";
  count: number;
}

export interface DataQuality {
  /** 0–100. */
  score: number;
  issues: DataQualityIssue[];
}

export interface ImportBatch {
  id: string;
  accountId: string;
  source: TradeSource;
  fileName: string;
  importedAt: string;
  timezone: string;
  tradeIds: string[];
  skippedDuplicates: number;
  dataQuality: DataQuality;
  rolledBack: boolean;
}

export type RuleFieldStatus = "CLEAR" | "ASSUMED" | "AMBIGUOUS" | "MISSING";

export type DailyLossBase = "INITIAL_BALANCE" | "DAY_START_BALANCE";
export type MaxLossType = "STATIC" | "EOD_TRAILING" | "INTRADAY_TRAILING";
export type MeasuredOn = "EQUITY" | "BALANCE";

export interface FundedRules {
  firmName: string;
  planName: string;
  phase: "PHASE_1" | "PHASE_2" | "PHASE_3" | "INSTANT" | "FUNDED";
  startingBalance: DecimalString;
  profitTargetPct: DecimalString | null;
  dailyLoss: {
    pct: DecimalString;
    base: DailyLossBase;
    measuredOn: MeasuredOn;
    resetTimezone: string;
    resetHour: number;
  } | null;
  maxLoss: {
    pct: DecimalString;
    type: MaxLossType;
    measuredOn: MeasuredOn;
    /** EOD trailing that stops trailing once the floor reaches the starting balance. */
    lockAtStartingBalance: boolean;
  } | null;
  minTradingDays: number | null;
  consistency: { maxPct: DecimalString; base: "TOTAL_PROFIT" | "PROFIT_TARGET" } | null;
  costsIncluded: boolean;
  newsRule: string;
  weekendRule: string;
  eaAllowed: "YES" | "NO" | "UNKNOWN";
  otherNotes: string;
}

export interface FundedRuleSet {
  id: string;
  accountId: string;
  version: number;
  presetId: string | null;
  effectiveFrom: string;
  confirmedAt: string | null;
  rules: FundedRules;
  fieldStatus: Partial<Record<FundedRuleField, RuleFieldStatus>>;
  fieldSource: Partial<Record<FundedRuleField, "USER" | "PRESET" | "DEFAULT">>;
}

export type FundedRuleField =
  | "startingBalance"
  | "profitTargetPct"
  | "dailyLoss"
  | "maxLoss"
  | "minTradingDays"
  | "consistency"
  | "costsIncluded"
  | "newsRule"
  | "weekendRule"
  | "eaAllowed";

export type SessionName = "ASIAN" | "LONDON" | "OVERLAP" | "NEW_YORK" | "OFF_HOURS";

export interface PersonalRules {
  maxRiskPerTradePct: DecimalString | null;
  maxDailyLossPct: DecimalString | null;
  maxTradesPerDay: number | null;
  maxConsecutiveLosses: number | null;
  allowedSessions: SessionName[];
  allowedInstruments: string[];
  minRiskReward: DecimalString | null;
}

export interface PersonalRuleSet {
  id: string;
  accountId: string;
  version: number;
  effectiveFrom: string;
  confirmedAt: string | null;
  rules: PersonalRules;
}

export type RiskModelId = "R1" | "R4" | "R5";

export interface RiskModelConfig {
  id: string;
  accountId: string;
  model: RiskModelId;
  version: number;
  enabled: boolean;
  confirmedAt: string | null;
  params: Record<string, string>;
}

export interface JournalDay {
  id: string;
  accountId: string;
  /** "YYYY-MM-DD" in the display timezone. */
  date: string;
  plan: { bias: string; setups: string; maxTrades: string; maxRiskPct: string };
  review: { wentWell: string; mistakes: string; lessons: string };
  quickNote: string;
}

export interface TradePlan {
  id: string;
  accountId: string;
  createdAt: string;
  strategyId: string | null;
  instrument: string;
  side: Side;
  entry: DecimalString;
  stopLoss: DecimalString;
  targets: DecimalString[];
  riskPct: DecimalString;
  atr: DecimalString | null;
  newsWithin30Min: boolean;
  checklist: Record<string, boolean>;
  lots: DecimalString;
  riskAmount: DecimalString;
  linkedTradeId: string | null;
  notes: string;
}

export interface Settings {
  language: "en";
  theme: "system" | "light" | "dark";
  displayTimezone: string;
  /** |net P&L| below this amount counts as breakeven. */
  breakevenTolerance: DecimalString;
  traderProfile: TraderProfile | null;
}

export interface TraderProfile {
  capital: string;
  accountKind: "PERSONAL" | "PROP";
  riskAppetite: "CONSERVATIVE" | "STANDARD" | "AGGRESSIVE";
  markets: string[];
  style: "SCALPING" | "INTRADAY" | "SWING";
  execution: "MANUAL" | "AUTOMATED";
  confirmedAt: string | null;
}
