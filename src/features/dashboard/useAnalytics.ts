"use client";

import { useMemo } from "react";
import type { Trade } from "@/domain/types";
import { bySession, byWeekday, byDirection, byInstrument } from "@/services/analytics/breakdowns";
import { d, sum } from "@/services/analytics/decimal";
import { balanceCurve, bestDayShare, dailyPnl, drawdownStats } from "@/services/analytics/equity";
import { computeMetrics } from "@/services/analytics/metrics";
import { useApp } from "@/store/appStore";
import { useAccountTrades, useSelectedAccount } from "@/store/hooks";

/** All dashboard numbers for the current account + filters, computed once by the deterministic engine. */
export function useAnalytics(tradesOverride?: Trade[]) {
  const { account, accounts, isCombined } = useSelectedAccount();
  const { trades: filtered, all } = useAccountTrades(true);
  const settings = useApp((s) => s.settings);
  const trades = tradesOverride ?? filtered;
  const startingBalance = isCombined ? sum(accounts.map((a) => d(a.startingBalance))).toFixed() : (account?.startingBalance ?? "0");
  const currency = isCombined ? (accounts[0]?.baseCurrency ?? "USD") : (account?.baseCurrency ?? "USD");

  return useMemo(() => {
    const opts = { breakevenTolerance: settings.breakevenTolerance, accountCurrency: currency };
    const tz = settings.displayTimezone;
    const metrics = computeMetrics(trades, opts);
    const curve = balanceCurve(trades, startingBalance);
    const dd = drawdownStats(curve, startingBalance);
    const days = dailyPnl(trades, tz);
    const best = bestDayShare(days);
    return {
      trades,
      allTrades: all,
      currency,
      startingBalance,
      tz,
      metrics,
      curve,
      dd,
      days,
      best,
      sessions: bySession(trades, opts),
      weekdays: byWeekday(trades, tz, opts),
      directions: byDirection(trades, opts),
      instruments: byInstrument(trades, opts),
      opts,
    };
  }, [trades, all, settings.breakevenTolerance, settings.displayTimezone, currency, startingBalance]);
}
