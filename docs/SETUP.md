# Setup guide (English + Roman Urdu)

The app is a website that runs completely in your browser. Your trades stay on your device. **No account, no API key, no monthly cost** is needed for Version 1.

Yeh app aik website hai jo poori tarah aap ke browser mein chalti hai. Aap ki trades aap ke device par rehti hain. Version 1 ke liye **na koi account, na koi API key, na koi mahana kharcha** chahiye.

---

## Option A — Run it on your computer (once)

1. **Install Node.js 22 (LTS)** from <https://nodejs.org> → "Download Node.js (LTS)" → install with default options.
   *Roman Urdu:* nodejs.org se Node.js 22 (LTS) download karein aur "Next, Next, Install" se install karein.
2. **Install Git** from <https://git-scm.com/downloads> (default options).
3. Open **Terminal** (Mac) or **PowerShell** (Windows) and run these commands one by one:

   ```bash
   git clone https://github.com/wizora-studio/trading-bot.git
   cd trading-bot
   git checkout ccr-578f2b0f-c7k0vv
   npm install
   npm run dev
   ```
4. Open <http://localhost:3000> in Chrome. Click **"Load sample data"** to explore, or create your own account.
   *Roman Urdu:* Chrome mein localhost:3000 kholein. Dekhne ke liye "Load sample data" dabayein, ya apna account banayein.

If a command fails, copy the full red error text and send it to your AI agent (never send passwords or keys).
*Agar koi command fail ho, poora laal error text copy kar ke apne AI agent ko bhejein (password ya keys kabhi nahi).*

## Option B — Put it online for free (use it on your phone too)

Because the app is a static website, any free static host works. Easiest: **Vercel**.

1. Go to <https://vercel.com> → **Sign up with GitHub** (free "Hobby" plan).
2. **Add New → Project** → choose the `trading-bot` repository → **Import**.
3. Framework is detected as **Next.js**. Leave everything as is and press **Deploy**.
4. After about 1 minute you get a link like `https://trading-bot-xxxx.vercel.app`. Open it on your phone and laptop.

*Roman Urdu:* vercel.com par GitHub se sign up karein (free), "Add New → Project" mein `trading-bot` chunein aur "Deploy" dabayein. Ek minute mein aap ko link mil jaye ga jo phone aur laptop dono par chalega.

**Important:** data is saved per browser. Data on your laptop is NOT automatically on your phone. Use **Settings → Export backup** and **Restore backup** to move it.
*Ahem: data har browser mein alag save hota hai. Laptop ka data phone par khud nahi aata. Settings → Export backup / Restore backup se le jayein.*

## Daily routine (about 1 minute)
1. After your session, in TradingView: Trading Panel → **Account History** → ⋯ → **Export data**.
2. In the app: **Import** → choose the file → check the timezone → **Import**.
3. Open **Trades**, add the stop-loss for trades that show "Needs stop-loss", tick the strategy checklist.
4. Write a short review in **Daily journal**.

## Commands for developers / AI agents
| Purpose | Command |
|---|---|
| Install | `npm install` (uses `.npmrc` `legacy-peer-deps=true`, see DECISIONS D-012) |
| Dev server | `npm run dev` |
| Typecheck / lint / unit tests | `npm run typecheck` · `npm run lint` · `npm test` |
| Build static site to `out/` | `npm run build` |
| Serve the build | `npm start` (needs Python 3) |
| E2E tests (after build) | `npm run e2e` |
| UI screenshots 375/768/1280 light+dark | `npm run screens` → `test-results/screens/` |
| Everything before a commit | `npm run check` |
