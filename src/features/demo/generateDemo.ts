import type { Trade } from "@/domain/types";
import { d, s } from "@/services/analytics/decimal";
import { getSpec } from "@/services/analytics/instruments";
import { wallTimeToUtc, zonedParts } from "@/services/analytics/time";
import { fingerprint } from "@/features/import/fingerprint";

/**
 * Realistic SYNTHETIC demo trades (clearly badged "Sample data" in the UI).
 * Deterministic: the same seed and end date always produce the same trades, so numbers stay stable.
 */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

interface DemoOptions {
  accountId: string;
  seed: number;
  startingBalance: string;
  riskPct: number;
  tradingDays: number;
  endDate: Date;
  /** Strategy ids to assign, with their checklist rule ids. */
  strategies: { id: string; ruleIds: string[]; instruments: string[]; londonFirst: boolean }[];
}

const BASE_PRICE: Record<string, number> = { EURUSD: 1.085, GBPUSD: 1.27, XAUUSD: 2650, USDJPY: 150 };
const STOP_RANGE: Record<string, [number, number]> = { EURUSD: [0.001, 0.0025], GBPUSD: [0.0012, 0.003], XAUUSD: [3, 8], USDJPY: [0.12, 0.3] };
const COMMISSION_PER_LOT = 7;

const MISTAKES = ["FOMO", "Early exit", "Widened SL", "Revenge trade", "Outside session"];

