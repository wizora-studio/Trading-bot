"use client";

import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import { Badge, RuleStateBadge } from "@/components/shared/badges";
import { Disclaimer, EmptyState, Notice, PageHeader, RuleMeter } from "@/components/shared/blocks";
import { formatMoney, formatNumber, formatPct } from "@/components/shared/format";
import { MoneyText } from "@/components/shared/numbers";
import { toast } from "@/components/shared/toast";
import { Button, Card, Field, Input, Section, Select, Tabs, Textarea } from "@/components/ui/primitives";
import type { FundedRuleField, FundedRuleSet, FundedRules } from "@/domain/types";
import { type DictKey, useT } from "@/i18n";
import { d } from "@/services/analytics/decimal";
import { evaluateFunded, type RuleCheck } from "@/services/analytics/funded";
import { getSpec, INSTRUMENTS } from "@/services/analytics/instruments";
import { positionSize } from "@/services/analytics/positionSize";
import { confirmFundedRules, saveFundedRules } from "@/store/actions";
import { useShallow } from "zustand/react/shallow";
import { useApp } from "@/store/appStore";
import { useSelectedAccount } from "@/store/hooks";
import { Welcome } from "@/features/onboarding/Welcome";
import { FUNDED_PRESETS } from "./presets";
import { FundedReadBackCard } from "./FundedReadBackCard";
import { type Draft, RuleEditor } from "./RuleEditor";
import { parseRuleText } from "./ruleText";

const ALL_FIELDS: FundedRuleField[] = ["startingBalance", "profitTargetPct", "dailyLoss", "maxLoss", "minTradingDays", "consistency", "costsIncluded", "newsRule", "weekendRule", "eaAllowed"];

function blankRules(balance: string): FundedRules {
  return {
    firmName: "",
    planName: "",
    phase: "PHASE_1",
    startingBalance: balance,
    profitTargetPct: null,
    dailyLoss: null,
    maxLoss: null,
    minTradingDays: null,
    consistency: null,
    costsIncluded: true,
    newsRule: "",
    weekendRule: "",
    eaAllowed: "UNKNOWN",
    otherNotes: "",
  };
}

/** Funded Account Page (Module G + Phase 4): intake → Read-Back → confirm → live rule board. */
export function FundedPage() {
  const { t } = useT();
  const { account, accounts } = useSelectedAccount();
  const ruleSets = useApp((s) => s.fundedRuleSets);
  const trades = useApp((s) => s.trades);
  const [editing, setEditing] = useState(false);
  const [explain, setExplain] = useState(false);

  const current = useMemo(() => (account ? [...ruleSets].filter((r) => r.accountId === account.id).sort((a, b) => b.version - a.version)[0] : undefined), [ruleSets, account]);
  const accTrades = useMemo(() => trades.filter((x) => x.accountId === account?.id), [trades, account]);

  if (!accounts.length) return <Welcome />;
  if (!account || account.type !== "FUNDED")
    return (
      <div>
        <PageHeader title={t("nav_funded")} />
        <EmptyState icon="funded" title={t("funded_only_title")} body={t("funded_only_body")} action={<Link href="/accounts/"><Button>{t("nav_accounts")}</Button></Link>} />
      </div>
    );

  const needsIntake = !current || editing;
  return (
    <div>
      <PageHeader
        title={t("nav_funded")}
        description={t("funded_desc", { name: account.name })}
        actions={
          current && !editing ? (
            <>
              <Button onClick={() => setExplain((v) => !v)} aria-pressed={explain}>
                {t("explain_rules")}
              </Button>
              <Button icon="edit" onClick={() => setEditing(true)}>
                {t("edit_rules")}
              </Button>
            </>
          ) : undefined
        }
      />
      {needsIntake ? (
        <RuleIntake
          accountId={account.id}
          currency={account.baseCurrency}
          initial={current}
          defaultBalance={account.startingBalance}
          onDone={() => setEditing(false)}
          onCancel={current ? () => setEditing(false) : undefined}
        />
      ) : !current.confirmedAt ? (
        <PendingConfirm set={current} currency={account.baseCurrency} onEdit={() => setEditing(true)} />
      ) : (
        <>
          {explain && (
            <Card className="mb-4">
              <FundedReadBackCard rules={current.rules} status={current.fieldStatus} source={current.fieldSource} currency={account.baseCurrency} />
            </Card>
          )}
          <RuleBoard set={current} trades={accTrades} currency={account.baseCurrency} />
        </>
      )}
      <Disclaimer />
    </div>
  );
}

