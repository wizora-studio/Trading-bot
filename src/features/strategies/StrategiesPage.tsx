"use client";

import { useMemo, useState } from "react";
import { Badge, ConfidenceBadge } from "@/components/shared/badges";
import { ConfirmDialog, Disclaimer, EmptyState, Notice, PageHeader, SimpleTable } from "@/components/shared/blocks";
import { formatNumber, formatPct } from "@/components/shared/format";
import { RMultipleText } from "@/components/shared/numbers";
import { toast } from "@/components/shared/toast";
import { Button, Dialog, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { type DictKey, useT } from "@/i18n";
import { computeMetrics } from "@/services/analytics/metrics";
import { addImportedStrategies, addManualStrategy, deleteStrategy, setStrategyActive, updateAccount } from "@/store/actions";
import { useShallow } from "zustand/react/shallow";
import { useApp } from "@/store/appStore";
import { useSelectedAccount } from "@/store/hooks";
import { parseStrategySpecs, type StrategySpec, type StrategyRule } from "./schema";
import { StrategyReadBack } from "./StrategyReadBack";
import { autoCheckable, checklistRules, objectivityShare, openAmbiguities, type StrategyRecord, undecidedRules } from "./types";

type StyleFilter = "" | StrategySpec["strategy"]["style"];

/** Strategies Page (Module E9): choose strategies, details panel, compare mode, Gemini spec import. */
export function StrategiesPage() {
  const { t } = useT();
  const { account } = useSelectedAccount();
  const strategies = useApp((s) => s.strategies);
  const trades = useApp((s) => s.trades);
  const be = useApp((s) => s.settings.breakevenTolerance);
  const profile = useApp((s) => s.settings.traderProfile);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [activate, setActivate] = useState<StrategyRecord | null>(null);
  const [del, setDel] = useState<StrategyRecord | null>(null);
  const [style, setStyle] = useState<StyleFilter>("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [fitProfile, setFitProfile] = useState(false);

  const stats = useMemo(() => {
    const m = new Map<string, ReturnType<typeof computeMetrics>>();
    for (const s of strategies) {
      const list = trades.filter((x) => x.strategyId === s.id && (!account || x.accountId === account.id));
      if (list.length) m.set(s.id, computeMetrics(list, { breakevenTolerance: be }));
    }
    return m;
  }, [strategies, trades, account, be]);

  const active = new Set(account?.activeStrategyIds ?? []);
  const list = strategies.filter((s) => {
    if (style && s.spec.strategy.style !== style) return false;
    if (onlyActive && !active.has(s.id)) return false;
    if (fitProfile && profile) {
      const wantStyle = profile.style === "SWING" ? ["SWING", "POSITION"] : [profile.style];
      if (!wantStyle.includes(s.spec.strategy.style)) return false;
      const markets = s.spec.strategy.instruments.join(" ").toLowerCase();
      const fits = profile.markets.some((mk) => markets.includes(mk.toLowerCase().split(" ")[0] ?? ""));
      if (profile.markets.length && !fits) return false;
    }
    return true;
  });
  const selected = strategies.find((s) => s.id === selectedId) ?? null;
  const toggleCompare = (id: string) => setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]));

  return (
    <div>
      <PageHeader
        title={t("nav_strategies")}
        description={t("str_desc")}
        actions={
          <>
            <Button variant="primary" icon="import" onClick={() => setImportOpen(true)}>
              {t("str_import")}
            </Button>
            <Button icon="plus" onClick={() => setManualOpen(true)}>
              {t("str_new")}
            </Button>
          </>
        }
      />
      <Notice>{t("str_guardrail")}</Notice>

      <div className="mt-4 mb-4 flex flex-wrap items-center gap-2">
        <Select aria-label={t("str_style")} value={style} onChange={(e) => setStyle(e.target.value as StyleFilter)} className="max-w-48">
          <option value="">{t("str_all_styles")}</option>
          {(["SCALPING", "INTRADAY", "SWING", "POSITION", "OTHER"] as const).map((x) => (
            <option key={x} value={x}>
              {t(`style_${x}` as DictKey)}
            </option>
          ))}
        </Select>
        {account && (
          <Button size="sm" variant={onlyActive ? "primary" : "secondary"} aria-pressed={onlyActive} onClick={() => setOnlyActive((v) => !v)}>
            {t("str_only_active")}
          </Button>
        )}
        {profile && (
          <Button size="sm" variant={fitProfile ? "primary" : "secondary"} aria-pressed={fitProfile} onClick={() => setFitProfile((v) => !v)}>
            {t("str_fit_profile")}
          </Button>
        )}
        {compare.length >= 2 && (
          <Button size="sm" variant="primary" onClick={() => setShowCompare(true)}>
            {t("str_compare_n", { n: compare.length })}
          </Button>
        )}
      </div>

      {!list.length ? (
        <EmptyState title={t("str_none")} body={t("str_none_body")} />
      ) : (
        <h2 className="mb-3 text-lg font-semibold">{t("str_choose")}</h2>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((s) => {
          const m = stats.get(s.id);
          const isActive = active.has(s.id);
          const isDefault = account?.defaultStrategyId === s.id;
          return (
            <article key={s.id} className={`flex flex-col gap-2 rounded-m border p-4 ${selectedId === s.id ? "border-blue ring-1 ring-blue" : "border-line"}`}>
              <div className="flex items-start justify-between gap-2">
                <button type="button" className="text-left font-semibold hover:underline" onClick={() => setSelectedId(s.id === selectedId ? null : s.id)} aria-expanded={selectedId === s.id}>
                  {s.seedKey && <span className="mr-1 text-xs text-muted">{s.seedKey}</span>}
                  {s.spec.strategy.name}
                </button>
                <Badge tone={s.status === "CONFIRMED" ? "ok" : s.status === "DRAFT" ? "dashed" : "warn"}>{t(`ss_${s.status}` as DictKey)}</Badge>
              </div>
              <div className="text-xs text-muted">
                {t(`style_${s.spec.strategy.style}` as DictKey)} · {s.spec.strategy.timeframes.setup.join(", ")} · {s.spec.strategy.instruments.slice(0, 4).join(", ")}
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <Badge tone="muted">{t("str_objective_pct", { p: formatPct(objectivityShare(s), 0) })}</Badge>
                <Badge tone="muted">{t("str_auto_n", { n: autoCheckable(s), total: s.spec.rules.length })}</Badge>
                {openAmbiguities(s).length > 0 && <Badge tone="warn">{t("str_questions_n", { n: openAmbiguities(s).length })}</Badge>}
              </div>
              <div className="text-sm">
                {m ? (
                  <span className="flex flex-wrap items-center gap-1.5">
                    n={m.n} · <RMultipleText value={m.avgR} /> · {formatPct(m.winRate, 0)}
                    <ConfidenceBadge level={m.rConfidence.level} />
                  </span>
                ) : (
                  <span className="text-muted">{t("no_data_yet")}</span>
                )}
              </div>
              <div className="mt-auto flex flex-wrap gap-2 pt-1">
                {account && (
                  <Button
                    size="sm"
                    variant={isActive ? "primary" : "secondary"}
                    aria-pressed={isActive}
                    onClick={() => {
                      if (isActive) setStrategyActive(account.id, s.id, false);
                      else setActivate(s);
                    }}
                  >
                    {isActive ? t("str_active") : t("str_activate")}
                  </Button>
                )}
                {account && isActive && (
                  <Button size="sm" variant="ghost" aria-pressed={isDefault} onClick={() => updateAccount(account.id, { defaultStrategyId: isDefault ? null : s.id })}>
                    {isDefault ? t("str_default") : t("str_make_default")}
                  </Button>
                )}
                <label className="flex min-h-9 items-center gap-1.5 text-sm max-md:min-h-11">
                  <input type="checkbox" className="h-4 w-4 accent-[var(--blue)]" checked={compare.includes(s.id)} onChange={() => toggleCompare(s.id)} />
                  {t("str_compare")}
                </label>
                {s.origin !== "SEED" && (
                  <Button size="sm" variant="ghost" icon="trash" aria-label={t("delete")} onClick={() => setDel(s)} />
                )}
              </div>
            </article>
          );
        })}
      </div>

      {selected && (
        <section className="mt-8 border-t border-line pt-6" aria-label={t("str_details")}>
          <h2 className="mt-0 mb-4 text-sm font-semibold tracking-wide text-muted uppercase">{t("str_details")}</h2>
          <StrategyReadBack key={selected.id + selected.version} s={selected} />
        </section>
      )}

      <ImportSpecDialog open={importOpen} onClose={() => setImportOpen(false)} onImported={(ids) => setSelectedId(ids[0] ?? null)} />
      <ManualStrategyDialog open={manualOpen} onClose={() => setManualOpen(false)} onCreated={(id) => setSelectedId(id)} />
      <CompareDialog open={showCompare} onClose={() => setShowCompare(false)} ids={compare} stats={stats} />
      {activate && account && (
        <Dialog
          open
          onClose={() => setActivate(null)}
          title={t("act_title", { name: activate.spec.strategy.name })}
          footer={
            <>
              <Button onClick={() => setActivate(null)}>{t("cancel")}</Button>
              <Button
                variant="primary"
                onClick={() => {
                  setStrategyActive(account.id, activate.id, true);
                  toast(t("str_activated"));
                  setActivate(null);
                }}
              >
                {t("act_confirm")}
              </Button>
            </>
          }
        >
          <p className="mt-0">{t("act_body", { n: checklistRules(activate).length, auto: autoCheckable(activate) })}</p>
          <ul className="pl-5 text-sm">
            {checklistRules(activate)
              .slice(0, 8)
              .map((r) => (
                <li key={r.id}>
                  {r.id}: {r.checklistQuestion || r.text} <span className="text-xs text-muted">({t(`meas_${r.measurability}` as DictKey)})</span>
                </li>
              ))}
          </ul>
          {activate.status !== "CONFIRMED" && <Notice tone="warn">{t("act_unconfirmed", { n: undecidedRules(activate).length, q: activate.spec.ambiguities.filter((a) => !activate.ambiguityAnswers[a.id]).length })}</Notice>}
        </Dialog>
      )}
      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={() => {
          if (del) deleteStrategy(del.id);
          if (del?.id === selectedId) setSelectedId(null);
          toast(t("deleted"));
        }}
        title={t("delete")}
        body={t("str_delete_body", { name: del?.spec.strategy.name ?? "" })}
        confirmLabel={t("delete")}
      />
      <Disclaimer />
    </div>
  );
}

