"use client";

import { useMemo } from "react";
import { create } from "zustand";
import type { SessionName, Side, Trade } from "@/domain/types";
import { tradeSession } from "@/services/analytics/trade";
import { useApp } from "./appStore";

/** The account chosen in the top bar ("ALL" = combined view of all non-archived accounts). */
export function useSelectedAccount() {
  const accounts = useApp((s) => s.accounts);
  const selectedId = useApp((s) => s.selectedAccountId);
  return useMemo(() => {
    const active = accounts.filter((a) => !a.archived);
    const account = active.find((a) => a.id === selectedId) ?? null;
    return { account, accounts: active, isCombined: selectedId === "ALL" && active.length > 0 };
  }, [accounts, selectedId]);
}

export interface Filters {
  range: "ALL" | "7" | "30" | "90";
  instrument: string;
  strategyId: string; // "" = all, "NONE" = no strategy
  session: SessionName | "";
  side: Side | "";
  tag: string;
}

export const DEFAULT_FILTERS: Filters = { range: "ALL", instrument: "", strategyId: "", session: "", side: "", tag: "" };

/** Global Filter Bar state (kept in memory only). */
export const useFilters = create<{ filters: Filters; set: (p: Partial<Filters>) => void; reset: () => void }>((set) => ({
  filters: DEFAULT_FILTERS,
  set: (p) => set((s) => ({ filters: { ...s.filters, ...p } })),
  reset: () => set({ filters: DEFAULT_FILTERS }),
}));

export function applyFilters(trades: Trade[], f: Filters, now = Date.now()): Trade[] {
  const since = f.range === "ALL" ? 0 : now - Number(f.range) * 86400000;
  return trades.filter(
    (t) =>
      new Date(t.closeTime).getTime() >= since &&
      (!f.instrument || t.instrument === f.instrument) &&
      (!f.strategyId || (f.strategyId === "NONE" ? t.strategyId === null : t.strategyId === f.strategyId)) &&
      (!f.session || tradeSession(t) === f.session) &&
      (!f.side || t.side === f.side) &&
      (!f.tag || t.mistakeTags.includes(f.tag)),
  );
}

/** Trades of the selected account (or all accounts in the combined view), optionally filtered. */
export function useAccountTrades(filtered = true): { all: Trade[]; trades: Trade[] } {
  const { account, isCombined, accounts } = useSelectedAccount();
  const trades = useApp((s) => s.trades);
  const filters = useFilters((s) => s.filters);
  return useMemo(() => {
    const ids = isCombined ? new Set(accounts.map((a) => a.id)) : new Set(account ? [account.id] : []);
    const all = trades.filter((t) => ids.has(t.accountId));
    return { all, trades: filtered ? applyFilters(all, filters) : all };
  }, [trades, account, isCombined, accounts, filters, filtered]);
}

export function useSettings() {
  return useApp((s) => s.settings);
}
