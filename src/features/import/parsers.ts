import type { QuantityUnit, Side, TradeSource } from "@/domain/types";
import { cleanNumberText, d, isDecimalText, s } from "@/services/analytics/decimal";
import { getSpec, mapSymbol } from "@/services/analytics/instruments";
import { parseExportTime } from "@/services/analytics/time";
import { findCol, normHeader } from "./csv";
import { scoreQuality } from "./quality";
import { type DraftTrade, emptyDraft, type ImportFormat, type ParseResult, type RowError } from "./types";

/** Reads a number cell. Returns undefined for empty cells and null for invalid text. */
function num(cell: string | undefined): string | null | undefined {
  if (cell === undefined || cell.trim() === "" || cell.trim() === "-") return undefined;
  const c = cleanNumberText(cell);
  return isDecimalText(c) ? s(d(c)) : null;
}

function sideOf(text: string | undefined): Side | null {
  const t = (text ?? "").trim().toLowerCase();
  if (["buy", "long", "b", "buy limit", "buy stop"].includes(t) || t.startsWith("buy")) return "LONG";
  if (["sell", "short", "s", "sell limit", "sell stop"].includes(t) || t.startsWith("sell")) return "SHORT";
  return null;
}

function symbolFields(raw: string): Pick<DraftTrade, "symbol" | "instrument" | "notes"> {
  const m = mapSymbol(raw);
  return { symbol: raw, instrument: m.instrument, notes: m.known ? "" : "[unknown-symbol]" };
}

function finish(format: ImportFormat, source: TradeSource, trades: DraftTrade[], errors: RowError[], warnings: string[], missingCommission = false): ParseResult {
  return { format, source, trades, errors, warnings, quality: scoreQuality(trades, errors, { missingCommissionColumn: missingCommission }) };
}

/** Looks at the header row and guesses which export this is. */
export function detectFormat(rows: string[][]): ImportFormat {
  for (const row of rows.slice(0, 15)) {
    const h = row.map(normHeader);
    if (h.includes("balancebefore") && h.includes("action")) return "TRADINGVIEW_ACCOUNT_HISTORY";
    if (h.includes("symbol") && h.includes("side") && (h.includes("fillprice") || h.includes("avgfillprice")) && h.includes("status"))
      return "TRADINGVIEW_ORDER_HISTORY";
    if ((h.includes("position") || h.includes("ticket")) && h.includes("symbol") && h.includes("volume") && h.includes("profit"))
      return "MT5_POSITIONS";
    if (h.includes("symbol") && h.includes("side") && h.includes("closetime") && h.includes("grosspnl")) return "STANDARD_TEMPLATE";
  }
  return "UNKNOWN";
}

