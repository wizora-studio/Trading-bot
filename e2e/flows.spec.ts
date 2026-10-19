import { expect, type Page, test } from "@playwright/test";

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

test("funded account: write rules → Read-Back → confirm → rule board", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await page.getByRole("button", { name: /Funded/ }).first().click();
  await page.getByLabel("Account name").fill("Challenge 10K");
  await page.getByRole("button", { name: "Create and enter rules" }).click();
  await expect(page).toHaveURL(/funded/);
  await page.getByRole("tab", { name: "Write your rules" }).click();
  await page.getByLabel("Your account rules").fill("10k account, target 8%, rozana loss 5% pichle din ke balance se, kul loss 10% static, kam az kam 4 din");
  await page.getByRole("button", { name: "Read my rules" }).click();
  await expect(page.getByText("Please answer these before confirming:")).toBeVisible();
  await page.getByRole("button", { name: "See Read-Back" }).click();
  await expect(page.getByText("Here is what I understood").first()).toBeVisible();
  await expect(page.getByText(/must not go below/).first()).toBeVisible();
  await page.getByRole("button", { name: "Confirm rules" }).click();
  await expect(page.getByText("Daily loss limit").first()).toBeVisible();
  await expect(page.getByText("Max loss limit").first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("import a Gemini strategy spec, open details, trade drawer and planner", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Load sample data" }).click();
  await page.goto("/strategies/");
  await page.getByRole("button", { name: "Import strategy spec" }).click();
  const spec = {
    schemaVersion: "strategy-spec/1.0",
    source: { videos: [{ url: "https://www.youtube.com/watch?v=abc", title: "T", channel: "C", durationText: "10:00", uploadDate: null, accessMode: "FULL", coverageNotes: "" }] },
    strategy: { name: "Video ORB", style: "INTRADAY", instruments: ["NAS100"], timeframes: { bias: [], setup: ["5m"], entry: ["5m"] } },
    rules: [{ id: "R1", category: "TIME", direction: "BOTH", text: "Enter after 09:45 NY", timestamp: "01:30", source: "INFERRED", objectivity: "OBJECTIVE", measurability: "YES" }],
  };
  await page.getByRole("dialog").getByRole("textbox").fill("```json\n" + JSON.stringify(spec) + "\n```");
  await page.getByRole("button", { name: "Import 1" }).click();
  await expect(page.getByRole("heading", { name: "Video ORB" })).toBeVisible();
  await expect(page.getByText("Decide these rules first: R1.")).toBeVisible();
  await page.getByLabel("Your decision").selectOption("CHECKLIST_ONLY");
  await page.getByRole("button", { name: "Yes, this is my strategy" }).click();
  await expect(page.getByText("Strategy confirmed").first()).toBeVisible();

  await page.goto("/trades/");
  await page.locator("tbody tr").first().click();
  await expect(page.getByRole("heading", { name: "Stop-loss, take-profit and planned risk" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.goto("/planner/");
  await page.getByLabel("Entry").fill("1.08500");
  await page.getByLabel("Stop-loss").fill("1.08300");
  await page.getByLabel("Target 1").fill("1.08900");
  await expect(page.getByText("≥ 1.8 R:R gate: pass")).toBeVisible();
  await page.getByRole("button", { name: "Save plan" }).click();
  await expect(page.getByText("Plan saved").first()).toBeVisible();
  expect(errors).toEqual([]);
});
