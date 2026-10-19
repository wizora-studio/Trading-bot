"use client";

import { type ReactNode, useId } from "react";
import { formatDayKey, formatMoney, formatR, MINUS } from "@/components/shared/format";
import type { DayBucket, EquityPoint } from "@/services/analytics/equity";
import type { Lang } from "@/i18n";

/**
 * Hand-built SVG charts (no chart library). Rules from Phase 9:
 * equity curve blue; drawdown area gray hatched; profit bars solid blue; loss bars gray hatched.
 * Every chart is wrapped in ChartFrame, which offers a data-table alternative.
 */

function HatchDefs({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" stroke="var(--loss)" strokeWidth="2" />
      </pattern>
    </defs>
  );
}

export function EquityChart({ points, currency, label, ddLabel }: { points: EquityPoint[]; currency: string; label: string; ddLabel: string }) {
  const hatch = useId().replace(/:/g, "");
  const W = 640;
  const top = 10;
  const eqH = 160;
  const gap = 22;
  const uwH = 50;
  const H = top + eqH + gap + uwH + 8;
  const vals = points.map((p) => p.balance.toNumber());
  const dds = points.map((p) => p.drawdown.toNumber());
  const N = Math.max(points.length - 1, 1);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const pad = (max - min) * 0.12 || Math.max(1, Math.abs(max) * 0.01);
  const y = (v: number) => top + (1 - (v - (min - pad)) / (max + pad - (min - pad))) * eqH;
  const x = (i: number) => 8 + (i / N) * (W - 120);
  const pts = vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const len = vals.reduce((a, v, i) => (i ? a + Math.hypot(x(i) - x(i - 1), y(v) - y(vals[i - 1]!)) : 0), 0);
  const uwTop = top + eqH + gap;
  const maxU = Math.max(...dds, 1e-9);
  const uy = (v: number) => uwTop + (v / maxU) * uwH;
  const uwPath = `M${x(0)},${uwTop} ` + dds.map((v, i) => `L${x(i).toFixed(1)},${uy(v).toFixed(1)}`).join(" ") + ` L${x(N)},${uwTop} Z`;
  const last = vals[vals.length - 1] ?? 0;
  const ex = x(N);
  const ey = y(last);
  const startY = y(vals[0] ?? 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="block h-auto w-full">
      <HatchDefs id={hatch} />
      <line x1="8" x2={W - 112} y1={startY} y2={startY} stroke="var(--line-strong)" strokeDasharray="3 4" />
      <text x="8" y={startY - 5} fill="var(--muted)" fontSize="11">
        {formatMoney(vals[0] ?? 0, currency, { sign: false })}
      </text>
      <polyline className="draw-line" style={{ ["--len" as string]: len.toFixed(0) }} points={pts} fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={ex} cy={ey} r="4.5" fill="var(--blue)" />
      <text x={ex + 10} y={ey + 4} fontSize="14" fontWeight="600" fill="var(--fg)">
        {formatMoney(last, currency, { sign: false })}
      </text>
      <text x="8" y={uwTop - 6} fill="var(--muted)" fontSize="11">
        {ddLabel}
      </text>
      <line x1="8" x2={W - 112} y1={uwTop} y2={uwTop} stroke="var(--line)" />
      <path d={uwPath} fill={`url(#${hatch})`} stroke="var(--loss)" strokeWidth="1" />
      {maxU > 1e-6 && (
        <text x={ex + 10} y={uy(maxU)} fill="var(--muted)" fontSize="11">
          {MINUS}
          {formatMoney(maxU, currency, { sign: false })}
        </text>
      )}
    </svg>
  );
}

export function DailyBarChart({ days, currency, label, lang }: { days: DayBucket[]; currency: string; label: string; lang: Lang }) {
  const hatch = useId().replace(/:/g, "");
  const W = 640;
  const H = 180;
  const mid = 85;
  const h = 70;
  const maxAbs = Math.max(...days.map((d) => Math.abs(d.net.toNumber())), 1e-9);
  const bw = (W - 20) / Math.max(days.length, 1);
  const every = Math.max(1, Math.ceil(days.length / 6));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="block h-auto w-full">
      <HatchDefs id={hatch} />
      <line x1="10" x2={W - 10} y1={mid} y2={mid} stroke="var(--line-strong)" />
      {days.map((d, i) => {
        const v = d.net.toNumber();
        const bh = Math.max((Math.abs(v) / maxAbs) * h, 1);
        const xx = 10 + i * bw + bw * 0.18;
        const w = Math.max(bw * 0.64, 1);
        return v >= 0 ? (
          <rect key={d.day} x={xx} y={mid - bh} width={w} height={bh} rx="2" fill="var(--blue)">
            <title>{`${formatDayKey(d.day, lang)} ${formatMoney(v, currency)}`}</title>
          </rect>
        ) : (
          <rect key={d.day} x={xx} y={mid} width={w} height={bh} rx="2" fill={`url(#${hatch})`} stroke="var(--loss)">
            <title>{`${formatDayKey(d.day, lang)} ${formatMoney(v, currency)}`}</title>
          </rect>
        );
      })}
      {days.map((d, i) =>
        i % every === 0 ? (
          <text key={`l${d.day}`} x={10 + i * bw + bw / 2} y={H - 4} fill="var(--muted)" fontSize="11" textAnchor="middle">
            {formatDayKey(d.day, lang)}
          </text>
        ) : null,
      )}
    </svg>
  );
}

