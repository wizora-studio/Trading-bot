"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/components/shared/badges";
import { ConfirmDialog, Disclaimer, EmptyState, Notice, PageHeader } from "@/components/shared/blocks";
import { formatDateTime, formatMoney, formatPrice } from "@/components/shared/format";
import { d } from "@/services/analytics/decimal";
import { MoneyText } from "@/components/shared/numbers";
import { toast } from "@/components/shared/toast";
import { Button, Card, Field, Select, Section, Textarea } from "@/components/ui/primitives";
import { type DictKey, isKey, useT } from "@/i18n";
import { COMMON_TIMEZONES } from "@/services/analytics/time";
import { commitImport, rollbackImport } from "@/store/actions";
import { useApp } from "@/store/appStore";
import { useSelectedAccount } from "@/store/hooks";
import { Welcome } from "@/features/onboarding/Welcome";
import { generateDemoTrades, demoTradesAsMt5Csv } from "@/features/demo/generateDemo";
import { readCsv, toCsv } from "./csv";
import { htmlReportToRows, readFileText } from "./htmlTable";
import { autoMapping, type ColumnMapping, detectFormat, parseByFormat, parseMapped, REQUIRED_FIELDS, STANDARD_FIELDS, STANDARD_TEMPLATE_ROWS } from "./parsers";
import type { ParseResult } from "./types";

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_ROWS = 50000;

