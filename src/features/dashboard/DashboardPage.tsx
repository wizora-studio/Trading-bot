"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CalendarHeatmap, DailyBarChart, DivergingBars, EquityChart } from "@/components/charts/charts";
import { Badge, ConfidenceBadge, RuleStateBadge, SampleBadge } from "@/components/shared/badges";
import { ChartFrame, Disclaimer, EmptyState, KpiStat, Notice, SimpleTable } from "@/components/shared/blocks";
import { FilterBar } from "@/components/shared/FilterBar";
import { formatDayKey, formatDuration, formatMoney, formatNumber, formatPct, formatR } from "@/components/shared/format";
import { MoneyText, RMultipleText, SignArrow } from "@/components/shared/numbers";
import { Button, Section } from "@/components/ui/primitives";
import { MIN_SEGMENT_SIZE } from "@/config/thresholds";
import { type DictKey, useT } from "@/i18n";
import { levelFromSize } from "@/services/analytics/confidence";
import { adherenceOf } from "@/services/analytics/adherence";
import { computeMetrics } from "@/services/analytics/metrics";
import type { Trade } from "@/domain/types";
import { evaluateFunded } from "@/services/analytics/funded";
import { sessionHoursIn } from "@/services/analytics/trade";
import { useApp } from "@/store/appStore";
import { useSelectedAccount } from "@/store/hooks";
import { checklistRules } from "@/features/strategies/types";
import { Welcome } from "@/features/onboarding/Welcome";
import { RecentTrades } from "./RecentTrades";
import { useAnalytics } from "./useAnalytics";

