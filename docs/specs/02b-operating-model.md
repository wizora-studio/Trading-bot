<!-- Generated from docs/specs/MASTER_PROMPT.md lines 107-119. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

2B. PRODUCT OPERATING MODEL (how the app actually works — keep it simple and honest)
- Two different things must never be confused:
  1. The BUILDER: you, the AI agent reading this prompt. You research, design, and write the code. Research (Phase 2) is done by you during development, using web search and official documentation.
  2. The PRODUCT: a web application (a website that also works on mobile) that traders log into, plus, in a later stage, an optional companion Chrome extension called the Research Assistant (Phase 3, Module L). The web app itself does not browse the internet. Neither the web app nor the extension ever places, modifies, or closes trades.
- How data gets into the product:
  - Trade history: the trader exports a file from their platform (Version 1: TradingView Paper Trading CSV) and uploads it, or enters trades manually. Typical routine: after each session or at the end of the day, export → upload (about one minute).
  - Rules: entered once per account through the Rule Intake & Read-Back flow, edited only when they change.
  - Strategies: added once (manually or by pasting a Gemini Strategy Spec), edited only when they change.
  - Journal notes, tags, and screenshots: added by the trader.
- What the product does with that data: deterministic calculations, dashboards, rule checks, strategy adherence, and (when enabled) AI explanations of the already-calculated results.
- Honest limitation of Version 1: the app analyzes trades after they are uploaded. It cannot watch open trades live or warn the trader in the middle of a trade. (Live market charts are available on the Charts page, but the trader's own open trades only become live in Module M, Level 3.) Live monitoring needs official broker/platform sync (a later stage) and must never rely on scraping or browser automation that breaks a platform's terms of service.
- Future options (research first): official broker/platform API sync, and the Research Assistant Chrome extension (Module L), which must follow all of its safety rules.