function RuleIntake({
  accountId,
  currency,
  initial,
  defaultBalance,
  onDone,
  onCancel,
}: {
  accountId: string;
  currency: string;
  initial?: FundedRuleSet;
  defaultBalance: string;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const { t } = useT();
  const [mode, setMode] = useState<"preset" | "text">(initial ? "preset" : "preset");
  const [step, setStep] = useState<"input" | "edit" | "readback">(initial ? "edit" : "input");
  const [presetId, setPresetId] = useState(initial?.presetId ?? "");
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<Draft>(() =>
    initial
      ? { rules: initial.rules, status: initial.fieldStatus }
      : { rules: blankRules(defaultBalance), status: Object.fromEntries(ALL_FIELDS.map((f) => [f, "MISSING"])) as Draft["status"] },
  );
  const [source, setSource] = useState<Partial<Record<FundedRuleField, "USER" | "PRESET" | "DEFAULT">>>(initial?.fieldSource ?? {});
  const [questions, setQuestions] = useState<FundedRuleField[]>([]);

  const startFromPreset = () => {
    const p = FUNDED_PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    setDraft({ rules: { ...p.rules, startingBalance: defaultBalance }, status: { ...p.fieldStatus, startingBalance: "CLEAR" } });
    setSource(Object.fromEntries(ALL_FIELDS.map((f) => [f, f === "startingBalance" ? "USER" : "PRESET"])));
    setQuestions(ALL_FIELDS.filter((f) => p.fieldStatus[f] === "MISSING" || p.fieldStatus[f] === "AMBIGUOUS" || p.fieldStatus[f] === "ASSUMED"));
    setStep("edit");
  };
  const startFromText = () => {
    const r = parseRuleText(text);
    const rules: FundedRules = { ...blankRules(defaultBalance), ...r.rules, otherNotes: text.slice(0, 2000) };
    const status = { ...r.status };
    if (!r.rules.startingBalance) status.startingBalance = "ASSUMED";
    setDraft({ rules, status });
    setSource(Object.fromEntries(ALL_FIELDS.map((f) => [f, r.status[f] === "MISSING" ? "DEFAULT" : "USER"])));
    setQuestions(r.questions);
    setStep("edit");
  };

  const save = () => {
    const id = saveFundedRules(accountId, draft.rules, { presetId: presetId || null, fieldStatus: draft.status, fieldSource: source });
    return id;
  };

  if (step === "input") {
    return (
      <Card>
        <Tabs
          label={t("intake_how")}
          value={mode}
          onChange={setMode}
          tabs={[
            { value: "preset", label: t("intake_preset") },
            { value: "text", label: t("intake_text") },
          ]}
        />
        {mode === "preset" ? (
          <div className="flex flex-col gap-3">
            <p className="m-0 text-sm text-muted">{t("intake_preset_hint")}</p>
            <Select aria-label={t("intake_preset")} value={presetId} onChange={(e) => setPresetId(e.target.value)} className="max-w-xl">
              <option value="">{t("choose")}</option>
              {FUNDED_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firm} — {p.plan}
                  {p.lastVerified ? ` (${t("verified_on", { d: p.lastVerified })})` : ""}
                </option>
              ))}
            </Select>
            {presetId && (
              <p className="m-0 text-xs text-muted">
                {FUNDED_PRESETS.find((p) => p.id === presetId)?.notes}{" "}
                {FUNDED_PRESETS.find((p) => p.id === presetId)?.sourceUrl && (
                  <a className="text-blue underline" href={FUNDED_PRESETS.find((p) => p.id === presetId)!.sourceUrl!} target="_blank" rel="noopener noreferrer">
                    {t("source")}
                  </a>
                )}
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="primary" disabled={!presetId} onClick={startFromPreset}>
                {t("next")}
              </Button>
              <Button
                onClick={() => {
                  setDraft({ rules: blankRules(defaultBalance), status: Object.fromEntries(ALL_FIELDS.map((f) => [f, "MISSING"])) as Draft["status"] });
                  setQuestions(ALL_FIELDS);
                  setStep("edit");
                }}
              >
                {t("intake_manual")}
              </Button>
              {onCancel && <Button variant="ghost" onClick={onCancel}>{t("cancel")}</Button>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Field label={t("intake_text_label")} hint={t("intake_text_hint")}>
              {({ id, describedBy }) => <Textarea id={id} aria-describedby={describedBy} rows={7} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("intake_text_placeholder")} />}
            </Field>
            <div className="flex gap-2">
              <Button variant="primary" disabled={!text.trim()} onClick={startFromText}>
                {t("intake_read")}
              </Button>
              {onCancel && <Button variant="ghost" onClick={onCancel}>{t("cancel")}</Button>}
            </div>
            <p className="m-0 text-xs text-muted">{t("intake_no_ai")}</p>
          </div>
        )}
      </Card>
    );
  }

  if (step === "edit") {
    return (
      <Card>
        <h2 className="mt-0 mb-1 text-lg font-semibold">{t("intake_questions_title")}</h2>
        {questions.length > 0 ? (
          <div className="mb-4">
            <Notice tone="warn">{t("intake_questions_hint")}</Notice>
            <ul className="mt-2 mb-0 pl-5 text-sm">
              {questions.map((q) => (
                <li key={q}>{t(`q_${q}` as DictKey)}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-0 text-sm text-muted">{t("intake_review_hint")}</p>
        )}
        <RuleEditor draft={draft} onChange={setDraft} />
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => setStep("readback")}>
            {t("intake_to_readback")}
          </Button>
          {onCancel && <Button variant="ghost" onClick={onCancel}>{t("cancel")}</Button>}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="mt-0 mb-3 text-lg font-semibold">{t("rb_understood")}</h2>
      <FundedReadBackCard rules={draft.rules} status={draft.status} source={source} currency={currency} />
      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          variant="primary"
          icon="check"
          onClick={() => {
            const id = save();
            confirmFundedRules(id);
            toast(t("rules_confirmed"));
            onDone();
          }}
        >
          {t("confirm_rules")}
        </Button>
        <Button onClick={() => setStep("edit")} icon="edit">
          {t("edit")}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            save();
            toast(t("saved_unconfirmed"));
            onDone();
          }}
        >
          {t("save_without_confirm")}
        </Button>
      </div>
      <p className="mt-2 mb-0 text-xs text-muted">{t("confirm_rules_note")}</p>
    </Card>
  );
}

function PendingConfirm({ set, currency, onEdit }: { set: FundedRuleSet; currency: string; onEdit: () => void }) {
  const { t } = useT();
  return (
    <Card>
      <Notice tone="warn">{t("rules_pending")}</Notice>
      <div className="mt-4">
        <FundedReadBackCard rules={set.rules} status={set.fieldStatus} source={set.fieldSource} currency={currency} />
      </div>
      <div className="mt-4 flex gap-2">
        <Button
          variant="primary"
          icon="check"
          onClick={() => {
            confirmFundedRules(set.id);
            toast(t("rules_confirmed"));
          }}
        >
          {t("confirm_rules")}
        </Button>
        <Button icon="edit" onClick={onEdit}>
          {t("edit")}
        </Button>
      </div>
    </Card>
  );
}

function RuleBoard({ set, trades, currency }: { set: FundedRuleSet; trades: Parameters<typeof evaluateFunded>[1]; currency: string }) {
  const { t } = useT();
  const ev = useMemo(() => evaluateFunded(set, trades), [set, trades]);
  const money = (x: Parameters<typeof formatMoney>[0]) => formatMoney(x, currency, { sign: false });
  const history = useApp(useShallow((s) => s.fundedRuleSets.filter((r) => r.accountId === set.accountId)));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Badge tone={ev.lifecycle === "BREACHED" ? "solid" : ev.lifecycle === "PASSED" ? "ok" : "muted"} icon={ev.lifecycle === "BREACHED" ? "alert" : ev.lifecycle === "PASSED" ? "check" : "info"}>
          {t(`life_${ev.lifecycle}` as DictKey)}
        </Badge>
        <span className="text-sm text-muted">
          {set.rules.firmName} {set.rules.planName} · {t(`phase_${set.rules.phase}` as DictKey)} · v{set.version}
        </span>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label={t("balance_closed")} value={money(ev.balance)} />
        <Stat label={t("profit_so_far")} value={<MoneyText value={ev.profit} currency={currency} />} />
        <Stat label={t("room_today")} value={ev.roomToday ? money(ev.roomToday) : "–"} hint={t("closed_trades_only")} />
        <Stat label={t("trading_days")} value={String(ev.tradingDays)} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {ev.checks.map((c) => (
          <RuleCard key={c.rule} c={c} currency={currency} />
        ))}
      </div>

      <p className="mt-6 rounded-s border border-dashed border-line-strong p-3 text-sm text-muted">{t("unverifiable_note")}</p>

      <RoomCalculator room={ev.roomToday?.toFixed(2) ?? null} balance={ev.balance.toFixed(2)} currency={currency} />

      <Section title={t("rule_versions")}>
        <ul className="m-0 pl-5 text-sm">
          {[...history]
            .sort((a, b) => b.version - a.version)
            .map((h) => (
              <li key={h.id}>
                v{h.version} · {h.effectiveFrom.slice(0, 10)} · {h.confirmedAt ? t("confirmed") : t("ss_UNCONFIRMED")}
              </li>
            ))}
        </ul>
      </Section>
    </div>
  );
}

