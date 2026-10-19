/**
 * Reads tables from an MT5/MT4 HTML report in the browser (DOMParser, no scripts run).
 * Returns all table rows as text cells, so the same MT5 parser can read them.
 */
export function htmlReportToRows(html: string): string[][] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const rows: string[][] = [];
  doc.querySelectorAll("tr").forEach((tr) => {
    const cells: string[] = [];
    tr.querySelectorAll("th,td").forEach((c) => {
      const span = Number((c as HTMLTableCellElement).colSpan) || 1;
      const text = (c.textContent ?? "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
      cells.push(text);
      // Keep column positions stable when a header cell spans several columns.
      for (let i = 1; i < span && span < 10; i++) cells.push("");
    });
    rows.push(cells);
  });
  // MT5 HTML reports hide some columns; drop rows that are all empty.
  return rows.filter((r) => r.some((c) => c !== ""));
}

/** MT5 HTML reports are often saved as UTF-16; this decodes the file bytes either way. */
export async function readFileText(file: File): Promise<string> {
  const buf = new Uint8Array(await file.arrayBuffer());
  if (buf[0] === 0xff && buf[1] === 0xfe) return new TextDecoder("utf-16le").decode(buf);
  if (buf[0] === 0xfe && buf[1] === 0xff) return new TextDecoder("utf-16be").decode(buf);
  return new TextDecoder("utf-8").decode(buf);
}
