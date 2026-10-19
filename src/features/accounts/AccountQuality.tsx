"use client";

import { useMemo } from "react";
import { Badge } from "@/components/shared/badges";
import type { Trade } from "@/domain/types";
import { type DictKey, useT } from "@/i18n";
import { type Availability, metricCoverage } from "@/services/analytics/dataQuality";
import { scoreAccountQuality } from "@/features/import/quality";

const TONE: Record<Availability, "ok" | "warn" | "solid"> = { OK: "ok", PARTIAL: "warn", UNAVAILABLE: "solid" };

/** Data quality score of everything stored in an account, plus which metric groups its fields can support. */
export function AccountQuality({ trades, currency }: { trades: Trade[]; currency: string }) {
  const { t } = useT();
  const { q, cov } = useMemo(() => ({ q: scoreAccountQuality(trades), cov: metricCoverage(trades, currency) }), [trades, currency]);
  if (!trades.length) return null;
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer">
        <Badge tone={q.score >= 80 ? "ok" : q.score >= 50 ? "warn" : "solid"}>{t("dq_score", { s: q.score })}</Badge>
      </summary>
      <ul className="mt-2 mb-0 flex list-none flex-col gap-1 p-0">
        {cov.map((c) => (
          <li key={c.key} className="flex flex-wrap items-center gap-2">
            <Badge tone={TONE[c.status]}>{t(`cov_status_${c.status}` as DictKey)}</Badge>
            <span>{t(`cov_${c.key}` as DictKey)}</span>
            <span className="text-xs text-muted">
              {c.covered}/{c.total}
            </span>
          </li>
        ))}
      </ul>
      {q.issues.length > 0 && (
        <ul className="mt-2 mb-0 pl-5 text-xs text-muted">
          {q.issues.map((i) => (
            <li key={i.code}>{t(`dq_${i.code}` as DictKey)} ({i.count})</li>
          ))}
        </ul>
      )}
    </details>
  );
}
