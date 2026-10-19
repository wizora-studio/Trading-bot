"use client";

import { useMemo, useState } from "react";
import { Badge, RuleStateBadge } from "@/components/shared/badges";
import { ConfirmDialog, Disclaimer, EmptyState, Notice, PageHeader, SimpleTable } from "@/components/shared/blocks";
import { formatDateTime, formatMoney, formatNumber, formatPrice } from "@/components/shared/format";
import { MoneyText, RMultipleText } from "@/components/shared/numbers";
import { toast } from "@/components/shared/toast";
import { Button, Card, Checkbox, Field, Input, Section, Segmented, Select } from "@/components/ui/primitives";
import type { Side, Trade } from "@/domain/types";
import { type DictKey, useT } from "@/i18n";
import { d, isDecimalText, s } from "@/services/analytics/decimal";
import { balanceCurve } from "@/services/analytics/equity";
import { evaluateFunded } from "@/services/analytics/funded";
import { getSpec, INSTRUMENTS } from "@/services/analytics/instruments";
import { positionSize } from "@/services/analytics/positionSize";
import { correlationCheck, DEFAULT_LADDER, ladderState, type LadderParams, rrGate } from "@/services/analytics/riskModels";
import { tradeNet, tradeR } from "@/services/analytics/trade";
import { deletePlan, linkPlan, savePlan } from "@/store/actions";
import { useApp } from "@/store/appStore";
import { useSelectedAccount } from "@/store/hooks";
import { Welcome } from "@/features/onboarding/Welcome";
import { ChecklistPanel } from "@/features/trades/ChecklistPanel";
import { objectivityShare } from "@/features/strategies/types";

interface OpenPos {
  instrument: string;
  riskAmount: string;
  atBreakeven: boolean;
}

/**
 * Trade Plan Builder (Module O). The trader plans THEIR OWN trade; the app never suggests a direction,
 * entry, or which trade to take. All numbers come from the deterministic engine.
 */
