"use client";

import { useEffect, useRef } from "react";
import { useT } from "@/i18n";

/** TradingView symbols for the default instruments (TradingView-hosted data; our app cannot read it). */
export const TV_SYMBOLS: Record<string, string> = {
  XAUUSD: "OANDA:XAUUSD",
  EURUSD: "FX:EURUSD",
  GBPUSD: "FX:GBPUSD",
  USDJPY: "FX:USDJPY",
  US30: "CAPITALCOM:US30",
  NAS100: "CAPITALCOM:US100",
  SPX500: "CAPITALCOM:US500",
  GER40: "CAPITALCOM:DE40",
  BTCUSD: "BITSTAMP:BTCUSD",
};

/**
 * Embeds TradingView's free Advanced Chart widget (Module M1). The TradingView logo/attribution stays,
 * as their terms require. It shows TradingView's chart only: it cannot show your trades,
 * and this app cannot read its data.
 */
export function TradingViewChart({ symbol, interval = "15", theme, timezone, height = 520 }: { symbol: string; interval?: string; theme: "light" | "dark"; timezone: string; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { t, lang } = useT();
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = "";
    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    widget.style.height = "100%";
    host.appendChild(widget);
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: TV_SYMBOLS[symbol] ?? symbol,
      interval,
      timezone: timezone === "Asia/Karachi" ? "Asia/Karachi" : "Etc/UTC",
      theme,
      style: "1",
      locale: lang === "en" ? "en" : "en",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });
    host.appendChild(script);
    return () => {
      host.innerHTML = "";
    };
  }, [symbol, interval, theme, timezone, lang]);
  return (
    <div>
      <div className="tradingview-widget-container overflow-hidden rounded-m border border-line" style={{ height }} ref={ref} />
      <p className="mt-1 mb-0 text-xs text-muted">
        <a href="https://www.tradingview.com/" rel="noopener nofollow noreferrer" target="_blank" className="underline">
          {t("tv_attribution")}
        </a>{" "}
        · {t("tv_limitation")}
      </p>
    </div>
  );
}

export { useResolvedTheme } from "@/components/shared/useSystemDark";
