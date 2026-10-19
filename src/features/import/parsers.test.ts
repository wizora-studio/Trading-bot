import { describe, expect, it } from "vitest";
import { readCsv, safeCell } from "./csv";
import { fingerprint } from "./fingerprint";
import {
  autoMapping,
  detectFormat,
  parseMapped,
  parseMt5Positions,
  parseTradingViewAccountHistory,
  parseTradingViewOrderHistory,
  STANDARD_TEMPLATE_ROWS,
} from "./parsers";

const TV_ACCOUNT = `Time,Balance Before,Balance After,Realized P&L (value),Action
2026-10-14 15:40:00,100150.00,100120.00,-30.00,"Close short position for symbol FX:GBPUSD at price 1.27300 for 10000 units. Position AVG Price was 1.27270, currency: USD, rate: 1.000, point value: 1.000"
2026-10-14 13:05:10,100002.00,100150.00,148.00,"Close long position for symbol OANDA:XAUUSD at price 2655.40 for 20 units. Position AVG Price was 2648.00, currency: USD, rate: 1.000, point value: 1.000"
2026-10-14 11:00:00,100004.00,100002.00,-2.00,"Commission for: Enter position for symbol OANDA:XAUUSD at price 2648.00 for 20 units"
2026-10-13 09:00:00,100000.00,100004.00,4.00,"Some unknown row"
`;

describe("TradingView Account History", () => {
  const rows = readCsv(TV_ACCOUNT);
  it("is detected", () => expect(detectFormat(rows)).toBe("TRADINGVIEW_ACCOUNT_HISTORY"));
  const res = parseTradingViewAccountHistory(rows, "Asia/Karachi");
  it("parses close rows into trades (oldest first) and matches commission", () => {
    expect(res.trades).toHaveLength(2);
    const [gold, gbp] = res.trades;
    expect(gold).toMatchObject({ instrument: "XAUUSD", side: "LONG", quantity: "20", entryPrice: "2648", exitPrice: "2655.4", grossPnl: "148", commission: "2" });
    expect(gold?.closeTime).toBe("2026-10-14T08:05:10.000Z"); // 13:05:10 Karachi = 08:05:10 UTC
    expect(gbp).toMatchObject({ instrument: "GBPUSD", side: "SHORT", grossPnl: "-30" });
    expect(res.warnings).toContain("IGNORED_ROWS:1");
  });
  it("lowers data quality for missing stop-loss and open time", () => {
    expect(res.quality.issues.map((i) => i.code)).toEqual(expect.arrayContaining(["MISSING_STOP_LOSS", "MISSING_OPEN_TIME"]));
    expect(res.quality.score).toBeLessThan(70);
  });
});

const TV_ORDERS = `Symbol,Side,Type,Qty,Limit Price,Stop Price,Fill Price,Status,Commission,Placing Time,Closing Time,Order ID
FX:EURUSD,Buy,Market,10000,,,1.10000,Filled,0,2026-10-14 10:00:00,2026-10-14 10:00:00,1
FX:EURUSD,Sell,Stop,10000,,1.09800,,Cancelled,0,2026-10-14 10:00:01,2026-10-14 12:00:00,2
FX:EURUSD,Buy,Market,10000,,,1.10200,Filled,0,2026-10-14 10:30:00,2026-10-14 10:30:00,3
FX:EURUSD,Sell,Market,5000,,,1.10300,Filled,0,2026-10-14 11:00:00,2026-10-14 11:00:00,4
FX:EURUSD,Sell,Market,25000,,,1.10400,Filled,0,2026-10-14 12:00:00,2026-10-14 12:00:00,5
FX:EURUSD,Buy,Market,10000,,,1.10300,Filled,0,2026-10-14 13:00:00,2026-10-14 13:00:00,6
`;