export function PlannerPage() {
  const { t, lang } = useT();
  const { account, accounts } = useSelectedAccount();
  const strategies = useApp((st) => st.strategies);
  const allTrades = useApp((st) => st.trades);
  const models = useApp((st) => st.riskModels);
  const fundedSets = useApp((st) => st.fundedRuleSets);
  const plans = useApp((st) => st.plans);
  const tz = useApp((st) => st.settings.displayTimezone);
  const overrides = useApp((st) => st.instrumentOverrides);

  const [strategyId, setStrategyId] = useState(account?.defaultStrategyId ?? "");
  const [instrument, setInstrument] = useState("EURUSD");
  const [side, setSide] = useState<Side>("LONG");
  const [entry, setEntry] = useState("");
  const [stop, setStop] = useState("");
  const [tp1, setTp1] = useState("");
  const [tp2, setTp2] = useState("");
  const [riskPct, setRiskPct] = useState("");
  const [atr, setAtr] = useState("");
  const [news, setNews] = useState(false);
  const [checklist, setChecklist] = useState<Trade["checklist"]>({});
  const [open, setOpen] = useState<OpenPos[]>([]);
  const [notes, setNotes] = useState("");
  const [delId, setDelId] = useState<string | null>(null);

  const trades = useMemo(() => allTrades.filter((x) => x.accountId === account?.id), [allTrades, account]);
  if (!accounts.length) return <Welcome />;
  if (!account) return <EmptyState title={t("pick_one_account")} body={t("pick_one_account_body")} />;
  const currency = account.baseCurrency;
  const balance = balanceCurve(trades, account.startingBalance).at(-1)?.balance ?? d(account.startingBalance);
  const r4 = [...models].filter((m) => m.accountId === account.id && m.model === "R4" && m.confirmedAt).sort((a, b) => b.version - a.version)[0];
  const r5 = [...models].filter((m) => m.accountId === account.id && m.model === "R5" && m.confirmedAt).sort((a, b) => b.version - a.version)[0];
  const ladder = r4 ? ladderState(trades, account.startingBalance, r4.params as unknown as LadderParams, tz) : null;
  const effectiveRisk = riskPct || (ladder ? ladder.riskPctNow.toString() : DEFAULT_LADDER.baselineRiskPct);
  const funded = account.type === "FUNDED" ? [...fundedSets].filter((r) => r.accountId === account.id && r.confirmedAt).sort((a, b) => b.version - a.version)[0] : undefined;
  const fe = funded ? evaluateFunded(funded, trades) : null;
  const strategy = strategies.find((x) => x.id === strategyId);
  const activeStrategies = strategies.filter((x) => account.activeStrategyIds.includes(x.id));
  const spec = getSpec(instrument, overrides);

  const valid = spec && [entry, stop].every(isDecimalText) && entry !== stop && isDecimalText(effectiveRisk);
  const dirOk = valid && (side === "LONG" ? d(stop).lt(d(entry)) : d(stop).gt(d(entry)));
  const sizing = valid && dirOk ? positionSize({ balance: s(balance), riskMode: "PERCENT", riskValue: effectiveRisk, entry, stopLoss: stop, spec: spec!, accountCurrency: currency, maxRiskAmount: fe?.roomToday?.toFixed(2) ?? null }) : null;
  const minRR = r5?.params.minRR ?? "1.8";
  const targets = [tp1, tp2].filter((x) => isDecimalText(x));
  const rrs = valid ? targets.map((x) => rrGate(entry, stop, x, minRR)) : [];
  const corr = sizing ? correlationCheck({ instrument, riskAmount: s(sizing.actualRisk) }, open.filter((o) => isDecimalText(o.riskAmount)), s(sizing.riskAmount), r5?.params.correlationCap ?? "1.5") : null;
  const unmet = strategy ? strategy.spec.rules.filter((r) => strategy.ruleDecisions[r.id] !== "REJECTED" && checklist[r.id] !== true) : [];
  const invalidation = strategy?.spec.rules.filter((r) => r.category === "INVALIDATION") ?? [];
  const newsRules = strategy?.spec.rules.filter((r) => r.category === "NEWS") ?? [];
  const mgmt = strategy?.spec.rules.filter((r) => r.category === "MANAGEMENT") ?? [];
  const dailyAfter = fe?.dailyFloorToday && sizing ? balance.minus(sizing.actualRisk).minus(fe.dailyFloorToday) : null;
  const maxAfter = fe?.maxFloorNow && sizing ? balance.minus(sizing.actualRisk).minus(fe.maxFloorNow) : null;
  const digits = spec?.digits ?? 5;

  const save = () => {
    if (!sizing) return;
    savePlan({
      accountId: account.id,
      strategyId: strategyId || null,
      instrument,
      side,
      entry,
      stopLoss: stop,
      targets,
      riskPct: effectiveRisk,
      atr: atr || null,
      newsWithin30Min: news,
      checklist,
      lots: s(sizing.lots),
      riskAmount: s(sizing.actualRisk),
      linkedTradeId: null,
      notes,
    });
    toast(t("plan_saved"));
  };

  const accountPlans = plans.filter((p) => p.accountId === account.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const linkable = trades.filter((x) => !x.tradePlanId).slice(-40).reverse();

  return (
    <div>
      <PageHeader title={t("nav_planner")} description={t("planner_desc")} />
      <Notice>{t("planner_guard")}</Notice>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Card>
          <h2 className="mt-0 mb-3 text-lg font-semibold">{t("planner_inputs")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("c_strategy")}>
              {({ id }) => (
                <Select id={id} value={strategyId} onChange={(e) => { setStrategyId(e.target.value); setChecklist({}); }}>
                  <option value="">{t("no_strategy_unplanned")}</option>
                  {activeStrategies.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.spec.strategy.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label={t("c_symbol")}>
              {({ id }) => (
                <Select id={id} value={instrument} onChange={(e) => setInstrument(e.target.value)}>
                  {INSTRUMENTS.map((i) => (
                    <option key={i.canonical}>{i.canonical}</option>
                  ))}
                </Select>
              )}
            </Field>
            <div>
              <div className="mb-1 text-sm font-medium">{t("planner_direction")}</div>
              <Segmented label={t("planner_direction")} value={side} onChange={setSide} options={[{ value: "LONG", label: t("side_LONG") }, { value: "SHORT", label: t("side_SHORT") }]} />
            </div>
            <Field label={t("risk_pct")} hint={ladder ? t("planner_risk_from_ladder", { r: ladder.riskPctNow.toString() }) : t("planner_risk_default", { r: DEFAULT_LADDER.baselineRiskPct })}>
              {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} inputMode="decimal" value={riskPct} placeholder={effectiveRisk} onChange={(e) => setRiskPct(e.target.value)} />}
            </Field>
            <Field label={t("c_entry")}>{({ id }) => <Input id={id} inputMode="decimal" value={entry} onChange={(e) => setEntry(e.target.value)} />}</Field>
            <Field label={t("c_sl")} error={valid && !dirOk ? t("planner_sl_side") : undefined}>
              {({ id, invalid }) => <Input id={id} inputMode="decimal" aria-invalid={invalid} value={stop} onChange={(e) => setStop(e.target.value)} />}
            </Field>
            <Field label={t("planner_tp1")}>{({ id }) => <Input id={id} inputMode="decimal" value={tp1} onChange={(e) => setTp1(e.target.value)} />}</Field>
            <Field label={t("planner_tp2")}>{({ id }) => <Input id={id} inputMode="decimal" value={tp2} onChange={(e) => setTp2(e.target.value)} />}</Field>
            <Field label={t("planner_atr")} hint={t("optional")}>{({ id }) => <Input id={id} inputMode="decimal" value={atr} onChange={(e) => setAtr(e.target.value)} />}</Field>
            <div className="flex items-end">
              <Checkbox label={t("planner_news")} checked={news} onChange={setNews} />
            </div>
          </div>
          <fieldset className="mt-4 rounded-m border border-line p-3">
            <legend className="px-1 text-sm font-medium">{t("planner_open_positions")}</legend>
            {open.map((o, i) => (
              <div key={i} className="mb-2 grid grid-cols-[1fr_1fr_auto_auto] items-end gap-2">
                <Select aria-label={t("c_symbol")} value={o.instrument} onChange={(e) => setOpen(open.map((x, j) => (j === i ? { ...x, instrument: e.target.value } : x)))}>
                  {INSTRUMENTS.map((ins) => (
                    <option key={ins.canonical}>{ins.canonical}</option>
                  ))}
                </Select>
                <Input aria-label={t("risk_amount")} inputMode="decimal" placeholder={t("risk_amount")} value={o.riskAmount} onChange={(e) => setOpen(open.map((x, j) => (j === i ? { ...x, riskAmount: e.target.value } : x)))} />
                <Checkbox label={t("at_breakeven")} checked={o.atBreakeven} onChange={(v) => setOpen(open.map((x, j) => (j === i ? { ...x, atBreakeven: v } : x)))} />
                <Button size="sm" variant="ghost" icon="trash" aria-label={t("remove")} onClick={() => setOpen(open.filter((_, j) => j !== i))} />
              </div>
            ))}
            <Button size="sm" icon="plus" onClick={() => setOpen([...open, { instrument: "GBPUSD", riskAmount: "", atBreakeven: false }])}>
              {t("add")}
            </Button>
          </fieldset>
          {strategy && (
            <div className="mt-4">
              <ChecklistPanel strategy={strategy} checklist={checklist} onChange={setChecklist} />
            </div>
          )}
          <Field label={t("journal_notes")} className="mt-4">{({ id }) => <Input id={id} value={notes} onChange={(e) => setNotes(e.target.value)} />}</Field>
        </Card>

        <Card className="border-2 border-blue">
          <h2 className="mt-0 mb-1 text-lg font-semibold">{t("ticket_title")}</h2>
          <p className="mt-0 mb-3 text-xs text-muted">{t("ticket_label")}</p>
          {!sizing ? (
            <p className="m-0 text-sm text-muted">{t("calc_fill_in")}</p>
          ) : (
            <div className="flex flex-col gap-4 text-sm">
              <section>
                <h3 className="mt-0 mb-1 text-md font-semibold">1 · {t("ticket_diag")}</h3>
                <ul className="m-0 pl-5">
                  <li>{t("ticket_balance", { b: formatMoney(balance, currency, { sign: false }), type: t(`acc_type_${account.type}` as DictKey) })}</li>
                  {ladder && <li>{t("ticket_ladder", { s: t(`ladder_state_${ladder.state}` as DictKey), r: ladder.riskPctNow.toString() })}{ladder.breakerTripped && <strong> · {t("breaker_tripped")}</strong>}</li>}
                  <li>{t("ticket_risk", { x: formatMoney(sizing.actualRisk, currency, { sign: false }), p: effectiveRisk })}</li>
                  {fe && (
                    <li>
                      {t("ticket_if_sl", { d: formatMoney(dailyAfter, currency, { sign: false }), m: formatMoney(maxAfter, currency, { sign: false }) })}{" "}
                      {fe.checks.filter((c) => c.rule === "DAILY_LOSS" || c.rule === "MAX_LOSS").map((c) => <RuleStateBadge key={c.rule} state={c.state} />)}
                    </li>
                  )}
                  {corr && (
                    <li>
                      {t("ticket_corr", { g: formatMoney(corr.groupRisk, currency, { sign: false }), c: formatMoney(corr.cap, currency, { sign: false }) })}{" "}
                      {corr.pass ? <Badge tone="ok">{t("pass")}</Badge> : <Badge tone="solid">{t("fail")}</Badge>}
                    </li>
                  )}
                  <li>{news ? <strong>{t("ticket_news_yes")}</strong> : t("ticket_news_no")}</li>
                </ul>
              </section>
              <section>
                <h3 className="mt-0 mb-1 text-md font-semibold">2 · {t("ticket_match")}</h3>
                {strategy ? (
                  <>
                    <p className="m-0">{unmet.length ? t("ticket_unmet", { n: unmet.length, ids: unmet.map((r) => r.id).join(", ") }) : t("ticket_all_met")}</p>
                    <p className="mt-1 mb-0 text-xs text-muted">{t("ticket_objectivity", { ours: Math.round(objectivityShare(strategy) * 100) })}</p>
                  </>
                ) : (
                  <p className="m-0">{t("ticket_no_strategy")}</p>
                )}
              </section>
              <section>
                <h3 className="mt-0 mb-1 text-md font-semibold">3 · {t("ticket_exec")}</h3>
                <div className="text-[length:var(--text-xl)] font-bold">
                  {formatNumber(sizing.lots)} {t("unit_LOTS")} <span className="text-sm font-normal text-muted">({t("stop_pips", { n: formatNumber(sizing.stopDistancePips, 1) })})</span>
                </div>
                {sizing.cappedByRule && <p className="mt-1 mb-0 font-medium">{t("capped_by_room", { x: formatMoney(fe?.roomToday ?? "0", currency, { sign: false }) })}</p>}
                <ul className="mt-1 mb-0 pl-5">
                  {rrs.map((g, i) => (
                    <li key={i}>
                      TP{i + 1} {formatPrice(targets[i], digits)}: {g.rr ? `${formatNumber(g.rr)} R` : "–"} {i === 0 && (g.pass ? <Badge tone="ok">{t("rr_gate_pass", { m: minRR })}</Badge> : <Badge tone="solid">{t("rr_gate_fail", { m: minRR })}</Badge>)}
                    </li>
                  ))}
                  <li>{mgmt.length ? mgmt.map((r) => r.text).join(" ") : t("ticket_partial_default")}</li>
                  {atr && isDecimalText(atr) && <li>{t("ticket_atr", { k: formatNumber(d(entry).minus(d(stop)).abs().div(d(atr)), 2) })}</li>}
                </ul>
              </section>
              <section>
                <h3 className="mt-0 mb-1 text-md font-semibold">4 · {t("ticket_scenarios")}</h3>
                <ul className="m-0 pl-5">
                  <li>
                    <strong>A</strong> · {t("scen_a", { e: formatPrice(entry, digits), sl: formatPrice(stop, digits), tp: targets.length ? targets.map((x) => formatPrice(x, digits)).join(" / ") : "–" })}
                  </li>
                  <li>
                    <strong>B</strong> · {invalidation.length ? invalidation.map((r) => r.text).join(" ") : t("scen_b_default")}
                  </li>
                  <li>
                    <strong>C</strong> · {newsRules.length ? newsRules.map((r) => r.text).join(" ") : t("scen_c_default")}
                  </li>
                </ul>
              </section>
              <div>
                <Button variant="primary" onClick={save}>
                  {t("save_plan")}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Section title={t("saved_plans")} hint={t("saved_plans_hint")}>
        {!accountPlans.length ? (
          <p className="m-0 text-sm text-muted">{t("no_plans")}</p>
        ) : (
          <div className="overflow-x-auto">
            <SimpleTable
              head={[t("c_date"), t("c_symbol"), t("c_side"), t("unit_LOTS"), t("risk_amount"), t("plan_vs_actual"), ""]}
              rows={accountPlans.map((p) => {
                const tr = trades.find((x) => x.id === p.linkedTradeId);
                return [
                  formatDateTime(p.createdAt, tz, lang),
                  p.instrument,
                  t(`side_${p.side}` as DictKey),
                  formatNumber(p.lots),
                  formatMoney(p.riskAmount, currency, { sign: false }),
                  tr ? (
                    <span key="a" className="flex flex-wrap items-center gap-1.5">
                      <MoneyText value={tradeNet(tr)} currency={currency} /> <RMultipleText value={tradeR(tr, currency)} arrow={false} />
                      {tr.stopLoss && tr.stopLoss !== p.stopLoss && <Badge tone="warn">{t("sl_changed")}</Badge>}
                      {tr.side !== p.side && <Badge tone="solid">{t("side_changed")}</Badge>}
                    </span>
                  ) : (
                    <Select key="l" aria-label={t("link_trade")} value="" onChange={(e) => e.target.value && linkPlan(p.id, e.target.value)} className="min-w-44">
                      <option value="">{t("link_trade")}</option>
                      {linkable
                        .filter((x) => x.instrument === p.instrument)
                        .map((x) => (
                          <option key={x.id} value={x.id}>
                            {formatDateTime(x.closeTime, tz, lang)} · {t(`side_${x.side}` as DictKey)}
                          </option>
                        ))}
                    </Select>
                  ),
                  <Button key="d" size="sm" variant="ghost" icon="trash" aria-label={t("delete")} onClick={() => setDelId(p.id)} />,
                ];
              })}
            />
          </div>
        )}
      </Section>
      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={() => delId && deletePlan(delId)} title={t("delete")} body={t("delete_plan_body")} confirmLabel={t("delete")} />
      <Disclaimer />
    </div>
  );
}
