import { test } from "@playwright/test";

/** UI quality gate (Section 3D): screenshots at 375 / 768 / 1280 px in light and dark. Not an assertion test. */
const PAGES = ["/", "/trades/", "/strategies/", "/funded/", "/rules/", "/planner/", "/import/", "/tools/", "/learn/handbook/", "/settings/"];

for (const scheme of ["light", "dark"] as const) {
  for (const width of [375, 768, 1280]) {
    test(`screens ${scheme} ${width}`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme });
      const page = await ctx.newPage();
      await page.goto("/");
      await page.getByRole("button", { name: "Load sample data" }).click();
      await page.getByText("Net P&L after costs").waitFor();
      for (const p of PAGES) {
        if (p === "/funded/") {
          await page.goto("/");
          await page.getByRole("combobox").first().selectOption("sample-funded");
          await page.waitForTimeout(500);
        }
        await page.goto(p);
        await page.waitForTimeout(400);
        const name = p === "/" ? "dashboard" : p.replaceAll("/", "");
        await page.screenshot({ path: `test-results/screens/${scheme}-${width}-${name}.png`, fullPage: true });
        // No horizontal page scroll allowed.
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (overflow > 1) console.log(`OVERFLOW ${scheme} ${width} ${p}: ${overflow}px`);
      }
      await ctx.close();
    });
  }
}
