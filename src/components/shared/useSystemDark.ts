"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-color-scheme: dark)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** True when the device prefers a dark theme. Safe during static rendering (false on the server). */
export function useSystemDark(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}

/** The light/dark theme actually in use, for widgets that need one (e.g., TradingView). */
export function useResolvedTheme(theme: "system" | "light" | "dark"): "light" | "dark" {
  const dark = useSystemDark();
  return theme === "system" ? (dark ? "dark" : "light") : theme;
}
