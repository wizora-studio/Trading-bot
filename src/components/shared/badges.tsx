"use client";

import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useT, type DictKey } from "@/i18n";
import type { ConfidenceLevel } from "@/services/analytics/confidence";
import type { RuleState } from "@/services/analytics/funded";
import type { RuleFieldStatus } from "@/domain/types";

/**
 * Badge styles (Phase 9): solid = violation, outlined = warning / low sample, dashed = unverifiable,
 * blue outline = OK. Every badge has a text label and usually an icon.
 */
export type BadgeTone = "solid" | "warn" | "ok" | "muted" | "dashed" | "blue";

const TONES: Record<BadgeTone, string> = {
  solid: "bg-fg text-bg border-fg",
  warn: "border-fg text-fg border-dashed",
  ok: "border-blue text-blue",
  muted: "border-line-strong text-muted",
  dashed: "border-muted text-muted border-dashed",
  blue: "bg-blue text-on-blue border-blue",
};

export function Badge({ tone = "muted", icon, children, title }: { tone?: BadgeTone; icon?: IconName; children: ReactNode; title?: string }) {
  return (
    <span title={title} className={`inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium sm:whitespace-nowrap ${TONES[tone]}`}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

const CONF: Record<ConfidenceLevel, { key: DictKey; tone: BadgeTone }> = {
  INSUFFICIENT_DATA: { key: "conf_insufficient", tone: "solid" },
  LOW: { key: "conf_low", tone: "warn" },
  MODERATE: { key: "conf_moderate", tone: "muted" },
  HIGH: { key: "conf_high", tone: "ok" },
};

/** Confidence badge from the single Phase 5 framework. Shows the sample size too. */
export function ConfidenceBadge({ level, n }: { level: ConfidenceLevel; n?: number }) {
  const { t } = useT();
  const c = CONF[level];
  return (
    <Badge tone={c.tone} icon={level === "HIGH" ? "check" : level === "MODERATE" ? "info" : "alert"} title={t("conf_tip")}>
      {t(c.key)}
      {n !== undefined && <span className="opacity-80">· n={n}</span>}
    </Badge>
  );
}

const RULE: Record<RuleState, { key: DictKey; tone: BadgeTone; icon: IconName }> = {
  VERIFIED_COMPLIANT: { key: "st_compliant", tone: "ok", icon: "check" },
  CONFIRMED_VIOLATION: { key: "st_violation", tone: "solid", icon: "alert" },
  POTENTIAL_RISK_WARNING: { key: "st_warning", tone: "warn", icon: "alert" },
  UNVERIFIABLE_FROM_CSV: { key: "st_unverifiable", tone: "dashed", icon: "question" },
  RULE_UNCONFIRMED: { key: "st_unconfirmed", tone: "warn", icon: "lock" },
  NOT_YET_MET: { key: "st_not_yet", tone: "muted", icon: "info" },
};

export function RuleStateBadge({ state }: { state: RuleState }) {
  const { t } = useT();
  const r = RULE[state];
  return (
    <Badge tone={r.tone} icon={r.icon}>
      {t(r.key)}
    </Badge>
  );
}

const FIELD: Record<RuleFieldStatus, { key: DictKey; tone: BadgeTone; icon: IconName }> = {
  CLEAR: { key: "fs_clear", tone: "ok", icon: "check" },
  ASSUMED: { key: "fs_assumed", tone: "warn", icon: "info" },
  AMBIGUOUS: { key: "fs_ambiguous", tone: "warn", icon: "question" },
  MISSING: { key: "fs_missing", tone: "solid", icon: "alert" },
};

export function FieldStatusBadge({ status }: { status: RuleFieldStatus }) {
  const { t } = useT();
  const f = FIELD[status];
  return (
    <Badge tone={f.tone} icon={f.icon}>
      {t(f.key)}
    </Badge>
  );
}

export function SampleBadge() {
  const { t } = useT();
  return (
    <Badge tone="dashed" icon="info">
      {t("sample_badge")}
    </Badge>
  );
}