describe("TradingView order history (fills → logical trades)", () => {
  const rows = readCsv(TV_ORDERS);
  it("is detected", () => expect(detectFormat(rows)).toBe("TRADINGVIEW_ORDER_HISTORY"));
  const res = parseTradingViewOrderHistory(rows, "UTC");
  it("scale-in + scale-out is ONE trade; the reversal opens a second trade", () => {
    expect(res.trades).toHaveLength(2);
    const [a, b] = res.trades;
    // Long 20,000 @ avg 1.1010. Close 5,000 @ 1.1030 (+10) and 15,000 @ 1.1040 (+45) → +55
    expect(a).toMatchObject({ side: "LONG", quantity: "20000", entryPrice: "1.101", grossPnl: "55", stopLoss: "1.098" });
    expect(a?.openTime).toBe("2026-10-14T10:00:00.000Z");
    // Reversal: short 10,000 @ 1.1040 closed @ 1.1030 → +10
    expect(b).toMatchObject({ side: "SHORT", quantity: "10000", entryPrice: "1.104", exitPrice: "1.103", grossPnl: "10" });
  });
});

const MT5 = `Positions
Time,Position,Symbol,Type,Volume,Price,S / L,T / P,Time,Price,Commission,Swap,Profit
2026.10.14 10:00:00,5001,XAUUSD.m,buy,0.10,2648.00,2643.00,2660.00,2026.10.14 12:30:00,2655.00,-0.70,0.00,70.00
2026.10.14 13:00:00,5002,EURUSD,sell,0.50,1.08500,1.08700,,2026.10.15 09:00:00,1.08700,-3.50,-1.20,-100.00
Orders
Open Time,Order,Symbol
`;

describe("MT5 positions report", () => {
  const rows = readCsv(MT5);
  it("is detected", () => expect(detectFormat(rows)).toBe("MT5_POSITIONS"));
  const res = parseMt5Positions(rows, "Europe/Athens");
  it("reads both time and price columns, costs as positive amounts", () => {
    expect(res.errors).toEqual([]);
    expect(res.trades).toHaveLength(2);
    expect(res.trades[0]).toMatchObject({
      instrument: "XAUUSD",
      quantity: "0.1",
      quantityUnit: "LOTS",
      entryPrice: "2648",
      exitPrice: "2655",
      stopLoss: "2643",
      takeProfit: "2660",
      grossPnl: "70",
      commission: "0.7",
    });
    expect(res.trades[0]?.openTime).toBe("2026-10-14T07:00:00.000Z"); // Athens = UTC+3 in October
    expect(res.trades[1]).toMatchObject({ side: "SHORT", takeProfit: null, swap: "1.2", commission: "3.5" });
  });
});

describe("standard template", () => {
  it("round-trips the template example", () => {
    const rows = STANDARD_TEMPLATE_ROWS;
    expect(detectFormat(rows)).toBe("STANDARD_TEMPLATE");
    const res = parseMapped(rows, autoMapping(rows[0]!), "UTC", "STANDARD_TEMPLATE");
    expect(res.errors).toEqual([]);
    expect(res.trades[0]).toMatchObject({ instrument: "EURUSD", side: "LONG", quantity: "0.25", stopLoss: "1.083", commission: "1.75" });
  });
  it("reports missing required columns", () => {
    const res = parseMapped([["foo", "bar"]], autoMapping(["foo", "bar"]), "UTC");
    expect(res.errors[0]?.code).toBe("MISSING_COLUMNS");
  });
  it("reports bad rows without stopping", () => {
    const rows = [["symbol", "side", "close_time", "gross_pnl"], ["EURUSD", "buy", "nope", "1"], ["EURUSD", "sideways", "2026-01-01", "1"], ["EURUSD", "sell", "2026-01-01", "abc"], ["EURUSD", "sell", "2026-01-01 10:00", "5"]];
    const res = parseMapped(rows, autoMapping(rows[0]!), "UTC");
    expect(res.trades).toHaveLength(1);
    expect(res.errors.map((e) => e.code)).toEqual(["BAD_TIME", "BAD_SIDE", "BAD_NUMBER"]);
  });
});

describe("safety and duplicates", () => {
  it("fingerprint is stable and detects duplicates", () => {
    const t = { symbol: "EURUSD", side: "LONG" as const, closeTime: "2026-01-01T00:00:00.000Z", quantity: "1.0", exitPrice: "1.1", grossPnl: "10.00" };
    expect(fingerprint("a", t)).toBe(fingerprint("a", { ...t, quantity: "1", grossPnl: "10" }));
    expect(fingerprint("a", t)).not.toBe(fingerprint("b", t));
  });
  it("formula injection is neutralized, numbers are not", () => {
    expect(safeCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(safeCell("-12.5")).toBe("-12.5");
    expect(safeCell("@SUM")).toBe("'@SUM");
  });
});