function RuleCard({ c, currency }: { c: RuleCheck; currency: string }) {
  const { t } = useT();
  const money = (x: Parameters<typeof formatMoney>[0]) => formatMoney(x, currency, { sign: false });
  const ratio = c.ratio ? Math.min(1, c.ratio.toNumber()) : 0;
  let foot1: string;
  let foot2 = "";
  switch (c.rule) {
    case "DAILY_LOSS":
      foot1 = t("left_today", { x: money(c.remaining) });
      foot2 = t("of_x", { x: money(c.limit) });
      break;
    case "MAX_LOSS":
      foot1 = t("left_before_breach", { x: money(c.remaining) });
      foot2 = t("of_x", { x: money(c.limit) });
      break;
    case "PROFIT_TARGET":
      foot1 = t("x_of_y", { x: money(c.used), y: money(c.limit) });
      foot2 = c.remaining && c.remaining.gt(0) ? t("to_go", { x: money(c.remaining) }) : "";
      break;
    case "MIN_DAYS":
      foot1 = t("x_of_y_days", { x: c.used?.toString() ?? "0", y: c.limit?.toString() ?? "0" });
      break;
    default:
      foot1 = c.used ? t("best_day_is", { x: formatPct(c.used, 0) }) : t("no_profit_yet");
      foot2 = c.remaining && c.remaining.gt(0) ? t("cons_need", { x: money(c.remaining) }) : "";
  }
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold">{t(`rule_${c.rule}` as DictKey)}</div>
        <RuleStateBadge state={c.state} />
      </div>
      <RuleMeter ratio={ratio} kind={c.rule === "DAILY_LOSS" || c.rule === "MAX_LOSS" ? "used" : "progress"} label={t(`rule_${c.rule}` as DictKey)} />
      <div className="flex justify-between gap-2 text-sm text-muted">
        <strong className="font-semibold text-fg">{foot1}</strong>
        <span>{foot2}</span>
      </div>
      {c.violationDay && <p className="mt-1 mb-0 text-sm font-medium">{t("violation_on", { d: c.violationDay })}</p>}
      {c.notes.includes("EQUITY_NOT_IN_FILE") && <p className="mt-1 mb-0 text-xs text-muted">{t("note_equity")}</p>}
      {c.notes.includes("INTRADAY_TRAILING_APPROX") && <p className="mt-1 mb-0 text-xs text-muted">{t("note_intraday")}</p>}
      {c.notes.includes("OPEN_TIME_MISSING_USED_CLOSE") && <p className="mt-1 mb-0 text-xs text-muted">{t("note_open_time")}</p>}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="border-b border-line pb-2">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
      {hint && <div className="text-xs text-muted">{hint}</div>}
    </div>
  );
}

