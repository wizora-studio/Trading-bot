"use client";

import { useMemo, useState } from "react";
import { Badge, ConfidenceBadge } from "@/components/shared/badges";
import { Notice, SimpleTable } from "@/components/shared/blocks";
import { formatPct } from "@/components/shared/format";
import { RMultipleText } from "@/components/shared/numbers";
import { toast } from "@/components/shared/toast";
import { Button, Input, Select } from "@/components/ui/primitives";
import { MIN_SEGMENT_SIZE } from "@/config/thresholds";
import { type DictKey, useT } from "@/i18n";
import { adherenceSplit } from "@/services/analytics/adherence";
import { computeMetrics } from "@/services/analytics/metrics";
import { confirmStrategy, editStrategy } from "@/store/actions";
import { useApp } from "@/store/appStore";
import type { StrategyRule } from "./schema";
import { convertSessionTime } from "./sessionTime";
import { autoCheckable, checklistRules, objectivityShare, openAmbiguities, type RuleDecision, type StrategyRecord, undecidedRules } from "./types";

const CATEGORY_ORDER: StrategyRule["category"][] = ["CONTEXT", "SETUP", "ENTRY", "STOP_LOSS", "TAKE_PROFIT", "MANAGEMENT", "RISK", "TIME", "NEWS", "INVALIDATION", "OTHER"];

/**
 * Strategy Read-Back (Module E3 / E9c). Everything shown is generated from the saved spec,
 * never from AI memory. INFERRED and NOT_STATED rules stay UNCONFIRMED until the trader decides.
 */
