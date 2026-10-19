"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge, SampleBadge } from "@/components/shared/badges";
import { ConfirmDialog, Disclaimer, EmptyState, PageHeader } from "@/components/shared/blocks";
import { FilterBar } from "@/components/shared/FilterBar";
import { formatDateTime, formatNumber, formatPrice } from "@/components/shared/format";
import { MoneyText, RMultipleText } from "@/components/shared/numbers";
import { toast } from "@/components/shared/toast";
import { Button, Select } from "@/components/ui/primitives";
import type { Trade } from "@/domain/types";
import { type DictKey, useT } from "@/i18n";
import { getSpec } from "@/services/analytics/instruments";
import { tradeNet, tradeR, tradeSession } from "@/services/analytics/trade";
import { bulkAddTag, bulkAssignStrategy, deleteTrades } from "@/store/actions";
import { useApp } from "@/store/appStore";
import { useAccountTrades, useSelectedAccount } from "@/store/hooks";
import { Welcome } from "@/features/onboarding/Welcome";
import { ManualTradeDialog } from "./ManualTradeDialog";
import { MISTAKE_TAGS, TradeDrawer } from "./TradeDrawer";

type SortKey = "close" | "instrument" | "net" | "r";
const PAGE = 50;

/** Trade Explorer (Module D): sortable, paginated, filterable; bulk tagging and strategy assignment. */
export function TradesPage() {
  const { t, lang } = useT();
  const { account, accounts, isCombined } = useSelectedAccount();
  const { trades } = useAccountTrades(true);
  const strategies = useApp((s) => s.strategies);
  const tz = useApp((s) => s.settings.displayTimezone);
  const params = useSearchParams();
  const [openId, setOpenId] = useState<string | null>(null);
  const [manual, setManual] = useState(() => params.get("new") === "1");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "close", dir: -1 });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const currency = account?.baseCurrency ?? accounts[0]?.baseCurrency ?? "USD";

  const sorted = useMemo(() => {
    const val = (x: Trade): number | string => {
      if (sort.key === "close") return x.closeTime;
      if (sort.key === "instrument") return x.instrument;
      if (sort.key === "net") return tradeNet(x).toNumber();
      return tradeR(x, currency)?.toNumber() ?? -Infinity;
    };
    return [...trades].sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir;
    });
  }, [trades, sort, currency]);

  if (!accounts.length) return <Welcome />;
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE));
  const view = sorted.slice(page * PAGE, page * PAGE + PAGE);
  const allOnPage = view.length > 0 && view.every((x) => selected.has(x.id));
  const toggleSort = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 }));
  const sortIcon = (key: SortKey) => (sort.key === key ? (sort.dir === 1 ? " ↑" : " ↓") : "");
  const activeIds = new Set(account?.activeStrategyIds ?? accounts.flatMap((a) => a.activeStrategyIds));
  const pickable = strategies.filter((s) => activeIds.has(s.id));

  return (
    <div>
      <PageHeader
        title={t("nav_trades")}
        description={t("trades_desc")}
        actions={
          account && !isCombined ? (
            <Button variant="primary" icon="plus" onClick={() => setManual(true)}>
              {t("add_manual_trade")}
            </Button>
          ) : undefined
        }
      />
      {account?.isSample && (
        <div className="mb-3">
          <SampleBadge />
        </div>
      )}
      <FilterBar />

      {selected.size > 0 && (
        <div className="sticky top-14 z-10 mb-3 flex flex-wrap items-center gap-2 rounded-m border border-blue bg-blue-soft p-2">
          <span className="text-sm font-medium">{t("n_selected", { n: selected.size })}</span>
          <Select
            aria-label={t("bulk_strategy")}
            className="max-w-56"
            value=""
            onChange={(e) => {
              if (!e.target.value) return;
              bulkAssignStrategy([...selected], e.target.value === "NONE" ? null : e.target.value);
              toast(t("saved"));
            }}
          >
            <option value="">{t("bulk_strategy")}</option>
            <option value="NONE">{t("no_strategy_unplanned")}</option>
            {pickable.map((s) => (
              <option key={s.id} value={s.id}>
                {s.spec.strategy.name}
              </option>
            ))}
          </Select>
          <Select
            aria-label={t("bulk_tag")}
            className="max-w-48"
            value=""
            onChange={(e) => {
              if (!e.target.value) return;
              bulkAddTag([...selected], e.target.value);
              toast(t("saved"));
            }}
          >
            <option value="">{t("bulk_tag")}</option>
            {MISTAKE_TAGS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </Select>
          <Button size="sm" variant="danger" icon="trash" onClick={() => setConfirmDelete(true)}>
            {t("delete")}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
            {t("clear_selection")}
          </Button>
        </div>
      )}

      {!trades.length ? (
        <EmptyState icon="trades" title={t("no_trades")} body={t("no_trades_body")} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-m border border-line">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead className="bg-soft text-left text-xs text-muted">
                <tr>
                  <th className="w-10 p-2">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[var(--blue)]"
                      aria-label={t("select_all")}
                      checked={allOnPage}
                      onChange={(e) => {
                        const next = new Set(selected);
                        view.forEach((x) => (e.target.checked ? next.add(x.id) : next.delete(x.id)));
                        setSelected(next);
                      }}
                    />
                  </th>
                  <Th onClick={() => toggleSort("close")} label={t("c_close") + sortIcon("close")} sort={sort.key === "close" ? sort.dir : 0} />
                  <Th onClick={() => toggleSort("instrument")} label={t("c_symbol") + sortIcon("instrument")} sort={sort.key === "instrument" ? sort.dir : 0} />
                  <th className="p-2 font-medium">{t("c_side")}</th>
                  <th className="p-2 text-right font-medium">{t("c_qty")}</th>
                  <th className="p-2 text-right font-medium">{t("c_entry")}</th>
                  <th className="p-2 text-right font-medium">{t("c_exit")}</th>
                  <th className="p-2 text-right font-medium">{t("c_sl")}</th>
                  <th className="p-2 font-medium">{t("c_session")}</th>
                  <th className="p-2 font-medium">{t("c_strategy")}</th>
                  <Th onClick={() => toggleSort("r")} label={t("c_r") + sortIcon("r")} right sort={sort.key === "r" ? sort.dir : 0} />
                  <Th onClick={() => toggleSort("net")} label={t("c_net") + sortIcon("net")} right sort={sort.key === "net" ? sort.dir : 0} />
                </tr>
              </thead>
              <tbody>
                {view.map((x) => {
                  const s = strategies.find((st) => st.id === x.strategyId);
                  const digits = getSpec(x.instrument)?.digits ?? 5;
                  return (
                    <tr key={x.id} className="cursor-pointer border-t border-line hover:bg-soft" onClick={() => setOpenId(x.id)}>
                      <td className="p-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-[var(--blue)]"
                          aria-label={t("select_trade")}
                          checked={selected.has(x.id)}
                          onChange={(e) => {
                            const next = new Set(selected);
                            if (e.target.checked) next.add(x.id);
                            else next.delete(x.id);
                            setSelected(next);
                          }}
                        />
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <button type="button" className="text-left underline-offset-2 hover:underline" onClick={() => setOpenId(x.id)}>
                          {formatDateTime(x.closeTime, tz, lang)}
                        </button>
                      </td>
                      <td className="p-2">
                        {x.instrument}
                        {x.notes.includes("[unknown-symbol]") && (
                          <span className="ml-1">
                            <Badge tone="warn">{t("dq_UNKNOWN_SYMBOL_short")}</Badge>
                          </span>
                        )}
                      </td>
                      <td className="p-2">{t(`side_${x.side}` as DictKey)}</td>
                      <td className="p-2 text-right">{formatNumber(x.quantity, x.quantityUnit === "LOTS" ? 2 : 0)}</td>
                      <td className="p-2 text-right">{formatPrice(x.entryPrice, digits)}</td>
                      <td className="p-2 text-right">{formatPrice(x.exitPrice, digits)}</td>
                      <td className="p-2 text-right">{x.stopLoss ? formatPrice(x.stopLoss, digits) : x.plannedRisk ? "–" : <Badge tone="warn">{t("needs_sl")}</Badge>}</td>
                      <td className="p-2 whitespace-nowrap">{t(`sess_${tradeSession(x)}` as DictKey)}</td>
                      <td className="max-w-48 truncate p-2">{s ? s.spec.strategy.name : <span className="text-muted">–</span>}</td>
                      <td className="p-2 text-right">
                        <RMultipleText value={tradeR(x, currency)} arrow={false} />
                      </td>
                      <td className="p-2 text-right">
                        <MoneyText value={tradeNet(x)} currency={currency} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
            <span>{t("showing_n", { a: page * PAGE + 1, b: Math.min((page + 1) * PAGE, sorted.length), n: sorted.length })}</span>
            <div className="flex gap-2">
              <Button size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                {t("prev")}
              </Button>
              <Button size="sm" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
                {t("next")}
              </Button>
            </div>
          </div>
        </>
      )}
      <TradeDrawer tradeId={openId} onClose={() => setOpenId(null)} />
      {account && manual && <ManualTradeDialog open={manual} onClose={() => setManual(false)} accountId={account.id} />}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteTrades([...selected]);
          setSelected(new Set());
          toast(t("deleted"));
        }}
        title={t("delete_trades_title")}
        body={t("delete_trades_body", { n: selected.size })}
        confirmLabel={t("delete")}
      />
      <Disclaimer />
    </div>
  );
}

function Th({ label, onClick, right, sort }: { label: string; onClick: () => void; right?: boolean; sort: 0 | 1 | -1 }) {
  return (
    <th className={`p-2 font-medium ${right ? "text-right" : ""}`} aria-sort={sort === 0 ? "none" : sort === 1 ? "ascending" : "descending"}>
      <button type="button" onClick={onClick} className="min-h-8 font-medium hover:text-fg">
        {label}
      </button>
    </th>
  );
}
