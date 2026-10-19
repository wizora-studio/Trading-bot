"use client";

import { FieldStatusBadge } from "@/components/shared/badges";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import type { FundedRuleField, FundedRules, RuleFieldStatus } from "@/domain/types";
import { type DictKey, useT } from "@/i18n";
import { COMMON_TIMEZONES } from "@/services/analytics/time";

export type Draft = { rules: FundedRules; status: Partial<Record<FundedRuleField, RuleFieldStatus>> };

/** Structured editor for every required funded rule field (Module G4). Editing a field marks it CLEAR. */
export function RuleEditor({ draft, onChange }: { draft: Draft; onChange: (d: Draft) => void }) {
  const { t } = useT();
  const r = draft.rules;
  const set = (field: FundedRuleField | null, patch: Partial<FundedRules>) =>
    onChange({ rules: { ...r, ...patch }, status: field ? { ...draft.status, [field]: "CLEAR" } : draft.status });
  const badge = (f: FundedRuleField) => draft.status[f] && <FieldStatusBadge status={draft.status[f]!} />;
  const head = (f: FundedRuleField, key: DictKey) => (
    <span className="flex flex-wrap items-center gap-2">
      {t(key)} {badge(f)}
    </span>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={t("fr_firm")}>{({ id }) => <Input id={id} value={r.firmName} onChange={(e) => set(null, { firmName: e.target.value })} />}</Field>
        <Field label={t("fr_plan")}>{({ id }) => <Input id={id} value={r.planName} onChange={(e) => set(null, { planName: e.target.value })} />}</Field>
        <Field label={t("fr_phase")}>
          {({ id }) => (
            <Select id={id} value={r.phase} onChange={(e) => set(null, { phase: e.target.value as FundedRules["phase"] })}>
              {(["PHASE_1", "PHASE_2", "PHASE_3", "INSTANT", "FUNDED"] as const).map((p) => (
                <option key={p} value={p}>
                  {t(`phase_${p}` as DictKey)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={head("startingBalance", "fr_start_balance")}>{({ id }) => <Input id={id} inputMode="decimal" value={r.startingBalance} onChange={(e) => set("startingBalance", { startingBalance: e.target.value })} />}</Field>
        <Field label={head("profitTargetPct", "fr_target")} hint={t("fr_target_hint")}>
          {({ id }) => <Input id={id} inputMode="decimal" value={r.profitTargetPct ?? ""} onChange={(e) => set("profitTargetPct", { profitTargetPct: e.target.value || null })} placeholder="%" />}
        </Field>
        <Field label={head("minTradingDays", "fr_min_days")}>
          {({ id }) => <Input id={id} inputMode="numeric" value={r.minTradingDays ?? ""} onChange={(e) => set("minTradingDays", { minTradingDays: e.target.value ? Number(e.target.value) : null })} placeholder={t("none")} />}
        </Field>
      </div>

      <fieldset className="rounded-m border border-line p-3">
        <legend className="px-1">{head("dailyLoss", "fr_daily")}</legend>
        <Checkbox
          label={t("fr_has_daily")}
          checked={!!r.dailyLoss}
          onChange={(v) => set("dailyLoss", { dailyLoss: v ? { pct: "5", base: "INITIAL_BALANCE", measuredOn: "EQUITY", resetTimezone: "Europe/Athens", resetHour: 0 } : null })}
        />
        {r.dailyLoss && (
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label={t("fr_pct")}>{({ id }) => <Input id={id} inputMode="decimal" value={r.dailyLoss!.pct} onChange={(e) => set("dailyLoss", { dailyLoss: { ...r.dailyLoss!, pct: e.target.value } })} />}</Field>
            <Field label={t("fr_daily_base")}>
              {({ id }) => (
                <Select id={id} value={r.dailyLoss!.base} onChange={(e) => set("dailyLoss", { dailyLoss: { ...r.dailyLoss!, base: e.target.value as "INITIAL_BALANCE" | "DAY_START_BALANCE" } })}>
                  <option value="INITIAL_BALANCE">{t("fr_base_INITIAL_BALANCE")}</option>
                  <option value="DAY_START_BALANCE">{t("fr_base_DAY_START_BALANCE")}</option>
                </Select>
              )}
            </Field>
            <Field label={t("fr_measured_on")}>
              {({ id }) => (
                <Select id={id} value={r.dailyLoss!.measuredOn} onChange={(e) => set("dailyLoss", { dailyLoss: { ...r.dailyLoss!, measuredOn: e.target.value as "EQUITY" | "BALANCE" } })}>
                  <option value="EQUITY">{t("fr_on_EQUITY")}</option>
                  <option value="BALANCE">{t("fr_on_BALANCE")}</option>
                </Select>
              )}
            </Field>
            <Field label={t("fr_reset_tz")}>
              {({ id }) => (
                <Select id={id} value={r.dailyLoss!.resetTimezone} onChange={(e) => set("dailyLoss", { dailyLoss: { ...r.dailyLoss!, resetTimezone: e.target.value } })}>
                  {[...new Set([...COMMON_TIMEZONES, "Europe/Prague", r.dailyLoss!.resetTimezone])].map((z) => (
                    <option key={z}>{z}</option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label={t("fr_reset_hour")}>
              {({ id }) => (
                <Select id={id} value={r.dailyLoss!.resetHour} onChange={(e) => set("dailyLoss", { dailyLoss: { ...r.dailyLoss!, resetHour: Number(e.target.value) } })}>
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, "0")}:00
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
        )}
      </fieldset>

      <fieldset className="rounded-m border border-line p-3">
        <legend className="px-1">{head("maxLoss", "fr_max")}</legend>
        <Checkbox label={t("fr_has_max")} checked={!!r.maxLoss} onChange={(v) => set("maxLoss", { maxLoss: v ? { pct: "10", type: "STATIC", measuredOn: "EQUITY", lockAtStartingBalance: false } : null })} />
        {r.maxLoss && (
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label={t("fr_pct")}>{({ id }) => <Input id={id} inputMode="decimal" value={r.maxLoss!.pct} onChange={(e) => set("maxLoss", { maxLoss: { ...r.maxLoss!, pct: e.target.value } })} />}</Field>
            <Field label={t("fr_max_type")}>
              {({ id }) => (
                <Select id={id} value={r.maxLoss!.type} onChange={(e) => set("maxLoss", { maxLoss: { ...r.maxLoss!, type: e.target.value as "STATIC" | "EOD_TRAILING" | "INTRADAY_TRAILING" } })}>
                  <option value="STATIC">{t("fr_type_STATIC")}</option>
                  <option value="EOD_TRAILING">{t("fr_type_EOD_TRAILING")}</option>
                  <option value="INTRADAY_TRAILING">{t("fr_type_INTRADAY_TRAILING")}</option>
                </Select>
              )}
            </Field>
            <Field label={t("fr_measured_on")}>
              {({ id }) => (
                <Select id={id} value={r.maxLoss!.measuredOn} onChange={(e) => set("maxLoss", { maxLoss: { ...r.maxLoss!, measuredOn: e.target.value as "EQUITY" | "BALANCE" } })}>
                  <option value="EQUITY">{t("fr_on_EQUITY")}</option>
                  <option value="BALANCE">{t("fr_on_BALANCE")}</option>
                </Select>
              )}
            </Field>
            {r.maxLoss.type !== "STATIC" && (
              <Checkbox label={t("fr_lock")} checked={r.maxLoss.lockAtStartingBalance} onChange={(v) => set("maxLoss", { maxLoss: { ...r.maxLoss!, lockAtStartingBalance: v } })} />
            )}
          </div>
        )}
      </fieldset>

      <fieldset className="rounded-m border border-line p-3">
        <legend className="px-1">{head("consistency", "fr_consistency")}</legend>
        <Checkbox label={t("fr_has_consistency")} checked={!!r.consistency} onChange={(v) => set("consistency", { consistency: v ? { maxPct: "40", base: "TOTAL_PROFIT" } : null })} />
        {r.consistency && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("fr_cons_max")}>{({ id }) => <Input id={id} inputMode="decimal" value={r.consistency!.maxPct} onChange={(e) => set("consistency", { consistency: { ...r.consistency!, maxPct: e.target.value } })} />}</Field>
            <Field label={t("fr_cons_base")}>
              {({ id }) => (
                <Select id={id} value={r.consistency!.base} onChange={(e) => set("consistency", { consistency: { ...r.consistency!, base: e.target.value as "TOTAL_PROFIT" | "PROFIT_TARGET" } })}>
                  <option value="TOTAL_PROFIT">{t("fr_cons_TOTAL_PROFIT")}</option>
                  <option value="PROFIT_TARGET">{t("fr_cons_PROFIT_TARGET")}</option>
                </Select>
              )}
            </Field>
          </div>
        )}
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-sm font-medium">{t("fr_costs")} {badge("costsIncluded")}</span>
          <Checkbox label={t("fr_costs_yes")} checked={r.costsIncluded} onChange={(v) => set("costsIncluded", { costsIncluded: v })} />
        </div>
        <Field label={head("eaAllowed", "fr_ea")}>
          {({ id }) => (
            <Select id={id} value={r.eaAllowed} onChange={(e) => set("eaAllowed", { eaAllowed: e.target.value as FundedRules["eaAllowed"] })}>
              <option value="UNKNOWN">{t("unknown")}</option>
              <option value="YES">{t("yes")}</option>
              <option value="NO">{t("no")}</option>
            </Select>
          )}
        </Field>
        <Field label={head("newsRule", "fr_news")} hint={t("fr_text_hint")}>{({ id }) => <Textarea id={id} rows={2} value={r.newsRule} onChange={(e) => set("newsRule", { newsRule: e.target.value })} />}</Field>
        <Field label={head("weekendRule", "fr_weekend")} hint={t("fr_text_hint")}>{({ id }) => <Textarea id={id} rows={2} value={r.weekendRule} onChange={(e) => set("weekendRule", { weekendRule: e.target.value })} />}</Field>
      </div>
      <Field label={t("fr_other")}>{({ id }) => <Textarea id={id} rows={2} value={r.otherNotes} onChange={(e) => set(null, { otherNotes: e.target.value })} />}</Field>
    </div>
  );
}