/**
 * Calendar heatmap: profit days are blue (stronger = bigger), loss days are hatched gray,
 * and every cell shows its signed amount as text.
 */
export function CalendarHeatmap({ days, currency, weekdayLabels, lang }: { days: DayBucket[]; currency: string; weekdayLabels: string[]; lang: Lang }) {
  if (!days.length) return null;
  const map = new Map(days.map((d) => [d.day, d]));
  const first = new Date(`${days[0]!.day}T00:00:00Z`);
  const lastD = new Date(`${days[days.length - 1]!.day}T00:00:00Z`);
  // Start on the Monday of the first week.
  const start = new Date(first);
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  const cells: { key: string; inRange: boolean }[] = [];
  for (let d = new Date(start); d <= lastD; d.setUTCDate(d.getUTCDate() + 1)) {
    const wd = d.getUTCDay();
    if (wd === 0 || wd === 6) continue;
    cells.push({ key: d.toISOString().slice(0, 10), inRange: d >= first });
  }
  const maxWin = Math.max(...days.map((d) => d.net.toNumber()), 1e-9);
  return (
    <div className="grid grid-cols-5 gap-1" role="table" aria-label="Calendar">
      {weekdayLabels.map((w) => (
        <div key={w} role="columnheader" className="pb-0.5 text-[11px] text-muted">
          {w}
        </div>
      ))}
      {cells.map((c) => {
        const b = map.get(c.key);
        const dayNum = Number(c.key.slice(8));
        if (!c.inRange) return <div key={c.key} aria-hidden="true" />;
        if (!b) {
          return (
            <div key={c.key} role="cell" className="flex min-h-13 flex-col justify-between rounded-s border border-line p-1.5 text-[11px]">
              <span className="text-muted">{dayNum}</span>
              <span className="text-muted">–</span>
            </div>
          );
        }
        const v = b.net.toNumber();
        if (v >= 0) {
          const a = 0.25 + 0.75 * (v / maxWin);
          const strong = a > 0.55;
          return (
            <div
              key={c.key}
              role="cell"
              title={`${formatDayKey(c.key, lang)} · ${b.count}`}
              className={`flex min-h-13 flex-col justify-between rounded-s p-1.5 text-[11px] ${strong ? "text-on-blue" : "text-fg"}`}
              style={{ background: `color-mix(in srgb, var(--blue) ${Math.round(a * 100)}%, var(--bg))` }}
            >
              <span className="opacity-80">{dayNum}</span>
              <span className="text-xs font-semibold">{formatMoney(v, currency, { dp: 0 })}</span>
            </div>
          );
        }
        return (
          <div key={c.key} role="cell" title={`${formatDayKey(c.key, lang)} · ${b.count}`} className="hatch-soft flex min-h-13 flex-col justify-between rounded-s border border-line p-1.5 text-[11px]">
            <span className="text-muted">{dayNum}</span>
            <span className="text-xs font-semibold">{formatMoney(v, currency, { dp: 0 })}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Diverging horizontal bars around zero (sessions, weekdays, rules), in R or money. */
export function DivergingBars({
  rows,
  unit,
  currency = "USD",
}: {
  rows: { label: string; sub?: string; value: number | null; n: number; badge?: ReactNode }[];
  unit: "R" | "MONEY";
  currency?: string;
}) {
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.value ?? 0)), 1e-9);
  return (
    <div>
      {rows.map((r) => {
        const v = r.value ?? 0;
        const w = (Math.abs(v) / maxAbs) * 50;
        return (
          <div key={r.label} className="grid grid-cols-[96px_1fr_104px] items-center gap-2.5 border-b border-line py-2 last:border-b-0">
            <div>
              <div className="text-sm">{r.label}</div>
              {r.sub && <div className="text-xs text-muted">{r.sub}</div>}
            </div>
            <div className="relative h-3" aria-hidden="true">
              <div className="absolute top-[-3px] bottom-[-3px] left-1/2 w-px bg-line-strong" />
              {r.value !== null && (v >= 0 ? <div className="absolute top-0 h-3 rounded-[3px] bg-blue" style={{ left: "50%", width: `${w}%` }} /> : <div className="hatch absolute top-0 h-3 rounded-[3px]" style={{ right: "50%", width: `${w}%` }} />)}
            </div>
            <div className="text-right">
              <div className={`text-sm font-semibold ${v > 0 ? "text-blue" : ""}`}>{r.value === null ? "–" : unit === "R" ? formatR(v) : formatMoney(v, currency)}</div>
              <div className="flex flex-wrap justify-end gap-1 text-xs text-muted">
                n={r.n} {r.badge}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
