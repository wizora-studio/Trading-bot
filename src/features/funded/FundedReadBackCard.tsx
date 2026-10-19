"use client";

import { FieldStatusBadge } from "@/components/shared/badges";
import { Notice } from "@/components/shared/blocks";
import type { FundedRuleField, FundedRules, RuleFieldStatus } from "@/domain/types";
import { type DictKey, useT } from "@/i18n";
import { buildFundedReadBack } from "./readback";

/** "Here is what I understood" card (Module G5). */
export function FundedReadBackCard({
  rules,
  status,
  source,
  currency,
}: {
  rules: FundedRules;
  status: Partial<Record<FundedRuleField, RuleFieldStatus>>;
  source: Partial<Record<FundedRuleField, "USER" | "PRESET" | "DEFAULT">>;
  currency: string;
}) {
  const { t, lang } = useT();
  const rb = buildFundedReadBack(rules, status, source, lang, currency);
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-m bg-soft p-3">
        <div className="mb-1 text-sm font-semibold">{t("rb_understood")}</div>
        <p className="m-0">{rb.summary}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead className="text-left text-xs text-muted">
            <tr>
              <th className="border-b border-line py-2 pr-3 font-medium">{t("rule")}</th>
              <th className="border-b border-line py-2 pr-3 font-medium">{t("value")}</th>
              <th className="border-b border-line py-2 pr-3 font-medium">{t("source")}</th>
              <th className="border-b border-line py-2 pr-3 font-medium">{t("status")}</th>
              <th className="border-b border-line py-2 font-medium">{t("rb_how")}</th>
            </tr>
          </thead>
          <tbody>
            {rb.rows.map((r) => (
              <tr key={r.field} className="align-top">
                <td className="border-b border-line py-2 pr-3 font-medium">{r.label}</td>
                <td className="border-b border-line py-2 pr-3">{r.value}</td>
                <td className="border-b border-line py-2 pr-3 text-xs">{t(`rsrc_${r.source}` as DictKey)}</td>
                <td className="border-b border-line py-2 pr-3">
                  <FieldStatusBadge status={r.status} />
                </td>
                <td className="border-b border-line py-2 text-xs text-muted">{r.how}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rb.example && (
        <div>
          <div className="mb-1 text-sm font-semibold">{t("rb_example_title")}</div>
          <p className="m-0 text-sm">{rb.example}</p>
        </div>
      )}
      <div>
        <div className="mb-1 text-sm font-semibold">{t("rb_not_checked")}</div>
        <ul className="m-0 pl-5 text-sm">
          {rb.notChecked.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>
      {rb.rows.some((r) => r.status === "AMBIGUOUS" || r.status === "MISSING") && <Notice tone="warn">{t("rb_unconfirmed_warning")}</Notice>}
    </div>
  );
}