function ImportSpecDialog({ open, onClose, onImported }: { open: boolean; onClose: () => void; onImported: (ids: string[]) => void }) {
  const { t } = useT();
  const [text, setText] = useState("");
  const res = useMemo(() => (text.trim() ? parseStrategySpecs(text) : null), [text]);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={t("str_import")}
      footer={
        <>
          <Button onClick={onClose}>{t("cancel")}</Button>
          <Button
            variant="primary"
            disabled={!res?.specs.length}
            onClick={() => {
              if (!res) return;
              const ids = addImportedStrategies(res.specs, text);
              toast(t("str_imported", { n: ids.length }));
              setText("");
              onImported(ids);
              onClose();
            }}
          >
            {t("str_import_n", { n: res?.specs.length ?? 0 })}
          </Button>
        </>
      }
    >
      <p className="mt-0 text-sm text-muted">{t("str_import_hint")}</p>
      <Textarea aria-label={t("str_import")} rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder={'```json\n{ "schemaVersion": "strategy-spec/1.0", … }\n```'} className="font-mono text-xs" />
      {res && (
        <div className="mt-3 flex flex-col gap-2 text-sm">
          {res.specs.map((s, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <Badge tone="ok" icon="check">
                {t("valid")}
              </Badge>
              <strong>{s.strategy.name}</strong> · {t("str_rules_n", { n: s.rules.length })} · {s.schemaVersion}
            </div>
          ))}
          {res.warnings.map((w) => (
            <Notice key={w} tone="warn">
              {w.includes("AUDIO_OR_TRANSCRIPT_ONLY") ? t("rb_transcript_only") : w}
            </Notice>
          ))}
          {res.errors.length > 0 && (
            <div role="alert" className="rounded-m border-2 border-fg p-3">
              <div className="mb-1 font-semibold">{t("str_import_errors")}</div>
              <ul className="m-0 pl-5 text-xs">
                {res.errors.map((e) => (
                  <li key={e}>{e === "NO_SPEC_FOUND" ? t("str_no_spec_found") : e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <p className="mt-3 mb-0 text-xs text-muted">{t("str_import_safety")}</p>
    </Dialog>
  );
}

function ManualStrategyDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const { t } = useT();
  const [name, setName] = useState("");
  const [style, setStyle] = useState<StrategySpec["strategy"]["style"]>("INTRADAY");
  const [instruments, setInstruments] = useState("EURUSD, XAUUSD");
  const [tf, setTf] = useState("15m");
  const [rules, setRules] = useState("");
  const [err, setErr] = useState("");
  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={t("str_new")}
      footer={
        <>
          <Button onClick={onClose}>{t("cancel")}</Button>
          <Button
            variant="primary"
            onClick={() => {
              const lines = rules
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean);
              if (!name.trim() || !lines.length) return setErr(t("str_manual_err"));
              const ruleObjs: StrategyRule[] = lines.map((l, i) => ({
                id: `R${i + 1}`,
                category: "OTHER",
                direction: "BOTH",
                setupName: "Setup A",
                text: l,
                parameters: {},
                timestamp: "",
                source: "STATED",
                objectivity: "PARTLY_SUBJECTIVE",
                measurableVersionSuggestion: null,
                measurability: "NO",
                requiredData: [],
                checklistQuestion: l.endsWith("?") ? l : `${l}?`,
              }));
              const spec: StrategySpec = {
                schemaVersion: "strategy-spec/1.1",
                generatedBy: "manual",
                source: { videos: [], documents: [{ title: "Written by the trader", author: "", date: new Date().toISOString().slice(0, 10), notes: "" }] },
                strategy: { name: name.trim(), aliases: [], summary: "", style, methodology: [], instruments: instruments.split(",").map((x) => x.trim()).filter(Boolean), timeframes: { bias: [], setup: [tf], entry: [tf] }, typicalHoldingTime: null, typicalTradesPerDay: null },
                terms: [],
                indicators: [],
                sessions: [],
                rules: ruleObjs,
                risk: { riskPerTradePercent: null, positionSizingMethod: null, maxTradesPerDay: null, dailyLossStop: null, maxConsecutiveLosses: null, minRiskReward: null, notes: "" },
                management: { takeProfitTargets: [], partialCloses: [], breakevenRule: null, trailingRule: null, timeExitRule: null },
                executionFlow: ruleObjs.map((r, i) => ({ step: i + 1, description: r.text, ruleIds: [r.id] })),
                examples: [],
                checklist: ruleObjs.map((r) => ({ ruleId: r.id, question: r.checklistQuestion })),
                mistakeTags: [],
                creatorClaims: [],
                ambiguities: [],
                analystNotes: [],
              };
              const id = addManualStrategy(spec);
              toast(t("saved"));
              setName("");
              setRules("");
              onCreated(id);
              onClose();
            }}
          >
            {t("save")}
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t("str_name")}>{({ id }) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} />}</Field>
        <Field label={t("str_style")}>
          {({ id }) => (
            <Select id={id} value={style} onChange={(e) => setStyle(e.target.value as typeof style)}>
              {(["SCALPING", "INTRADAY", "SWING", "POSITION", "OTHER"] as const).map((x) => (
                <option key={x} value={x}>
                  {t(`style_${x}` as DictKey)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={t("str_instruments")}>{({ id }) => <Input id={id} value={instruments} onChange={(e) => setInstruments(e.target.value)} />}</Field>
        <Field label={t("str_timeframe")}>{({ id }) => <Input id={id} value={tf} onChange={(e) => setTf(e.target.value)} />}</Field>
      </div>
      <Field label={t("str_rules_lines")} hint={t("str_rules_lines_hint")} error={err} className="mt-3">
        {({ id, invalid }) => <Textarea id={id} aria-invalid={invalid} rows={6} value={rules} onChange={(e) => setRules(e.target.value)} placeholder={t("str_rules_placeholder")} />}
      </Field>
    </Dialog>
  );
}

function CompareDialog({ open, onClose, ids, stats }: { open: boolean; onClose: () => void; ids: string[]; stats: Map<string, ReturnType<typeof computeMetrics>> }) {
  const { t } = useT();
  const strategies = useApp(useShallow((s) => s.strategies.filter((x) => ids.includes(x.id))));
  return (
    <Dialog open={open} onClose={onClose} wide title={t("str_compare_title")}>
      <div className="overflow-x-auto">
        <SimpleTable
          head={["", ...strategies.map((s) => s.spec.strategy.name)]}
          rows={[
            [t("str_style"), ...strategies.map((s) => t(`style_${s.spec.strategy.style}` as DictKey))],
            [t("str_timeframe"), ...strategies.map((s) => s.spec.strategy.timeframes.setup.join(", "))],
            [t("str_rules_n_label"), ...strategies.map((s) => String(s.spec.rules.length))],
            [t("rb_objectivity_ours"), ...strategies.map((s) => formatPct(objectivityShare(s), 0))],
            [t("rb_auto"), ...strategies.map((s) => String(autoCheckable(s)))],
            [t("trades_word"), ...strategies.map((s) => String(stats.get(s.id)?.n ?? 0))],
            [t("k_exp_r"), ...strategies.map((s) => <RMultipleText key={s.id} value={stats.get(s.id)?.avgR ?? null} />)],
            [t("k_winrate"), ...strategies.map((s) => formatPct(stats.get(s.id)?.winRate ?? null, 0))],
            [t("k_pf"), ...strategies.map((s) => formatNumber(stats.get(s.id)?.profitFactor ?? null))],
            [t("conf_label"), ...strategies.map((s) => (stats.get(s.id) ? <ConfidenceBadge key={s.id} level={stats.get(s.id)!.rConfidence.level} n={stats.get(s.id)!.rCount} /> : t("no_data_yet")))],
          ]}
        />
      </div>
      <p className="mt-3 mb-0 text-xs text-muted">{t("str_compare_note")}</p>
    </Dialog>
  );
}
