"use client";

import { type ReactNode, useState } from "react";
import { Badge } from "@/components/shared/badges";
import { formatDateTime, formatDuration, formatMoney, formatNumber, formatPrice } from "@/components/shared/format";
import { MoneyText, RMultipleText } from "@/components/shared/numbers";
import { toast } from "@/components/shared/toast";
import { Button, Drawer, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import type { Trade } from "@/domain/types";
import { type DictKey, useT } from "@/i18n";
import { isDecimalText } from "@/services/analytics/decimal";
import { getSpec } from "@/services/analytics/instruments";
import { holdingMs, plannedRisk, plannedRR, tradeCosts, tradeNet, tradeR, tradeSession } from "@/services/analytics/trade";
import { updateTrade } from "@/store/actions";
import { useApp } from "@/store/appStore";
import { ChecklistPanel } from "./ChecklistPanel";

export const MISTAKE_TAGS = ["FOMO", "Revenge trade", "Early exit", "Widened SL", "Moved TP", "News gamble", "Overtrading", "Outside session", "No plan", "Oversized"];

/** Trade Detail Drawer (Module D): execution facts, editable SL/TP/risk with audit trail, strategy, checklist, journal. */
export function TradeDrawer({ tradeId, onClose }: { tradeId: string | null; onClose: () => void }) {
  const trade = useApp((s) => s.trades.find((x) => x.id === tradeId) ?? null);
  if (!trade) return <Drawer open={false} onClose={onClose} title="">{null}</Drawer>;
  // Keyed by trade id so the form starts fresh whenever another trade is opened.
  return <TradeDrawerBody key={trade.id} trade={trade} onClose={onClose} />;
}

function TradeDrawerBody({ trade, onClose }: { trade: Trade; onClose: () => void }) {
  const { t, lang } = useT();
  const account = useApp((s) => s.accounts.find((a) => a.id === trade.accountId));
  const strategies = useApp((s) => s.strategies);
  const tz = useApp((s) => s.settings.displayTimezone);
  const plans = useApp((s) => s.plans);

  const [sl, setSl] = useState(trade.stopLoss ?? "");
  const [tp, setTp] = useState(trade.takeProfit ?? "");
  const [risk, setRisk] = useState(trade.plannedRisk ?? "");
  const [notes, setNotes] = useState(trade.notes.replace("[unknown-symbol]", "").trim());
  const [shots, setShots] = useState((trade.screenshotUrls ?? []).join("\n"));
  const [customTag, setCustomTag] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});

  const currency = account?.baseCurrency ?? "USD";
  const spec = getSpec(trade.instrument);
  const digits = spec?.digits ?? 5;
  const activeIds = account?.activeStrategyIds ?? [];
  const pickable = strategies.filter((s) => activeIds.includes(s.id) || s.id === trade.strategyId);
  const strategy = strategies.find((s) => s.id === trade.strategyId);
  const plan = plans.find((p) => p.id === trade.tradePlanId);

  const save = () => {
    const e: Record<string, string> = {};
    for (const [k, v] of [["sl", sl], ["tp", tp], ["risk", risk]] as const) if (v.trim() && !isDecimalText(v)) e[k] = t("err_number");
    if (risk.trim() && Number(risk) <= 0) e.risk = t("err_positive_number");
    setErr(e);
    if (Object.keys(e).length) return;
    const patch: Partial<Trade> = {};
    if ((trade.stopLoss ?? "") !== sl.trim()) patch.stopLoss = sl.trim() || null;
    if ((trade.takeProfit ?? "") !== tp.trim()) patch.takeProfit = tp.trim() || null;
    if ((trade.plannedRisk ?? "") !== risk.trim()) patch.plannedRisk = risk.trim() || null;
    updateTrade(trade.id, patch);
    const urls = shots
      .split(/\s+/)
      .map((u) => u.trim())
      .filter((u) => /^https?:\/\//i.test(u));
    updateTrade(trade.id, { notes: notes + (trade.notes.includes("[unknown-symbol]") ? " [unknown-symbol]" : ""), screenshotUrls: urls }, false);
    toast(t("saved"));
  };

  const r = tradeR(trade, currency);
  const rr = plannedRR(trade);
  const pr = plannedRisk(trade, currency);
  const facts: [string, ReactNode][] = [
    [t("c_symbol"), `${trade.instrument}${trade.symbol !== trade.instrument ? ` (${trade.symbol})` : ""}`],
    [t("c_side"), t(`side_${trade.side}` as DictKey)],
    [t("c_qty"), `${formatNumber(trade.quantity, trade.quantityUnit === "LOTS" ? 2 : 0)} ${t(`unit_${trade.quantityUnit}` as DictKey)}`],
    [t("c_open"), formatDateTime(trade.openTime, tz, lang)],
    [t("c_close"), formatDateTime(trade.closeTime, tz, lang)],
    [t("c_hold"), formatDuration(holdingMs(trade))],
    [t("c_session"), t(`sess_${tradeSession(trade)}` as DictKey)],
    [t("c_entry"), formatPrice(trade.entryPrice, digits)],
    [t("c_exit"), formatPrice(trade.exitPrice, digits)],
    [t("c_gross"), <MoneyText key="g" value={trade.grossPnl} currency={currency} />],
    [t("c_costs"), formatMoney(tradeCosts(trade), currency, { sign: false })],
    [t("c_net"), <MoneyText key="n" value={tradeNet(trade)} currency={currency} />],
    [t("c_planned_risk"), pr ? formatMoney(pr, currency, { sign: false }) : <Badge key="r" tone="warn">{t("needs_sl")}</Badge>],
    [t("c_r"), r ? <RMultipleText key="rr" value={r} /> : "–"],
    [t("c_planned_rr"), rr ? formatNumber(rr) : "–"],
    [t("c_source"), t(`src_${trade.source}` as DictKey)],
  ];

  return (
    <Drawer
      open
      onClose={onClose}
      title={`${trade.instrument} · ${t(`side_${trade.side}` as DictKey)}`}
      footer={
        <>
          <Button onClick={onClose}>{t("close")}</Button>
          <Button variant="primary" onClick={save}>
            {t("save")}
          </Button>
        </>
      }
    >
      <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {facts.map(([k, v]) => (
          <div key={k} className="border-b border-line pb-1.5">
            <dt className="text-xs text-muted">{k}</dt>
            <dd className="m-0">{v}</dd>
          </div>
        ))}
      </dl>
      {trade.userEdited.length > 0 && (
        <p className="mt-2 mb-0 text-xs text-muted">
          {t("audit_edited")}: {trade.userEdited.join(", ")}
        </p>
      )}
      {plan && <p className="mt-2 mb-0 text-xs text-muted">{t("linked_plan", { d: formatDateTime(plan.createdAt, tz, lang) })}</p>}

      <h3 className="mt-5 mb-2 text-md font-semibold">{t("edit_risk_title")}</h3>
      <p className="mt-0 mb-3 text-xs text-muted">{t("edit_risk_hint")}</p>
      <div className="grid grid-cols-3 gap-3">
        <Field label={t("c_sl")} error={err.sl}>
          {({ id, invalid }) => <Input id={id} inputMode="decimal" aria-invalid={invalid} value={sl} onChange={(e) => setSl(e.target.value)} />}
        </Field>
        <Field label={t("c_tp")} error={err.tp}>
          {({ id, invalid }) => <Input id={id} inputMode="decimal" aria-invalid={invalid} value={tp} onChange={(e) => setTp(e.target.value)} />}
        </Field>
        <Field label={t("c_planned_risk")} error={err.risk}>
          {({ id, invalid }) => <Input id={id} inputMode="decimal" aria-invalid={invalid} value={risk} onChange={(e) => setRisk(e.target.value)} placeholder={currency} />}
        </Field>
      </div>

      <h3 className="mt-5 mb-2 text-md font-semibold">{t("c_strategy")}</h3>
      <Select
        aria-label={t("c_strategy")}
        value={trade.strategyId ?? ""}
        onChange={(e) => updateTrade(trade.id, { strategyId: e.target.value || null, checklist: {} }, false)}
      >
        <option value="">{t("no_strategy_unplanned")}</option>
        {pickable.map((s) => (
          <option key={s.id} value={s.id}>
            {s.spec.strategy.name}
            {s.status !== "CONFIRMED" ? ` (${t(`ss_${s.status}` as DictKey)})` : ""}
          </option>
        ))}
      </Select>
      {!pickable.length && <p className="mt-1 mb-0 text-xs text-muted">{t("no_active_strategies")}</p>}
      {strategy && (
        <div className="mt-3">
          <ChecklistPanel strategy={strategy} checklist={trade.checklist} onChange={(c) => updateTrade(trade.id, { checklist: c }, false)} />
        </div>
      )}

      <h3 className="mt-5 mb-2 text-md font-semibold">{t("mistake_tags")}</h3>
      <div className="flex flex-wrap gap-2">
        {[...new Set([...MISTAKE_TAGS, ...trade.mistakeTags])].map((tag) => {
          const on = trade.mistakeTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={on}
              onClick={() => updateTrade(trade.id, { mistakeTags: on ? trade.mistakeTags.filter((x) => x !== tag) : [...trade.mistakeTags, tag] }, false)}
              className={`min-h-9 rounded-full border px-3 text-sm max-md:min-h-11 ${on ? "border-fg bg-fg text-bg" : "border-line text-muted"}`}
            >
              {tag}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        <Input aria-label={t("add_tag")} placeholder={t("add_tag")} value={customTag} onChange={(e) => setCustomTag(e.target.value)} />
        <Button
          onClick={() => {
            const tag = customTag.trim().slice(0, 40);
            if (!tag) return;
            updateTrade(trade.id, { mistakeTags: [...new Set([...trade.mistakeTags, tag])] }, false);
            setCustomTag("");
          }}
        >
          {t("add")}
        </Button>
      </div>

      <h3 className="mt-5 mb-2 text-md font-semibold">{t("journal_notes")}</h3>
      <Textarea aria-label={t("journal_notes")} rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Field label={t("screenshots")} hint={t("screenshots_hint")} className="mt-3">
        {({ id }) => <Textarea id={id} rows={2} value={shots} onChange={(e) => setShots(e.target.value)} placeholder="https://www.tradingview.com/x/…" />}
      </Field>
      {(trade.screenshotUrls ?? []).length > 0 && (
        <ul className="mt-2 mb-0 pl-4 text-sm">
          {(trade.screenshotUrls ?? []).map((u) => (
            <li key={u}>
              <a href={u} target="_blank" rel="noopener noreferrer" className="break-all text-blue underline">
                {u}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