/** Runs the right parser for a detected format. */
export function parseByFormat(format: ImportFormat, rows: string[][], timeZone: string): ParseResult | null {
  switch (format) {
    case "TRADINGVIEW_ACCOUNT_HISTORY":
      return parseTradingViewAccountHistory(rows, timeZone);
    case "TRADINGVIEW_ORDER_HISTORY":
      return parseTradingViewOrderHistory(rows, timeZone);
    case "MT5_POSITIONS":
      return parseMt5Positions(rows, timeZone);
    case "STANDARD_TEMPLATE":
      return parseMapped(rows, autoMapping(rows[0] ?? []), timeZone, "STANDARD_TEMPLATE");
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------------------------
// TradingView Paper Trading — "Account History" (Time, Balance Before, Balance After, Realized P&L, Action)
// ---------------------------------------------------------------------------------------------

const TV_CLOSE =
  /close\s+(long|short)\s+position\s+for\s+symbol\s+(\S+?)\s+at\s+price\s+([\d.,]+)\s+for\s+([\d.,]+)\s+units?.*?avg\.?\s+price\s+was\s+([\d.,]+)/i;
const TV_COMMISSION = /commission\b.*?symbol\s+(\S+?)(?:\s|$|,)/i;

/**
 * TradingView "Account History" export. Each closed position is one "Close long/short position…" row.
 * Commission rows are matched to the trade of the same symbol. Open time and stop-loss are not in this
 * file, so the Data Quality Score is lowered and the trader can add the stop-loss by hand.
 * The exact wording comes from third-party guides and may change; check a real export (see docs/research).
 */
export function parseTradingViewAccountHistory(rows: string[][], timeZone: string): ParseResult {
  const headers = rows[0] ?? [];
  const cTime = findCol(headers, ["Time", "Date"]);
  const cBefore = findCol(headers, ["Balance Before"]);
  const cAfter = findCol(headers, ["Balance After"]);
  const cPnl = findCol(headers, ["Realized P&L (value)", "Realized P&L", "Realized PnL", "P&L"]);
  const cAction = findCol(headers, ["Action", "Description"]);
  const errors: RowError[] = [];
  const warnings: string[] = [];
  type Close = { draft: DraftTrade; time: number };
  const closes: Close[] = [];
  const commissions: { symbol: string; amount: string; time: number; row: number }[] = [];
  let ignored = 0;

  rows.slice(1).forEach((r, i) => {
    const rowNo = i + 2;
    const action = r[cAction] ?? "";
    const time = parseExportTime(r[cTime] ?? "", timeZone);
    if (!time) {
      errors.push({ row: rowNo, code: "BAD_TIME", detail: r[cTime] ?? "" });
      return;
    }
    let pnl = num(r[cPnl]);
    if (pnl === undefined) {
      const b = num(r[cBefore]);
      const a = num(r[cAfter]);
      pnl = b && a ? s(d(a).minus(d(b))) : undefined;
    }
    const close = TV_CLOSE.exec(action);
    if (close) {
      if (pnl === null || pnl === undefined) {
        errors.push({ row: rowNo, code: "BAD_NUMBER", detail: r[cPnl] ?? "" });
        return;
      }
      const [, dir, sym = "", exit = "", qty = "", avg = ""] = close;
      closes.push({
        time: time.getTime(),
        draft: emptyDraft({
          source: "TRADINGVIEW",
          ...symbolFields(sym),
          side: dir?.toLowerCase() === "long" ? "LONG" : "SHORT",
          quantity: num(qty) ?? "0",
          quantityUnit: "UNITS",
          closeTime: time.toISOString(),
          entryPrice: num(avg) ?? null,
          exitPrice: num(exit) ?? null,
          grossPnl: pnl,
        }),
      });
      return;
    }
    const comm = TV_COMMISSION.exec(action);
    if (comm && pnl) {
      commissions.push({ symbol: comm[1] ?? "", amount: s(d(pnl).abs()), time: time.getTime(), row: rowNo });
      return;
    }
    ignored += 1;
  });

  closes.sort((a, b) => a.time - b.time);
  let unmatched = 0;
  for (const c of commissions) {
    const same = closes.filter((x) => x.draft.symbol === c.symbol);
    const target = same.find((x) => x.time >= c.time) ?? [...same].reverse().find((x) => c.time - x.time <= 60000);
    if (target) target.draft.commission = s(d(target.draft.commission).plus(d(c.amount)));
    else unmatched += 1;
  }
  if (unmatched) warnings.push(`UNMATCHED_COMMISSIONS:${unmatched}`);
  if (ignored) warnings.push(`IGNORED_ROWS:${ignored}`);
  return finish("TRADINGVIEW_ACCOUNT_HISTORY", "TRADINGVIEW", closes.map((c) => c.draft), errors, warnings, commissions.length === 0);
}

// ---------------------------------------------------------------------------------------------
// TradingView — "History" / order history (fills). Rebuilt into logical trades (flat → flat).
// ---------------------------------------------------------------------------------------------

interface Fill {
  symbol: string;
  side: Side;
  qty: ReturnType<typeof d>;
  price: ReturnType<typeof d>;
  commission: ReturnType<typeof d>;
  time: number;
}

interface BracketOrder {
  symbol: string;
  side: Side;
  kind: "STOP" | "LIMIT";
  price: string;
  placed: number;
}

/**
 * TradingView order history. Only filled orders create fills. Fills are grouped per symbol into one
 * "logical trade" from flat to flat, so scaling in or out does not inflate the trade count.
 * The first opposite-side stop order placed while the position was open is used as the initial stop-loss.
 */
export function parseTradingViewOrderHistory(rows: string[][], timeZone: string): ParseResult {
  const h = rows[0] ?? [];
  const col = {
    symbol: findCol(h, ["Symbol"]),
    side: findCol(h, ["Side"]),
    type: findCol(h, ["Type"]),
    qty: findCol(h, ["Qty", "Quantity", "Filled Qty"]),
    fill: findCol(h, ["Fill Price", "Avg Fill Price", "Avg. Fill Price"]),
    stop: findCol(h, ["Stop Price"]),
    limit: findCol(h, ["Limit Price", "Price"]),
    status: findCol(h, ["Status"]),
    commission: findCol(h, ["Commission"]),
    placed: findCol(h, ["Placing Time", "Placed Time", "Created Time"]),
    closed: findCol(h, ["Closing Time", "Fill Time", "Filled Time", "Time"]),
  };
  const errors: RowError[] = [];
  const fills: Fill[] = [];
  const brackets: BracketOrder[] = [];

  rows.slice(1).forEach((r, i) => {
    const rowNo = i + 2;
    const status = (r[col.status] ?? "").toLowerCase();
    const side = sideOf(r[col.side]);
    const symbol = r[col.symbol] ?? "";
    if (!side || !symbol) {
      errors.push({ row: rowNo, code: "BAD_SIDE_OR_SYMBOL", detail: `${r[col.side] ?? ""} ${symbol}` });
      return;
    }
    const type = (r[col.type] ?? "").toLowerCase();
    const placed = parseExportTime(r[col.placed] ?? "", timeZone)?.getTime();
    if (placed !== undefined) {
      const stopPrice = num(r[col.stop]);
      const limitPrice = num(r[col.limit]);
      if (type.includes("stop") && stopPrice) brackets.push({ symbol, side, kind: "STOP", price: stopPrice, placed });
      else if (type.includes("limit") && limitPrice) brackets.push({ symbol, side, kind: "LIMIT", price: limitPrice, placed });
    }
    if (!status.startsWith("fill")) return;
    const qty = num(r[col.qty]);
    const price = num(r[col.fill]);
    const time = parseExportTime(r[col.closed] ?? r[col.placed] ?? "", timeZone);
    if (!qty || !price || !time) {
      errors.push({ row: rowNo, code: "BAD_FILL", detail: `${r[col.qty] ?? ""} @ ${r[col.fill] ?? ""}` });
      return;
    }
    fills.push({ symbol, side, qty: d(qty), price: d(price), commission: d(num(r[col.commission]) ?? "0").abs(), time: time.getTime() });
  });

  const trades = rebuildTrades(fills, brackets);
  return finish("TRADINGVIEW_ORDER_HISTORY", "TRADINGVIEW", trades.trades, errors, trades.warnings, col.commission < 0);
}

/** Rebuilds flat-to-flat logical trades from fills (average-price method). Exported for tests. */
export function rebuildTrades(fills: Fill[], brackets: BracketOrder[] = []): { trades: DraftTrade[]; warnings: string[] } {
  const bySymbol = new Map<string, Fill[]>();
  for (const f of [...fills].sort((a, b) => a.time - b.time)) bySymbol.set(f.symbol, [...(bySymbol.get(f.symbol) ?? []), f]);
  const out: DraftTrade[] = [];
  let open = 0;
  for (const [symbol, list] of bySymbol) {
    let pos = d(0); // signed quantity
    let avg = d(0);
    let start = 0;
    let dir: Side = "LONG";
    let gross = d(0);
    let commission = d(0);
    let openedQty = d(0);
    let exitValue = d(0);
    let exitQty = d(0);
    let avgEntry = d(0);
    const emit = (closeTime: number) => {
      const sl = brackets
        .filter((b) => b.symbol === symbol && b.kind === "STOP" && b.side !== dir && b.placed >= start - 1000 && b.placed <= closeTime)
        .sort((a, b) => a.placed - b.placed)[0];
      const tp = brackets
        .filter((b) => b.symbol === symbol && b.kind === "LIMIT" && b.side !== dir && b.placed >= start - 1000 && b.placed <= closeTime)
        .sort((a, b) => a.placed - b.placed)[0];
      out.push(
        emptyDraft({
          source: "TRADINGVIEW",
          ...symbolFields(symbol),
          side: dir,
          quantity: s(openedQty),
          quantityUnit: "UNITS",
          openTime: new Date(start).toISOString(),
          closeTime: new Date(closeTime).toISOString(),
          entryPrice: s(avgEntry),
          exitPrice: exitQty.gt(0) ? s(exitValue.div(exitQty)) : null,
          stopLoss: sl?.price ?? null,
          takeProfit: tp?.price ?? null,
          grossPnl: s(gross),
          commission: s(commission),
        }),
      );
      gross = d(0);
      commission = d(0);
      openedQty = d(0);
      exitValue = d(0);
      exitQty = d(0);
    };
    for (const f of list) {
      const signed = f.side === "LONG" ? f.qty : f.qty.neg();
      commission = commission.plus(f.commission);
      if (pos.isZero()) {
        dir = f.side;
        start = f.time;
        pos = signed;
        avg = f.price;
        avgEntry = f.price;
        openedQty = f.qty;
        continue;
      }
      const sameDirection = pos.gt(0) === signed.gt(0);
      if (sameDirection) {
        // Scale in: new weighted average price.
        avg = avg.times(pos.abs()).plus(f.price.times(f.qty)).div(pos.abs().plus(f.qty));
        avgEntry = avg;
        pos = pos.plus(signed);
        openedQty = openedQty.plus(f.qty);
        continue;
      }
      // Reducing or reversing.
      const closeQty = f.qty.lt(pos.abs()) ? f.qty : pos.abs();
      const dirSign = pos.gt(0) ? 1 : -1;
      gross = gross.plus(f.price.minus(avg).times(closeQty).times(dirSign));
      exitValue = exitValue.plus(f.price.times(closeQty));
      exitQty = exitQty.plus(closeQty);
      pos = pos.plus(signed.gt(0) ? closeQty : closeQty.neg());
      if (pos.isZero()) {
        emit(f.time);
        const left = f.qty.minus(closeQty);
        if (left.gt(0)) {
          // Position reversal: the rest of the fill opens a new trade in the other direction.
          dir = f.side;
          start = f.time;
          pos = f.side === "LONG" ? left : left.neg();
          avg = f.price;
          avgEntry = f.price;
          openedQty = left;
        }
      }
    }
    if (!pos.isZero()) open += 1;
  }
  const warnings: string[] = [];
  if (open) warnings.push(`OPEN_POSITIONS_SKIPPED:${open}`);
  // P&L rebuilt from prices is in the quote currency; for non-USD quotes (e.g., USDJPY) it is not account money.
  if (out.some((t) => (getSpec(t.instrument)?.quoteCurrency ?? "USD") !== "USD")) warnings.push("NON_USD_QUOTE");
  return { trades: out.sort((a, b) => a.closeTime.localeCompare(b.closeTime)), warnings };
}

// ---------------------------------------------------------------------------------------------
// MT5 — "Positions" section of the account history report (HTML/XLSX saved as CSV, or pasted).
// Columns: Time | Position | Symbol | Type | Volume | Price | S / L | T / P | Time | Price | Commission | Swap | Profit
// ---------------------------------------------------------------------------------------------

export function parseMt5Positions(rows: string[][], timeZone: string): ParseResult {
  const errors: RowError[] = [];
  const trades: DraftTrade[] = [];
  const headerIdx = rows.findIndex((r) => {
    const h = r.map(normHeader);
    return (h.includes("position") || h.includes("ticket")) && h.includes("symbol") && h.includes("volume");
  });
  if (headerIdx < 0) return finish("MT5_POSITIONS", "MT5", [], [{ row: 1, code: "NO_HEADER", detail: "Positions header not found" }], []);
  const h = rows[headerIdx] ?? [];
  const tOpen = findCol(h, ["Time", "Open Time"]);
  const tClose = findCol(h, ["Time", "Close Time"], tOpen + 1);
  const pOpen = findCol(h, ["Price", "Open Price"]);
  const pClose = findCol(h, ["Price", "Close Price"], Math.max(pOpen + 1, tClose));
  const col = {
    symbol: findCol(h, ["Symbol"]),
    type: findCol(h, ["Type"]),
    volume: findCol(h, ["Volume", "Lots"]),
    sl: findCol(h, ["S / L", "SL", "Stop Loss"]),
    tp: findCol(h, ["T / P", "TP", "Take Profit"]),
    commission: findCol(h, ["Commission"]),
    swap: findCol(h, ["Swap"]),
    profit: findCol(h, ["Profit"]),
  };

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i] ?? [];
    const rowNo = i + 1;
    const nonEmpty = r.filter((c) => c !== "").length;
    if (nonEmpty <= 2) {
      // A section title like "Orders" ends the Positions table.
      if (nonEmpty === 1 && /orders|deals|summary|results/i.test(r.join(""))) break;
      continue;
    }
    const side = sideOf(r[col.type]);
    if (!side) {
      if (/balance|credit|deposit/i.test(r[col.type] ?? "")) continue;
      errors.push({ row: rowNo, code: "BAD_TYPE", detail: r[col.type] ?? "" });
      continue;
    }
    const open = parseExportTime(r[tOpen] ?? "", timeZone);
    const close = parseExportTime(r[tClose] ?? "", timeZone);
    const profit = num(r[col.profit]);
    const volume = num(r[col.volume]);
    if (!close || !profit || !volume) {
      errors.push({ row: rowNo, code: "BAD_ROW", detail: r.join(" | ").slice(0, 120) });
      continue;
    }
    const comm = num(r[col.commission]) ?? "0";
    const swap = num(r[col.swap]) ?? "0";
    const sl = num(r[col.sl]);
    const tp = num(r[col.tp]);
    trades.push(
      emptyDraft({
        source: "MT5",
        ...symbolFields(r[col.symbol] ?? ""),
        side,
        quantity: volume,
        quantityUnit: "LOTS",
        openTime: open?.toISOString() ?? null,
        closeTime: close.toISOString(),
        entryPrice: num(r[pOpen]) ?? null,
        exitPrice: num(r[pClose]) ?? null,
        stopLoss: sl && !d(sl).isZero() ? sl : null,
        takeProfit: tp && !d(tp).isZero() ? tp : null,
        grossPnl: profit,
        // MT5 shows costs as negative numbers; we store costs as positive amounts.
        commission: s(d(comm).neg()),
        swap: s(d(swap).neg()),
      }),
    );
  }
  return finish("MT5_POSITIONS", "MT5", trades, errors, [], col.commission < 0);
}

