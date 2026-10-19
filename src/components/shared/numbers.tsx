"use client";

import { Icon } from "@/components/ui/Icon";
import type { Dec } from "@/services/analytics/decimal";
import { formatMoney, formatPct, formatR, signOf } from "./format";

type Num = Dec | string | number | null | undefined;

/** Up/down arrow that matches the sign. Meaning never depends on color alone. */
export function SignArrow({ value, size = 14 }: { value: Num; size?: number }) {
  const s = signOf(value);
  if (s === 0) return null;
  return <Icon name={s > 0 ? "up" : "down"} size={size} />;
}

const tone = (v: Num) => (signOf(v) > 0 ? "text-blue" : "text-fg");

/** Profit/loss money: "+$12.00" in blue with an up arrow, "−$12.00" in black/white with a down arrow. */
export function MoneyText({ value, currency = "USD", arrow = true, plain = false, className = "" }: { value: Num; currency?: string; arrow?: boolean; plain?: boolean; className?: string }) {
  if (plain) return <span className={className}>{formatMoney(value, currency, { sign: false })}</span>;
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap ${tone(value)} ${className}`}>
      {arrow && <SignArrow value={value} />}
      {formatMoney(value, currency)}
    </span>
  );
}

export function RMultipleText({ value, arrow = true, className = "" }: { value: Num; arrow?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap ${tone(value)} ${className}`}>
      {arrow && <SignArrow value={value} />}
      {formatR(value)}
    </span>
  );
}

/** Share (0.42) → "42%". With `signed`, shows +/− with arrows like money. */
export function PercentText({ value, dp = 1, signed = false, className = "" }: { value: Num; dp?: number; signed?: boolean; className?: string }) {
  if (!signed) return <span className={className}>{formatPct(value, dp)}</span>;
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap ${tone(value)} ${className}`}>
      <SignArrow value={value} />
      {formatPct(value, dp, { sign: true })}
    </span>
  );
}
