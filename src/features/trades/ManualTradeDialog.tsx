"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "@/components/shared/toast";
import { Button, Dialog, Field, Input, Segmented, Select, Textarea } from "@/components/ui/primitives";
import type { QuantityUnit, Side } from "@/domain/types";
import { useT } from "@/i18n";
import { emptyDraft } from "@/features/import/types";
import { isDecimalText } from "@/services/analytics/decimal";
import { INSTRUMENTS, mapSymbol } from "@/services/analytics/instruments";
import { parseExportTime } from "@/services/analytics/time";
import { addManualTrade } from "@/store/actions";
import { useApp } from "@/store/appStore";

const dec = z.string().trim().refine((v) => v === "" || isDecimalText(v));
const Schema = z.object({
  symbol: z.string().trim().min(1),
  quantity: z.string().trim().refine((v) => isDecimalText(v) && Number(v) > 0),
  close: z.string().min(1),
  gross: z.string().trim().refine(isDecimalText),
  entry: dec,
  exit: dec,
  sl: dec,
  tp: dec,
  commission: dec,
  swap: dec,
});

/** Manual trade entry form (MVP import option 3), validated with Zod. */
export function ManualTradeDialog({ open, onClose, accountId }: { open: boolean; onClose: () => void; accountId: string }) {
  const { t } = useT();
  const tz = useApp((s) => s.settings.displayTimezone);
  const activeIds = useApp((s) => s.accounts.find((a) => a.id === accountId)?.activeStrategyIds ?? []);
  const strategies = useApp((s) => s.strategies.filter((x) => activeIds.includes(x.id)));
  const [f, setF] = useState({ symbol: "EURUSD", side: "LONG" as Side, quantity: "0.10", unit: "LOTS" as QuantityUnit, open: "", close: "", entry: "", exit: "", sl: "", tp: "", gross: "", commission: "", swap: "", notes: "", strategyId: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    const r = Schema.safeParse(f);
    const e: Record<string, string> = {};
    if (!r.success) for (const i of r.error.issues) e[String(i.path[0])] = i.path[0] === "symbol" || i.path[0] === "close" ? t("err_required") : t("err_number");
    const closeTime = parseExportTime(f.close.replace("T", " "), tz);
    const openTime = f.open ? parseExportTime(f.open.replace("T", " "), tz) : null;
    if (!closeTime) e.close = t("err_required");
    if (openTime && closeTime && openTime > closeTime) e.open = t("err_open_after_close");
    setErr(e);
    if (Object.keys(e).length || !closeTime) return;
    const m = mapSymbol(f.symbol);
    const n = (v: string) => (v.trim() === "" ? null : v.trim());
    addManualTrade(
      accountId,
      emptyDraft({
        source: "MANUAL",
        symbol: f.symbol.trim().toUpperCase(),
        instrument: m.instrument,
        side: f.side,
        quantity: f.quantity.trim(),
        quantityUnit: f.unit,
        openTime: openTime?.toISOString() ?? null,
        closeTime: closeTime.toISOString(),
        entryPrice: n(f.entry),
        exitPrice: n(f.exit),
        stopLoss: n(f.sl),
        takeProfit: n(f.tp),
        grossPnl: f.gross.trim(),
        commission: n(f.commission)?.replace("-", "") ?? "0",
        swap: n(f.swap) ?? "0",
        notes: f.notes,
        strategyId: f.strategyId || null,
      }),
    );
    toast(t("trade_added"));
    onClose();
  };

  const num = (k: keyof typeof f, label: string, hint?: string) => (
    <Field label={label} error={err[k]} hint={hint}>
      {({ id, invalid, describedBy }) => <Input id={id} inputMode="decimal" aria-invalid={invalid} aria-describedby={describedBy} value={f[k]} onChange={(e) => set(k, e.target.value)} />}
    </Field>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={t("add_manual_trade")}
      footer={
        <>
          <Button onClick={onClose}>{t("cancel")}</Button>
          <Button variant="primary" onClick={submit}>
            {t("save")}
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={t("c_symbol")} error={err.symbol}>
          {({ id, invalid }) => (
            <>
              <Input id={id} list="instrument-list" aria-invalid={invalid} value={f.symbol} onChange={(e) => set("symbol", e.target.value)} />
              <datalist id="instrument-list">
                {INSTRUMENTS.map((i) => (
                  <option key={i.canonical} value={i.canonical} />
                ))}
              </datalist>
            </>
          )}
        </Field>
        <div>
          <div className="mb-1 text-sm font-medium">{t("c_side")}</div>
          <Segmented label={t("c_side")} value={f.side} onChange={(v) => set("side", v)} options={[{ value: "LONG", label: t("side_LONG") }, { value: "SHORT", label: t("side_SHORT") }]} />
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          {num("quantity", t("c_qty"))}
          <Field label={t("unit")}>
            {({ id }) => (
              <Select id={id} value={f.unit} onChange={(e) => set("unit", e.target.value)}>
                <option value="LOTS">{t("unit_LOTS")}</option>
                <option value="UNITS">{t("unit_UNITS")}</option>
              </Select>
            )}
          </Field>
        </div>
        <Field label={t("c_open")} error={err.open} hint={t("optional")}>
          {({ id, invalid }) => <Input id={id} type="datetime-local" aria-invalid={invalid} value={f.open} onChange={(e) => set("open", e.target.value)} />}
        </Field>
        <Field label={t("c_close")} error={err.close} hint={t("time_in_tz", { tz })}>
          {({ id, invalid, describedBy }) => <Input id={id} type="datetime-local" aria-invalid={invalid} aria-describedby={describedBy} value={f.close} onChange={(e) => set("close", e.target.value)} />}
        </Field>
        {num("gross", t("c_gross"), t("gross_hint"))}
        {num("entry", t("c_entry"))}
        {num("exit", t("c_exit"))}
        {num("sl", t("c_sl"), t("sl_hint"))}
        {num("tp", t("c_tp"))}
        {num("commission", t("c_commission"))}
        {num("swap", t("c_swap"), t("swap_hint"))}
      </div>
      <Field label={t("c_strategy")} className="mt-3">
        {({ id }) => (
          <Select id={id} value={f.strategyId} onChange={(e) => set("strategyId", e.target.value)}>
            <option value="">{t("no_strategy_unplanned")}</option>
            {strategies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.spec.strategy.name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label={t("journal_notes")} className="mt-3">
        {({ id }) => <Textarea id={id} rows={2} value={f.notes} onChange={(e) => set("notes", e.target.value)} />}
      </Field>
    </Dialog>
  );
}
