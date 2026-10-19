<!-- Generated from docs/specs/MASTER_PROMPT.md lines 742-767. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

PHASE 6 — AI ANALYSIS ENGINE & GUARDRAILS
Design the AI Analyst layer on top of the verified mathematical engine.
- Architecture: The AI receives a strictly typed, pre-computed JSON summary of verified metrics, statistical confidence flags, rule compliance summaries, and anonymized trade aggregates—never raw unrestricted database access.
- Capabilities:
  1. Automated Executive Performance Debrief (Weekly/Monthly/Custom Period).
  2. Evidence-Based Weakness & Leak Detector (e.g., "Your London session EURUSD trades have a +1.4R expectancy across 42 trades, whereas your New York late-session XAUUSD trades have a -0.8R expectancy and account for 78% of your rule violations").
  3. Funded-Account Survival Coach (explaining current drawdown headroom, consistency rule math, and safe position sizing to avoid blowing the account).
  4. Interactive Q&A Assistant backed by deterministic tool-calling / pre-computed query functions.
  5. Rule Intake Parser: converts the user's free-text funded-account or personal rules into a draft structured configuration (Zod-validated), plus a list of follow-up questions. The draft is never active until the user confirms it through the Read-Back Screen (Phase 3, Module G).
  6. Strategy Spec Reviewer: explains an imported strategy spec in simple English and Roman Urdu, points out gaps, contradictions, and subjective rules, and proposes measurable versions of subjective rules clearly labeled as suggestions. It must never add rules the video did not contain, and its output also goes through the Strategy Read-Back confirmation (Phase 3, E3).
- Mandatory Output Structure (enforced via Zod structured output schemas):
  - `finding`: Clear statement in English and Roman Urdu.
  - `evidence`: Exact numbers from the deterministic engine.
  - `sampleSize` & `dateRange`: e.g., `n = 38 trades (2026-09-01 to 2026-10-15)`.
  - `confidenceLevel`: taken from the Phase 5 Statistical Confidence Framework (never invented by the AI).
  - `alternativeExplanations`: Objective caveats (e.g., outlier influence, market regime).
  - `testableHypothesis`: A concrete, rule-based adjustment the trader can test next week.
- Number-Grounding Validator: After every AI response, code must check that every number in the output exists in (or is a documented rounding of) the input JSON. If not, reject and regenerate, or fall back to a non-AI template.
- Multiple-comparison control in the Leak Detector: enforce a minimum segment size, report how many segments were tested, and apply a correction (e.g., Benjamini-Hochberg). Segments that fail are not presented as findings.
- Scope guard: The AI must refuse to predict prices, give buy/sell signals, or recommend specific prop firms to buy. It only analyzes past evidence.
- Security & Cost Controls:
  - Prompt-injection sanitization: Treat all user trade notes, tags, rule text, and CSV text fields as untrusted user input, isolating them in delimited data blocks.
  - Server-side rate limiting, response caching (don't re-run AI if no new trades were imported), token budget caps per user per plan, cost tracking per request, and clean fallback UI if the AI API is unreachable.
- Privacy: Send the minimum data needed. Never send names, emails, or broker account numbers. Verify each AI provider's data-retention settings. Give users a clear opt-in/opt-out for AI features. Label all AI-generated content as AI-generated.
- AI Evaluation (Evals): Maintain a golden set of test datasets with expected findings and expected rule-intake outputs. Re-run evals whenever the prompt or model changes. Include a Roman Urdu quality checklist. Store the prompt version, model ID, and engine version with every AI report.
