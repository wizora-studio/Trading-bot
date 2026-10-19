import type { FundedRuleField, FundedRules, RuleFieldStatus } from "@/domain/types";
import { formatMoney, formatPercentValue } from "@/components/shared/format";
import { translate, type Lang } from "@/i18n";
import { d } from "@/services/analytics/decimal";

export interface ReadBackRow {
  field: FundedRuleField;
  label: string;
  value: string;
  status: RuleFieldStatus;
  source: "USER" | "PRESET" | "DEFAULT";
  how: string;
}

/**
 * Builds the funded-rule Read-Back from the STRUCTURED configuration (Module G5/G8).
 * The text is generated from exactly what the engine will use, never from AI memory.
 */
export function buildFundedReadBack(
  rules: FundedRules,
  status: Partial<Record<FundedRuleField, RuleFieldStatus>>,
  source: Partial<Record<FundedRuleField, "USER" | "PRESET" | "DEFAULT">>,
  lang: Lang,
  currency = "USD",
): { rows: ReadBackRow[]; summary: string; example: string; notChecked: string[] } {
  const t = (k: Parameters<typeof translate>[1], v?: Record<string, string | number>) => translate(lang, k, v);
  const start = d(rules.startingBalance || "0");
  const money = (x: ReturnType<typeof d>) => formatMoney(x, currency, { sign: false });
  const st = (f: FundedRuleField): RuleFieldStatus => status[f] ?? "MISSING";
  const src = (f: FundedRuleField) => source[f] ?? "USER";
  const rows: ReadBackRow[] = [];

  rows.push({ field: "startingBalance", label: t("fr_start_balance"), value: money(start), status: st("startingBalance"), source: src("startingBalance"), how: t("rb_how_start") });
  rows.push({
    field: "profitTargetPct",
    label: t("fr_target"),
    value: rules.profitTargetPct ? `${formatPercentValue(rules.profitTargetPct)} = ${money(start.times(d(rules.profitTargetPct)).div(100))}` : t("none"),
    status: st("profitTargetPct"),
    source: src("profitTargetPct"),
    how: t(rules.costsIncluded ? "rb_how_target_net" : "rb_how_target_gross"),
  });
  if (rules.dailyLoss) {
    const dl = rules.dailyLoss;
    rows.push({
      field: "dailyLoss",
      label: t("fr_daily"),
      value: `${formatPercentValue(dl.pct)} · ${t(`fr_base_${dl.base}`)} · ${t(`fr_on_${dl.measuredOn}`)} · ${t("rb_reset_at", { h: String(dl.resetHour).padStart(2, "0"), tz: dl.resetTimezone })}`,
      status: st("dailyLoss"),
      source: src("dailyLoss"),
      how: t(dl.base === "INITIAL_BALANCE" ? "rb_how_daily_initial" : "rb_how_daily_daystart", { p: formatPercentValue(dl.pct) }),
    });
  } else rows.push({ field: "dailyLoss", label: t("fr_daily"), value: t("none"), status: st("dailyLoss"), source: src("dailyLoss"), how: "–" });
  if (rules.maxLoss) {
    const ml = rules.maxLoss;
    rows.push({
      field: "maxLoss",
      label: t("fr_max"),
      value: `${formatPercentValue(ml.pct)} = ${money(start.times(d(ml.pct)).div(100))} · ${t(`fr_type_${ml.type}`)} · ${t(`fr_on_${ml.measuredOn}`)}${ml.lockAtStartingBalance ? ` · ${t("fr_lock")}` : ""}`,
      status: st("maxLoss"),
      source: src("maxLoss"),
      how: t(`rb_how_max_${ml.type}`, { floor: money(start.minus(start.times(d(ml.pct)).div(100))) }),
    });
  } else rows.push({ field: "maxLoss", label: t("fr_max"), value: t("none"), status: st("maxLoss"), source: src("maxLoss"), how: "–" });
  rows.push({ field: "minTradingDays", label: t("fr_min_days"), value: rules.minTradingDays === null ? t("none") : String(rules.minTradingDays), status: st("minTradingDays"), source: src("minTradingDays"), how: t("rb_how_days") });
  rows.push({
    field: "consistency",
    label: t("fr_consistency"),
    value: rules.consistency ? `${formatPercentValue(rules.consistency.maxPct)} · ${t(`fr_cons_${rules.consistency.base}`)}` : t("none"),
    status: st("consistency"),
    source: src("consistency"),
    how: rules.consistency ? t("rb_how_consistency", { p: formatPercentValue(rules.consistency.maxPct) }) : "–",
  });
  rows.push({ field: "costsIncluded", label: t("fr_costs"), value: rules.costsIncluded ? t("yes") : t("no"), status: st("costsIncluded"), source: src("costsIncluded"), how: t("rb_how_costs") });
  rows.push({ field: "newsRule", label: t("fr_news"), value: rules.newsRule || t("none_written"), status: st("newsRule"), source: src("newsRule"), how: t("not_auto_checked") });
  rows.push({ field: "weekendRule", label: t("fr_weekend"), value: rules.weekendRule || t("none_written"), status: st("weekendRule"), source: src("weekendRule"), how: t("not_auto_checked") });
  rows.push({ field: "eaAllowed", label: t("fr_ea"), value: t(rules.eaAllowed === "YES" ? "yes" : rules.eaAllowed === "NO" ? "no" : "unknown"), status: st("eaAllowed"), source: src("eaAllowed"), how: t("not_auto_checked") });

  // Worked example with the user's own numbers (Module G5).
  let example = "";
  if (rules.dailyLoss) {
    const yesterday = start.times(1.03);
    const limit = d(rules.dailyLoss.pct).div(100).times(rules.dailyLoss.base === "INITIAL_BALANCE" ? start : yesterday);
    example = t("rb_example_daily", { start: money(start), y: money(yesterday), p: formatPercentValue(rules.dailyLoss.pct), floor: money(yesterday.minus(limit)) });
  }
  if (rules.maxLoss && rules.maxLoss.type !== "STATIC") {
    const lim = start.times(d(rules.maxLoss.pct)).div(100);
    const peak = start.plus(lim.div(2));
    example += (example ? " " : "") + t("rb_example_trailing", { peak: money(peak), floor: money(rules.maxLoss.lockAtStartingBalance && peak.minus(lim).gt(start) ? start : peak.minus(lim)) });
  }

  const notChecked = [t("nc_equity"), t("nc_news"), t("nc_weekend"), t("nc_ea"), t("nc_copy")];
  if (rules.maxLoss?.type === "INTRADAY_TRAILING") notChecked.unshift(t("nc_intraday_trailing"));

  const summary = t("rb_funded_summary", {
    firm: rules.firmName || t("unknown"),
    plan: rules.planName || "",
    bal: money(start),
    target: rules.profitTargetPct ? formatPercentValue(rules.profitTargetPct) : t("none"),
    daily: rules.dailyLoss ? formatPercentValue(rules.dailyLoss.pct) : t("none"),
    max: rules.maxLoss ? `${formatPercentValue(rules.maxLoss.pct)} (${t(`fr_type_${rules.maxLoss.type}`)})` : t("none"),
  });
  return { rows, summary, example, notChecked };
}
