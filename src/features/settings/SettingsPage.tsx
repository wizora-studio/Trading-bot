"use client";

import { useState } from "react";
import { z } from "zod";
import { Badge } from "@/components/shared/badges";
import { ConfirmDialog, Disclaimer, Notice, PageHeader } from "@/components/shared/blocks";
import { toast } from "@/components/shared/toast";
import { Button, Checkbox, Field, Input, Section, Segmented, Select } from "@/components/ui/primitives";
import type { TraderProfile } from "@/domain/types";
import { useT } from "@/i18n";
import { isDecimalText } from "@/services/analytics/decimal";
import { COMMON_TIMEZONES } from "@/services/analytics/time";
import { tradeNet } from "@/services/analytics/trade";
import { type AppData, exportData, useApp } from "@/store/appStore";
import { toCsv } from "@/features/import/csv";

const MARKETS = ["Forex majors", "Gold / commodities", "US indices", "Crypto", "Stocks"];

/** Backup files are untrusted input: validate the shape before replacing anything. */
const BackupSchema = z
  .object({
    schemaVersion: z.literal(1),
    accounts: z.array(z.object({ id: z.string(), name: z.string(), type: z.enum(["NORMAL", "FUNDED", "BACKTEST"]), startingBalance: z.string() }).passthrough()),
    trades: z.array(z.object({ id: z.string(), accountId: z.string(), closeTime: z.string(), grossPnl: z.string() }).passthrough()),
    settings: z.object({}).passthrough(),
  })
  .passthrough();

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function SettingsPage() {
  const { t } = useT();
  const state = useApp();
  const { settings, update } = state;
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [pendingRestore, setPendingRestore] = useState<AppData | null>(null);
  const [profile, setProfile] = useState<TraderProfile>(
    settings.traderProfile ?? { capital: "", accountKind: "PROP", riskAppetite: "STANDARD", markets: ["Forex majors", "Gold / commodities"], style: "INTRADAY", execution: "MANUAL", confirmedAt: null },
  );
  const set = (patch: Partial<typeof settings>) => update((d) => ({ settings: { ...d.settings, ...patch } }));

  const restore = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) return toast(t("err_file_too_big", { mb: 50 }), "error");
    try {
      const json: unknown = JSON.parse(await file.text());
      const r = BackupSchema.safeParse(json);
      if (!r.success) return toast(t("backup_invalid"), "error");
      setPendingRestore(r.data as unknown as AppData);
    } catch {
      toast(t("backup_invalid"), "error");
    }
  };

  return (
    <div>
      <PageHeader title={t("nav_settings")} description={t("settings_desc")} />

      <Section title={t("set_general")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-sm font-medium">{t("set_theme")}</div>
            <Segmented
              label={t("set_theme")}
              value={settings.theme}
              onChange={(v) => set({ theme: v })}
              options={[
                { value: "system", label: t("theme_system") },
                { value: "light", label: t("theme_light") },
                { value: "dark", label: t("theme_dark") },
              ]}
            />
          </div>
          <Field label={t("set_tz")} hint={t("set_tz_hint")}>
            {({ id, describedBy }) => (
              <Select id={id} aria-describedby={describedBy} value={settings.displayTimezone} onChange={(e) => set({ displayTimezone: e.target.value })}>
                {COMMON_TIMEZONES.map((z) => (
                  <option key={z}>{z}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t("set_be")} hint={t("set_be_hint")} error={!isDecimalText(settings.breakevenTolerance) ? t("err_number") : undefined}>
            {({ id, describedBy, invalid }) => <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} inputMode="decimal" value={settings.breakevenTolerance} onChange={(e) => set({ breakevenTolerance: e.target.value })} />}
          </Field>
        </div>
      </Section>

      <Section title={t("profile_title")} hint={t("profile_hint")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("profile_capital")}>{({ id }) => <Input id={id} value={profile.capital} onChange={(e) => setProfile({ ...profile, capital: e.target.value })} placeholder="$10,000" />}</Field>
          <div>
            <div className="mb-1 text-sm font-medium">{t("profile_kind")}</div>
            <Segmented label={t("profile_kind")} value={profile.accountKind} onChange={(v) => setProfile({ ...profile, accountKind: v })} options={[{ value: "PERSONAL", label: t("profile_personal") }, { value: "PROP", label: t("profile_prop") }]} />
          </div>
          <div>
            <div className="mb-1 text-sm font-medium">{t("profile_risk")}</div>
            <Segmented
              label={t("profile_risk")}
              value={profile.riskAppetite}
              onChange={(v) => setProfile({ ...profile, riskAppetite: v })}
              options={[
                { value: "CONSERVATIVE", label: t("risk_CONSERVATIVE") },
                { value: "STANDARD", label: t("risk_STANDARD") },
                { value: "AGGRESSIVE", label: t("risk_AGGRESSIVE") },
              ]}
            />
          </div>
          <div>
            <div className="mb-1 text-sm font-medium">{t("profile_style")}</div>
            <Segmented
              label={t("profile_style")}
              value={profile.style}
              onChange={(v) => setProfile({ ...profile, style: v })}
              options={[
                { value: "SCALPING", label: t("pstyle_SCALPING") },
                { value: "INTRADAY", label: t("pstyle_INTRADAY") },
                { value: "SWING", label: t("pstyle_SWING") },
              ]}
            />
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="mb-1 text-sm font-medium">{t("profile_markets")}</legend>
            <div className="flex flex-wrap gap-x-4">
              {MARKETS.map((m) => (
                <Checkbox key={m} label={m} checked={profile.markets.includes(m)} onChange={(c) => setProfile({ ...profile, markets: c ? [...profile.markets, m] : profile.markets.filter((x) => x !== m) })} />
              ))}
            </div>
          </fieldset>
          <div>
            <div className="mb-1 text-sm font-medium">{t("profile_exec")}</div>
            <Segmented label={t("profile_exec")} value={profile.execution} onChange={(v) => setProfile({ ...profile, execution: v })} options={[{ value: "MANUAL", label: t("exec_MANUAL") }, { value: "AUTOMATED", label: t("exec_AUTOMATED") }]} />
          </div>
        </div>
        <div className="mt-4 rounded-m bg-soft p-3 text-sm">
          {t("profile_readback", {
            kind: t(profile.accountKind === "PROP" ? "profile_prop" : "profile_personal"),
            capital: profile.capital || "–",
            risk: t(`risk_${profile.riskAppetite}`),
            markets: profile.markets.join(", ") || "–",
            style: t(`pstyle_${profile.style}`),
            exec: t(`exec_${profile.execution}`),
          })}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => {
              set({ traderProfile: { ...profile, confirmedAt: new Date().toISOString() } });
              toast(t("saved"));
            }}
          >
            {t("profile_confirm")}
          </Button>
          {settings.traderProfile?.confirmedAt && <Badge tone="ok">{t("confirmed")}</Badge>}
        </div>
      </Section>

      <Section title={t("set_data")} hint={t("set_data_hint")}>
        <Notice>{t("privacy_local")}</Notice>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button icon="download" onClick={() => download(`trading-analyst-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(exportData(state), null, 1), "application/json")}>
            {t("export_backup")}
          </Button>
          <Button
            icon="download"
            onClick={() =>
              download(
                "trades.csv",
                toCsv([
                  ["account", "symbol", "instrument", "side", "quantity", "unit", "open_time_utc", "close_time_utc", "entry", "exit", "stop_loss", "take_profit", "gross_pnl", "commission", "swap", "fees", "net_pnl", "strategy", "tags", "notes"],
                  ...state.trades.map((x) => [
                    state.accounts.find((a) => a.id === x.accountId)?.name ?? "",
                    x.symbol,
                    x.instrument,
                    x.side,
                    x.quantity,
                    x.quantityUnit,
                    x.openTime,
                    x.closeTime,
                    x.entryPrice,
                    x.exitPrice,
                    x.stopLoss,
                    x.takeProfit,
                    x.grossPnl,
                    x.commission,
                    x.swap,
                    x.fees,
                    tradeNet(x).toFixed(),
                    state.strategies.find((s) => s.id === x.strategyId)?.spec.strategy.name ?? "",
                    x.mistakeTags.join("; "),
                    x.notes,
                  ]),
                ]),
                "text/csv",
              )
            }
          >
            {t("export_trades_csv")}
          </Button>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-s border border-line-strong px-4 font-medium hover:border-fg">
            {t("restore_backup")}
            <input type="file" accept=".json,application/json" className="sr-only" onChange={(e) => restore(e.target.files?.[0])} />
          </label>
          <Button variant="danger" icon="trash" onClick={() => setConfirmWipe(true)}>
            {t("delete_all")}
          </Button>
        </div>
      </Section>
      <ConfirmDialog
        open={confirmWipe}
        onClose={() => setConfirmWipe(false)}
        onConfirm={() => {
          state.resetAll();
          toast(t("deleted"));
        }}
        title={t("delete_all")}
        body={t("delete_all_body")}
        confirmLabel={t("delete_all")}
      />
      <ConfirmDialog
        open={!!pendingRestore}
        onClose={() => setPendingRestore(null)}
        onConfirm={() => {
          if (pendingRestore) state.replaceAll(pendingRestore);
          toast(t("backup_restored"));
        }}
        title={t("restore_backup")}
        body={t("restore_body", { a: pendingRestore?.accounts.length ?? 0, t: pendingRestore?.trades.length ?? 0 })}
        confirmLabel={t("restore_backup")}
      />
      <Disclaimer />
    </div>
  );
}
