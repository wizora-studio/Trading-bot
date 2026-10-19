"use client";

import { useState } from "react";
import { Badge, SampleBadge } from "@/components/shared/badges";
import { ConfirmDialog, Disclaimer, PageHeader } from "@/components/shared/blocks";
import { formatMoney } from "@/components/shared/format";
import { toast } from "@/components/shared/toast";
import { Button, Card, Dialog, Input } from "@/components/ui/primitives";
import { type DictKey, useT } from "@/i18n";
import { deleteAccount, removeSampleData, selectAccount, updateAccount } from "@/store/actions";
import { useApp } from "@/store/appStore";
import { AccountForm } from "./AccountForm";

/** Accounts Page: list with type badges (Normal / Funded / Backtest), create, rename, archive, delete. */
export function AccountsPage() {
  const { t } = useT();
  const accounts = useApp((s) => s.accounts);
  const trades = useApp((s) => s.trades);
  const selected = useApp((s) => s.selectedAccountId);
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [del, setDel] = useState<string | null>(null);
  return (
    <div>
      <PageHeader
        title={t("nav_accounts")}
        description={t("accounts_desc")}
        actions={
          <>
            {accounts.some((a) => a.isSample) && (
              <Button
                onClick={() => {
                  removeSampleData();
                  toast(t("sample_removed"));
                }}
              >
                {t("remove_sample")}
              </Button>
            )}
            <Button variant="primary" icon="plus" onClick={() => setCreating(true)}>
              {t("acc_new")}
            </Button>
          </>
        }
      />
      <div className="grid gap-3 md:grid-cols-2">
        {accounts.map((a) => (
          <Card key={a.id} className={a.id === selected ? "border-blue" : ""}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{a.name}</div>
                <div className="text-sm text-muted">
                  {a.platform} · {a.baseCurrency} · {t("acc_start_balance")}: {formatMoney(a.startingBalance, a.baseCurrency, { sign: false })}
                </div>
                <div className="text-sm text-muted">{t("n_trades_found", { n: trades.filter((x) => x.accountId === a.id).length })}</div>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge tone={a.type === "FUNDED" ? "blue" : "muted"}>{t(`acc_type_${a.type}` as DictKey)}</Badge>
                {a.isSample && <SampleBadge />}
                {a.archived && <Badge tone="dashed">{t("archived")}</Badge>}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant={a.id === selected ? "primary" : "secondary"} onClick={() => selectAccount(a.id)}>
                {a.id === selected ? t("selected") : t("select")}
              </Button>
              <Button size="sm" variant="ghost" icon="edit" onClick={() => setRenaming({ id: a.id, name: a.name })}>
                {t("rename")}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => updateAccount(a.id, { archived: !a.archived })}>
                {a.archived ? t("unarchive") : t("archive")}
              </Button>
              <Button size="sm" variant="ghost" icon="trash" onClick={() => setDel(a.id)}>
                {t("delete")}
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={creating} onClose={() => setCreating(false)} title={t("acc_new")} wide>
        <AccountForm
          onDone={() => {
            setCreating(false);
            toast(t("acc_created"));
          }}
        />
      </Dialog>
      <Dialog
        open={!!renaming}
        onClose={() => setRenaming(null)}
        title={t("rename")}
        footer={
          <Button
            variant="primary"
            onClick={() => {
              if (renaming && renaming.name.trim()) updateAccount(renaming.id, { name: renaming.name.trim() });
              setRenaming(null);
            }}
          >
            {t("save")}
          </Button>
        }
      >
        <Input aria-label={t("acc_name")} value={renaming?.name ?? ""} onChange={(e) => setRenaming((r) => (r ? { ...r, name: e.target.value } : r))} />
      </Dialog>
      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={() => {
          if (del) deleteAccount(del);
          toast(t("deleted"));
        }}
        title={t("delete_account_title")}
        body={t("delete_account_body")}
        confirmLabel={t("delete")}
      />
      <Disclaimer />
    </div>
  );
}
