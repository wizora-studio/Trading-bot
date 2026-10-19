"use client";

/**
 * Development-only component gallery (Section 3D): every shared component in its main states,
 * shown side by side in the light and dark theme. Not translated on purpose (not a user page).
 */
import { useState } from "react";
import { CalendarHeatmap, DailyBarChart, DivergingBars, EquityChart } from "@/components/charts/charts";
import { Badge, ConfidenceBadge, FieldStatusBadge, RuleStateBadge, SampleBadge } from "@/components/shared/badges";
import { ConfirmDialog, EmptyState, ErrorState, KpiStat, LoadingSkeleton, Notice, RuleMeter } from "@/components/shared/blocks";
import { MoneyText, PercentText, RMultipleText } from "@/components/shared/numbers";
import { Button, Checkbox, Field, Input, Segmented, Select, Tabs } from "@/components/ui/primitives";
import { d } from "@/services/analytics/decimal";
import { balanceCurve, dailyPnl } from "@/services/analytics/equity";
import { mkTrade } from "@/services/analytics/testUtils";

const trades = [40, -25, 0.4, 60, -55, 30, -10, 80].map((g, i) =>
  mkTrade({ id: `g${i}`, grossPnl: String(g), closeTime: new Date(Date.UTC(2026, 9, 5 + i, 10)).toISOString() }),
);

function Panel({ scope }: { scope: "light" | "dark" }) {
  const [tab, setTab] = useState("a");
  const [seg, setSeg] = useState("x");
  const [check, setCheck] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const curve = balanceCurve(trades, "1000");
  const days = dailyPnl(trades, "UTC");
  return (
    <div data-theme-scope={scope} className="flex min-w-0 flex-col gap-6 rounded-m border border-line bg-bg p-4 text-fg">
      <h2 className="m-0 text-lg font-semibold">{scope} theme</h2>
      <section className="flex flex-wrap gap-2">
        <Button variant="primary">Primary</Button>
        <Button>Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger" icon="trash">Danger</Button>
        <Button disabled>Disabled</Button>
        <Button size="sm" icon="plus">Small</Button>
      </section>
      <section className="grid gap-3 sm:grid-cols-2">
        <Field label="Input">{({ id }) => <Input id={id} placeholder="1.08500" />}</Field>
        <Field label="Input with error" error="Please enter a number.">{({ id, invalid }) => <Input id={id} aria-invalid={invalid} defaultValue="abc" />}</Field>
        <Field label="Select" hint="Hint text">{({ id }) => <Select id={id}><option>EURUSD</option></Select>}</Field>
        <Checkbox label="Checkbox" hint="With hint" checked={check} onChange={setCheck} />
        <Segmented label="Segmented" value={seg} onChange={setSeg} options={[{ value: "x", label: "One" }, { value: "y", label: "Two" }]} />
      </section>
      <Tabs label="Tabs" value={tab} onChange={setTab} tabs={[{ value: "a", label: "Tab A" }, { value: "b", label: "Tab B" }]} />
      <section className="flex flex-wrap gap-2">
        {(["INSUFFICIENT_DATA", "LOW", "MODERATE", "HIGH"] as const).map((l) => <ConfidenceBadge key={l} level={l} n={12} />)}
        {(["VERIFIED_COMPLIANT", "CONFIRMED_VIOLATION", "POTENTIAL_RISK_WARNING", "UNVERIFIABLE_FROM_CSV", "RULE_UNCONFIRMED", "NOT_YET_MET"] as const).map((s) => <RuleStateBadge key={s} state={s} />)}
        {(["CLEAR", "ASSUMED", "AMBIGUOUS", "MISSING"] as const).map((s) => <FieldStatusBadge key={s} status={s} />)}
        <SampleBadge />
        <Badge tone="blue">Blue</Badge>
      </section>
      <section className="flex flex-wrap gap-4 text-lg">
        <MoneyText value="1234.5" /> <MoneyText value="-87.25" /> <MoneyText value="0" />
        <RMultipleText value="1.75" /> <RMultipleText value="-1" /> <PercentText value={d("0.123")} signed />
      </section>
      <div className="grid grid-cols-2">
        <KpiStat label="KPI" value={<MoneyText value="320" />} meta="from 40 trades" info="Definition text" />
        <KpiStat label="KPI empty" value="–" meta="No data yet" />
      </div>
      <div>
        <RuleMeter ratio={0.72} kind="used" label="Used" />
        <RuleMeter ratio={0.4} kind="progress" label="Progress" />
      </div>
      <Notice>Info notice</Notice>
      <Notice tone="warn">Warning notice</Notice>
      <EmptyState title="Empty state" body="What to do next." action={<Button variant="primary">Action</Button>} />
      <ErrorState title="Error state" body="What went wrong and how to fix it." />
      <LoadingSkeleton rows={2} />
      <EquityChart points={curve} currency="USD" label="Balance" ddLabel="Drawdown" />
      <DailyBarChart days={days} currency="USD" label="Daily" lang="en" />
      <CalendarHeatmap days={days} currency="USD" lang="en" weekdayLabels={["Mon", "Tue", "Wed", "Thu", "Fri"]} />
      <DivergingBars unit="R" rows={[{ label: "London", value: 0.4, n: 20 }, { label: "New York", value: -0.3, n: 8 }, { label: "Asian", value: null, n: 0 }]} />
      <div>
        <Button onClick={() => setConfirm(true)}>Open confirm dialog</Button>
        <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={() => undefined} title="Delete?" body="This cannot be undone." />
      </div>
    </div>
  );
}

export function ComponentGallery() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Component gallery (development only)</h1>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel scope="light" />
        <Panel scope="dark" />
      </div>
    </div>
  );
}
