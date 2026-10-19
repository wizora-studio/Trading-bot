"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge, RuleStateBadge } from "@/components/shared/badges";
import { Disclaimer, EmptyState, PageHeader, RuleMeter } from "@/components/shared/blocks";
import { formatMoney } from "@/components/shared/format";
import { toast } from "@/components/shared/toast";
import { Button, Card, Select, Tabs, Textarea } from "@/components/ui/primitives";
import type { Trade } from "@/domain/types";
import { type DictKey, useT } from "@/i18n";
import { evaluateFunded } from "@/services/analytics/funded";
import { checkPersonalRules } from "@/services/analytics/personalRules";
import { dayKey } from "@/services/analytics/time";
import { saveJournal } from "@/store/actions";
import { useApp } from "@/store/appStore";
import { useSelectedAccount } from "@/store/hooks";
import { Welcome } from "@/features/onboarding/Welcome";
import { ChecklistPanel } from "@/features/trades/ChecklistPanel";
import { PositionSizeCalculator } from "@/features/tools/PositionSizeCalculator";
import { convertSessionTime, insideSession } from "@/features/strategies/sessionTime";
import { TradingViewChart, useResolvedTheme } from "@/features/charts/TradingViewChart";

type Panel = "strategy" | "size" | "rules" | "plan";

