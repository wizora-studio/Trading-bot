"use client";

import type {
  AccountType,
  FundedRuleSet,
  FundedRules,
  ImportBatch,
  JournalDay,
  PersonalRules,
  RiskModelConfig,
  RiskModelId,
  Trade,
  TradePlan,
  TradingAccount,
} from "@/domain/types";
import { generateDemoTrades } from "@/features/demo/generateDemo";
import { fingerprint } from "@/features/import/fingerprint";
import type { ParseResult } from "@/features/import/types";
import { FUNDED_PRESETS } from "@/features/funded/presets";
import type { StrategySpec } from "@/features/strategies/schema";
import { SEED_STRATEGIES } from "@/features/strategies/seeds";
import type { RuleDecision, StrategyRecord } from "@/features/strategies/types";
import { checklistRules } from "@/features/strategies/types";
import { type AppData, newId, useApp } from "./appStore";

const now = () => new Date().toISOString();
const upd = (fn: (d: AppData) => Partial<AppData>) => useApp.getState().update(fn);

// ------------------------------------------------------------------ accounts

export function createAccount(input: { name: string; type: AccountType; platform: string; baseCurrency: string; startingBalance: string }): string {
  const id = newId("acc");
  const acc: TradingAccount = { id, ...input, createdAt: now(), archived: false, isSample: false, activeStrategyIds: [], defaultStrategyId: null };
  upd((d) => ({ accounts: [...d.accounts, acc], selectedAccountId: id }));
  return id;
}

