"use client";

import { Badge } from "@/components/shared/badges";
import { Checkbox } from "@/components/ui/primitives";
import { type DictKey, useT } from "@/i18n";
import { adherencePct } from "@/services/analytics/adherence";
import type { Trade } from "@/domain/types";
import { checklistRules, type StrategyRecord } from "@/features/strategies/types";

/**
 * Per-trade strategy checklist (Module E5). Each rule shows how the app can check it:
 * auto (from trade data), needs market data, or checklist only.
 */
export function ChecklistPanel({ strategy, checklist, onChange }: { strategy: StrategyRecord; checklist: Trade["checklist"]; onChange: (c: Trade["checklist"]) => void }) {
  const { t } = useT();
  const rules = checklistRules(strategy);
  const pct = adherencePct({ checklist } as Trade, rules.map((r) => r.id));
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold">{t("checklist_title")}</div>
        <Badge tone={pct === 1 ? "ok" : pct === null ? "muted" : "warn"}>{t("adherence_pct", { p: pct === null ? "–" : Math.round(pct * 100) })}</Badge>
      </div>
      <ul className="m-0 flex flex-col divide-y divide-line p-0">
        {rules.map((r) => {
          const v = checklist[r.id];
          return (
            <li key={r.id} className="list-none py-1">
              <div className="flex items-start justify-between gap-2">
                <Checkbox
                  label={
                    <span>
                      <span className="mr-1 text-xs text-muted">{r.id}</span>
                      {r.checklistQuestion || r.text}
                    </span>
                  }
                  checked={v === true}
                  onChange={(c) => onChange({ ...checklist, [r.id]: c })}
                  hint={<span>{t(`meas_${r.measurability}` as DictKey)}</span>}
                />
                <button
                  type="button"
                  className={`mt-2 min-h-9 shrink-0 rounded-s border px-2 text-xs ${v === false ? "border-fg bg-fg text-bg" : "border-line text-muted"}`}
                  aria-pressed={v === false}
                  onClick={() => {
                    const next = { ...checklist };
                    if (v === false) delete next[r.id];
                    else next[r.id] = false;
                    onChange(next);
                  }}
                >
                  {t("broke_rule")}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
