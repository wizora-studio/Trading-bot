"use client";

import { useCallback } from "react";
import { useApp } from "@/store/appStore";
import { en } from "./en";

export type DictKey = keyof typeof en;
export type Lang = "en";

/** Fills "{name}" placeholders. */
export function translate(_lang: Lang, key: DictKey, vars?: Record<string, string | number>): string {
  let s: string = en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

/** React hook: `const { t, lang } = useT(); t("nav_dashboard")`. */
export function useT() {
  const lang = useApp((s) => s.settings.language);
  const t = useCallback((key: DictKey, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang]);
  return { t, lang };
}

/** True when a string is a dictionary key (used for codes that come from the engine). */
export function isKey(k: string): k is DictKey {
  return k in en;
}
