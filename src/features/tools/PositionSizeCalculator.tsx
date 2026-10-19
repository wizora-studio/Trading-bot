"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { formatMoney, formatNumber } from "@/components/shared/format";
import { Field, Input, Segmented, Select } from "@/components/ui/primitives";
import { useT } from "@/i18n";
import { isDecimalText } from "@/services/analytics/decimal";
import { getSpec, INSTRUMENTS } from "@/services/analytics/instruments";
import { positionSize, type PositionSizeResult } from "@/services/analytics/positionSize";
import { useApp } from "@/store/appStore";

/**
 * Position Size Calculator (Risk Model R1): risk (% or money) + stop-loss → lot size.
 * Contract sizes come from the Instrument Specification Registry; brokers can differ, so they are editable.
 */
export function PositionSizeCalculator({
  defaultBalance = "10000",
  currency = "USD",
  maxRiskAmount = null,
  onResult,
  initialInstrument = "EURUSD",
}: {
  defaultBalance?: string;
  currency?: string;
  maxRiskAmount?: string | null;
  onResult?: (r: PositionSizeResult | null, input: { instrument: string; entry: string; stop: string; riskPct: string }) => void;
  initialInstrument?: string;
}) {
  const { t } = useT();
  const overrides = useApp((s) => s.instrumentOverrides);
  const update = useApp((s) => s.update);
  const [balance, setBalance] = useState(defaultBalance);
  const [mode, setMode] = useState<"PERCENT" | "MONEY">("PERCENT");
  const [risk, setRisk] = useState("0.5");
  const [instrument, setInstrument] = useState(initialInstrument);
  const [entry, setEntry] = useState("");
  const [stop, setStop] = useState("");
  const [rate, setRate] = useState("");
  const spec = getSpec(instrument, overrides);
  const ok = spec && [balance, risk, entry, stop].every((v) => isDecimalText(v)) && entry !== stop && Number(entry) > 0;
  const res = ok ? positionSize({ balance, riskMode: mode, riskValue: risk, entry, stopLoss: stop, spec, quoteToAccountRate: rate, accountCurrency: currency, maxRiskAmount }) : null;
  // Report the result to a parent (e.g., Trade Planner) only when it really changes.
  const key = `${res?.lots.toString() ?? "none"}|${res?.actualRisk.toString() ?? ""}|${instrument}|${entry}|${stop}|${mode}|${risk}`;
  const report = useEffectEvent(() => onResult?.(res, { instrument, entry, stop, riskPct: mode === "PERCENT" ? risk : "" }));
  useEffect(() => {
    report();
  }, [key]);
  const needsRate = spec && spec.quoteCurrency !== currency && !spec.canonical.startsWith(currency);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={t("balance")}>{({ id }) => <Input id={id} inputMode="decimal" value={balance} onChange={(e) => setBalance(e.target.value)} />}</Field>
        <div>
          <div className="mb-1 text-sm font-medium">{t("risk_mode")}</div>
          <Segmented label={t("risk_mode")} value={mode} onChange={setMode} options={[{ value: "PERCENT", label: "%" }, { value: "MONEY", label: currency }]} />
        </div>
        <Field label={mode === "PERCENT" ? t("risk_pct") : t("risk_money")}>{({ id }) => <Input id={id} inputMode="decimal" value={risk} onChange={(e) => setRisk(e.target.value)} />}</Field>
        <Field label={t("c_symbol")}>
          {({ id }) => (
            <Select id={id} value={instrument} onChange={(e) => setInstrument(e.target.value)}>
              {INSTRUMENTS.map((i) => (
                <option key={i.canonical} value={i.canonical}>
                  {i.canonical} — {i.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={t("c_entry")}>{({ id }) => <Input id={id} inputMode="decimal" value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="1.08500" />}</Field>
        <Field label={t("c_sl")}>{({ id }) => <Input id={id} inputMode="decimal" value={stop} onChange={(e) => setStop(e.target.value)} placeholder="1.08300" />}</Field>
        {needsRate && (
          <Field label={t("quote_rate", { q: spec.quoteCurrency, a: currency })} hint={t("quote_rate_hint")}>
            {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />}
          </Field>
        )}
      </div>
      {spec && (
        <details>
          <summary className="min-h-11 cursor-pointer text-sm text-muted">{t("spec_details", { c: spec.contractSize, p: spec.pipSize })}</summary>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label={t("contract_size")}>
              {({ id }) => <Input id={id} inputMode="decimal" value={spec.contractSize} onChange={(e) => update((s) => ({ instrumentOverrides: { ...s.instrumentOverrides, [instrument]: { ...s.instrumentOverrides[instrument], contractSize: e.target.value } } }))} />}
            </Field>
            <Field label={t("pip_size")}>
              {({ id }) => <Input id={id} inputMode="decimal" value={spec.pipSize} onChange={(e) => update((s) => ({ instrumentOverrides: { ...s.instrumentOverrides, [instrument]: { ...s.instrumentOverrides[instrument], pipSize: e.target.value } } }))} />}
            </Field>
          </div>
          <p className="mt-1 mb-0 text-xs text-muted">{t("spec_override_note")}</p>
        </details>
      )}
      {res ? (
        <div className="rounded-m border-2 border-blue p-4">
          <div className="text-sm text-muted">{t("lot_size")}</div>
          <div className="text-[length:var(--text-2xl)] font-bold">{formatNumber(res.lots)} {t("unit_LOTS")}</div>
          <div className="mt-1 grid gap-1 text-sm sm:grid-cols-2">
            <span>{t("risk_amount")}: {formatMoney(res.riskAmount, currency, { sign: false })}</span>
            <span>{t("actual_risk")}: {formatMoney(res.actualRisk, currency, { sign: false })}</span>
            <span>{t("stop_pips", { n: formatNumber(res.stopDistancePips, 1) })}</span>
            <span>{t("pip_value_lot", { x: formatMoney(res.pipValuePerLot, currency, { sign: false }) })}</span>
          </div>
          {res.cappedByRule && <p className="mt-2 mb-0 text-sm font-medium">{t("capped_by_room", { x: formatMoney(maxRiskAmount ?? "0", currency, { sign: false }) })}</p>}
          {res.warnings.includes("BELOW_MIN_LOT") && <p className="mt-2 mb-0 text-sm">{t("below_min_lot")}</p>}
          {res.warnings.includes("RATE_UNKNOWN_ASSUMED_1") && <p className="mt-2 mb-0 text-sm">{t("rate_unknown")}</p>}
        </div>
      ) : (
        <p className="m-0 text-sm text-muted">{t("calc_fill_in")}</p>
      )}
    </div>
  );
}