export function updateAccount(id: string, patch: Partial<TradingAccount>) {
  upd((d) => ({ accounts: d.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));
}

/** Deletes an account and everything that belongs to it. */
export function deleteAccount(id: string) {
  upd((d) => {
    const accounts = d.accounts.filter((a) => a.id !== id);
    return {
      accounts,
      trades: d.trades.filter((t) => t.accountId !== id),
      importBatches: d.importBatches.filter((b) => b.accountId !== id),
      fundedRuleSets: d.fundedRuleSets.filter((r) => r.accountId !== id),
      personalRuleSets: d.personalRuleSets.filter((r) => r.accountId !== id),
      riskModels: d.riskModels.filter((r) => r.accountId !== id),
      journal: d.journal.filter((j) => j.accountId !== id),
      plans: d.plans.filter((p) => p.accountId !== id),
      selectedAccountId: d.selectedAccountId === id ? (accounts[0]?.id ?? null) : d.selectedAccountId,
    };
  });
}

export function selectAccount(id: string | null) {
  upd(() => ({ selectedAccountId: id }));
}

// ------------------------------------------------------------------ strategies

/** Adds the 20 Appendix A seed strategies once (as DRAFT). */
export function ensureSeedStrategies() {
  const have = new Set(useApp.getState().strategies.map((s) => s.seedKey).filter(Boolean));
  const missing = SEED_STRATEGIES.filter((s) => !have.has(s.seedKey));
  if (!missing.length) return;
  const records: StrategyRecord[] = missing.map((s) => {
    const { seedKey, ...spec } = s;
    return {
      id: `seed-${seedKey.toLowerCase()}`,
      origin: "SEED",
      seedKey,
      spec: spec as StrategySpec,
      rawText: "",
      status: "DRAFT",
      version: 1,
      createdAt: now(),
      confirmedAt: null,
      ruleDecisions: {},
      ambiguityAnswers: {},
      history: [{ version: 1, at: now(), status: "DRAFT", note: "Seeded from Appendix A" }],
    };
  });
  upd((d) => ({ strategies: [...d.strategies, ...records] }));
}

export function addImportedStrategies(specs: StrategySpec[], rawText: string): string[] {
  const records: StrategyRecord[] = specs.map((spec) => ({
    id: newId("str"),
    origin: "IMPORT",
    seedKey: null,
    spec,
    rawText,
    status: "UNCONFIRMED",
    version: 1,
    createdAt: now(),
    confirmedAt: null,
    ruleDecisions: {},
    ambiguityAnswers: {},
    history: [{ version: 1, at: now(), status: "UNCONFIRMED", note: "Imported strategy spec" }],
  }));
  upd((d) => ({ strategies: [...d.strategies, ...records] }));
  return records.map((r) => r.id);
}

export function addManualStrategy(spec: StrategySpec): string {
  const id = newId("str");
  const rec: StrategyRecord = {
    id,
    origin: "MANUAL",
    seedKey: null,
    spec,
    rawText: "",
    status: "UNCONFIRMED",
    version: 1,
    createdAt: now(),
    confirmedAt: null,
    ruleDecisions: {},
    ambiguityAnswers: {},
    history: [{ version: 1, at: now(), status: "UNCONFIRMED", note: "Created by hand" }],
  };
  upd((d) => ({ strategies: [...d.strategies, rec] }));
  return id;
}

/** Any change to a strategy creates a new version. Confirmation is lost until the user confirms again. */
export function editStrategy(id: string, patch: { ruleDecisions?: Record<string, RuleDecision>; ambiguityAnswers?: Record<string, string> }, note: string) {
  upd((d) => ({
    strategies: d.strategies.map((s) =>
      s.id !== id
        ? s
        : {
            ...s,
            ...patch,
            version: s.version + 1,
            status: s.status === "CONFIRMED" ? "UNCONFIRMED" : s.status,
            confirmedAt: s.status === "CONFIRMED" ? null : s.confirmedAt,
            history: [...s.history, { version: s.version + 1, at: now(), status: s.status === "CONFIRMED" ? "UNCONFIRMED" : s.status, note }],
          },
    ),
  }));
}

export function confirmStrategy(id: string) {
  upd((d) => ({
    strategies: d.strategies.map((s) =>
      s.id !== id ? s : { ...s, status: "CONFIRMED", confirmedAt: now(), version: s.version + 1, history: [...s.history, { version: s.version + 1, at: now(), status: "CONFIRMED", note: "Read-Back confirmed" }] },
    ),
  }));
}

export function deleteStrategy(id: string) {
  upd((d) => ({
    strategies: d.strategies.filter((s) => s.id !== id),
    accounts: d.accounts.map((a) => ({ ...a, activeStrategyIds: a.activeStrategyIds.filter((x) => x !== id), defaultStrategyId: a.defaultStrategyId === id ? null : a.defaultStrategyId })),
    trades: d.trades.map((t) => (t.strategyId === id ? { ...t, strategyId: null, checklist: {} } : t)),
  }));
}

export function setStrategyActive(accountId: string, strategyId: string, active: boolean) {
  upd((d) => ({
    accounts: d.accounts.map((a) =>
      a.id !== accountId
        ? a
        : {
            ...a,
            activeStrategyIds: active ? [...new Set([...a.activeStrategyIds, strategyId])] : a.activeStrategyIds.filter((x) => x !== strategyId),
            defaultStrategyId: !active && a.defaultStrategyId === strategyId ? null : a.defaultStrategyId,
          },
    ),
  }));
}

// ------------------------------------------------------------------ trades & imports

/** Saves parsed trades as one import batch. Duplicates (same fingerprint) are skipped. */
export function commitImport(accountId: string, result: ParseResult, fileName: string, timezone: string): ImportBatch {
  const batchId = newId("imp");
  const existing = new Set(useApp.getState().trades.filter((t) => t.accountId === accountId).map((t) => t.fingerprint));
  const fresh: Trade[] = [];
  let skipped = 0;
  for (const draft of result.trades) {
    const fp = fingerprint(accountId, draft);
    if (existing.has(fp)) {
      skipped += 1;
      continue;
    }
    existing.add(fp);
    fresh.push({ ...draft, id: newId("tr"), accountId, importBatchId: batchId, fingerprint: fp, tradePlanId: null });
  }
  const batch: ImportBatch = {
    id: batchId,
    accountId,
    source: result.source,
    fileName,
    importedAt: now(),
    timezone,
    tradeIds: fresh.map((t) => t.id),
    skippedDuplicates: skipped,
    dataQuality: result.quality,
    rolledBack: false,
  };
  upd((d) => ({ trades: [...d.trades, ...fresh], importBatches: [...d.importBatches, batch] }));
  return batch;
}

/** Undoes one import cleanly: removes only that batch's trades. */
export function rollbackImport(batchId: string) {
  upd((d) => ({
    trades: d.trades.filter((t) => t.importBatchId !== batchId),
    importBatches: d.importBatches.map((b) => (b.id === batchId ? { ...b, rolledBack: true } : b)),
  }));
}

export function addManualTrade(accountId: string, draft: Omit<Trade, "id" | "accountId" | "importBatchId" | "fingerprint" | "tradePlanId">): string {
  const id = newId("tr");
  const fp = fingerprint(accountId, draft);
  upd((d) => ({ trades: [...d.trades, { ...draft, id, accountId, importBatchId: null, fingerprint: fp, tradePlanId: null }] }));
  return id;
}

/** Edits a trade and records which fields the trader changed by hand (audit trail). */
export function updateTrade(id: string, patch: Partial<Trade>, markEdited = true) {
  upd((d) => ({
    trades: d.trades.map((t) => {
      if (t.id !== id) return t;
      const edited = markEdited ? [...new Set([...t.userEdited, ...Object.keys(patch).filter((k) => !["checklist", "notes", "mistakeTags", "strategyId"].includes(k))])] : t.userEdited;
      return { ...t, ...patch, userEdited: edited };
    }),
  }));
}

export function bulkAssignStrategy(ids: string[], strategyId: string | null) {
  const set = new Set(ids);
  upd((d) => ({ trades: d.trades.map((t) => (set.has(t.id) ? { ...t, strategyId, checklist: t.strategyId === strategyId ? t.checklist : {} } : t)) }));
}

export function bulkAddTag(ids: string[], tag: string) {
  const set = new Set(ids);
  upd((d) => ({ trades: d.trades.map((t) => (set.has(t.id) && !t.mistakeTags.includes(tag) ? { ...t, mistakeTags: [...t.mistakeTags, tag] } : t)) }));
}

export function deleteTrades(ids: string[]) {
  const set = new Set(ids);
  upd((d) => ({ trades: d.trades.filter((t) => !set.has(t.id)) }));
}

// ------------------------------------------------------------------ rules

export function saveFundedRules(accountId: string, rules: FundedRules, meta: Pick<FundedRuleSet, "presetId" | "fieldStatus" | "fieldSource">): string {
  const prev = latestFunded(accountId);
  const id = newId("frs");
  const set: FundedRuleSet = { id, accountId, version: (prev?.version ?? 0) + 1, effectiveFrom: now(), confirmedAt: null, rules, ...meta };
  upd((d) => ({ fundedRuleSets: [...d.fundedRuleSets, set] }));
  return id;
}

export function confirmFundedRules(id: string) {
  upd((d) => ({ fundedRuleSets: d.fundedRuleSets.map((r) => (r.id === id ? { ...r, confirmedAt: now() } : r)) }));
}

export function latestFunded(accountId: string): FundedRuleSet | undefined {
  return [...useApp.getState().fundedRuleSets].filter((r) => r.accountId === accountId).sort((a, b) => b.version - a.version)[0];
}

export function savePersonalRules(accountId: string, rules: PersonalRules, confirm: boolean) {
  const prev = [...useApp.getState().personalRuleSets].filter((r) => r.accountId === accountId).sort((a, b) => b.version - a.version)[0];
  upd((d) => ({
    personalRuleSets: [...d.personalRuleSets, { id: newId("prs"), accountId, version: (prev?.version ?? 0) + 1, effectiveFrom: now(), confirmedAt: confirm ? now() : null, rules }],
  }));
}

export function saveRiskModel(accountId: string, model: RiskModelId, params: Record<string, string>, enabled: boolean, confirm: boolean) {
  const prev = useApp.getState().riskModels.filter((r) => r.accountId === accountId && r.model === model).sort((a, b) => b.version - a.version)[0];
  const cfg: RiskModelConfig = { id: newId("rm"), accountId, model, version: (prev?.version ?? 0) + 1, enabled, confirmedAt: confirm ? now() : null, params };
  upd((d) => ({ riskModels: [...d.riskModels, cfg] }));
}

// ------------------------------------------------------------------ journal & plans

export function saveJournal(entry: Omit<JournalDay, "id"> & { id?: string }) {
  upd((d) => {
    const existing = d.journal.find((j) => j.accountId === entry.accountId && j.date === entry.date);
    const rec: JournalDay = { ...entry, id: existing?.id ?? newId("jr") };
    return { journal: existing ? d.journal.map((j) => (j.id === existing.id ? rec : j)) : [...d.journal, rec] };
  });
}

export function savePlan(plan: Omit<TradePlan, "id" | "createdAt">): string {
  const id = newId("plan");
  upd((d) => ({ plans: [...d.plans, { ...plan, id, createdAt: now() }] }));
  return id;
}

export function linkPlan(planId: string, tradeId: string | null) {
  upd((d) => ({
    plans: d.plans.map((p) => (p.id === planId ? { ...p, linkedTradeId: tradeId } : p)),
    trades: d.trades.map((t) => (t.id === tradeId ? { ...t, tradePlanId: planId } : t.tradePlanId === planId ? { ...t, tradePlanId: null } : t)),
  }));
}

export function deletePlan(id: string) {
  upd((d) => ({ plans: d.plans.filter((p) => p.id !== id), trades: d.trades.map((t) => (t.tradePlanId === id ? { ...t, tradePlanId: null } : t)) }));
}

// ------------------------------------------------------------------ sample data

/**
 * Loads two clearly badged SAMPLE accounts (a paper account and a funded challenge),
 * with seed strategies S4 and S14 activated and demo trades. Safe to remove later.
 */
export function loadSampleData() {
  ensureSeedStrategies();
  const st = useApp.getState();
  if (st.accounts.some((a) => a.isSample)) return;
  const s4 = st.strategies.find((s) => s.seedKey === "S4");
  const s14 = st.strategies.find((s) => s.seedKey === "S14");
  const strategies = [s4, s14]
    .filter((x): x is StrategyRecord => !!x)
    .map((s, i) => ({ id: s.id, ruleIds: checklistRules(s).map((r) => r.id), instruments: i === 0 ? ["EURUSD", "GBPUSD", "XAUUSD"] : ["XAUUSD", "EURUSD"], londonFirst: i === 0 }));
  const end = new Date();
  const paper: TradingAccount = {
    id: "sample-paper",
    name: "Sample · Paper account",
    type: "NORMAL",
    platform: "TradingView Paper Trading",
    baseCurrency: "USD",
    startingBalance: "5000",
    createdAt: now(),
    archived: false,
    isSample: true,
    activeStrategyIds: strategies.map((s) => s.id),
    defaultStrategyId: strategies[0]?.id ?? null,
  };
  const funded: TradingAccount = { ...paper, id: "sample-funded", name: "Sample · Prop challenge 10K", type: "FUNDED", platform: "MT5", startingBalance: "10000" };
  const t1 = generateDemoTrades({ accountId: paper.id, seed: 7, startingBalance: "5000", riskPct: 1, tradingDays: 30, endDate: end, strategies });
  const t2 = generateDemoTrades({ accountId: funded.id, seed: 21, startingBalance: "10000", riskPct: 0.5, tradingDays: 20, endDate: end, strategies });
  const preset = FUNDED_PRESETS.find((p) => p.id === "generic-2step")!;
  const ruleSet: FundedRuleSet = {
    id: "sample-funded-rules",
    accountId: funded.id,
    version: 1,
    presetId: preset.id,
    effectiveFrom: now(),
    confirmedAt: now(),
    rules: { ...preset.rules, firmName: "Sample firm", planName: "2-step 10K", startingBalance: "10000", consistency: { maxPct: "40", base: "TOTAL_PROFIT" } },
    fieldStatus: { ...preset.fieldStatus, newsRule: "CLEAR", weekendRule: "CLEAR", eaAllowed: "CLEAR", consistency: "CLEAR" },
    fieldSource: {},
  };
  upd((d) => ({
    accounts: [...d.accounts, paper, funded],
    trades: [...d.trades, ...t1, ...t2],
    fundedRuleSets: [...d.fundedRuleSets, ruleSet],
    strategies: d.strategies.map((s) => (strategies.some((x) => x.id === s.id) ? { ...s, status: "CONFIRMED", confirmedAt: now() } : s)),
    personalRuleSets: [
      ...d.personalRuleSets,
      {
        id: "sample-personal",
        accountId: paper.id,
        version: 1,
        effectiveFrom: now(),
        confirmedAt: now(),
        rules: { maxRiskPerTradePct: "1", maxDailyLossPct: "3", maxTradesPerDay: 2, maxConsecutiveLosses: 2, allowedSessions: ["LONDON", "OVERLAP", "NEW_YORK"], allowedInstruments: [], minRiskReward: "1.5" },
      },
    ],
    selectedAccountId: d.selectedAccountId ?? paper.id,
  }));
}

export function removeSampleData() {
  const ids = useApp.getState().accounts.filter((a) => a.isSample).map((a) => a.id);
  ids.forEach(deleteAccount);
}
