import { expect, type Page, test } from "@playwright/test";

const PAGES = ["/", "/trades/", "/strategies/", "/funded/", "/rules/", "/room/", "/planner/", "/journal/", "/charts/", "/tools/", "/import/", "/accounts/", "/learn/", "/settings/"];

/** Collects page errors and console errors from our own code (external widgets are ignored). */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const url = m.location().url ?? "";
    if (url.includes("tradingview") || /Failed to load resource/.test(m.text())) return;
    errors.push(`console: ${m.text()}`);
  });
  return errors;
}

test("first run → sample data → every page renders without errors", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Welcome/ })).toBeVisible();
  await page.getByRole("button", { name: "Load sample data" }).click();
  await expect(page.getByText("Net P&L after costs")).toBeVisible();
  for (const p of PAGES) {
    await page.goto(p);
    await expect(page.locator("main h1, main h2").first()).toBeVisible();
  }
  // Funded account view
  await page.goto("/");
  await page.getByRole("combobox").first().selectOption("sample-funded");
  await page.waitForTimeout(500); // let IndexedDB save before navigating
  await page.goto("/funded/");
  await expect(page.getByText("Daily loss limit").first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("import MT5 demo file end to end and roll back", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Normal" }).first().click();
  await page.getByLabel("Account name").fill("My paper");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/import/);
  const csv = [
    "Positions",
    "Time,Position,Symbol,Type,Volume,Price,S / L,T / P,Time,Price,Commission,Swap,Profit",
    "2026.10.14 10:00:00,1,XAUUSD.m,buy,0.10,2648.00,2643.00,2660.00,2026.10.14 12:30:00,2655.00,-0.70,0.00,70.00",
    "2026.10.14 13:00:00,2,EURUSD,sell,0.50,1.08500,1.08700,,2026.10.15 09:00:00,1.08700,-3.50,-1.20,-100.00",
  ].join("\n");
  await page.getByLabel("Or paste CSV text").fill(csv);
  await page.getByRole("button", { name: "Read pasted text" }).click();
  await expect(page.getByText("MT5 · Positions report")).toBeVisible();
  await page.getByRole("button", { name: "Import 2 trades" }).click();
  await expect(page).toHaveURL(/trades/);
  await expect(page.getByRole("cell", { name: "XAUUSD" })).toBeVisible();
  await page.goto("/import/");
  await page.getByRole("button", { name: "Undo import" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Undo import" }).click();
  await expect(page.getByText("Import undone").first()).toBeVisible();
  expect(errors).toEqual([]);
});
