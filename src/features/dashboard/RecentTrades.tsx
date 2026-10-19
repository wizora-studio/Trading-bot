"use client";

import { Badge } from "@/components/shared/badges";
import { formatDateTime } from "@/components/shared/format";
import { MoneyText, RMultipleText } from "@/components/shared/numbers";
import type { Trade } from "@/domain/types";
import { type DictKey, useT } from "@/i18n";
import { adherenceOf } from "@/services/analytics/adherence";
import { tradeNet, tradeR } from "@/services/analytics/trade";
import { useApp } from "@/store/appStore";
import { checklistRules } from "@/features/strategies/types";

export function RecentTrades({ trades, currency }: { trades: Trade[]; currency: string }) {
  const { t, lang } = useT();
  const strategies = useApp((s) => s.strategies);
  const tz = useApp((s) => s.settings.displayTimezone);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs text-muted">
            {[t("c_date"), t("c_symbol"), t("c_side"), t("c_strategy"), t("c_rules")].map((h) => (
              <th key={h} className="border-b border-line py-2 pr-3 font-medium">
                {h}
              </th>
            ))}
            <th className="border-b border-line py-2 pr-3 text-right font-medium">{t("c_r")}</th>
            <th className="border-b border-line py-2 text-right font-medium">{t("c_net")}</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((x) => {
            const s = strategies.find((st) => st.id === x.strategyId);
            const g = s ? adherenceOf(x, checklistRules(s).map((r) => r.id)) : null;
            return (
              <tr key={x.id}>
                <td className="border-b border-line py-2.5 pr-3 whitespace-nowrap">{formatDateTime(x.closeTime, tz, lang)}</td>
                <td className="border-b border-line py-2.5 pr-3">{x.instrument}</td>
                <td className="border-b border-line py-2.5 pr-3">{t(`side_${x.side}` as DictKey)}</td>
                <td className="border-b border-line py-2.5 pr-3">{s ? s.spec.strategy.name : <span className="text-muted">{t("no_strategy")}</span>}</td>
                <td className="border-b border-line py-2.5 pr-3">
                  {g === "FOLLOWED" ? <Badge tone="ok" icon="check">{t("followed")}</Badge> : g === "BROKE" ? <Badge tone="solid" icon="alert">{t("broken")}</Badge> : g ? <Badge>{t("unanswered")}</Badge> : "–"}
                </td>
                <td className="border-b border-line py-2.5 pr-3 text-right">
                  <RMultipleText value={tradeR(x, currency)} arrow={false} />
                </td>
                <td className="border-b border-line py-2.5 text-right">
                  <MoneyText value={tradeNet(x)} currency={currency} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