// ---------------------------------------------------------------------------------------------
// Standard template and the generic column mapper
// ---------------------------------------------------------------------------------------------

export const STANDARD_FIELDS = [
  "symbol",
  "side",
  "quantity",
  "quantity_unit",
  "open_time",
  "close_time",
  "entry_price",
  "exit_price",
  "stop_loss",
  "take_profit",
  "gross_pnl",
  "commission",
  "swap",
  "fees",
  "notes",
] as const;
export type StandardField = (typeof STANDARD_FIELDS)[number];
export const REQUIRED_FIELDS: StandardField[] = ["symbol", "side", "close_time", "gross_pnl"];

export type ColumnMapping = Record<StandardField, number>;

/** Maps headers to standard fields by name (works for our template and many similar files). */
export function autoMapping(headers: string[]): ColumnMapping {
  const aliases: Record<StandardField, string[]> = {
    symbol: ["symbol", "instrument", "ticker", "pair", "market"],
    side: ["side", "direction", "type", "buysell"],
    quantity: ["quantity", "qty", "volume", "lots", "size", "units"],
    quantity_unit: ["quantity_unit", "unit"],
    open_time: ["open_time", "opentime", "entrytime", "opendate", "open"],
    close_time: ["close_time", "closetime", "exittime", "closedate", "close", "time", "date"],
    entry_price: ["entry_price", "entryprice", "openprice", "entry"],
    exit_price: ["exit_price", "exitprice", "closeprice", "exit"],
    stop_loss: ["stop_loss", "stoploss", "sl", "stop"],
    take_profit: ["take_profit", "takeprofit", "tp", "target"],
    gross_pnl: ["gross_pnl", "grosspnl", "profit", "pnl", "p&l", "realizedpnl", "netpnl", "result"],
    commission: ["commission", "commissions", "comm"],
    swap: ["swap", "swaps", "rollover"],
    fees: ["fees", "fee"],
    notes: ["notes", "note", "comment", "comments"],
  };
  const mapping = {} as ColumnMapping;
  const used = new Set<number>();
  for (const f of STANDARD_FIELDS) {
    const idx = headers.findIndex((hh, i) => !used.has(i) && aliases[f].map(normHeader).includes(normHeader(hh)));
    mapping[f] = idx;
    if (idx >= 0) used.add(idx);
  }
  return mapping;
}