export function generateDemoTrades(o: DemoOptions): Trade[] {
  const rnd = mulberry32(o.seed);
  const days: Date[] = [];
  const cursor = new Date(o.endDate);
  while (days.length < o.tradingDays) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    const wd = cursor.getUTCDay();
    if (wd >= 1 && wd <= 5) days.unshift(new Date(cursor));
  }
  const trades: Trade[] = [];
  let balance = Number(o.startingBalance);
  let n = 0;
  for (const day of days) {
    const count = Math.floor(rnd() * 3.4);
    for (let i = 0; i < count; i++) {
      n += 1;
      const strat = rnd() < 0.85 ? o.strategies[Math.floor(rnd() * o.strategies.length)] : undefined;
      const instruments = strat?.instruments ?? ["EURUSD", "XAUUSD"];
      const instrument = instruments[Math.floor(rnd() * instruments.length)] ?? "EURUSD";
      const spec = getSpec(instrument)!;
      const followed = strat ? rnd() < 0.7 : false;
      // Open time: London morning or New York morning, in each market's own clock (DST-correct).
      const london = strat?.londonFirst ? rnd() < 0.75 : rnd() < 0.45;
      const p = zonedParts(day, "UTC");
      const tz = london ? "Europe/London" : "America/New_York";
      const hour = (london ? 8 : 9) + Math.floor(rnd() * 3);
      const asianSlip = !followed && rnd() < 0.2;
      const open = asianSlip
        ? wallTimeToUtc(p.year, p.month, p.day, 10 + Math.floor(rnd() * 4), Math.floor(rnd() * 60), 0, "Asia/Tokyo")
        : wallTimeToUtc(p.year, p.month, p.day, hour, Math.floor(rnd() * 60), 0, tz);
      const holdMin = 20 + Math.floor(rnd() * 220);
      const close = new Date(open.getTime() + holdMin * 60000);

      const side = rnd() < 0.5 ? "LONG" : "SHORT";
      const base = BASE_PRICE[instrument] ?? 1;
      const entry = base * (1 + (rnd() - 0.5) * 0.02);
      const [lo, hi] = STOP_RANGE[instrument] ?? [0.001, 0.002];
      const stopDist = lo + rnd() * (hi - lo);
      const riskMoney = (balance * o.riskPct) / 100;
      const pip = Number(spec.pipSize);
      const pipValue = Number(spec.contractSize) * pip * (spec.quoteCurrency === "USD" ? 1 : 1 / entry);
      const lots = Math.max(0.01, Math.floor((riskMoney / ((stopDist / pip) * pipValue)) * 100) / 100);
      const actualRisk = lots * (stopDist / pip) * pipValue;

      const q = rnd();
      let r: number;
      if (followed) r = q < 0.52 ? 1.4 + rnd() * 1.2 : q < 0.57 ? 0 : -(0.9 + rnd() * 0.15);
      else r = q < 0.38 ? 0.4 + rnd() * 1.1 : q < 0.42 ? 0 : -(1 + rnd() * 0.45);
      const gross = Math.round(r * actualRisk * 100) / 100;
      const dir = side === "LONG" ? 1 : -1;
      const units = lots * Number(spec.contractSize);
      const quoteMove = gross / units / (spec.quoteCurrency === "USD" ? 1 : 1 / entry);
      const exit = entry + dir * quoteMove;
      const digits = spec.digits;
      const commission = Math.round(lots * COMMISSION_PER_LOT * 100) / 100;
      const swap = holdMin > 200 && rnd() < 0.3 ? Math.round(lots * 2 * 100) / 100 : 0;

      const ruleIds = strat?.ruleIds ?? [];
      const checklist: Record<string, boolean> = {};
      if (strat && rnd() < 0.9) {
        const broken = followed ? -1 : Math.floor(rnd() * ruleIds.length);
        ruleIds.forEach((id, idx) => (checklist[id] = idx !== broken));
      }
      const draft = {
        symbol: instrument,
        side: side as Trade["side"],
        closeTime: close.toISOString(),
        quantity: s(d(lots.toFixed(2))),
        exitPrice: exit.toFixed(digits),
        grossPnl: gross.toFixed(2),
      };
      const t: Trade = {
        id: `demo-${o.seed}-${n}`,
        accountId: o.accountId,
        importBatchId: null,
        source: "SAMPLE",
        fingerprint: fingerprint(o.accountId, draft),
        symbol: instrument,
        instrument,
        side: draft.side,
        quantity: draft.quantity,
        quantityUnit: "LOTS",
        openTime: open.toISOString(),
        closeTime: draft.closeTime,
        entryPrice: entry.toFixed(digits),
        exitPrice: draft.exitPrice,
        stopLoss: (entry - dir * stopDist).toFixed(digits),
        takeProfit: (entry + dir * stopDist * 2).toFixed(digits),
        plannedRisk: actualRisk.toFixed(2),
        grossPnl: draft.grossPnl,
        commission: commission.toFixed(2),
        swap: swap.toFixed(2),
        fees: "0",
        notes: "",
        mistakeTags: !followed && strat && rnd() < 0.6 ? [MISTAKES[Math.floor(rnd() * MISTAKES.length)]!] : [],
        strategyId: strat?.id ?? null,
        checklist,
        userEdited: [],
        tradePlanId: null,
      };
      trades.push(t);
      balance += gross - commission - swap;
    }
  }
  return trades;
}

/** The demo trades as an MT5-style "Positions" CSV, for testing the importer end to end. */
export function demoTradesAsMt5Csv(trades: Trade[]): string {
  const fmt = (iso: string | null) => {
    if (!iso) return "";
    const p = zonedParts(new Date(iso), "Europe/Athens");
    const z = (x: number) => String(x).padStart(2, "0");
    return `${p.year}.${z(p.month)}.${z(p.day)} ${z(p.hour)}:${z(p.minute)}:${z(p.second)}`;
  };
  const rows = [
    "Positions",
    "Time,Position,Symbol,Type,Volume,Price,S / L,T / P,Time,Price,Commission,Swap,Profit",
    ...trades.map((t, i) =>
      [
        fmt(t.openTime),
        String(7000001 + i),
        t.symbol,
        t.side === "LONG" ? "buy" : "sell",
        t.quantity,
        t.entryPrice ?? "",
        t.stopLoss ?? "",
        t.takeProfit ?? "",
        fmt(t.closeTime),
        t.exitPrice ?? "",
        s(d(t.commission).neg()),
        s(d(t.swap).neg()),
        t.grossPnl,
      ].join(","),
    ),
  ];
  return rows.join("\n") + "\n";
}