/** "How much room do I have?" — max position size that keeps the next trade inside both limits. Educational only. */
function RoomCalculator({ room, balance, currency }: { room: string | null; balance: string; currency: string }) {
  const { t } = useT();
  const [instrument, setInstrument] = useState("EURUSD");
  const [entry, setEntry] = useState("1.08500");
  const [stop, setStop] = useState("1.08300");
  const [riskPct, setRiskPct] = useState("0.5");
  const spec = getSpec(instrument);
  const valid = spec && Number(entry) > 0 && Number(stop) > 0 && entry !== stop;
  const res = valid ? positionSize({ balance, riskMode: "PERCENT", riskValue: riskPct || "0", entry, stopLoss: stop, spec, maxRiskAmount: room }) : null;
  return (
    <Section title={t("room_calc_title")} hint={t("room_calc_hint")}>
      <div className="grid gap-3 sm:grid-cols-4">
        <Field label={t("c_symbol")}>
          {({ id }) => (
            <Select id={id} value={instrument} onChange={(e) => setInstrument(e.target.value)}>
              {INSTRUMENTS.map((i) => (
                <option key={i.canonical}>{i.canonical}</option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={t("c_entry")}>{({ id }) => <Input id={id} inputMode="decimal" value={entry} onChange={(e) => setEntry(e.target.value)} />}</Field>
        <Field label={t("c_sl")}>{({ id }) => <Input id={id} inputMode="decimal" value={stop} onChange={(e) => setStop(e.target.value)} />}</Field>
        <Field label={t("risk_pct")}>{({ id }) => <Input id={id} inputMode="decimal" value={riskPct} onChange={(e) => setRiskPct(e.target.value)} />}</Field>
      </div>
      {res && (
        <div className="mt-4 rounded-m bg-soft p-3 text-sm">
          <div>
            {t("max_lots")}: <strong className="text-lg">{formatNumber(res.lots)}</strong> · {t("actual_risk")}: {formatMoney(res.actualRisk, currency, { sign: false })} · {t("stop_pips", { n: formatNumber(res.stopDistancePips, 1) })}
          </div>
          {res.cappedByRule && <div className="mt-1 font-medium">{t("capped_by_room", { x: formatMoney(d(room ?? "0"), currency, { sign: false }) })}</div>}
          {res.warnings.includes("BELOW_MIN_LOT") && <div className="mt-1">{t("below_min_lot")}</div>}
        </div>
      )}
      <p className="mt-2 mb-0 text-xs text-muted">{t("educational_only")}</p>
    </Section>
  );
}

