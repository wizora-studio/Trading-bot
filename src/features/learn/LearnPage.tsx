"use client";

import Link from "next/link";
import { useState } from "react";
import { Disclaimer, PageHeader, SimpleTable } from "@/components/shared/blocks";
import { Input, Section } from "@/components/ui/primitives";
import { useT } from "@/i18n";
import { CAPITAL_TIERS, LESSONS } from "./content";
import { GLOSSARY } from "./glossary";

export function LearnPage() {
  const { t } = useT();
  const [q, setQ] = useState("");
  const terms = GLOSSARY.filter((g) => !q || `${g.term} ${g.en}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title={t("nav_learn")} description={t("learn_desc")} actions={<Link href="/learn/handbook/" className="text-sm font-semibold underline">{t("hb_open")}</Link>} />
      <Section title={t("lessons")}>
        <div className="flex flex-col gap-2">
          {LESSONS.map((l) => (
            <details key={l.id} className="rounded-m border border-line p-3">
              <summary className="min-h-8 cursor-pointer font-semibold">{l.title}</summary>
              <p className="mt-3 mb-0 whitespace-pre-line">{l.body}</p>
            </details>
          ))}
        </div>
      </Section>
      <Section title={t("glossary")}>
        <Input aria-label={t("search")} placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} className="mb-3 max-w-sm" />
        <dl className="m-0 grid gap-3 sm:grid-cols-2">
          {terms.map((g) => (
            <div key={g.term} className="border-b border-line pb-2">
              <dt className="font-semibold">{g.term}</dt>
              <dd className="m-0 text-sm">{g.en}</dd>
            </div>
          ))}
        </dl>
      </Section>
      <Section title={t("tiers_title")} hint={t("tiers_hint")}>
        <div className="overflow-x-auto">
          <SimpleTable head={[t("tier"), t("risk_pct"), t("trades_word"), t("nav_strategies"), t("rm_title")]} rows={CAPITAL_TIERS.map((c) => [c.tier, c.risk, c.trades, c.strategies, c.models])} />
        </div>
      </Section>
      <Disclaimer />
    </div>
  );
}
