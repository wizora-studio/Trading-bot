"use client";

import { useState } from "react";
import { Disclaimer, PageHeader } from "@/components/shared/blocks";
import { Segmented, Select } from "@/components/ui/primitives";
import { useT } from "@/i18n";
import { useApp } from "@/store/appStore";
import { TradingViewChart, useResolvedTheme } from "./TradingViewChart";

const DEFAULTS = ["XAUUSD", "EURUSD", "GBPUSD", "US30", "NAS100"];

export function ChartsPage() {
  const { t } = useT();
  const settings = useApp((s) => s.settings);
  const theme = useResolvedTheme(settings.theme);
  const [symbol, setSymbol] = useState("XAUUSD");
  const [interval, setInterval] = useState("15");
  return (
    <div>
      <PageHeader title={t("nav_charts")} description={t("charts_desc")} />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Segmented label={t("c_symbol")} value={symbol} onChange={setSymbol} options={DEFAULTS.map((s) => ({ value: s, label: s }))} />
        <Select aria-label={t("timeframe")} value={interval} onChange={(e) => setInterval(e.target.value)} className="w-32">
          {[
            ["1", "1m"],
            ["5", "5m"],
            ["15", "15m"],
            ["60", "1H"],
            ["240", "4H"],
            ["D", "1D"],
          ].map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
      </div>
      <TradingViewChart symbol={symbol} interval={interval} theme={theme} timezone={settings.displayTimezone} height={600} />
      <Disclaimer />
    </div>
  );
}