export function DashboardPage() {
  const { t, lang } = useT();
  const { account, accounts, isCombined } = useSelectedAccount();
  const a = useAnalytics();
  const strategies = useApp((s) => s.strategies);
  const fundedSets = useApp((s) => s.fundedRuleSets);
  const batches = useApp((s) => s.importBatches);

  const adherence = useMemo(() => {
    const followed: Trade[] = [];
    const broke: Trade[] = [];
    for (const s of strategies) {
      const ids = checklistRules(s).map((r) => r.id);
      for (const tr of a.trades) {
        if (tr.strategyId !== s.id) continue;
        const g = adherenceOf(tr, ids);
        if (g === "FOLLOWED") followed.push(tr);
        else if (g === "BROKE") broke.push(tr);
      }
    }
    const brokeIds = new Set(broke.map((x) => x.id));
    return {
      followed: { n: followed.length, avgR: computeMetrics(followed, a.opts).avgR },
      broke: { n: broke.length, avgR: computeMetrics(broke, a.opts).avgR },
      netWithoutBroken: computeMetrics(a.trades.filter((x) => !brokeIds.has(x.id)), a.opts).netPnl,
    };
  }, [a, strategies]);

  if (!accounts.length) return <Welcome />;
  if (!account && !isCombined) return null;

  const m = a.metrics;
  const isSample = isCombined ? accounts.some((x) => x.isSample) : account?.isSample;
  const funded = !isCombined && account?.type === "FUNDED" ? [...fundedSets].filter((r) => r.accountId === account.id).sort((x, y) => y.version - x.version)[0] : undefined;
  const fundedEval = funded ? evaluateFunded(funded, a.allTrades) : null;
  const lastBatch = [...batches].filter((b) => b.accountId === account?.id && !b.rolledBack).sort((x, y) => y.importedAt.localeCompare(x.importedAt))[0];
  const conf = levelFromSize(m.n);

  return (
    <div>
      {isSample && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <SampleBadge />
          <span className="text-sm text-muted">{t("sample_notice")}</span>
        </div>
      )}
      <FilterBar />

      {!a.allTrades.length ? (
        <EmptyState
          icon="import"
          title={t("dash_empty_title")}
          body={t("dash_empty_body")}
          action={
            <>
              <Link href="/import/">
                <Button variant="primary" icon="import">
                  {t("go_import")}
                </Button>
              </Link>
              <Link href="/trades/?new=1">
                <Button icon="plus">{t("add_manual_trade")}</Button>
              </Link>
            </>
          }
        />
      ) : !a.trades.length ? (
        <EmptyState title={t("no_trades_filter")} body={t("no_trades_filter_body")} />
      ) : (
        <>
          <div className="mb-7">
            <h1 className="m-0 mb-1 text-md font-medium text-muted">{t("net_title")}</h1>
            <div className={`flex flex-wrap items-baseline gap-2.5 text-[length:var(--text-hero)] leading-none font-bold tracking-tight ${m.netPnl.gt(0) ? "text-blue" : ""}`}>
              <SignArrow value={m.netPnl} size={28} />
              {formatMoney(m.netPnl, a.currency)}
              <span className="text-md font-medium tracking-normal text-muted">{t("net_sub", { n: m.n })}</span>
            </div>
            <div className="mt-4">
              <ChartFrame
                title={<span className="sr-only">{t("eq_label")}</span>}
                hint={t("eq_hint")}
                table={
                  <SimpleTable
                    head={[t("c_date"), t("eq_label"), t("dd_label")]}
                    numericCols={[1, 2]}
                    rows={a.curve.map((p) => [p.time ? formatDayKey(p.time.slice(0, 10), lang) : t("start"), formatMoney(p.balance, a.currency, { sign: false }), formatMoney(p.drawdown.neg(), a.currency)])}
                  />
                }
              >
                <EquityChart points={a.curve} currency={a.currency} label={t("eq_label")} ddLabel={t("dd_closed_label")} />
              </ChartFrame>
            </div>
          </div>

          <Section title={t("k_title")} hint={t("k_hint")} actions={<ConfidenceBadge level={conf} n={m.n} />}>
            <div className="grid grid-cols-2 md:grid-cols-3">
              <KpiStat label={t("k_winrate")} info={<Def k="def_winrate" />} value={formatPct(m.winRate, 0)} meta={t("k_wins", { w: m.wins, l: m.losses, b: m.breakevens })} />
              <KpiStat
                label={t("k_exp_r")}
                info={<Def k="def_expectancy_r" />}
                value={m.avgR ? <RMultipleText value={m.avgR} /> : <span className="text-muted">–</span>}
                meta={m.rCount < m.n ? t("k_r_partial", { n: m.rCount, total: m.n }) : <ConfidenceBadge level={m.rConfidence.level} n={m.rCount} />}
              />
              <KpiStat label={t("k_exp_money")} info={<Def k="def_expectancy" />} value={<MoneyText value={m.expectancy} currency={a.currency} />} meta={m.expectancyConfidence.ciIncludesZero ? t("ci_includes_zero") : t("ci_excludes_zero")} />
              <KpiStat label={t("k_pf")} info={<Def k="def_pf" />} value={m.profitFactor ? formatNumber(m.profitFactor) : "–"} meta={m.profitFactor ? t("k_pf_meta") : t("k_pf_none")} />
              <KpiStat
                label={t("k_dd")}
                info={<Def k="def_dd" />}
                value={<MoneyText value={a.dd.maxDrawdown.neg()} currency={a.currency} />}
                meta={t("k_dd_meta", { p: formatPct(a.dd.maxDrawdownPctOfPeak), s: formatPct(a.dd.maxDrawdownPctOfStart) })}
              />
              <KpiStat label={t("k_costs")} info={<Def k="def_costs" />} value={formatMoney(m.totalCosts, a.currency, { sign: false })} meta={t("k_costs_meta", { p: formatPct(m.costsPctOfGrossProfit) })} />
              <KpiStat label={t("k_gross")} value={<span className="text-lg">{formatMoney(m.grossProfit, a.currency, { sign: false })} / {formatMoney(m.grossLoss.neg(), a.currency)}</span>} meta={t("k_gross_meta")} />
              <KpiStat label={t("k_avg_win_loss")} info={<Def k="def_payoff" />} value={<span className="text-lg">{formatMoney(m.avgWin, a.currency, { sign: false })} / {formatMoney(m.avgLoss?.neg(), a.currency)}</span>} meta={t("k_payoff", { x: formatNumber(m.payoffRatio) })} />
              <KpiStat label={t("k_best_day")} info={<Def k="def_consistency" />} value={formatPct(a.best.share, 0)} meta={t("k_best_day_meta", { x: formatMoney(a.best.best, a.currency) })} />
              <KpiStat label={t("k_outlier")} info={<Def k="def_outlier" />} value={formatPct(m.top1Share, 0)} meta={m.top1Share && m.top1Share.gt(0.5) ? <Badge tone="warn" icon="alert">{t("outlier_warning")}</Badge> : t("k_top3", { x: formatPct(m.top3Share, 0) })} />
              <KpiStat label={t("k_streaks")} value={`${m.maxConsecutiveWins} / ${m.maxConsecutiveLosses}`} meta={t("k_streaks_meta")} />
              <KpiStat label={t("k_hold")} value={formatDuration(m.avgHoldingMs)} meta={t("k_hold_meta", { w: formatDuration(m.avgHoldingWinnersMs), l: formatDuration(m.avgHoldingLosersMs) })} />
            </div>
            {conf === "INSUFFICIENT_DATA" || conf === "LOW" ? (
              <div className="mt-4">
                <Notice tone="warn">{t("small_sample_warning", { n: m.n })}</Notice>
              </div>
            ) : null}
            {lastBatch && lastBatch.dataQuality.score < 80 && (
              <div className="mt-3">
                <Notice tone="warn">
                  {t("dq_notice", { s: lastBatch.dataQuality.score })}{" "}
                  <Link className="underline" href="/import/">
                    {t("details")}
                  </Link>
                </Notice>
              </div>
            )}
          </Section>

          {fundedEval && (
            <Section title={t("funded_summary")} actions={<Link href="/funded/" className="text-sm text-blue underline">{t("open_funded")}</Link>}>
              <div className="flex flex-wrap gap-2">
                {fundedEval.checks.map((c) => (
                  <span key={c.rule} className="inline-flex items-center gap-1.5 rounded-s border border-line px-2.5 py-1.5 text-sm">
                    {t(`rule_${c.rule}` as DictKey)} <RuleStateBadge state={c.state} />
                  </span>
                ))}
              </div>
              {fundedEval.roomToday && (
                <p className="mt-3 mb-0 text-sm">
                  {t("room_today")}: <strong>{formatMoney(fundedEval.roomToday, a.currency, { sign: false })}</strong> <span className="text-muted">({t("closed_trades_only")})</span>
                </p>
              )}
            </Section>
          )}

          <Section title={t("daily_title")} hint={t("daily_hint")}>
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <ChartFrame
                title={<span className="sr-only">{t("daily_title")}</span>}
                table={<SimpleTable head={[t("c_date"), t("trades_word"), t("c_net")]} numericCols={[1, 2]} rows={a.days.map((d) => [formatDayKey(d.day, lang), d.count, <MoneyText key={d.day} value={d.net} currency={a.currency} />])} />}
              >
                <DailyBarChart days={a.days} currency={a.currency} label={t("daily_title")} lang={lang} />
              </ChartFrame>
              <div>
                <h3 className="mt-0 mb-3 text-md font-semibold">{t("cal_title")}</h3>
                <CalendarHeatmap days={a.days.slice(-40)} currency={a.currency} lang={lang} weekdayLabels={[t("wd_1"), t("wd_2"), t("wd_3"), t("wd_4"), t("wd_5")]} />
              </div>
            </div>
          </Section>

          <Section title={t("adh_title")} hint={t("adh_hint")}>
            {adherence.followed.n + adherence.broke.n === 0 ? (
              <EmptyState title={t("adh_empty")} body={t("adh_empty_body")} action={<Link href="/trades/"><Button>{t("nav_trades")}</Button></Link>} />
            ) : (
              <>
                <div className="grid grid-cols-2">
                  {(["followed", "broke"] as const).map((k, i) => (
                    <div key={k} className={i ? "border-l border-line pl-4" : "pr-4"}>
                      <div className="text-sm text-muted">{t(k === "followed" ? "adh_followed" : "adh_broke")}</div>
                      <div className="text-2xl font-bold tracking-tight">{adherence[k].avgR ? <RMultipleText value={adherence[k].avgR} /> : "–"}</div>
                      <div className="flex flex-wrap items-center gap-1 text-sm text-muted">
                        {t("adh_avg", { n: adherence[k].n })} {adherence[k].n < 30 && <Badge tone="warn">{t("low_sample")}</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 mb-0 max-w-[62ch]">
                  {t("adh_note_1")} <strong>{formatMoney(adherence.netWithoutBroken, a.currency)}</strong> {t("adh_note_2", { y: formatMoney(m.netPnl, a.currency) })}
                </p>
              </>
            )}
          </Section>

          <Section title={t("sess_title")} hint={t("sess_hint")}>
            <DivergingBars
              unit="R"
              rows={a.sessions
                .filter((s) => s.trades.length > 0 || s.key !== "OFF_HOURS")
                .map((s) => {
                  const hours = s.key === "ASIAN" || s.key === "LONDON" || s.key === "NEW_YORK" ? sessionHoursIn(s.key, new Date(), a.tz) : null;
                  return {
                    label: t(`sess_${s.key}` as DictKey),
                    sub: hours ? `${hours.start}–${hours.end}` : undefined,
                    value: s.metrics.avgR ? s.metrics.avgR.toNumber() : null,
                    n: s.trades.length,
                    badge: s.trades.length > 0 && s.trades.length < MIN_SEGMENT_SIZE ? <Badge tone="warn">{t("low_sample")}</Badge> : undefined,
                  };
                })}
            />
            <p className="mt-2 mb-0 text-xs text-muted">{t("sess_tz_note", { tz: a.tz })}</p>
          </Section>

          <Section title={t("wd_title")} hint={t("wd_hint")}>
            <DivergingBars
              unit="MONEY"
              currency={a.currency}
              rows={a.weekdays.map((s) => ({
                label: t(`wd_${s.key}` as DictKey),
                value: s.trades.length ? s.metrics.netPnl.toNumber() : null,
                n: s.trades.length,
                badge: s.trades.length > 0 && s.trades.length < MIN_SEGMENT_SIZE ? <Badge tone="warn">{t("low_sample")}</Badge> : undefined,
              }))}
            />
          </Section>

          <Section title={t("ls_title")}>
            <SimpleTable
              head={[t("c_segment"), t("trades_word"), t("k_winrate"), t("k_exp_r"), t("c_net")]}
              numericCols={[1, 2, 3, 4]}
              rows={[...a.directions.map((s) => ({ ...s, label: t(`side_${s.key}` as DictKey) })), ...a.instruments.map((s) => ({ ...s, label: s.key }))].map((s) => [
                s.label,
                s.trades.length,
                formatPct(s.metrics.winRate, 0),
                formatR(s.metrics.avgR),
                <MoneyText key={s.label} value={s.metrics.netPnl} currency={a.currency} />,
              ])}
            />
          </Section>

          <Section title={t("recent_title")} actions={<Link href="/trades/" className="text-sm text-blue underline">{t("see_all")}</Link>}>
            <RecentTrades trades={a.trades.slice(-8).reverse()} currency={a.currency} />
          </Section>
        </>
      )}
      <Disclaimer />
    </div>
  );
}

function Def({ k }: { k: DictKey }) {
  const { t } = useT();
  return <span className="whitespace-pre-line">{t(k)}</span>;
}
