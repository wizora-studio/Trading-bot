"use client";

import { useMemo, useState } from "react";
import { Disclaimer, EmptyState, PageHeader } from "@/components/shared/blocks";
import { formatDayKey } from "@/components/shared/format";
import { MoneyText } from "@/components/shared/numbers";
import { toast } from "@/components/shared/toast";
import { Button, Card, Field, Input, Section, Textarea } from "@/components/ui/primitives";
import type { JournalDay } from "@/domain/types";
import { useT } from "@/i18n";
import { sum } from "@/services/analytics/decimal";
import { dayKey } from "@/services/analytics/time";
import { tradeNet } from "@/services/analytics/trade";
import { saveJournal } from "@/store/actions";
import { useApp } from "@/store/appStore";
import { useSelectedAccount } from "@/store/hooks";
import { Welcome } from "@/features/onboarding/Welcome";
import { RecentTrades } from "@/features/dashboard/RecentTrades";

type Form = Pick<JournalDay, "plan" | "review" | "quickNote">;
const EMPTY: Form = { plan: { bias: "", setups: "", maxTrades: "", maxRiskPct: "" }, review: { wentWell: "", mistakes: "", lessons: "" }, quickNote: "" };

/** Daily Plan & Review (MVP): a short pre-session plan and an end-of-day review, linked to that day's trades. */
export function JournalPage() {
  const { t, lang } = useT();
  const { account, accounts } = useSelectedAccount();
  const tz = useApp((s) => s.settings.displayTimezone);
  const journal = useApp((s) => s.journal);
  const trades = useApp((s) => s.trades);
  const [date, setDate] = useState(() => dayKey(new Date(), tz));
  const entry = journal.find((j) => j.accountId === account?.id && j.date === date);
  const dayTrades = useMemo(() => trades.filter((x) => x.accountId === account?.id && dayKey(new Date(x.closeTime), tz) === date), [trades, account, tz, date]);
  const past = useMemo(() => journal.filter((j) => j.accountId === account?.id).sort((a, b) => b.date.localeCompare(a.date)), [journal, account]);

  if (!accounts.length) return <Welcome />;
  if (!account) return <EmptyState title={t("pick_one_account")} body={t("pick_one_account_body")} />;
  const planned = Number(entry?.plan.maxTrades ?? "");
  const over = !!entry?.plan.maxTrades && Number.isFinite(planned) && dayTrades.length > planned;

  return (
    <div>
      <PageHeader title={t("nav_journal")} description={t("journal_desc")} />
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Field label={t("c_date")}>{({ id }) => <Input id={id} type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-48" />}</Field>
        <Button variant="ghost" onClick={() => setDate(dayKey(new Date(), tz))}>
          {t("today")}
        </Button>
      </div>
      <JournalEditor key={`${account.id}-${date}-${entry?.id ?? "new"}`} accountId={account.id} date={date} entry={entry} />

      <Section title={t("day_trades", { d: formatDayKey(date, lang) })}>
        {dayTrades.length ? (
          <>
            <p className="mt-0 text-sm">
              {t("n_trades_found", { n: dayTrades.length })} · <MoneyText value={sum(dayTrades.map(tradeNet))} currency={account.baseCurrency} />
              {over && <strong className="ml-2">{t("over_plan", { n: dayTrades.length, m: planned })}</strong>}
            </p>
            <RecentTrades trades={dayTrades} currency={account.baseCurrency} />
          </>
        ) : (
          <p className="m-0 text-sm text-muted">{t("no_trades_day")}</p>
        )}
      </Section>

      {past.length > 0 && (
        <Section title={t("journal_history")}>
          <ul className="m-0 flex flex-col divide-y divide-line p-0">
            {past.map((j) => (
              <li key={j.id} className="list-none">
                <button type="button" className="flex min-h-11 w-full items-center justify-between gap-2 py-2 text-left hover:text-blue" onClick={() => setDate(j.date)}>
                  <span className="font-medium">{formatDayKey(j.date, lang)}</span>
                  <span className="truncate text-sm text-muted">{j.review.lessons || j.plan.bias || j.quickNote}</span>
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}
      <Disclaimer />
    </div>
  );
}

/** Plan + review form. Keyed by account/date/entry so it always starts from the saved values. */
function JournalEditor({ accountId, date, entry }: { accountId: string; date: string; entry: JournalDay | undefined }) {
  const { t } = useT();
  const [form, setForm] = useState<Form>(entry ? { plan: entry.plan, review: entry.review, quickNote: entry.quickNote } : EMPTY);
  const setPlan = (k: keyof Form["plan"], v: string) => setForm((f) => ({ ...f, plan: { ...f.plan, [k]: v } }));
  const setReview = (k: keyof Form["review"], v: string) => setForm((f) => ({ ...f, review: { ...f.review, [k]: v } }));
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mt-0 mb-3 text-lg font-semibold">{t("plan_title")}</h2>
          <div className="flex flex-col gap-3">
            <Field label={t("plan_bias")} hint={t("plan_bias_hint")}>{({ id }) => <Input id={id} value={form.plan.bias} onChange={(e) => setPlan("bias", e.target.value)} />}</Field>
            <Field label={t("plan_setups")}>{({ id }) => <Textarea id={id} rows={2} value={form.plan.setups} onChange={(e) => setPlan("setups", e.target.value)} />}</Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("plan_max_trades")}>{({ id }) => <Input id={id} inputMode="numeric" value={form.plan.maxTrades} onChange={(e) => setPlan("maxTrades", e.target.value)} />}</Field>
              <Field label={t("plan_max_risk")}>{({ id }) => <Input id={id} inputMode="decimal" value={form.plan.maxRiskPct} onChange={(e) => setPlan("maxRiskPct", e.target.value)} />}</Field>
            </div>
          </div>
        </Card>
        <Card>
          <h2 className="mt-0 mb-3 text-lg font-semibold">{t("review_title")}</h2>
          <div className="flex flex-col gap-3">
            <Field label={t("review_well")}>{({ id }) => <Textarea id={id} rows={2} value={form.review.wentWell} onChange={(e) => setReview("wentWell", e.target.value)} />}</Field>
            <Field label={t("review_mistakes")}>{({ id }) => <Textarea id={id} rows={2} value={form.review.mistakes} onChange={(e) => setReview("mistakes", e.target.value)} />}</Field>
            <Field label={t("review_lessons")}>{({ id }) => <Textarea id={id} rows={2} value={form.review.lessons} onChange={(e) => setReview("lessons", e.target.value)} />}</Field>
          </div>
        </Card>
      </div>
      <Field label={t("quick_note")} className="mt-4">{({ id }) => <Textarea id={id} rows={2} value={form.quickNote} onChange={(e) => setForm((f) => ({ ...f, quickNote: e.target.value }))} />}</Field>
      <div className="mt-3">
        <Button
          variant="primary"
          onClick={() => {
            saveJournal({ accountId, date, ...form });
            toast(t("saved"));
          }}
        >
          {t("save")}
        </Button>
      </div>

    </>
  );
}
