import type { FundedRuleField, FundedRules, RuleFieldStatus } from "@/domain/types";

/**
 * Versioned prop-firm presets. Presets are NEVER assumed to be current: the user must review and
 * confirm every rule (Module G3a). Each preset stores where it came from and when it was checked.
 */
export interface FundedPreset {
  id: string;
  firm: string;
  plan: string;
  phase: FundedRules["phase"];
  version: string;
  sourceUrl: string | null;
  lastVerified: string | null;
  rules: Omit<FundedRules, "startingBalance">;
  fieldStatus: Partial<Record<FundedRuleField, RuleFieldStatus>>;
  notes: string;
}

export const FUNDED_PRESETS: FundedPreset[] = [
  {
    id: "ftmo-2step-p1",
    firm: "FTMO",
    plan: "FTMO Challenge (2-Step)",
    phase: "PHASE_1",
    version: "2026-10-19",
    sourceUrl: "https://ftmo.com/en/trading-objectives/",
    lastVerified: "2026-10-19",
    rules: {
      firmName: "FTMO",
      planName: "FTMO Challenge (2-Step)",
      phase: "PHASE_1",
      profitTargetPct: "10",
      dailyLoss: { pct: "5", base: "INITIAL_BALANCE", measuredOn: "EQUITY", resetTimezone: "Europe/Prague", resetHour: 0 },
      maxLoss: { pct: "10", type: "STATIC", measuredOn: "EQUITY", lockAtStartingBalance: false },
      minTradingDays: 4,
      consistency: null,
      costsIncluded: true,
      newsRule: "",
      weekendRule: "",
      eaAllowed: "UNKNOWN",
      otherNotes: "Daily loss is recalculated at 00:00 CE(S)T from that day's starting balance, limit = 5% of initial capital.",
    },
    fieldStatus: {
      profitTargetPct: "CLEAR",
      dailyLoss: "CLEAR",
      maxLoss: "CLEAR",
      minTradingDays: "CLEAR",
      consistency: "CLEAR",
      costsIncluded: "ASSUMED",
      newsRule: "MISSING",
      weekendRule: "MISSING",
      eaAllowed: "MISSING",
    },
    notes: "Checked on the official FTMO 'Trading Objectives' page on 2026-10-19. The 2-Step page lists no consistency rule.",
  },
  {
    id: "ftmo-2step-p2",
    firm: "FTMO",
    plan: "FTMO Verification (2-Step)",
    phase: "PHASE_2",
    version: "2026-10-19",
    sourceUrl: "https://ftmo.com/en/trading-objectives/",
    lastVerified: "2026-10-19",
    rules: {
      firmName: "FTMO",
      planName: "FTMO Verification (2-Step)",
      phase: "PHASE_2",
      profitTargetPct: "5",
      dailyLoss: { pct: "5", base: "INITIAL_BALANCE", measuredOn: "EQUITY", resetTimezone: "Europe/Prague", resetHour: 0 },
      maxLoss: { pct: "10", type: "STATIC", measuredOn: "EQUITY", lockAtStartingBalance: false },
      minTradingDays: 4,
      consistency: null,
      costsIncluded: true,
      newsRule: "",
      weekendRule: "",
      eaAllowed: "UNKNOWN",
      otherNotes: "",
    },
    fieldStatus: {
      profitTargetPct: "CLEAR",
      dailyLoss: "CLEAR",
      maxLoss: "CLEAR",
      minTradingDays: "CLEAR",
      consistency: "CLEAR",
      costsIncluded: "ASSUMED",
      newsRule: "MISSING",
      weekendRule: "MISSING",
      eaAllowed: "MISSING",
    },
    notes: "Checked on the official FTMO 'Trading Objectives' page on 2026-10-19.",
  },
  {
    id: "generic-2step",
    firm: "Generic template",
    plan: "Typical 2-step challenge (8% / 5% daily / 10% max)",
    phase: "PHASE_1",
    version: "template",
    sourceUrl: null,
    lastVerified: null,
    rules: {
      firmName: "",
      planName: "",
      phase: "PHASE_1",
      profitTargetPct: "8",
      dailyLoss: { pct: "5", base: "DAY_START_BALANCE", measuredOn: "EQUITY", resetTimezone: "Europe/Athens", resetHour: 0 },
      maxLoss: { pct: "10", type: "STATIC", measuredOn: "EQUITY", lockAtStartingBalance: false },
      minTradingDays: 3,
      consistency: null,
      costsIncluded: true,
      newsRule: "",
      weekendRule: "",
      eaAllowed: "UNKNOWN",
      otherNotes: "",
    },
    fieldStatus: {
      profitTargetPct: "ASSUMED",
      dailyLoss: "ASSUMED",
      maxLoss: "ASSUMED",
      minTradingDays: "ASSUMED",
      consistency: "ASSUMED",
      costsIncluded: "ASSUMED",
      newsRule: "MISSING",
      weekendRule: "MISSING",
      eaAllowed: "MISSING",
    },
    notes: "Not a real firm. A starting point only: replace every value with your firm's official rules.",
  },
  {
    id: "generic-futures-eod",
    firm: "Generic template",
    plan: "Futures-style EOD trailing drawdown",
    phase: "PHASE_1",
    version: "template",
    sourceUrl: null,
    lastVerified: null,
    rules: {
      firmName: "",
      planName: "",
      phase: "PHASE_1",
      profitTargetPct: "6",
      dailyLoss: null,
      maxLoss: { pct: "4", type: "EOD_TRAILING", measuredOn: "BALANCE", lockAtStartingBalance: true },
      minTradingDays: null,
      consistency: { maxPct: "50", base: "PROFIT_TARGET" },
      costsIncluded: true,
      newsRule: "",
      weekendRule: "",
      eaAllowed: "UNKNOWN",
      otherNotes: "",
    },
    fieldStatus: {
      profitTargetPct: "ASSUMED",
      dailyLoss: "ASSUMED",
      maxLoss: "ASSUMED",
      minTradingDays: "ASSUMED",
      consistency: "ASSUMED",
      costsIncluded: "ASSUMED",
      newsRule: "MISSING",
      weekendRule: "MISSING",
      eaAllowed: "MISSING",
    },
    notes: "Not a real firm. Shows how an EOD trailing drawdown that locks at the starting balance is set up.",
  },
];
