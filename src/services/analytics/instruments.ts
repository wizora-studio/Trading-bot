import { d, type Dec } from "./decimal";

/**
 * Instrument Specification Registry (Module B).
 * These are COMMON defaults. Brokers differ (e.g., gold contract size, index point value),
 * so every value can be overridden by the user. Never calculate money from the symbol name alone.
 */
export interface InstrumentSpec {
  canonical: string;
  assetClass: "FOREX" | "METAL" | "INDEX" | "CRYPTO" | "COMMODITY";
  /** Units in 1 standard lot. */
  contractSize: string;
  /** Size of one pip (forex/metals) or one point (indices, crypto). */
  pipSize: string;
  quoteCurrency: string;
  /** Price decimals usually shown. */
  digits: number;
  aliases: string[];
  label: string;
}

export const INSTRUMENTS: InstrumentSpec[] = [
  fx("EURUSD", "USD"),
  fx("GBPUSD", "USD"),
  fx("AUDUSD", "USD"),
  fx("NZDUSD", "USD"),
  fx("USDCAD", "CAD"),
  fx("USDCHF", "CHF"),
  fx("USDJPY", "JPY", "0.01", 3),
  fx("EURJPY", "JPY", "0.01", 3),
  fx("GBPJPY", "JPY", "0.01", 3),
  fx("EURGBP", "GBP"),
  {
    canonical: "XAUUSD",
    assetClass: "METAL",
    contractSize: "100",
    pipSize: "0.1",
    quoteCurrency: "USD",
    digits: 2,
    aliases: ["GOLD", "XAUUSD", "XAU/USD"],
    label: "Gold",
  },
  {
    canonical: "XAGUSD",
    assetClass: "METAL",
    contractSize: "5000",
    pipSize: "0.01",
    quoteCurrency: "USD",
    digits: 3,
    aliases: ["SILVER", "XAGUSD", "XAG/USD"],
    label: "Silver",
  },
  index("US30", ["US30", "DJ30", "WS30", "DJI", "DOW", "US30CASH", "YM"], "Dow Jones 30"),
  index("NAS100", ["NAS100", "USTEC", "NDX", "US100", "NAS100CASH", "NQ"], "Nasdaq 100"),
  index("SPX500", ["SPX500", "US500", "SPX", "SP500", "ES"], "S&P 500"),
  index("GER40", ["GER40", "DE40", "DAX", "GER30", "DE30"], "Germany 40"),
  {
    canonical: "BTCUSD",
    assetClass: "CRYPTO",
    contractSize: "1",
    pipSize: "1",
    quoteCurrency: "USD",
    digits: 2,
    aliases: ["BTCUSD", "BTCUSDT", "BTC/USD", "XBTUSD"],
    label: "Bitcoin",
  },
  {
    canonical: "ETHUSD",
    assetClass: "CRYPTO",
    contractSize: "1",
    pipSize: "1",
    quoteCurrency: "USD",
    digits: 2,
    aliases: ["ETHUSD", "ETHUSDT", "ETH/USD"],
    label: "Ethereum",
  },
  {
    canonical: "USOIL",
    assetClass: "COMMODITY",
    contractSize: "1000",
    pipSize: "0.01",
    quoteCurrency: "USD",
    digits: 2,
    aliases: ["USOIL", "WTI", "XTIUSD", "CL", "OIL"],
    label: "WTI crude oil",
  },
];

function fx(pair: string, quote: string, pipSize = "0.0001", digits = 5): InstrumentSpec {
  return {
    canonical: pair,
    assetClass: "FOREX",
    contractSize: "100000",
    pipSize,
    quoteCurrency: quote,
    digits,
    aliases: [pair, `${pair.slice(0, 3)}/${pair.slice(3)}`],
    label: `${pair.slice(0, 3)}/${pair.slice(3)}`,
  };
}

function index(canonical: string, aliases: string[], label: string): InstrumentSpec {
  return { canonical, assetClass: "INDEX", contractSize: "1", pipSize: "1", quoteCurrency: "USD", digits: 2, aliases, label };
}

const PREFIX = /^[A-Z0-9_]+:/; // "FX:", "OANDA:", "FOREXCOM:", "CAPITALCOM:"
const SUFFIX = /([._\-+#!](?:[A-Z0-9]{1,6})?|(?<=[A-Z]{6})(?:M|PRO|ECN|RAW|STD|MICRO|I|C))$/;

/**
 * Maps a broker symbol to a canonical instrument.
 * Examples: "FX:EURUSD" → "EURUSD", "XAUUSD.m" → "XAUUSD", "GOLD" → "XAUUSD", "US30.cash" → "US30".
 * Returns the cleaned symbol with `known: false` when it is not in the registry.
 */
export function mapSymbol(raw: string): { instrument: string; known: boolean } {
  let sym = raw.trim().toUpperCase().replace(PREFIX, "");
  for (let i = 0; i < 2; i++) {
    const hit = findByAlias(sym);
    if (hit) return { instrument: hit.canonical, known: true };
    sym = sym.replace(SUFFIX, "");
  }
  const hit = findByAlias(sym);
  return hit ? { instrument: hit.canonical, known: true } : { instrument: sym, known: false };
}

function findByAlias(sym: string): InstrumentSpec | undefined {
  return INSTRUMENTS.find((i) => i.aliases.includes(sym) || i.canonical === sym);
}

/** Looks up the spec of a canonical instrument, with optional user overrides. */
export function getSpec(
  instrument: string,
  overrides: Record<string, Partial<InstrumentSpec>> = {},
): InstrumentSpec | null {
  const base = INSTRUMENTS.find((i) => i.canonical === instrument);
  const o = overrides[instrument];
  if (!base && !o) return null;
  return { ...(base ?? fallbackSpec(instrument)), ...o } as InstrumentSpec;
}

function fallbackSpec(instrument: string): InstrumentSpec {
  return { canonical: instrument, assetClass: "FOREX", contractSize: "1", pipSize: "1", quoteCurrency: "USD", digits: 2, aliases: [], label: instrument };
}

/** Number of units in a trade, from lots or units. */
export function unitsOf(quantity: Dec, unit: "LOTS" | "UNITS", spec: InstrumentSpec | null): Dec | null {
  if (unit === "UNITS") return quantity;
  if (!spec) return null;
  return quantity.times(d(spec.contractSize));
}