function download(name: string, text: string, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Import Center (Module B): upload → timezone → validation preview → import; history with rollback. */
export function ImportPage() {
  const { t, lang } = useT();
  const router = useRouter();
  const { account, accounts } = useSelectedAccount();
  const batches = useApp((s) => s.importBatches.filter((b) => b.accountId === account?.id));
  const displayTz = useApp((s) => s.settings.displayTimezone);
  const [rows, setRows] = useState<string[][] | null>(null);
  const [fileName, setFileName] = useState("");
  const [paste, setPaste] = useState("");
  const [tz, setTz] = useState<string>("Asia/Karachi");
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [headerRow, setHeaderRow] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [rollbackId, setRollbackId] = useState<string | null>(null);

  const format = useMemo(() => (rows ? detectFormat(rows) : null), [rows]);
  const result: ParseResult | null = useMemo(() => {
    if (!rows || !format) return null;
    if (format !== "UNKNOWN") return parseByFormat(format, rows, tz);
    if (!mapping) return null;
    return parseMapped(rows.slice(headerRow), mapping, tz);
  }, [rows, format, tz, mapping, headerRow]);

  if (!accounts.length) return <Welcome />;
  if (!account) return <EmptyState title={t("pick_one_account")} body={t("pick_one_account_body")} />;

  const load = (text: string, name: string) => {
    setError(null);
    let r: string[][];
    if (/<table/i.test(text)) r = htmlReportToRows(text);
    else r = readCsv(text);
    if (r.length > MAX_ROWS) {
      setError(t("err_too_many_rows", { n: MAX_ROWS }));
      return;
    }
    if (r.length < 2) {
      setError(t("err_empty_file"));
      return;
    }
    setRows(r);
    setFileName(name);
    const f = detectFormat(r);
    if (f === "UNKNOWN") {
      setHeaderRow(0);
      setMapping(autoMapping(r[0] ?? []));
    } else setMapping(null);
    if (f === "MT5_POSITIONS") setTz("Europe/Athens");
    else if (f.startsWith("TRADINGVIEW")) setTz(displayTz);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_BYTES) return setError(t("err_file_too_big", { mb: 10 }));
    if (!/\.(csv|txt|htm|html|tsv)$/i.test(file.name)) return setError(t("err_file_type"));
    load(await readFileText(file), file.name);
  };

  const doImport = () => {
    if (!result || !result.trades.length) return;
    const b = commitImport(account.id, result, fileName || "pasted.csv", tz);
    toast(t("import_done", { n: b.tradeIds.length, d: b.skippedDuplicates }));
    setRows(null);
    setPaste("");
    router.push("/trades/");
  };

  const headers = rows?.[headerRow] ?? [];

  return (
    <div>
      <PageHeader title={t("nav_import")} description={t("import_desc", { name: account.name })} />

      <Card className="mb-4">
        <ol className="m-0 grid gap-2 pl-5 text-sm">
          <li>{t("imp_tv_how")}</li>
          <li>{t("imp_mt5_how")}</li>
          <li>{t("imp_other_how")}</li>
        </ol>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" icon="download" onClick={() => download("standard-template.csv", toCsv(STANDARD_TEMPLATE_ROWS))}>
            {t("download_template")}
          </Button>
          <Button
            size="sm"
            icon="download"
            onClick={() =>
              download(
                "demo-trades-mt5.csv",
                demoTradesAsMt5Csv(generateDemoTrades({ accountId: "demo", seed: 99, startingBalance: "10000", riskPct: 0.5, tradingDays: 20, endDate: new Date(), strategies: [] })),
              )
            }
          >
            {t("download_demo_mt5")}
          </Button>
        </div>
      </Card>

      {!rows ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-m border-2 border-dashed border-line-strong p-6 text-center hover:border-blue">
            <span className="font-semibold">{t("choose_file")}</span>
            <span className="text-sm text-muted">{t("choose_file_hint")}</span>
            <input type="file" accept=".csv,.txt,.htm,.html,.tsv" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          <div className="flex flex-col gap-2">
            <Field label={t("or_paste")}>{({ id }) => <Textarea id={id} rows={6} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Time,Balance Before,Balance After,…" />}</Field>
            <div>
              <Button disabled={!paste.trim()} onClick={() => load(paste, "pasted.csv")}>
                {t("read_pasted")}
              </Button>
            </div>
          </div>
          {error && (
            <div className="md:col-span-2">
              <Notice tone="warn">{error}</Notice>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-semibold">{fileName}</div>
              <div className="text-sm text-muted">
                {t("detected_format")}: <strong>{t(`fmt_${format}` as DictKey)}</strong>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setRows(null)}>
              {t("choose_other_file")}
            </Button>
          </div>

          <Field label={t("declare_tz")} hint={t(format === "MT5_POSITIONS" ? "tz_hint_mt5" : "tz_hint_tv")} className="max-w-md">
            {({ id, describedBy }) => (
              <Select id={id} aria-describedby={describedBy} value={tz} onChange={(e) => setTz(e.target.value)}>
                {COMMON_TIMEZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          {format === "UNKNOWN" && mapping && (
            <div className="mt-4">
              <Notice>{t("mapper_intro")}</Notice>
              <Field label={t("header_row")} className="mt-3 max-w-40">
                {({ id }) => (
                  <Select
                    id={id}
                    value={headerRow}
                    onChange={(e) => {
                      const h = Number(e.target.value);
                      setHeaderRow(h);
                      setMapping(autoMapping(rows[h] ?? []));
                    }}
                  >
                    {rows.slice(0, 10).map((_, i) => (
                      <option key={i} value={i}>
                        {i + 1}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {STANDARD_FIELDS.map((f) => (
                  <Field key={f} label={`${t(`sf_${f}` as DictKey)}${REQUIRED_FIELDS.includes(f) ? " *" : ""}`}>
                    {({ id }) => (
                      <Select id={id} value={mapping[f]} onChange={(e) => setMapping({ ...mapping, [f]: Number(e.target.value) })}>
                        <option value={-1}>—</option>
                        {headers.map((h, i) => (
                          <option key={i} value={i}>
                            {h || `#${i + 1}`}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={result.quality.score >= 80 ? "ok" : result.quality.score >= 50 ? "warn" : "solid"}>{t("dq_score", { s: result.quality.score })}</Badge>
                <Badge tone="muted">{t("n_trades_found", { n: result.trades.length })}</Badge>
                {result.errors.length > 0 && <Badge tone="solid" icon="alert">{t("n_row_errors", { n: result.errors.length })}</Badge>}
              </div>
              {result.quality.issues.length > 0 && (
                <ul className="mt-3 mb-0 pl-5 text-sm">
                  {result.quality.issues.map((i) => (
                    <li key={i.code}>
                      {t(`dq_${i.code}` as DictKey)} ({i.count})
                    </li>
                  ))}
                </ul>
              )}
              {result.warnings.map((w) => {
                const [code, n] = w.split(":");
                const key = `warn_${code}`;
                return (
                  <p key={w} className="mt-2 mb-0 text-sm text-muted">
                    {isKey(key) ? t(key, { n: n ?? "" }) : w}
                  </p>
                );
              })}
              {result.errors.length > 0 && (
                <details className="mt-3">
                  <summary className="min-h-11 cursor-pointer text-sm font-medium">{t("show_row_errors")}</summary>
                  <ul className="mt-1 max-h-48 overflow-y-auto pl-5 text-sm">
                    {result.errors.slice(0, 200).map((e, i) => (
                      <li key={i}>
                        {t("row_n", { n: e.row })}: {isKey(`err_${e.code}`) ? t(`err_${e.code}` as DictKey) : e.code} <span className="text-muted">{e.detail}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              {result.trades.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-sm">
                    <thead className="text-left text-xs text-muted">
                      <tr>
                        {[t("c_close"), t("c_symbol"), t("c_side"), t("c_qty"), t("c_entry"), t("c_exit"), t("c_sl"), t("c_costs"), t("c_gross")].map((h) => (
                          <th key={h} className="border-b border-line py-2 pr-3 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.trades.slice(0, 15).map((x, i) => (
                        <tr key={i}>
                          <td className="border-b border-line py-2 pr-3 whitespace-nowrap">{formatDateTime(x.closeTime, displayTz, lang)}</td>
                          <td className="border-b border-line py-2 pr-3">{x.instrument}</td>
                          <td className="border-b border-line py-2 pr-3">{t(`side_${x.side}` as DictKey)}</td>
                          <td className="border-b border-line py-2 pr-3">{x.quantity}</td>
                          <td className="border-b border-line py-2 pr-3">{formatPrice(x.entryPrice)}</td>
                          <td className="border-b border-line py-2 pr-3">{formatPrice(x.exitPrice)}</td>
                          <td className="border-b border-line py-2 pr-3">{x.stopLoss ?? "–"}</td>
                          <td className="border-b border-line py-2 pr-3">{formatMoney(d(x.commission).plus(d(x.swap)).plus(d(x.fees)), account.baseCurrency, { sign: false })}</td>
                          <td className="border-b border-line py-2">
                            <MoneyText value={x.grossPnl} currency={account.baseCurrency} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {result.trades.length > 15 && <p className="mt-2 mb-0 text-xs text-muted">{t("preview_more", { n: result.trades.length - 15 })}</p>}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="primary" disabled={!result.trades.length} onClick={doImport}>
                  {t("import_n", { n: result.trades.length })}
                </Button>
                <Button onClick={() => setRows(null)}>{t("cancel")}</Button>
              </div>
              <p className="mt-2 mb-0 text-xs text-muted">{t("dup_note")}</p>
            </div>
          )}
        </Card>
      )}

      <Section title={t("import_history")}>
        {!batches.length ? (
          <p className="m-0 text-sm text-muted">{t("no_imports")}</p>
        ) : (
          <ul className="m-0 flex flex-col divide-y divide-line p-0">
            {[...batches].reverse().map((b) => (
              <li key={b.id} className="flex list-none flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <div className="font-medium">{b.fileName}</div>
                  <div className="text-xs text-muted">
                    {formatDateTime(b.importedAt, displayTz, lang)} · {t(`src_${b.source}` as DictKey)} · {t("n_trades_found", { n: b.tradeIds.length })} · {t("n_dups", { n: b.skippedDuplicates })} · {b.timezone}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={b.dataQuality.score >= 80 ? "ok" : "warn"}>{t("dq_score", { s: b.dataQuality.score })}</Badge>
                  {b.rolledBack ? (
                    <Badge tone="dashed">{t("rolled_back")}</Badge>
                  ) : (
                    <Button size="sm" icon="undo" onClick={() => setRollbackId(b.id)}>
                      {t("rollback")}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <ConfirmDialog
        open={!!rollbackId}
        onClose={() => setRollbackId(null)}
        onConfirm={() => {
          if (rollbackId) rollbackImport(rollbackId);
          toast(t("rolled_back"));
        }}
        title={t("rollback_title")}
        body={t("rollback_body")}
        confirmLabel={t("rollback")}
      />
      <Disclaimer />
    </div>
  );
}
