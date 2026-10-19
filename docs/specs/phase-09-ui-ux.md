<!-- Generated from docs/specs/MASTER_PROMPT.md lines 812-835. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

PHASE 9 — USER INTERFACE (UI) AND USER EXPERIENCE (UX)
Follow Section 3D (UI Quality Standards). The UI must look professional, calm, and trustworthy on every screen size.
Design a high-trust, institutional-grade dark/light interface tailored for serious traders:
- Zero clutter, high readability, monospace tabular numbers (`tabular-nums`) for all prices, P&L, and percentages.
- Color Palette (founder's current decision): use ONLY three colors — Black, White, and Blue — plus their shades (grays made from black and white; lighter and darker blues). Do not use green, red, amber, or any other color for now.
  - Dark theme: black / near-black background, white text, blue accents. Light theme: white background, black text, blue accents.
  - Blue is used for primary buttons, links, active and selected states, and key highlights.
  - Because green and red are not used, meaning must come from signs, icons, labels, and styles, never from color alone:
    - Profit: "+" sign with an up-arrow icon, in blue.
    - Loss: "−" sign with a down-arrow icon, in black (light theme) or white (dark theme).
    - Violation: solid badge with a clear text label (e.g., "VIOLATION") and an icon.
    - Warning / low sample / data quality: outlined badge with a text label (e.g., "WARNING", "LOW SAMPLE").
    - Secondary metadata: gray.
  - Charts: profit bars solid blue; loss bars gray or outlined/hatched; equity curve in blue; drawdown area in gray.
  - Define every color as a design token (CSS variables / Tailwind theme) in ONE file, so the palette can be changed later with minimal edits.
  - Check contrast ratios for WCAG 2.2 AA in both themes.
- Every view must implement Loading Skeletons, Helpful Empty States (with 1-click "Load Sample Funded Account Data" for new users), Error Boundaries, and Mobile/Desktop responsiveness.
- Onboarding wizard that starts with "Normal account or Funded account?"
- Rule Intake UI: a free-text box (and optional chat-style flow) for writing rules, grouped follow-up questions with tappable options, and a Read-Back card showing "Here is what I understood" with per-rule status badges (CLEAR / ASSUMED / AMBIGUOUS / MISSING), Edit buttons, and one final Confirm button.
- Strategies Page UI (see Phase 3, E9): card grid with selection checkboxes at the top and the Strategy Details panel opening below, plus compare mode. Strategy Library UI: strategy cards, "Import Strategy Spec" paste box with validation errors, a Strategy Read-Back screen with per-rule status badges and clickable video timestamps, a strategy picker in the Trade Drawer and Trade Explorer (bulk), and a per-trade checklist panel.
- Language toggle (English / Roman Urdu).
- Accessibility: WCAG 2.2 AA, full keyboard navigation, reduced-motion support, and a data-table alternative for every chart.
- Printable / PDF report layout.
