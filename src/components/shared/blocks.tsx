"use client";

import { type ReactNode, useId, useState } from "react";
import { Button, Dialog } from "@/components/ui/primitives";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useT } from "@/i18n";

/** Same header on every page: title, short description, optional actions. */
export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="m-0 text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 mb-0 max-w-[72ch] text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

/** Ruled KPI cell (as in the preview: rules, not cards). */
export function KpiStat({ label, value, meta, info }: { label: ReactNode; value: ReactNode; meta?: ReactNode; info?: ReactNode }) {
  return (
    <div className="border-b border-line py-3.5 pr-4">
      <div className="flex items-center gap-1 text-sm text-muted">
        {label}
        {info && <InfoTip>{info}</InfoTip>}
      </div>
      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xl font-semibold">{value}</div>
      {meta && <div className="mt-0.5 text-xs text-muted">{meta}</div>}
    </div>
  );
}

/** Small "i" button that shows a definition (English + Roman Urdu content passed in). */
export function InfoTip({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const { t } = useT();
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={t("what_is_this")}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        className="grid h-6 w-6 place-items-center rounded-full text-muted hover:text-fg max-md:h-8 max-md:w-8"
      >
        <Icon name="info" size={14} />
      </button>
      {open && (
        <span id={id} role="tooltip" className="absolute top-7 left-0 z-30 w-72 rounded-s border border-line bg-bg p-3 text-xs font-normal text-fg shadow-2">
          {children}
        </span>
      )}
    </span>
  );
}

export function EmptyState({ icon = "info", title, body, action }: { icon?: IconName; title: ReactNode; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-m border border-dashed border-line-strong px-6 py-10 text-center">
      <Icon name={icon} size={28} className="text-muted" />
      <h3 className="m-0 text-md font-semibold">{title}</h3>
      {body && <p className="m-0 max-w-[50ch] text-sm text-muted">{body}</p>}
      {action && <div className="mt-2 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, body, action }: { title: ReactNode; body?: ReactNode; action?: ReactNode }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-m border-2 border-fg p-4">
      <Icon name="alert" size={22} />
      <div>
        <h3 className="m-0 text-md font-semibold">{title}</h3>
        {body && <p className="mt-1 mb-0 text-sm">{body}</p>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}

export function Notice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warn" }) {
  return (
    <p className={`my-0 rounded-r-s border-l-[3px] px-3 py-2 text-sm ${tone === "warn" ? "border-fg bg-soft" : "border-blue bg-blue-soft"}`}>{children}</p>
  );
}

export function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  const { t } = useT();
  return (
    <div aria-busy="true" aria-label={t("loading")} className="flex flex-col gap-3">
      <div className="skeleton h-10 w-1/3 rounded-s bg-soft" />
      <div className="skeleton h-40 rounded-m bg-soft" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton h-6 rounded-s bg-soft" />
      ))}
    </div>
  );
}

/** Confirmation for destructive actions. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  body: ReactNode;
  confirmLabel?: ReactNode;
}) {
  const { t } = useT();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button onClick={onClose}>{t("cancel")}</Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel ?? t("confirm")}
          </Button>
        </>
      }
    >
      <p className="m-0">{body}</p>
    </Dialog>
  );
}

/**
 * Meter for a limit (used = hatched, because it is a loss) or a goal (progress = blue).
 * The numbers are always written next to the bar, so it is not color-only.
 */
export function RuleMeter({ ratio, kind, label }: { ratio: number; kind: "used" | "progress"; label: string }) {
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  return (
    <div role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={label} className="my-2 h-2.5 overflow-hidden rounded-full bg-soft">
      <div className={`h-full rounded-full ${kind === "used" ? "hatch" : "bg-blue"}`} style={{ width: `${pct.toFixed(1)}%` }} />
    </div>
  );
}

/** Chart wrapper: title, description, and a "Show as table" switch (data-table alternative). */
export function ChartFrame({ title, hint, children, table }: { title: ReactNode; hint?: ReactNode; children: ReactNode; table: ReactNode }) {
  const [asTable, setAsTable] = useState(false);
  const { t } = useT();
  return (
    <figure className="m-0">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
        <figcaption>
          <span className="block text-lg font-semibold">{title}</span>
          {hint && <span className="block text-sm text-muted">{hint}</span>}
        </figcaption>
        <Button size="sm" variant="ghost" onClick={() => setAsTable((v) => !v)} aria-pressed={asTable}>
          {asTable ? t("show_chart") : t("show_table")}
        </Button>
      </div>
      <div className="mt-2">{asTable ? <div className="overflow-x-auto">{table}</div> : children}</div>
    </figure>
  );
}

/** A simple accessible table used inside ChartFrame and elsewhere. */
export function SimpleTable({ head, rows, numericCols = [] }: { head: ReactNode[]; rows: ReactNode[][]; numericCols?: number[] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          {head.map((h, i) => (
            <th key={i} className={`border-b border-line py-2 pr-3 text-xs font-medium text-muted ${numericCols.includes(i) ? "text-right" : "text-left"}`}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j} className={`border-b border-line py-2 pr-3 ${numericCols.includes(j) ? "text-right" : ""}`}>
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Disclaimer() {
  const { t } = useT();
  return <footer className="mt-4 max-w-[75ch] border-t border-line pt-4 text-xs text-muted">{t("disclaimer")}</footer>;
}