/** Trading Room v1 (Module N1): chart + strategy panel + position size + rule meters + today's plan, on one screen. */
export function TradingRoomPage() {
  const { t } = useT();
  const { account, accounts } = useSelectedAccount();
  const strategies = useApp((s) => s.strategies);
  const settings = useApp((s) => s.settings);
  const allTrades = useApp((s) => s.trades);
  const fundedSets = useApp((s) => s.fundedRuleSets);
  const personal = useApp((s) => s.personalRuleSets);
  const journal = useApp((s) => s.journal);
  const theme = useResolvedTheme(settings.theme);
  const [strategyId, setStrategyId] = useState<string>(account?.defaultStrategyId ?? account?.activeStrategyIds[0] ?? "");
  const [panel, setPanel] = useState<Panel>("strategy");
  const [checklist, setChecklist] = useState<Trade["checklist"]>({});
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);
  const today = dayKey(now, settings.displayTimezone);
  const entry = journal.find((j) => j.accountId === account?.id && j.date === today);
  const [note, setNote] = useState(entry?.quickNote ?? "");
  const trades = useMemo(() => allTrades.filter((x) => x.accountId === account?.id), [allTrades, account]);

  if (!accounts.length) return <Welcome />;
  if (!account) return <EmptyState title={t("pick_one_account")} body={t("pick_one_account_body")} />;
  const active = strategies.filter((s) => account.activeStrategyIds.includes(s.id));
  const strategy = strategies.find((s) => s.id === strategyId) ?? active[0];
  const instrument = guessInstrument(strategy?.spec.strategy.instruments ?? []);
  const interval = tfToInterval(strategy?.spec.strategy.timeframes.setup[0]);
  const sessions = strategy?.spec.sessions ?? [];
  const inside = sessions.map((s) => insideSession(now, s.startTime, s.endTime, s.timezoneAsStated));
  const insideAny = inside.some((x) => x === true) ? true : inside.every((x) => x === null) ? null : false;
  const funded = account.type === "FUNDED" ? [...fundedSets].filter((r) => r.accountId === account.id && r.confirmedAt).sort((a, b) => b.version - a.version)[0] : undefined;
  const fe = funded ? evaluateFunded(funded, trades, now) : null;
  const pr = [...personal].filter((r) => r.accountId === account.id && r.confirmedAt).sort((a, b) => b.version - a.version)[0];
  const comp = pr ? checkPersonalRules(pr.rules, trades, { startingBalance: account.startingBalance, timeZone: settings.displayTimezone }) : null;
  const todayTrades = trades.filter((x) => dayKey(new Date(x.closeTime), settings.displayTimezone) === today).length;

  const panels = {
    strategy: strategy ? (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm">{t("room_inside")}</span>
          {insideAny === null ? <Badge tone="dashed">{t("room_no_window")}</Badge> : insideAny ? <Badge tone="ok" icon="check">{t("yes")}</Badge> : <Badge tone="solid" icon="alert">{t("no")}</Badge>}
        </div>
        {sessions.map((s) => {
          const a = convertSessionTime(s.startTime, s.timezoneAsStated, settings.displayTimezone, now);
          const b = convertSessionTime(s.endTime, s.timezoneAsStated, settings.displayTimezone, now);
          return (
            <div key={s.name} className="text-xs text-muted">
              {s.name}: {a && b ? `${a}–${b} (${settings.displayTimezone})` : `${s.startTime}–${s.endTime} ${s.timezoneAsStated ?? ""}`}
            </div>
          );
        })}
        <ol className="m-0 pl-5 text-sm">
          {strategy.spec.executionFlow.slice(0, 10).map((f) => (
            <li key={f.step}>{f.description}</li>
          ))}
        </ol>
        <ChecklistPanel strategy={strategy} checklist={checklist} onChange={setChecklist} />
        <Button size="sm" variant="ghost" onClick={() => setChecklist({})}>
          {t("reset")}
        </Button>
      </div>
    ) : (
      <EmptyState title={t("no_active_strategies")} action={<Link href="/strategies/"><Button>{t("nav_strategies")}</Button></Link>} />
    ),
    size: <PositionSizeCalculator key={instrument} initialInstrument={instrument} defaultBalance={fe ? fe.balance.toFixed(2) : account.startingBalance} currency={account.baseCurrency} maxRiskAmount={fe?.roomToday?.toFixed(2) ?? null} />,
    rules: (
      <div className="flex flex-col gap-4">
        {fe ? (
          fe.checks.map((c) => (
            <div key={c.rule}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium">{t(`rule_${c.rule}` as DictKey)}</span>
                <RuleStateBadge state={c.state} />
              </div>
              <RuleMeter ratio={c.ratio ? Math.min(1, c.ratio.toNumber()) : 0} kind={c.rule === "DAILY_LOSS" || c.rule === "MAX_LOSS" ? "used" : "progress"} label={t(`rule_${c.rule}` as DictKey)} />
              {(c.rule === "DAILY_LOSS" || c.rule === "MAX_LOSS") && <div className="text-xs text-muted">{t("left_before_breach", { x: formatMoney(c.remaining, account.baseCurrency, { sign: false }) })}</div>}
            </div>
          ))
        ) : (
          <p className="m-0 text-sm text-muted">{account.type === "FUNDED" ? t("rules_pending") : t("room_normal_rules")}</p>
        )}
        {pr && (
          <div className="text-sm">
            {pr.rules.maxTradesPerDay !== null && <div>{t("room_trades_today", { n: todayTrades, m: pr.rules.maxTradesPerDay })}</div>}
            {comp && <div className="text-muted">{t("comp_violations")}: {comp.violations.length}</div>}
          </div>
        )}
        <p className="m-0 text-xs text-muted">{t("room_latest_import")}</p>
      </div>
    ),
    plan: (
      <div className="flex flex-col gap-2 text-sm">
        {entry ? (
          <>
            <div><strong>{t("plan_bias")}:</strong> {entry.plan.bias || "–"}</div>
            <div><strong>{t("plan_setups")}:</strong> {entry.plan.setups || "–"}</div>
            <div><strong>{t("plan_max_trades")}:</strong> {entry.plan.maxTrades || "–"} · <strong>{t("plan_max_risk")}:</strong> {entry.plan.maxRiskPct || "–"}</div>
          </>
        ) : (
          <p className="m-0 text-muted">
            {t("room_no_plan")} <Link href="/journal/" className="text-blue underline">{t("nav_journal")}</Link>
          </p>
        )}
        <Textarea aria-label={t("quick_note")} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("quick_note")} />
        <div>
          <Button
            size="sm"
            onClick={() => {
              saveJournal({ accountId: account.id, date: today, plan: entry?.plan ?? { bias: "", setups: "", maxTrades: "", maxRiskPct: "" }, review: entry?.review ?? { wentWell: "", mistakes: "", lessons: "" }, quickNote: note });
              toast(t("saved"));
            }}
          >
            {t("save")}
          </Button>
        </div>
      </div>
    ),
  } satisfies Record<Panel, React.ReactNode>;

  return (
    <div>
      <PageHeader
        title={t("nav_room")}
        description={t("room_desc")}
        actions={
          active.length > 0 ? (
            <Select aria-label={t("c_strategy")} value={strategy?.id ?? ""} onChange={(e) => setStrategyId(e.target.value)} className="min-w-56">
              {active.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.spec.strategy.name}
                </option>
              ))}
            </Select>
          ) : undefined
        }
      />
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <TradingViewChart key={`${instrument}-${interval}`} symbol={instrument} interval={interval} theme={theme} timezone={settings.displayTimezone} height={560} />
        <Card>
          <Tabs
            label={t("nav_room")}
            value={panel}
            onChange={setPanel}
            tabs={[
              { value: "strategy", label: t("room_tab_strategy") },
              { value: "size", label: t("room_tab_size") },
              { value: "rules", label: t("room_tab_rules") },
              { value: "plan", label: t("room_tab_plan") },
            ]}
          />
          {panels[panel]}
        </Card>
      </div>
      <Disclaimer />
    </div>
  );
}

function guessInstrument(list: string[]): string {
  const joined = list.join(" ").toUpperCase();
  for (const s of ["XAUUSD", "EURUSD", "GBPUSD", "NAS100", "US30", "SPX500", "USDJPY", "BTCUSD"]) if (joined.includes(s)) return s;
  if (joined.includes("GOLD")) return "XAUUSD";
  if (joined.includes("FOREX")) return "EURUSD";
  if (joined.includes("INDIC")) return "NAS100";
  return "XAUUSD";
}

function tfToInterval(tf: string | undefined): string {
  const m = /^(\d+)\s*(m|h|d)/i.exec(tf ?? "");
  if (!m) return "15";
  const n = Number(m[1]);
  const u = m[2]!.toLowerCase();
  if (u === "m") return String(n);
  if (u === "h") return String(n * 60);
  return "D";
}
