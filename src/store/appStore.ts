"use client";

import { del, get, set } from "idb-keyval";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type {
  FundedRuleSet,
  ImportBatch,
  JournalDay,
  PersonalRuleSet,
  RiskModelConfig,
  Settings,
  Trade,
  TradePlan,
  TradingAccount,
} from "@/domain/types";
import { DEFAULT_BREAKEVEN_TOLERANCE } from "@/config/thresholds";
import type { StrategyRecord } from "@/features/strategies/types";
import type { InstrumentSpec } from "@/services/analytics/instruments";
import type { ColumnMapping } from "@/features/import/parsers";

/**
 * The whole app state, saved on THIS device (IndexedDB) — see docs/DECISIONS.md D-010.
 * Nothing is sent to a server. Use Settings → Export to keep a backup file.
 */
export interface AppData {
  schemaVersion: 1;
  accounts: TradingAccount[];
  trades: Trade[];
  importBatches: ImportBatch[];
  fundedRuleSets: FundedRuleSet[];
  personalRuleSets: PersonalRuleSet[];
  riskModels: RiskModelConfig[];
  strategies: StrategyRecord[];
  journal: JournalDay[];
  plans: TradePlan[];
  settings: Settings;
  selectedAccountId: string | null;
  savedMappings: { id: string; name: string; mapping: ColumnMapping; headerKey: string }[];
  instrumentOverrides: Record<string, Partial<InstrumentSpec>>;
}

export const DEFAULT_SETTINGS: Settings = {
  language: "en",
  theme: "system",
  displayTimezone: "Asia/Karachi",
  breakevenTolerance: DEFAULT_BREAKEVEN_TOLERANCE,
  traderProfile: null,
};

export const EMPTY_DATA: AppData = {
  schemaVersion: 1,
  accounts: [],
  trades: [],
  importBatches: [],
  fundedRuleSets: [],
  personalRuleSets: [],
  riskModels: [],
  strategies: [],
  journal: [],
  plans: [],
  settings: DEFAULT_SETTINGS,
  selectedAccountId: null,
  savedMappings: [],
  instrumentOverrides: {},
};

interface AppActions {
  hydrated: boolean;
  setHydrated: () => void;
  /** Immutable update helper: every change goes through here. */
  update: (fn: (d: AppData) => Partial<AppData>) => void;
  replaceAll: (data: AppData) => void;
  resetAll: () => void;
}

export type AppState = AppData & AppActions;

const idbStorage: StateStorage = {
  getItem: async (name) => (await get<string>(name)) ?? null,
  setItem: async (name, value) => set(name, value),
  removeItem: async (name) => del(name),
};

/** Falls back to memory when IndexedDB is not available (private windows, tests). */
const safeStorage: StateStorage = {
  getItem: async (n) => {
    try {
      return await idbStorage.getItem(n);
    } catch {
      return null;
    }
  },
  setItem: async (n, v) => {
    try {
      await idbStorage.setItem(n, v);
    } catch {
      /* storage unavailable: data stays in memory for this session */
    }
  },
  removeItem: async (n) => {
    try {
      await idbStorage.removeItem(n);
    } catch {
      /* ignore */
    }
  },
};

export const useApp = create<AppState>()(
  persist(
    (setState) => ({
      ...EMPTY_DATA,
      hydrated: false,
      setHydrated: () => setState({ hydrated: true }),
      update: (fn) => setState((s) => fn(s)),
      replaceAll: (data) => setState({ ...EMPTY_DATA, ...data, settings: { ...DEFAULT_SETTINGS, ...data.settings } }),
      resetAll: () => setState({ ...EMPTY_DATA }),
    }),
    {
      name: "ai-trading-analyst-v1",
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => {
        const { hydrated: _h, setHydrated: _a, update: _u, replaceAll: _r, resetAll: _x, ...data } = s;
        return data;
      },
      onRehydrateStorage: () => (state) => state?.setHydrated(),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppData>;
        return { ...current, ...p, settings: { ...DEFAULT_SETTINGS, ...p.settings } };
      },
    },
  ),
);

/** Small unique id (time + random), good enough for one person's local data. */
export function newId(prefix: string): string {
  const rand = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

/** Returns a copy of all data for backup export. */
export function exportData(s: AppData): AppData {
  const { schemaVersion, accounts, trades, importBatches, fundedRuleSets, personalRuleSets, riskModels, strategies, journal, plans, settings, selectedAccountId, savedMappings, instrumentOverrides } = s;
  return { schemaVersion, accounts, trades, importBatches, fundedRuleSets, personalRuleSets, riskModels, strategies, journal, plans, settings, selectedAccountId, savedMappings, instrumentOverrides };
}