export function StrategyReadBack({ s }: { s: StrategyRecord }) {
  const { t, lang } = useT();
  const tz = useApp((st) => st.settings.displayTimezone);
  const trades = useApp((st) => st.trades.filter((x) => x.strategyId === s.id));
  const be = useApp((st) => st.settings.breakevenTolerance);
  const [answers, setAnswers] = useState<Record<string, string>>(s.ambiguityAnswers);
  const spec = s.spec;
  const undecided = undecidedRules(s);
  const open = openAmbiguities({ ...s, ambiguityAnswers: answers });
  const objShare = objectivityShare(s);
  const auto = autoCheckable(s);
  const ruleIds = checklistRules(s).map((r) => r.id);
  const perf = useMemo(() => ({ all: computeMetrics(trades, { breakevenTolerance: be }), split: adherenceSplit(trades, ruleIds, { breakevenTolerance: be }) }), [trades, ruleIds, be]);

  const decide = (ruleId: string, d: RuleDecision | "") => {
    const next = { ...s.ruleDecisions };
    if (d) next[ruleId] = d;
    else delete next[ruleId];
    editStrategy(s.id, { ruleDecisions: next }, `Rule ${ruleId}: ${d || "undecided"}`);
  };

  const yes = spec.rules.filter((r) => r.measurability === "YES").length;
  const partial = spec.rules.filter((r) => r.measurability === "PARTIAL").length;
  const no = spec.rules.length - yes - partial;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="m-0 text-xl font-bold">{spec.strategy.name}</h2>
          <Badge tone={s.status === "CONFIRMED" ? "ok" : "warn"}>{t(`ss_${s.status}` as DictKey)}</Badge>
          <Badge tone="muted">v{s.version}</Badge>
        </div>
        <p className="mt-2 mb-0">{spec.strategy.summary}</p>
        <div className="mt-3 rounded-m bg-soft p-3 text-sm">
          <div className="mb-1 font-semibold">{t("rb_summary_title")}</div>
          {t("rb_summary", {
            style: t(`style_${spec.strategy.style}` as DictKey),
            markets: spec.strategy.instruments.join(", ") || "–",
            tf: spec.strategy.timeframes.setup.join(", ") || "–",
            n: spec.rules.length,
            yes,
            partial,
            no,
          })}
        </div>
        {lang === "en" ? null : <p className="mt-2 mb-0 text-xs text-muted">{t("rb_content_language_note")}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Fact label={t("rb_objectivity_ours")} value={formatPct(objShare, 0)} hint={t("rb_objectivity_ours_hint")} />
        <Fact label={t("rb_objectivity_source")} value={("documents" in spec.source ? spec.source.documents[0]?.notes : undefined)?.match(/rating \(unverified\): ([^.]+)/)?.[1] ?? "–"} hint={t("unverified")} />
        <Fact label={t("rb_auto")} value={`${auto} / ${spec.rules.length}`} hint={t("rb_auto_hint")} />
        <Fact label={t("rb_source")} value={spec.source.videos.length ? t("rb_src_video", { n: spec.source.videos.length }) : t("rb_src_document")} />
      </div>

      {spec.source.videos.some((v) => v.accessMode === "AUDIO_OR_TRANSCRIPT_ONLY") && <Notice tone="warn">{t("rb_transcript_only")}</Notice>}

      <section>
        <h3 className="mt-0 mb-2 text-lg font-semibold">{t("rb_flow")}</h3>
        <ol className="m-0 flex flex-col gap-1.5 pl-5 text-sm">
          {spec.executionFlow.map((f) => (
            <li key={f.step}>
              {f.description} {f.ruleIds.length > 0 && <span className="text-xs text-muted">({f.ruleIds.join(", ")})</span>}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="mt-0 mb-2 text-lg font-semibold">{t("rb_rules")}</h3>
        <p className="mt-0 mb-3 text-sm text-muted">{t("rb_rules_hint")}</p>
        {CATEGORY_ORDER.filter((c) => spec.rules.some((r) => r.category === c)).map((cat) => (
          <div key={cat} className="mb-4">
            <div className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">{t(`cat_${cat}` as DictKey)}</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <tbody>
                  {spec.rules
                    .filter((r) => r.category === cat)
                    .map((r) => {
                      const needsDecision = r.source === "INFERRED" || r.source === "NOT_STATED";
                      return (
                        <tr key={r.id} className="border-b border-line align-top">
                          <td className="w-12 py-2 pr-2 text-xs text-muted">{r.id}</td>
                          <td className="py-2 pr-3">
                            {r.text}
                            {r.measurableVersionSuggestion && <div className="mt-1 text-xs text-muted">{t("rb_suggestion")}: {r.measurableVersionSuggestion}</div>}
                            {r.timestamp && spec.source.videos[0]?.url && (
                              <a className="ml-1 text-xs text-blue underline" href={timestampUrl(spec.source.videos[0].url, r.timestamp)} target="_blank" rel="noopener noreferrer">
                                {r.timestamp}
                              </a>
                            )}
                          </td>
                          <td className="w-28 py-2 pr-2">
                            <Badge tone={r.source === "STATED" ? "ok" : r.source === "SHOWN_ONLY" ? "muted" : "warn"}>{t(`src_rule_${r.source}` as DictKey)}</Badge>
                          </td>
                          <td className="w-28 py-2 pr-2 text-xs">{t(`obj_${r.objectivity}` as DictKey)}</td>
                          <td className="w-32 py-2 pr-2 text-xs">{t(`meas_${r.measurability}` as DictKey)}</td>
                          <td className="w-36 py-2">
                            <Select
                              aria-label={t("rb_decision")}
                              value={s.ruleDecisions[r.id] ?? ""}
                              onChange={(e) => decide(r.id, e.target.value as RuleDecision | "")}
                              className={needsDecision && !s.ruleDecisions[r.id] ? "border-2 border-fg" : ""}
                            >
                              <option value="">{needsDecision ? t("rb_undecided") : t("rb_keep")}</option>
                              <option value="CONFIRMED">{t("rd_CONFIRMED")}</option>
                              <option value="CHECKLIST_ONLY">{t("rd_CHECKLIST_ONLY")}</option>
                              <option value="REJECTED">{t("rd_REJECTED")}</option>
                            </Select>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>

      {spec.sessions.length > 0 && (
        <section>
          <h3 className="mt-0 mb-2 text-lg font-semibold">{t("rb_sessions")}</h3>
          <SimpleTable
            head={[t("rb_session"), t("rb_as_stated"), t("rb_in_your_tz", { tz })]}
            rows={spec.sessions.map((x) => {
              const a = convertSessionTime(x.startTime, x.timezoneAsStated, tz);
              const b = convertSessionTime(x.endTime, x.timezoneAsStated, tz);
              return [x.name, `${x.startTime ?? "?"}–${x.endTime ?? "?"} ${x.timezoneAsStated ?? ""}`, a && b ? `${a}–${b}` : t("rb_tz_unclear")];
            })}
          />
          <p className="mt-2 mb-0 text-xs text-muted">{t("rb_dst_note")}</p>
        </section>
      )}

      {spec.indicators.length > 0 && (
        <section>
          <h3 className="mt-0 mb-2 text-lg font-semibold">{t("rb_indicators")}</h3>
          <ul className="m-0 flex flex-wrap gap-2 p-0">
            {spec.indicators.map((i) => (
              <li key={i.name} className="list-none rounded-full border border-line px-3 py-1 text-sm">
                {i.name}
                {Object.keys(i.settings).length > 0 && <span className="text-muted"> · {JSON.stringify(i.settings)}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {spec.terms.length > 0 && (
        <section>
          <h3 className="mt-0 mb-2 text-lg font-semibold">{t("rb_terms")}</h3>
          <dl className="m-0 grid gap-2">
            {spec.terms.map((x) => (
              <div key={x.term}>
                <dt className="font-medium">{x.term}</dt>
                <dd className="m-0 text-sm text-muted">{x.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {spec.examples.length > 0 && (
        <section>
          <h3 className="mt-0 mb-2 text-lg font-semibold">{t("rb_examples")}</h3>
          <SimpleTable
            head={[t("rb_time"), t("c_symbol"), t("c_side"), t("rb_result"), t("rb_context")]}
            rows={spec.examples.map((e) => [e.timestamp, e.instrument ?? "–", e.direction ?? "–", e.result ?? "–", e.context])}
          />
          {spec.examples.every((e) => (e.result ?? "").toLowerCase().includes("win")) && <p className="mt-2 mb-0 text-xs">{t("rb_selection_bias")}</p>}
        </section>
      )}

      {spec.creatorClaims.length > 0 && (
        <section>
          <h3 className="mt-0 mb-2 text-lg font-semibold">{t("rb_claims")}</h3>
          <ul className="m-0 flex flex-col gap-1 p-0">
            {spec.creatorClaims.map((c) => (
              <li key={c.claim} className="flex list-none flex-wrap items-center gap-2 text-sm">
                <Badge tone="dashed">{t("unverified")}</Badge> {c.claim}
              </li>
            ))}
          </ul>
          <p className="mt-2 mb-0 text-xs text-muted">{t("rb_claims_note")}</p>
        </section>
      )}

      {spec.mistakeTags.length > 0 && (
        <section>
          <h3 className="mt-0 mb-2 text-lg font-semibold">{t("mistake_tags")}</h3>
          <ul className="m-0 grid gap-1 p-0 text-sm">
            {spec.mistakeTags.map((m) => (
              <li key={m.tag} className="list-none">
                <strong>{m.tag}</strong> — <span className="text-muted">{m.meaning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="mt-0 mb-2 text-lg font-semibold">{t("rb_questions")}</h3>
        {spec.ambiguities.length === 0 ? (
          <p className="m-0 text-sm text-muted">{t("rb_no_questions")}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {spec.ambiguities.map((a) => (
              <div key={a.id} className="rounded-m border border-line p-3">
                <div className="text-sm font-medium">{a.issue}</div>
                <div className="mt-1 text-sm">{a.questionForTrader}</div>
                {a.suggestedDefault && (
                  <div className="mt-1 text-xs text-muted">
                    {t("rb_suggested_default")}: {a.suggestedDefault}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <Input aria-label={t("rb_your_answer")} placeholder={t("rb_your_answer")} value={answers[a.id] ?? ""} onChange={(e) => setAnswers({ ...answers, [a.id]: e.target.value })} className="max-w-md" />
                  {a.suggestedDefault && (
                    <Button size="sm" onClick={() => setAnswers({ ...answers, [a.id]: a.suggestedDefault ?? "" })}>
                      {t("rb_use_default")}
                    </Button>
                  )}
                  <Button size="sm" onClick={() => setAnswers({ ...answers, [a.id]: t("rb_checklist_only_answer") })}>
                    {t("rd_CHECKLIST_ONLY")}
                  </Button>
                </div>
              </div>
            ))}
            <div>
              <Button
                onClick={() => {
                  editStrategy(s.id, { ambiguityAnswers: answers }, "Answered open questions");
                  toast(t("saved"));
                }}
              >
                {t("rb_save_answers")}
              </Button>
            </div>
          </div>
        )}
      </section>

      <section>
        <h3 className="mt-0 mb-2 text-lg font-semibold">{t("rb_your_results")}</h3>
        {!trades.length ? (
          <p className="m-0 text-sm text-muted">{t("no_data_yet")}</p>
        ) : (
          <>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
              {t("n_trades_found", { n: trades.length })} · {t("k_winrate")} {formatPct(perf.all.winRate, 0)} · {t("k_exp_r")} <RMultipleText value={perf.all.avgR} />
              <ConfidenceBadge level={perf.all.rConfidence.level} n={perf.all.rCount} />
            </div>
            <SimpleTable
              head={[t("c_segment"), t("trades_word"), t("k_winrate"), t("k_exp_r")]}
              numericCols={[1, 2, 3]}
              rows={[
                [t("adh_followed"), perf.split.followed.trades.length, formatPct(perf.split.followed.metrics.winRate, 0), <RMultipleText key="f" value={perf.split.followed.metrics.avgR} />],
                [t("adh_broke"), perf.split.broke.trades.length, formatPct(perf.split.broke.metrics.winRate, 0), <RMultipleText key="b" value={perf.split.broke.metrics.avgR} />],
                [t("unanswered"), perf.split.unanswered, "–", "–"],
              ]}
            />
            <h4 className="mt-4 mb-1 text-md font-semibold">{t("rb_per_rule")}</h4>
            <p className="mt-0 mb-2 text-xs text-muted">{t("rb_per_rule_hint", { tested: perf.split.perRule.length, min: MIN_SEGMENT_SIZE })}</p>
            <SimpleTable
              head={[t("rule"), t("rb_when_yes"), t("rb_when_no")]}
              rows={perf.split.perRule.map((p) => [
                p.ruleId,
                p.yes.n >= MIN_SEGMENT_SIZE ? <span key="y">{formatAvg(p.yes.avgR)} · n={p.yes.n}</span> : <Badge key="y" tone="warn">{t("low_sample")} · n={p.yes.n}</Badge>,
                p.no.n >= MIN_SEGMENT_SIZE ? <span key="n">{formatAvg(p.no.avgR)} · n={p.no.n}</span> : <Badge key="n" tone="warn">{t("low_sample")} · n={p.no.n}</Badge>,
              ])}
            />
          </>
        )}
      </section>

      <section className="rounded-m border-2 border-blue p-4">
        <h3 className="mt-0 mb-2 text-lg font-semibold">{t("rb_confirm_title")}</h3>
        <ul className="mt-0 mb-3 pl-5 text-sm">
          <li>{t("rb_confirm_1", { n: ruleIds.length })}</li>
          <li>{t("rb_confirm_2", { n: auto })}</li>
          <li>{t("rb_confirm_3")}</li>
        </ul>
        {undecided.length > 0 && <Notice tone="warn">{t("rb_need_decisions", { ids: undecided.map((r) => r.id).join(", ") })}</Notice>}
        {open.length > 0 && <div className="mt-2"><Notice tone="warn">{t("rb_need_answers", { n: open.length })}</Notice></div>}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="primary"
            icon="check"
            disabled={undecided.length > 0 || open.length > 0 || s.status === "CONFIRMED"}
            onClick={() => {
              if (JSON.stringify(answers) !== JSON.stringify(s.ambiguityAnswers)) editStrategy(s.id, { ambiguityAnswers: answers }, "Answered open questions");
              confirmStrategy(s.id);
              toast(t("strategy_confirmed"));
            }}
          >
            {s.status === "CONFIRMED" ? t("ss_CONFIRMED") : t("rb_confirm_btn")}
          </Button>
        </div>
      </section>

      <details>
        <summary className="min-h-11 cursor-pointer text-sm font-medium">{t("version_history")}</summary>
        <ul className="mt-1 pl-5 text-xs text-muted">
          {[...s.history].reverse().map((h) => (
            <li key={h.version + h.at}>
              v{h.version} · {h.at.slice(0, 16).replace("T", " ")} · {t(`ss_${h.status}` as DictKey)} · {h.note}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

function formatAvg(x: Parameters<typeof RMultipleText>[0]["value"]) {
  return <RMultipleText value={x} arrow={false} />;
}

function Fact({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-m border border-line p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
      {hint && <div className="text-xs text-muted">{hint}</div>}
    </div>
  );
}

/** Builds a YouTube link that opens at the rule's timestamp (mm:ss or hh:mm:ss). */
export function timestampUrl(url: string, ts: string): string {
  const parts = ts.split(":").map(Number);
  if (parts.some((p) => Number.isNaN(p))) return url;
  const secs = parts.reduce((a, p) => a * 60 + p, 0);
  try {
    const u = new URL(url);
    if (!/^(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)$/.test(u.hostname)) return url;
    u.searchParams.set("t", `${secs}s`);
    return u.toString();
  } catch {
    return url;
  }
}
