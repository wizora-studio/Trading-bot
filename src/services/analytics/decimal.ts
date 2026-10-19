import Decimal from "decimal.js";

/**
 * One configured Decimal class for all money math.
 * Full precision is kept during calculation; rounding happens only for display
 * (see `src/components/shared/format.ts`). Never use JavaScript `number` for money sums.
 */
export const Dec = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_EVEN });
export type Dec = InstanceType<typeof Dec>;

/** A decimal value as it is stored and passed around: always a plain string like "-12.50". */
export type DecimalString = string;

export const ZERO = new Dec(0);

/** Turns a stored string (or null) into a Decimal. Empty or null becomes zero. */
export function d(value: DecimalString | number | null | undefined): Dec {
  if (value === null || value === undefined || value === "") return ZERO;
  return new Dec(value);
}

/** Like `d`, but returns null when the value is missing. Use for optional fields like stop-loss. */
export function dOrNull(value: DecimalString | null | undefined): Dec | null {
  if (value === null || value === undefined || value === "") return null;
  return new Dec(value);
}

/** Adds a list of decimals. */
export function sum(values: Dec[]): Dec {
  return values.reduce((acc, v) => acc.plus(v), ZERO);
}

/** Serializes a decimal for storage (full precision, no exponent notation). */
export function s(value: Dec): DecimalString {
  return value.toFixed();
}

/** Returns true when the text is a valid decimal number (used by importers and forms). */
export function isDecimalText(text: string): boolean {
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(text.trim())) return false;
  try {
    new Dec(text.trim());
    return true;
  } catch {
    return false;
  }
}

/** Cleans number text from exports: removes thousands separators, spaces, currency signs, and the Unicode minus. */
export function cleanNumberText(raw: string): string {
  return raw
    .replace(/−/g, "-")
    .replace(/[\s$€£,]/g, "")
    .replace(/^\((.*)\)$/, "-$1");
}
