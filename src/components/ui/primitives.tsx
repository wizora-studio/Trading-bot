"use client";

import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes, useEffect, useId, useRef } from "react";
import { useT } from "@/i18n";
import { Icon, type IconName } from "./Icon";

/**
 * Design-system primitives. They read ONLY design tokens (via Tailwind token classes).
 * Every interactive element is at least 44px tall on touch screens (Section 3D).
 */

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-blue text-on-blue border-blue hover:bg-blue-strong hover:border-blue-strong",
  secondary: "bg-bg text-fg border-line-strong hover:border-fg",
  ghost: "bg-transparent text-fg border-transparent hover:bg-soft",
  danger: "bg-fg text-bg border-fg hover:opacity-90",
};

export function Button({
  variant = "secondary",
  icon,
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; icon?: IconName; size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-s border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        size === "sm" ? "min-h-9 px-3 text-sm max-md:min-h-11" : "min-h-11 px-4"
      } ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}

const fieldBase =
  "w-full min-h-11 rounded-s border border-line-strong bg-bg px-3 text-md placeholder:text-muted focus:border-blue focus:outline-none aria-[invalid=true]:border-fg aria-[invalid=true]:border-2";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldBase} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldBase} py-2 ${props.className ?? ""}`} />;
}

export function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${fieldBase} pr-8 ${props.className ?? ""}`}>
      {children}
    </select>
  );
}

/** Label + control + hint + inline error, wired for screen readers. */
export function Field({
  label,
  hint,
  error,
  children,
  className = "",
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children({ id, describedBy: [hintId, errId].filter(Boolean).join(" ") || undefined, invalid: !!error })}
      {hint && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} className="flex items-center gap-1 text-xs font-medium" role="alert">
          <Icon name="alert" size={14} /> {error}
        </p>
      )}
    </div>
  );
}

export function Checkbox({ label, checked, onChange, hint, id: idProp }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void; hint?: ReactNode; id?: string }) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 py-2">
      <input id={id} type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--blue)]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

/** Segmented choice (radio group) with large touch targets. */
export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-s border border-line p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-9 rounded-s px-3 text-sm max-md:min-h-11 ${value === o.value ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Card({ children, className = "", as: As = "div" }: { children: ReactNode; className?: string; as?: "div" | "section" | "article" }) {
  return <As className={`rounded-m border border-line bg-bg p-4 ${className}`}>{children}</As>;
}

/** Section with a ruled top border, as in the dashboard preview. */
export function Section({ title, hint, children, actions, id }: { title: ReactNode; hint?: ReactNode; children: ReactNode; actions?: ReactNode; id?: string }) {
  const hid = useId();
  return (
    <section aria-labelledby={id ?? hid} className="border-t border-line py-6">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
        <h2 id={id ?? hid} className="m-0 text-lg font-semibold">
          {title}
        </h2>
        {actions}
      </div>
      {hint && <p className="mt-0 mb-4 max-w-[70ch] text-sm text-muted">{hint}</p>}
      {children}
    </section>
  );
}

export function Tabs<T extends string>({ value, onChange, tabs, label }: { value: T; onChange: (v: T) => void; tabs: { value: T; label: ReactNode }[]; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="mb-4 flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((tb) => (
        <button
          key={tb.value}
          role="tab"
          type="button"
          aria-selected={value === tb.value}
          onClick={() => onChange(tb.value)}
          className={`-mb-px min-h-11 whitespace-nowrap border-b-2 px-3 text-sm ${value === tb.value ? "border-blue font-semibold text-fg" : "border-transparent text-muted hover:text-fg"}`}
        >
          {tb.label}
        </button>
      ))}
    </div>
  );
}

/** Modal dialog using the native <dialog> element (focus trap and Escape for free). */
export function Dialog({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  const { t } = useT();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      className={`m-auto w-[calc(100%-32px)] rounded-m border border-line bg-bg p-0 text-fg shadow-2 backdrop:bg-[var(--overlay)] ${wide ? "max-w-3xl" : "max-w-lg"}`}
    >
      {open && (
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <h2 className="m-0 text-lg font-semibold">{title}</h2>
            <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-s hover:bg-soft" aria-label={t("close")}>
              <Icon name="close" />
            </button>
          </div>
          <div className="overflow-y-auto px-4 py-4">{children}</div>
          {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-4 py-3">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}

/** Side drawer (right on desktop, full screen on mobile). */
export function Drawer({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode }) {
  const { t } = useT();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      className="m-0 ml-auto h-full max-h-none w-full max-w-xl border-l border-line bg-bg p-0 text-fg shadow-2 backdrop:bg-[var(--overlay)]"
    >
      {open && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <h2 className="m-0 text-lg font-semibold">{title}</h2>
            <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-s hover:bg-soft" aria-label={t("close")}>
              <Icon name="close" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
          {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-4 py-3">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
