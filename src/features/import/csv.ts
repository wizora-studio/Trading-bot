import Papa from "papaparse";

/** Reads CSV text into rows of cells. Handles quoted fields, commas, semicolons, and tabs. */
export function readCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const result = Papa.parse<string[]>(clean, { skipEmptyLines: "greedy", delimiter: "" });
  return result.data.map((row) => row.map((c) => (c ?? "").trim()));
}

/** Normalizes a header for matching: lower case, no spaces or punctuation. "S / L" → "sl". */
export function normHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9%&]/g, "");
}

/** Finds the index of the first header that matches one of the names. */
export function findCol(headers: string[], names: string[], from = 0): number {
  const wanted = names.map(normHeader);
  for (let i = from; i < headers.length; i++) {
    if (wanted.includes(normHeader(headers[i] ?? ""))) return i;
  }
  return -1;
}

/**
 * Neutralizes spreadsheet formula injection when text from a file is shown or exported
 * (cells starting with =, +, -, @ can run formulas in Excel). Numbers are left alone.
 */
export function safeCell(text: string): string {
  if (/^[=+\-@]/.test(text) && !/^[-+]?\d/.test(text)) return `'${text}`;
  return text;
}

/** Turns rows back into CSV text (for export and templates), with formula-injection protection. */
export function toCsv(rows: (string | number | null)[][]): string {
  return Papa.unparse(rows.map((r) => r.map((c) => (c === null ? "" : safeCell(String(c))))));
}
