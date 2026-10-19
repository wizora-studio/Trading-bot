"use client";

import Link from "next/link";
import { useState } from "react";
import { Disclaimer, PageHeader } from "@/components/shared/blocks";
import { Card } from "@/components/ui/primitives";
import { useT } from "@/i18n";
import { HANDBOOK } from "./handbook.generated";

/** The Phase 1 handbook (docs/handbook) readable inside the app. HTML is generated at build time from our own files. */
export function HandbookPage() {
  const { t } = useT();
  const [slug, setSlug] = useState(HANDBOOK[0]?.slug ?? "");
  const current = HANDBOOK.find((m) => m.slug === slug) ?? HANDBOOK[0];
  return (
    <div>
      <PageHeader title={t("hb_title")} description={t("hb_desc")} actions={<Link href="/learn/" className="text-sm underline">{t("hb_back")}</Link>} />
      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <nav aria-label={t("hb_title")} className="flex flex-col gap-1">
          {HANDBOOK.map((m) => (
            <button
              key={m.slug}
              type="button"
              aria-current={m.slug === current?.slug ? "page" : undefined}
              onClick={() => {
                setSlug(m.slug);
                window.scrollTo({ top: 0 });
              }}
              className={`min-h-10 rounded-m border px-3 py-2 text-left text-sm max-md:min-h-11 ${m.slug === current?.slug ? "border-blue bg-blue-soft font-semibold" : "border-line"}`}
            >
              {m.n}. {m.title}
            </button>
          ))}
        </nav>
        {current && (
          <Card>
            <h2 className="mt-0">{current.title}</h2>
            <div className="handbook" dangerouslySetInnerHTML={{ __html: current.html }} />
          </Card>
        )}
      </div>
      <Disclaimer />
    </div>
  );
}
