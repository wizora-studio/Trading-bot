"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Disclaimer } from "@/components/shared/blocks";
import { toast } from "@/components/shared/toast";
import { Icon } from "@/components/ui/Icon";
import { Button, Card } from "@/components/ui/primitives";
import type { AccountType } from "@/domain/types";
import { AccountForm } from "@/features/accounts/AccountForm";
import { useT } from "@/i18n";
import { loadSampleData } from "@/store/actions";

/** First-run wizard (Module J): "Normal or Funded?" → create account or load sample data. */
export function Welcome() {
  const { t } = useT();
  const router = useRouter();
  const [type, setType] = useState<AccountType | null>(null);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mt-2 mb-2 text-2xl font-bold tracking-tight">{t("welcome_title")}</h1>
      <p className="mt-0 mb-6 text-muted">{t("welcome_body")}</p>

      <ol className="mb-6 grid gap-3 p-0 sm:grid-cols-3">
        {(["welcome_step1", "welcome_step2", "welcome_step3"] as const).map((k, i) => (
          <li key={k} className="flex list-none gap-3 rounded-m border border-line p-3 text-sm">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue text-sm font-semibold text-on-blue">{i + 1}</span>
            {t(k)}
          </li>
        ))}
      </ol>

      {!type ? (
        <>
          <h2 className="mb-3 text-lg font-semibold">{t("welcome_question")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <ChoiceCard icon="trades" title={t("acc_type_NORMAL")} body={t("welcome_normal_body")} onClick={() => setType("NORMAL")} />
            <ChoiceCard icon="funded" title={t("acc_type_FUNDED")} body={t("welcome_funded_body")} onClick={() => setType("FUNDED")} />
          </div>
          <Card className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-soft">
            <div>
              <div className="font-semibold">{t("welcome_sample_title")}</div>
              <div className="text-sm text-muted">{t("welcome_sample_body")}</div>
            </div>
            <Button
              variant="primary"
              icon="play"
              onClick={() => {
                loadSampleData();
                toast(t("sample_loaded"));
              }}
            >
              {t("load_sample")}
            </Button>
          </Card>
        </>
      ) : (
        <Card>
          <button type="button" className="mb-3 min-h-11 text-sm text-blue" onClick={() => setType(null)}>
            ← {t("back")}
          </button>
          <AccountForm
            initialType={type}
            onDone={(_id, ty) => {
              toast(t("acc_created"));
              router.push(ty === "FUNDED" ? "/funded/" : "/import/");
            }}
          />
        </Card>
      )}
      <Disclaimer />
    </div>
  );
}

function ChoiceCard({ icon, title, body, onClick }: { icon: "trades" | "funded"; title: string; body: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-28 flex-col items-start gap-1 rounded-m border border-line-strong p-4 text-left hover:border-blue focus-visible:border-blue">
      <Icon name={icon} size={22} className="text-blue" />
      <span className="text-md font-semibold">{title}</span>
      <span className="text-sm text-muted">{body}</span>
    </button>
  );
}
