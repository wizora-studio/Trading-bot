import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** Checks WCAG 2.2 AA contrast of every text/background token pair, in both themes. */
const css = readFileSync(new URL("../app/tokens.css", import.meta.url), "utf8");

function block(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start));
  return Object.fromEntries([...body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1]!, m[2]!]));
}

function lum(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
}
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
};

const light = block(":root {");
const dark = { ...light, ...block(':root[data-theme="dark"]') };

describe.each([
  ["light", light],
  ["dark", dark],
])("%s theme contrast", (_name, t) => {
  it.each([
    ["fg", "bg", 4.5],
    ["muted", "bg", 4.5],
    ["muted", "soft", 4.5],
    ["blue", "bg", 4.5],
    ["blue", "soft", 4.5],
    ["fg", "blue-soft", 4.5],
    ["on-blue", "blue", 4.5],
    ["loss", "bg", 3], // non-text graphics (hatched bars) need 3:1
  ])("%s on %s ≥ %d", (fg, bg, min) => {
    expect(ratio(t[fg]!, t[bg]!)).toBeGreaterThanOrEqual(min);
  });
});
