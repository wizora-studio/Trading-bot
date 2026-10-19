"use client";

import { useMemo, useState } from "react";
import { RuleMeter } from "@/components/shared/blocks";
import { formatMoney, formatPct } from "@/components/shared/format";
import { Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { useT } from "@/i18n";
import { d, isDecimalText, ZERO } from "@/services/analytics/decimal";

/**
 * Free Prop Firm Calculator (Launch Stage 1 lead magnet). Works without an account:
 * remaining daily loss, remaining max loss (static or trailing), and the consistency rule.
 */
export function PropFirmCalculator() {
  const { t } = useT();
  const [start, setStart] = useState("10000");
  const [dayStart, setDayStart] = useState("10150");
  const [now, setNow] = useState("10020");
  const [peak, setPeak] = useState("10300");
  const [dailyPct, setDailyPct] = useState("5");
  const [dailyBase, setDailyBase] = useState<"INITIAL" | "DAY_START">("INITIAL");
  const [maxPct, setMaxPct] = useState("10");
  const [maxType, setMaxType] = useState<"STATIC" | "TRAILING">("STATIC");
  const [consPct, setConsPct] = useState("40");
  const [days, setDays] = useState("250, 120, -80, 310");

  const r = useMemo(() => {
    if (![start, dayStart, now, peak, dailyPct, maxPct, consPct].every(isDecimalText)) return null;
    const s0 = d(start);
    const ds = d(dayStart);
    const cur = d(now);
    const dailyLimit = d(dailyPct).div(100).times(dailyBase === "INITIAL" ? s0 : ds);
    const dailyFloor = ds.minus(dailyLimit);
    const maxLimit = d(maxPct).div(100).times(s0);
    const maxFloor = (maxType === "STATIC" ? s0 : d(peak).gt(s0) ? d(peak) : s0).minus(maxLimit);
    const dailyLeft = cur.minus(dailyFloor);
    const maxLeft = cur.minus(maxFloor);
    const dayVals = days
      .split(/[,\s]+/)
      .map((x) => x.trim())
      .filter((x) => isDecimalText(x))
      .map((x) => d(x));
    const total = dayVals.reduce((a, b) => a.plus(b), ZERO);
    const best = dayVals.reduce((a, b) => (b.gt(a) ? b : a), ZERO);
    const share = total.gt(0) ? best.div(total) : null;
    const maxShare = d(consPct).div(100);
    const needed = share && share.gt(maxShare) ? best.div(maxShare).minus(total) : ZERO;
    return { dailyLimit, dailyFloor, dailyLeft, maxLimit, maxFloor, maxLeft, total, best, share, needed, room: dailyLeft.lt(maxLeft) ? dailyLeft : maxLeft };
  }, [start, dayStart, now, peak, dailyPct, dailyBase, maxPct, maxType, consPct, days]);

  const m = (x: Parameters<typeof formatMoney>[0]) => formatMoney(x, "USD", { sign: false });
  const num = (label: string, v: string, set: (x: string) => void, hint?: string) => (
    <Field label={label} hint={hint} error={v && !isDecimalText(v) ? t("err_number") : undefined}>
      {({ id, invalid, describedBy }) => <Input id={id} inputMode="decimal" aria-invalid={invalid} aria-describedby={describedBy} value={v} onChange={(e) => set(e.target.value)} />}
    </Field>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-4">
        {num(t("pfc_start"), start, setStart)}
        {num(t("pfc_day_start"), dayStart, setDayStart, t("pfc_day_start_hint"))}
        {num(t("pfc_now"), now, setNow, t("pfc_now_hint"))}
        {num(t("pfc_peak"), peak, setPeak, t("pfc_peak_hint"))}
        {num(t("pfc_daily_pct"), dailyPct, setDailyPct)}
        <Field label={t("fr_daily_base")}>
          {({ id }) => (
            <Select id={id} value={dailyBase} onChange={(e) => setDailyBase(e.target.value as "INITIAL" | "DAY_START")}>
              <option value="INITIAL">{t("fr_base_INITIAL_BALANCE")}</option>
              <option value="DAY_START">{t("fr_base_DAY_START_BALANCE")}</option>
            </Select>
          )}
        </Field>
        {num(t("pfc_max_pct"), maxPct, setMaxPct)}
        <Field label={t("fr_max_type")}>
          {({ id }) => (
            <Select id={id} value={maxType} onChange={(e) => setMaxType(e.target.value as "STATIC" | "TRAILING")}>
              <option value="STATIC">{t("fr_type_STATIC")}</option>
              <option value="TRAILING">{t("fr_type_EOD_TRAILING")}</option>
            </Select>
          )}
        </Field>
      </div>
      {r && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <div className="font-semibold">{t("rule_DAILY_LOSS")}</div>
            <RuleMeter kind="used" ratio={r.dailyLimit.gt(0) ? 1 - Math.max(0, r.dailyLeft.div(r.dailyLimit).toNumber()) : 0} label={t("rule_DAILY_LOSS")} />
            <div className="text-sm">
              <strong>{t("left_today", { x: m(r.dailyLeft.lt(0) ? ZERO : r.dailyLeft) })}</strong> · {t("pfc_floor", { x: m(r.dailyFloor) })}
            </div>
            {r.dailyLeft.lte(0) && <p className="mt-1 mb-0 font-semibold">{t("pfc_breached")}</p>}
          </div>
          <div>
            <div className="font-semibold">{t("rule_MAX_LOSS")}</div>
            <RuleMeter kind="used" ratio={r.maxLimit.gt(0) ? 1 - Math.max(0, r.maxLeft.div(r.maxLimit).toNumber()) : 0} label={t("rule_MAX_LOSS")} />
            <div className="text-sm">
              <strong>{t("left_before_breach", { x: m(r.maxLeft.lt(0) ? ZERO : r.maxLeft) })}</strong> · {t("pfc_floor", { x: m(r.maxFloor) })}
            </div>
            {r.maxLeft.lte(0) && <p className="mt-1 mb-0 font-semibold">{t("pfc_breached")}</p>}
          </div>
          <div className="rounded-m bg-soft p-3 sm:col-span-2">
            {t("pfc_room", { x: m(r.room.lt(0) ? ZERO : r.room) })}
          </div>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
        <Field label={t("pfc_days")} hint={t("pfc_days_hint")}>{({ id, describedBy }) => <Textarea id={id} aria-describedby={describedBy} rows={2} value={days} onChange={(e) => setDays(e.target.value)} />}</Field>
        {num(t("fr_cons_max"), consPct, setConsPct)}
      </div>
      {r && (
        <div className="text-sm">
          {r.share === null ? (
            t("no_profit_yet")
          ) : (
            <>
              {t("pfc_cons_result", { best: m(r.best), total: m(r.total), p: formatPct(r.share, 1) })}{" "}
              <strong>{r.needed.gt(0) ? t("cons_need", { x: m(r.needed) }) : t("pfc_cons_ok")}</strong>
            </>
          )}
        </div>
      )}
      <p className="m-0 text-xs text-muted">{t("pfc_note")}</p>
    </div>
  );
}
