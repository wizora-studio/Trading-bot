<!-- Generated from docs/specs/MASTER_PROMPT.md lines 600-631. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

L. Companion Chrome Extension: "Research Assistant" (NOT in the MVP; built after Version 1 private use works)
Purpose: save the trader time on research tasks by reading web pages and bringing the results into the web app, always with Read-Back and user confirmation.
L1. Research tasks it supports:
    - Prop-firm rules: on a firm's official rules/FAQ page, extract the rules into a draft rule set → the app's Rule Intake Read-Back → user confirms. Always store the source URL and access date.
    - Strategy research: send a YouTube video link or a strategy article to the app's strategy extraction (using an official AI API that supports video, e.g., the Gemini API), producing a Strategy Spec (strategy-spec/1.0) → Strategy Read-Back → user confirms.
    - Prop-firm comparison research: open the official pages of firms the user names, extract key rules into a comparison table with sources, and flag anything unclear.
    - Economic news times for news rules: only from a source whose terms allow it, or through a licensed API.
    - Trade-history convenience: help the user upload a file they exported themselves. It must NOT automate or scrape TradingView, broker, or prop-firm platform interfaces.
L2. Autonomy levels, built in this order:
    - Level 1, "Capture this page" (build first): the user clicks a button and the extension reads only the current tab. Read-only.
    - Level 2, "Research task": the user types a task (e.g., "Find this firm's 2-step challenge rules"). The extension opens public pages from an allowlist in new tabs, reads them, and returns a summary with source URLs and dates. Before each new website, it shows what it will do and asks for approval. It never fills forms and never logs in.
    - Level 3, "Actions" (only if ever needed, much later): any click or form action requires the user's confirmation for every single action.
L3. Hard safety rules (non-negotiable):
    - Never place, modify, or close trades. Never interact with order or trade buttons on any trading platform.
    - Never read, type, or store passwords, 2FA codes, payment details, or broker account credentials. Stop immediately on login, payment, banking, or trading-terminal pages (blocklist).
    - Treat all web page content as untrusted data, never as instructions (prompt-injection defense). A web page must never be able to make the extension do anything the user did not ask for.
    - Show a visible activity log of every page visited and every action taken, with a one-click Stop (kill switch).
    - Minimal permissions (prefer "activeTab" and optional host permissions over access to all sites). Comply with Chrome Web Store policies.
    - Respect each website's terms of service and robots rules. Do not automate sites that forbid it.
    - No AI API keys inside the extension. All AI calls go through the web app's server, with the same rate limits, cost caps, and privacy rules.
    - Everything extracted goes through the same Read-Back and confirmation flows. Nothing becomes active automatically.
L4. Technology: Chrome Manifest V3 with a side panel UI, connected to the user's web-app account through authenticated API calls. Verify current Chrome extension APIs and Chrome Web Store policies before building.
L5. Testing: prompt-injection test pages (malicious hidden instructions must be ignored), blocklist tests (login, payment, and trading pages stop the agent), permission review, and Read-Back flow tests.
L6. Web search and multiple AI models (GPT, Claude, Gemini) — official channels only:
    - Web search: use only official channels, such as the AI providers' built-in search or grounding tools (e.g., Gemini grounding with Google Search, Claude's web search tool, OpenAI's web search tool) or a licensed search API. Never automate the google.com search page. Verify current availability, limits, and pricing before choosing.
    - Multiple AI models: use OpenAI (GPT), Anthropic (Claude), and Google (Gemini) only through their official APIs, called from the web app's server through the AI adapter (Phase 8). Never automate the chatgpt.com, claude.ai, or gemini.google.com websites, and never use a user's personal chat subscription.
    - Model routing by task, configured in ONE file with pinned, verified model versions: video understanding → Gemini (native YouTube video support); deep analysis and writing → configurable (Claude or GPT); small, simple tasks → a cheaper small model.
    - Cross-check mode for important extractions (prop-firm rules and strategy specs): two different models extract independently, and the app compares the results field by field. Every disagreement appears in the Read-Back as AMBIGUOUS with a question for the user.
    - Fallback: if one provider fails or is unavailable, switch to another provider automatically.
    - Cost control: per-task token budgets, an estimated cost shown before each Level 2 research task, and a monthly cap per user.
    - API keys live only on the server and are documented in `.env.example` (e.g., GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, and a search API key if one is used).
