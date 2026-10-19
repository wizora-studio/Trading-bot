"use client";

import { useMemo } from "react";
import { ConfidenceBadge } from "@/components/shared/badges";
import { Notice } from "@/components/shared/blocks";
import { formatMoney, formatPct } from "@/components/shared/format";
import { Section } from "@/components/ui/primitives";
import type { Trade } from "@/domain/types";
import { type DictKey, useT } from "@/i18n";
import { afterStreak, exitDiscipline, redDays, sizeAfterLoss, weekendHolding } from "@/services/analytics/behavior";
import type { ConfidenceLevel } from "@/services/analytics/confidence";
import type { Dec } from "@/services/analytics/decimal";

interface Item {
  id: string;
  title: DictKey;
  evidenceKey: DictKey;
  vars: Record<string, string | number>;
  hypothesis: DictKey;
  question: DictKey;
  n: number;
  confidence: ConfidenceLevel;
}

/**
 * Module 8 view: Observed pattern → Quantitative evidence → Possible interpretation (a hypothesis) → Question for the journal.
 * Only patterns that actually occur are listed. The app never states a feeling or a diagnosis as fact.
 */
export function ObservedPatterns({ trades, startingBalance, currency, timeZone, breakevenTolerance }: { trades: Trade[]; startingBalance: string; currency: string; timeZone: string; breakevenTolerance: string }) {
  const { t } = useT();
  const items = useMemo(() => {
    const opts = { breakevenTolerance, timeZone, accountCurrency: currency };
    const money = (x: Dec | null) => (x ? formatMoney(x, currency) : "–");
    const out: Item[] = [];

    const sz = sizeAfterLoss(trades, opts);
    if (sz.escalated > 0)
      out.push({ id: "size", title: "obs_size_title", evidenceKey: "obs_size_ev", vars: { a: sz.afterLoss, e: sz.escalated, c: sz.longestChain, x: money(sz.escalatedNetAvg), y: money(sz.otherNetAvg) }, hypothesis: "obs_size_hy", question: "obs_size_q", n: sz.afterLoss, confidence: sz.confidence });

    const rd = redDays(trades, startingBalance, opts);
    if (rd.redDays > 0 && (rd.openedWhileDown > 0 || (rd.avgTradesRedDay && rd.avgTradesGreenDay && rd.avgTradesRedDay.gt(rd.avgTradesGreenDay))))
      out.push({
        id: "red",
        title: "obs_red_title",
        evidenceKey: "obs_red_ev",
        vars: { r: rd.redDays, g: rd.greenDays, tr: rd.avgTradesRedDay?.toFixed(1) ?? "–", tg: rd.avgTradesGreenDay?.toFixed(1) ?? "–", w: rd.openedWhileDown, x: money(rd.openedWhileDownNet), u: rd.unplaceable },
        hypothesis: "obs_red_hy",
        question: "obs_red_q",
        n: rd.redDays + rd.greenDays,
        confidence: rd.confidence,
      });

    const ex = exitDiscipline(trades, opts);
    if (ex.winnersCutShort > 0 || ex.losersBeyondPlan > 0)
      out.push({ id: "exit", title: "obs_exit_title", evidenceKey: "obs_exit_ev", vars: { w: ex.winnersChecked, c: ex.winnersCutShort, a: formatPct(ex.avgCaptureShare, 0), l: ex.losersChecked, b: ex.losersBeyondPlan, r: ex.avgLossR?.toFixed(2) ?? "–" }, hypothesis: "obs_exit_hy", question: "obs_exit_q", n: ex.n, confidence: ex.confidence });

    const wk = weekendHolding(trades);
    if (wk.held > 0)
      out.push({ id: "weekend", title: "obs_weekend_title", evidenceKey: "obs_weekend_ev", vars: { h: wk.held, c: wk.checked, x: formatMoney(wk.heldNet, currency), u: wk.unknown }, hypothesis: "obs_weekend_hy", question: "obs_weekend_q", n: wk.checked, confidence: wk.confidence });

    for (const kind of ["WIN", "LOSS"] as const) {
      const st = afterStreak(trades, opts, kind, 3);
      if (st.following > 0)
        out.push({
          id: `streak-${kind}`,
          title: kind === "WIN" ? "obs_streakw_title" : "obs_streakl_title",
          evidenceKey: "obs_streak_ev",
          vars: { f: st.following, x: money(st.followingNetAvg), o: st.otherCount, y: money(st.otherNetAvg) },
          hypothesis: kind === "WIN" ? "obs_streakw_hy" : "obs_streakl_hy",
          question: "obs_streak_q",
          n: st.following,
          confidence: st.confidence,
        });
    }
    return out;
  }, [trades, startingBalance, currency, timeZone, breakevenTolerance]);

  return (
    <Section title={t("obs_title")} hint={t("obs_hint")}>
      {items.length === 0 ? (
        <Notice>{t("obs_none")}</Notice>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((it) => (
            <article key={it.id} className="rounded-m border border-line p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="m-0 text-base font-semibold">{t(it.title)}</h3>
                <ConfidenceBadge level={it.confidence} n={it.n} />
              </div>
              <p className="m-0 mb-1 text-xs font-medium text-muted">{t("obs_evidence")}</p>
              <p className="mt-0 mb-2">{t(it.evidenceKey, it.vars)}</p>
              {it.confidence === "INSUFFICIENT_DATA" ? (
                <p className="m-0 text-sm text-muted">{t("obs_insufficient")}</p>
              ) : (
                <>
                  <p className="m-0 mb-1 text-xs font-medium text-muted">{t("obs_hypothesis")}</p>
                  <p className="mt-0 mb-2 text-sm">{t(it.hypothesis)}</p>
                </>
              )}
              <p className="m-0 mb-1 text-xs font-medium text-muted">{t("obs_question")}</p>
              <p className="m-0 text-sm">{t(it.question)}</p>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
