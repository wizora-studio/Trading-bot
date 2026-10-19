"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/shared/badges";
import { Disclaimer, EmptyState, Notice, PageHeader, SimpleTable } from "@/components/shared/blocks";
import { formatDayKey, formatMoney, formatPct, formatPercentValue } from "@/components/shared/format";
import { MoneyText } from "@/components/shared/numbers";
import { toast } from "@/components/shared/toast";
import { Button, Card, Checkbox, Field, Input, Section } from "@/components/ui/primitives";
import type { PersonalRules, SessionName } from "@/domain/types";
import { type DictKey, translate, useT } from "@/i18n";
import { SESSION_ORDER } from "@/services/analytics/breakdowns";
import { d, isDecimalText } from "@/services/analytics/decimal";
import { balanceCurve } from "@/services/analytics/equity";
import { checkPersonalRules } from "@/services/analytics/personalRules";
import { DEFAULT_LADDER, ladderState, type LadderParams } from "@/services/analytics/riskModels";
import { saveRiskModel, savePersonalRules } from "@/store/actions";
import { useApp } from "@/store/appStore";
import { useSelectedAccount } from "@/store/hooks";
import { Welcome } from "@/features/onboarding/Welcome";

const EMPTY_RULES: PersonalRules = { maxRiskPerTradePct: null, maxDailyLossPct: null, maxTradesPerDay: null, maxConsecutiveLosses: null, allowedSessions: [], allowedInstruments: [], minRiskReward: null };

