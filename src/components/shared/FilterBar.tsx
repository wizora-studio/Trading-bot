"use client";

import { useMemo } from "react";
import { Button, Select } from "@/components/ui/primitives";
import type { SessionName } from "@/domain/types";
import { type DictKey, useT } from "@/i18n";
import { SESSION_ORDER } from "@/services/analytics/breakdowns";
import { useApp } from "@/store/appStore";
import { DEFAULT_FILTERS, type Filters, useAccountTrades, useFilters } from "@/store/hooks";

/** Global Filter Bar: every KPI and chart on the page uses the same filtered trades. */
export function FilterBar() {
  const { t } = useT();
  const { filters, set, reset } = useFilters();
  const { all } = useAccountTrades(false);
  const strategies = useApp((s) => s.strategies);
  const instruments = useMemo(() => [...new Set(all.map((x) => x.instrument))].sort(), [all]);
  const tags = useMemo(() => [...new Set(all.flatMap((x) => x.mistakeTags))].sort(), [all]);
  const usedStrategies = useMemo(() => strategies.filter((s) => all.some((x) => x.strategyId === s.id)), [strategies, all]);
  const changed = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);
  const sel = "";
  return (
    <div className="mb-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center [&>select]:sm:w-44" role="group" aria-label={t("filters")}>
      <Select aria-label={t("f_range")} value={filters.range} onChange={(e) => set({ range: e.target.value as Filters["range"] })} className={sel}>
        <option value="ALL">{t("f_range_all")}</option>
        <option value="7">{t("f_range_n", { n: 7 })}</option>
        <option value="30">{t("f_range_n", { n: 30 })}</option>
        <option value="90">{t("f_range_n", { n: 90 })}</option>
      </Select>
      <Select aria-label={t("f_instrument")} value={filters.instrument} onChange={(e) => set({ instrument: e.target.value })} className={sel}>
        <option value="">{t("f_all_instruments")}</option>
        {instruments.map((i) => (
          <option key={i}>{i}</option>
        ))}
      </Select>
      <Select aria-label={t("f_strategy")} value={filters.strategyId} onChange={(e) => set({ strategyId: e.target.value })} className={sel}>
        <option value="">{t("f_all_strategies")}</option>
        <option value="NONE">{t("no_strategy")}</option>
        {usedStrategies.map((s) => (
          <option key={s.id} value={s.id}>
            {s.spec.strategy.name}
          </option>
        ))}
      </Select>
      <Select aria-label={t("f_session")} value={filters.session} onChange={(e) => set({ session: e.target.value as SessionName | "" })} className={sel}>
        <option value="">{t("f_all_sessions")}</option>
        {SESSION_ORDER.map((s) => (
          <option key={s} value={s}>
            {t(`sess_${s}` as DictKey)}
          </option>
        ))}
      </Select>
      <Select aria-label={t("f_side")} value={filters.side} onChange={(e) => set({ side: e.target.value as Filters["side"] })} className={sel}>
        <option value="">{t("f_all_sides")}</option>
        <option value="LONG">{t("side_LONG")}</option>
        <option value="SHORT">{t("side_SHORT")}</option>
      </Select>
      {tags.length > 0 && (
        <Select aria-label={t("f_tag")} value={filters.tag} onChange={(e) => set({ tag: e.target.value })} className={sel}>
          <option value="">{t("f_all_tags")}</option>
          {tags.map((tg) => (
            <option key={tg}>{tg}</option>
          ))}
        </Select>
      )}
      {changed && (
        <Button size="sm" variant="ghost" onClick={reset} icon="close">
          {t("f_clear")}
        </Button>
      )}
    </div>
  );
}
