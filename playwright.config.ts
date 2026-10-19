import { defineConfig } from "@playwright/test";

/** E2E + screenshot checks against the static build in ./out (run `npm run build` first). */
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  retries: 0,
  use: { baseURL: "http://127.0.0.1:4173", launchOptions: { executablePath: process.env.PW_CHROMIUM ?? undefined } },
  webServer: { command: "python3 -m http.server 4173 --bind 127.0.0.1 --directory out", url: "http://127.0.0.1:4173", reuseExistingServer: true },
});