/** Parses any table using a column mapping (our template or a user mapping). */
export function parseMapped(rows: string[][], mapping: ColumnMapping, timeZone: string, format: ImportFormat = "MAPPED"): ParseResult {
  const missing = REQUIRED_FIELDS.filter((f) => mapping[f] < 0);
  if (missing.length) {
    return finish(format, format === "STANDARD_TEMPLATE" ? "STANDARD_CSV" : "MAPPED_CSV", [], [{ row: 1, code: "MISSING_COLUMNS", detail: missing.join(", ") }], []);
  }
  const errors: RowError[] = [];
  const trades: DraftTrade[] = [];
  const cell = (r: string[], f: StandardField) => (mapping[f] >= 0 ? (r[mapping[f]] ?? "") : "");
  rows.slice(1).forEach((r, i) => {
    const rowNo = i + 2;
    const side = sideOf(cell(r, "side"));
    const close = parseExportTime(cell(r, "close_time"), timeZone);
    const gross = num(cell(r, "gross_pnl"));
    const symbol = cell(r, "symbol");
    if (!side) return void errors.push({ row: rowNo, code: "BAD_SIDE", detail: cell(r, "side") });
    if (!close) return void errors.push({ row: rowNo, code: "BAD_TIME", detail: cell(r, "close_time") });
    if (!gross) return void errors.push({ row: rowNo, code: "BAD_NUMBER", detail: cell(r, "gross_pnl") });
    if (!symbol) return void errors.push({ row: rowNo, code: "MISSING_SYMBOL", detail: "" });
    const optional = (f: StandardField) => {
      const v = num(cell(r, f));
      if (v === null) errors.push({ row: rowNo, code: "BAD_NUMBER", detail: `${f}: ${cell(r, f)}` });
      return v ?? null;
    };
    const unitText = cell(r, "quantity_unit").toUpperCase();
    const unit: QuantityUnit = unitText.startsWith("UNIT") ? "UNITS" : "LOTS";
    const sym = symbolFields(symbol);
    trades.push(
      emptyDraft({
        source: format === "STANDARD_TEMPLATE" ? "STANDARD_CSV" : "MAPPED_CSV",
        ...sym,
        notes: [sym.notes, cell(r, "notes")].filter(Boolean).join(" "),
        side,
        quantity: optional("quantity") ?? "0",
        quantityUnit: unit,
        openTime: parseExportTime(cell(r, "open_time"), timeZone)?.toISOString() ?? null,
        closeTime: close.toISOString(),
        entryPrice: optional("entry_price"),
        exitPrice: optional("exit_price"),
        stopLoss: optional("stop_loss"),
        takeProfit: optional("take_profit"),
        grossPnl: gross,
        commission: s(d(optional("commission") ?? "0").abs()),
        swap: optional("swap") ?? "0",
        fees: s(d(optional("fees") ?? "0").abs()),
      }),
    );
  });
  return finish(format, format === "STANDARD_TEMPLATE" ? "STANDARD_CSV" : "MAPPED_CSV", trades, errors, [], mapping.commission < 0);
}

/** The downloadable Standard CSV Template (header + one example row). */
export const STANDARD_TEMPLATE_ROWS: string[][] = [
  [...STANDARD_FIELDS],
  ["EURUSD", "buy", "0.25", "lots", "2026-10-14 13:05:00", "2026-10-14 15:40:00", "1.08500", "1.08800", "1.08300", "1.08900", "75.00", "1.75", "0", "0", "London breakout"],
];