/** My Rules (Module F + Module P): personal rules with Read-Back, compliance monitor, risk model presets. */
export function RulesPage() {
  const { t, lang } = useT();
  const { account, accounts } = useSelectedAccount();
  const sets = useApp((s) => s.personalRuleSets);
  const models = useApp((s) => s.riskModels);
  const allTrades = useApp((s) => s.trades);
  const tz = useApp((s) => s.settings.displayTimezone);
  const current = useMemo(() => (account ? [...sets].filter((r) => r.accountId === account.id).sort((a, b) => b.version - a.version)[0] : undefined), [sets, account]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PersonalRules | null>(null);
  const [step, setStep] = useState<"edit" | "readback">("edit");
  const trades = useMemo(() => allTrades.filter((x) => x.accountId === account?.id), [allTrades, account]);

  const compliance = useMemo(
    () => (account && current?.confirmedAt ? checkPersonalRules(current.rules, trades, { startingBalance: account.startingBalance, timeZone: tz, accountCurrency: account.baseCurrency }) : null),
    [account, current, trades, tz],
  );

  if (!accounts.length) return <Welcome />;
  if (!account) return <EmptyState title={t("pick_one_account")} body={t("pick_one_account_body")} />;
  const currency = account.baseCurrency;
  const balanceNow = balanceCurve(trades, account.startingBalance).at(-1)?.balance ?? d(account.startingBalance);
  const r = draft ?? current?.rules ?? EMPTY_RULES;
  const showForm = editing || !current;

  const readBackLines = (lng: "en" | "ru", rules: PersonalRules) => {
    const tt = (k: DictKey, v?: Record<string, string | number>) => translate(lng, k, v);
    const lines: string[] = [];
    if (rules.maxRiskPerTradePct) lines.push(tt("prb_risk", { p: formatPercentValue(rules.maxRiskPerTradePct), x: formatMoney(balanceNow.times(d(rules.maxRiskPerTradePct)).div(100), currency, { sign: false }), b: formatMoney(balanceNow, currency, { sign: false }) }));
    if (rules.maxDailyLossPct) lines.push(tt("prb_daily", { p: formatPercentValue(rules.maxDailyLossPct), x: formatMoney(balanceNow.times(d(rules.maxDailyLossPct)).div(100), currency, { sign: false }) }));
    if (rules.maxTradesPerDay !== null) lines.push(tt("prb_trades", { n: rules.maxTradesPerDay }));
    if (rules.maxConsecutiveLosses !== null) lines.push(tt("prb_streak", { n: rules.maxConsecutiveLosses }));
    if (rules.allowedSessions.length) lines.push(tt("prb_sessions", { s: rules.allowedSessions.map((s) => tt(`sess_${s}` as DictKey)).join(", ") }));
    if (rules.allowedInstruments.length) lines.push(tt("prb_instruments", { s: rules.allowedInstruments.join(", ") }));
    if (rules.minRiskReward) lines.push(tt("prb_rr", { x: rules.minRiskReward }));
    if (!lines.length) lines.push(tt("prb_none"));
    return lines;
  };

  return (
    <div>
      <PageHeader title={t("nav_rules")} description={t("rules_desc")} actions={current && !editing ? <Button icon="edit" onClick={() => { setEditing(true); setDraft(current.rules); setStep("edit"); }}>{t("edit_rules")}</Button> : undefined} />

      {showForm ? (
        <Card className="mb-6">
          {step === "edit" ? (
            <>
              <PersonalRulesForm value={r} onChange={setDraft} />
              <div className="mt-4 flex gap-2">
                <Button variant="primary" onClick={() => setStep("readback")}>
                  {t("intake_to_readback")}
                </Button>
                {current && (
                  <Button variant="ghost" onClick={() => { setEditing(false); setDraft(null); }}>
                    {t("cancel")}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-0 mb-2 text-lg font-semibold">{t("rb_understood")}</h2>
              <ul className="mt-0 pl-5">
                {readBackLines(lang, r).map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <ul className="mt-0 pl-5 text-sm text-muted">
                {readBackLines(lang === "en" ? "ru" : "en", r).map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p className="text-sm text-muted">{t("prb_how")}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  icon="check"
                  onClick={() => {
                    savePersonalRules(account.id, r, true);
                    setEditing(false);
                    setDraft(null);
                    setStep("edit");
                    toast(t("rules_confirmed"));
                  }}
                >
                  {t("confirm_rules")}
                </Button>
                <Button icon="edit" onClick={() => setStep("edit")}>
                  {t("edit")}
                </Button>
              </div>
            </>
          )}
        </Card>
      ) : (
        <Card className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <Badge tone={current.confirmedAt ? "ok" : "warn"}>{current.confirmedAt ? t("confirmed") : t("ss_UNCONFIRMED")}</Badge>
            <span className="text-xs text-muted">v{current.version}</span>
          </div>
          <ul className="m-0 pl-5">
            {readBackLines(lang, current.rules).map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </Card>
      )}

      {compliance && (
        <Section title={t("comp_title")} hint={t("comp_hint")}>
          {!trades.length ? (
            <EmptyState title={t("no_trades")} action={<Link href="/import/"><Button>{t("go_import")}</Button></Link>} />
          ) : (
            <>
              <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Mini label={t("comp_rate")} value={formatPct(compliance.complianceRate, 0)} />
                <Mini label={t("comp_violations")} value={String(compliance.violations.length)} />
                <Mini label={t("comp_cost")} value={<MoneyText value={compliance.costOfViolations} currency={currency} />} />
                <Mini label={t("comp_without")} value={<MoneyText value={compliance.netWithoutViolations} currency={currency} />} />
              </div>
              {(compliance.uncheckable.RISK_PER_TRADE > 0 || compliance.uncheckable.MIN_RR > 0) && (
                <Notice tone="warn">{t("comp_uncheckable", { a: compliance.uncheckable.RISK_PER_TRADE, b: compliance.uncheckable.MIN_RR })}</Notice>
              )}
              {compliance.violations.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <SimpleTable
                    head={[t("c_date"), t("rule"), t("details")]}
                    rows={compliance.violations.slice(-50).reverse().map((v) => [formatDayKey(v.day, lang), t(`pv_${v.kind}` as DictKey), v.detail])}
                  />
                </div>
              )}
            </>
          )}
        </Section>
      )}

      <RiskModels accountId={account.id} trades={trades} startingBalance={account.startingBalance} models={models.filter((m) => m.accountId === account.id)} tz={tz} currency={currency} />
      <Disclaimer />
    </div>
  );
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-line pb-2">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function PersonalRulesForm({ value, onChange }: { value: PersonalRules; onChange: (r: PersonalRules) => void }) {
  const { t } = useT();
  const num = (k: "maxRiskPerTradePct" | "maxDailyLossPct" | "minRiskReward", label: string, hint?: string) => (
    <Field label={label} hint={hint} error={value[k] && !isDecimalText(value[k]!) ? t("err_number") : undefined}>
      {({ id, invalid }) => <Input id={id} inputMode="decimal" aria-invalid={invalid} value={value[k] ?? ""} onChange={(e) => onChange({ ...value, [k]: e.target.value.trim() || null })} placeholder={t("none")} />}
    </Field>
  );
  const int = (k: "maxTradesPerDay" | "maxConsecutiveLosses", label: string) => (
    <Field label={label}>
      {({ id }) => <Input id={id} inputMode="numeric" value={value[k] ?? ""} onChange={(e) => onChange({ ...value, [k]: e.target.value ? Math.max(0, Math.floor(Number(e.target.value))) : null })} placeholder={t("none")} />}
    </Field>
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {num("maxRiskPerTradePct", t("pr_risk"), t("pr_risk_hint"))}
        {num("maxDailyLossPct", t("pr_daily"))}
        {num("minRiskReward", t("pr_rr"), t("pr_rr_hint"))}
        {int("maxTradesPerDay", t("pr_trades"))}
        {int("maxConsecutiveLosses", t("pr_streak"))}
        <Field label={t("pr_instruments")} hint={t("pr_instruments_hint")}>
          {({ id }) => (
            <Input
              id={id}
              value={value.allowedInstruments.join(", ")}
              onChange={(e) => onChange({ ...value, allowedInstruments: e.target.value.split(",").map((x) => x.trim().toUpperCase()).filter(Boolean) })}
              placeholder="EURUSD, XAUUSD"
            />
          )}
        </Field>
      </div>
      <fieldset className="rounded-m border border-line p-3">
        <legend className="px-1 text-sm font-medium">{t("pr_sessions")}</legend>
        <div className="flex flex-wrap gap-x-4">
          {SESSION_ORDER.map((s) => (
            <Checkbox
              key={s}
              label={t(`sess_${s}` as DictKey)}
              checked={value.allowedSessions.includes(s)}
              onChange={(c) => onChange({ ...value, allowedSessions: c ? [...value.allowedSessions, s] : value.allowedSessions.filter((x): x is SessionName => x !== s) })}
            />
          ))}
        </div>
        <p className="mt-1 mb-0 text-xs text-muted">{t("pr_sessions_hint")}</p>
      </fieldset>
    </div>
  );
}

function RiskModels({
  accountId,
  trades,
  startingBalance,
  models,
  tz,
  currency,
}: {
  accountId: string;
  trades: Parameters<typeof ladderState>[0];
  startingBalance: string;
  models: { model: string; version: number; enabled: boolean; confirmedAt: string | null; params: Record<string, string> }[];
  tz: string;
  currency: string;
}) {
  const { t } = useT();
  const latest = (m: string) => [...models].filter((x) => x.model === m).sort((a, b) => b.version - a.version)[0];
  const r4 = latest("R4");
  const r5 = latest("R5");
  const [ladder, setLadder] = useState<LadderParams>((r4?.params as unknown as LadderParams) ?? DEFAULT_LADDER);
  const [minRR, setMinRR] = useState(r5?.params.minRR ?? "1.8");
  const [cap, setCap] = useState(r5?.params.correlationCap ?? "1.5");
  const state = r4?.confirmedAt ? ladderState(trades, startingBalance, ladder, tz) : null;

  return (
    <Section title={t("rm_title")} hint={t("rm_hint")}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="m-0 text-md font-semibold">{t("rm_r4")}</h3>
            {r4?.confirmedAt ? <Badge tone="ok">{t("confirmed")}</Badge> : <Badge tone="dashed">{t("rm_off")}</Badge>}
          </div>
          <p className="mt-0 text-sm text-muted">{t("rm_r4_hint")}</p>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(DEFAULT_LADDER) as (keyof LadderParams)[]).map((k) => (
              <Field key={k} label={t(`ladder_${k}` as DictKey)}>
                {({ id }) => <Input id={id} inputMode="decimal" value={ladder[k]} onChange={(e) => setLadder({ ...ladder, [k]: e.target.value })} />}
              </Field>
            ))}
          </div>
          <p className="text-xs text-muted">{t("rm_r4_ambiguity")}</p>
          <Button
            variant="primary"
            onClick={() => {
              if (Object.values(ladder).some((v) => !isDecimalText(v))) return toast(t("err_number"), "error");
              saveRiskModel(accountId, "R4", { ...ladder }, true, true);
              toast(t("rules_confirmed"));
            }}
          >
            {t("rm_confirm")}
          </Button>
          {state && (
            <div className="mt-4 rounded-m bg-soft p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={state.state === "CRITICAL" ? "solid" : state.state === "CAUTION" ? "warn" : "ok"}>{t(`ladder_state_${state.state}` as DictKey)}</Badge>
                {state.breakerTripped && <Badge tone="solid" icon="alert">{t("breaker_tripped")}</Badge>}
              </div>
              <p className="mt-2 mb-0">{t("ladder_now", { dd: formatPercentValue(state.drawdownPct.toFixed(2)), hwm: formatMoney(state.highWaterMark, currency, { sign: false }), risk: formatPercentValue(state.riskPctNow.toString(), 3) })}</p>
              <p className="mt-1 mb-0 text-xs text-muted">{t("ladder_closed_note")}</p>
            </div>
          )}
        </Card>
        <Card>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="m-0 text-md font-semibold">{t("rm_r5")}</h3>
            {r5?.confirmedAt ? <Badge tone="ok">{t("confirmed")}</Badge> : <Badge tone="dashed">{t("rm_off")}</Badge>}
          </div>
          <p className="mt-0 text-sm text-muted">{t("rm_r5_hint")}</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("rm_min_rr")}>{({ id }) => <Input id={id} inputMode="decimal" value={minRR} onChange={(e) => setMinRR(e.target.value)} />}</Field>
            <Field label={t("rm_cap")}>{({ id }) => <Input id={id} inputMode="decimal" value={cap} onChange={(e) => setCap(e.target.value)} />}</Field>
          </div>
          <p className="text-xs text-muted">{t("rm_r5_ambiguity")}</p>
          <Button
            variant="primary"
            onClick={() => {
              if (!isDecimalText(minRR) || !isDecimalText(cap)) return toast(t("err_number"), "error");
              saveRiskModel(accountId, "R5", { minRR, correlationCap: cap }, true, true);
              toast(t("rules_confirmed"));
            }}
          >
            {t("rm_confirm")}
          </Button>
          <p className="mt-3 mb-0 text-xs text-muted">{t("rm_r1_note")}</p>
        </Card>
      </div>
    </Section>
  );
}
