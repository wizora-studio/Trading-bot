"use client";

import { useState } from "react";
import { z } from "zod";
import { Button, Field, Input, Segmented, Select } from "@/components/ui/primitives";
import type { AccountType } from "@/domain/types";
import { useT } from "@/i18n";
import { createAccount } from "@/store/actions";

const PLATFORMS = ["TradingView Paper Trading", "MT5", "MT4", "cTrader", "Match-Trader", "TradeLocker", "DXtrade", "Other"];
const CURRENCIES = ["USD", "EUR", "GBP", "PKR", "AED", "SAR", "INR"];

const AccountInput = z.object({
  name: z.string().trim().min(1),
  startingBalance: z.string().regex(/^\d+(\.\d{1,2})?$/).refine((v) => Number(v) > 0),
});

/** Create-account form (Module G1/G2). Funded accounts continue to the rule intake. */
export function AccountForm({ initialType = "NORMAL", onDone }: { initialType?: AccountType; onDone: (id: string, type: AccountType) => void }) {
  const { t } = useT();
  const [type, setType] = useState<AccountType>(initialType);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState(PLATFORMS[0]!);
  const [currency, setCurrency] = useState("USD");
  const [balance, setBalance] = useState(initialType === "FUNDED" ? "10000" : "10000");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const r = AccountInput.safeParse({ name, startingBalance: balance.replace(/,/g, "") });
    if (!r.success) {
      const e: Record<string, string> = {};
      for (const i of r.error.issues) e[String(i.path[0])] = i.path[0] === "name" ? t("err_required") : t("err_positive_number");
      setErrors(e);
      return;
    }
    const id = createAccount({ name: r.data.name, type, platform, baseCurrency: currency, startingBalance: r.data.startingBalance });
    onDone(id, type);
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      noValidate
    >
      <div>
        <div className="mb-1 text-sm font-medium">{t("acc_type")}</div>
        <Segmented
          label={t("acc_type")}
          value={type}
          onChange={setType}
          options={[
            { value: "NORMAL", label: t("acc_type_NORMAL") },
            { value: "FUNDED", label: t("acc_type_FUNDED") },
            { value: "BACKTEST", label: t("acc_type_BACKTEST") },
          ]}
        />
        <p className="mt-1 mb-0 text-xs text-muted">{t(type === "FUNDED" ? "acc_type_FUNDED_hint" : type === "BACKTEST" ? "acc_type_BACKTEST_hint" : "acc_type_NORMAL_hint")}</p>
      </div>
      <Field label={t("acc_name")} error={errors.name} hint={t("acc_name_hint")}>
        {({ id, describedBy, invalid }) => <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={name} onChange={(e) => setName(e.target.value)} placeholder={type === "FUNDED" ? "FTMO 10K Phase 1" : "TradingView Paper"} />}
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t("acc_platform")}>
          {({ id }) => (
            <Select id={id} value={platform} onChange={(e) => setPlatform(e.target.value)}>
              {PLATFORMS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={t("acc_currency")}>
          {({ id }) => (
            <Select id={id} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={t("acc_start_balance")} error={errors.startingBalance}>
          {({ id, describedBy, invalid }) => <Input id={id} inputMode="decimal" aria-describedby={describedBy} aria-invalid={invalid} value={balance} onChange={(e) => setBalance(e.target.value)} />}
        </Field>
      </div>
      <div>
        <Button variant="primary" type="submit">
          {type === "FUNDED" ? t("acc_create_and_rules") : t("acc_create")}
        </Button>
      </div>
    </form>
  );
}
