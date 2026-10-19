GEMINI STRATEGY EXTRACTION PROMPT v1.0
(Schema: strategy-spec/1.0, linked to MASTER PROMPT v2.1)

=====================================================================
ISTEMAL KA TAREEQA (sirf aap ke liye, yeh hissa Gemini ko copy na karein)
=====================================================================
1. Behtareen nateeja Google AI Studio mein Gemini Pro model se milega. Gemini app bhi chalega.
2. Ek waqt mein sirf EK video dein. Video public honi chahiye.
3. Neeche "COPY FROM HERE" se le kar "END OF PROMPT" tak poora text copy karein, aur VIDEO LINK ki jagah apna link paste karein.
4. Jawab aane ke baad, isi chat mein neeche wala "VERIFY PROMPT" bhejein. Is se Gemini apni ghaltiyan khud pakdega.
5. Ek hi strategy ki kai videos hon, to har video alag chalayein, phir "MERGE PROMPT" se sab ko jodein.
6. Final jawab ka Section 19 (JSON) apne app ke "Import Strategy Spec" mein paste karein, ya poora jawab agent ko dein.
7. Agar Section 0 mein "ACCESS FAILED" ya "AUDIO_OR_TRANSCRIPT_ONLY" aaye, to samajh lein ke Gemini ne chart nahi dekha. Aise jawab par poora bharosa na karein.

=====================================================================
COPY FROM HERE
=====================================================================

ROLE
You are a senior trading strategy analyst and technical writer. Watch the YouTube video below and extract the trading strategy it teaches, from A to Z: nothing missing, nothing invented.
Your output will be read by another AI agent that builds a trading analytics app. That agent will turn this strategy into rules, checklists, and automatic checks on real trades. Precision matters more than style.

INPUTS
- VIDEO LINK: [PASTE YOUTUBE LINK HERE]
- (Optional) The name I use for this strategy: [ ]
- (Optional) Instruments I plan to trade with it: [ ]
- (Optional) My broker server timezone: [ ]
- (Optional) Specific questions I have about this video: [ ]

STRICT RULES
1. Access check first. Before anything else, state honestly whether you can actually watch the video frames and hear the audio. If you cannot access the video, stop and write "ACCESS FAILED" with the reason. Never guess the content from the title, description, thumbnail, comments, or your general knowledge of the creator.
2. Extract, do not invent. Only record what the video says or shows.
3. Label the source of every item:
   - STATED: the creator clearly says it.
   - SHOWN_ONLY: visible on the chart or screen, but not said.
   - INFERRED: your interpretation from context. Explain why you inferred it.
   - NOT_STATED: the video does not cover it.
4. Timestamps: every rule, definition, and example must have a timestamp (mm:ss or hh:mm:ss).
5. Exact numbers only. If the creator says "around 20 pips", write "around 20 pips". Never turn a vague statement into a precise number. Unknown numbers are null in the JSON.
6. Separate rules from opinions, motivation, and marketing. Performance claims (win rate, "never lose", income screenshots) go only into the Unverified Creator Claims section.
7. Do not add your own improvements, indicators, or "best practices" into the rules. Your own suggestions go only into the Analyst Notes section, clearly labeled.
8. Objectivity: rate each rule:
   - OBJECTIVE: two traders would always agree (e.g., "enter at the 50% level of the candle").
   - PARTLY_SUBJECTIVE: some judgment needed.
   - SUBJECTIVE: depends on feeling (e.g., "strong momentum").
   For subjective rules, propose a measurable version, labeled as your suggestion.
9. Timezones: record session times and killzones exactly as stated, including the timezone. Convert to UTC only if the timezone is clear, and mention daylight-saving effects. If the timezone is unclear, list it as an ambiguity.
10. Long and short: describe each direction separately, unless the creator explicitly says they are mirror images.
11. If the video teaches more than one setup, split them into Setup A, Setup B, and so on.
12. If the video seems to be one part of a series, say which parts seem to be missing.
13. Language: Sections 0 to 19 in clear, simple English. Section 20 in simple Roman Urdu (Urdu written in the English alphabet).
14. This is documentation of what the video teaches, not financial advice.

OUTPUT FORMAT (use these exact section headings, in this order)

Section 0 — Access Check
- Access mode: FULL (video frames + audio) / AUDIO_OR_TRANSCRIPT_ONLY / ACCESS FAILED
- Video title, channel, length, upload date (if visible), spoken language.
- Did you process the full video? Which parts were unclear (bad audio, small chart, fast scrolling)?

Section 1 — Strategy Summary
Maximum 8 lines: what the strategy is, where and when it is traded, and its core idea.

Section 2 — Strategy Identity
A table with: name (as the creator calls it), style (scalping / intraday / swing / position), methodology family (price action, SMC/ICT, indicator-based, breakout, mean reversion, trend-following, other), markets and instruments, timeframes (bias / setup / entry), sessions and times, typical holding time, typical number of trades per day or week, and the experience level the creator says is needed.

Section 3 — Terms & Definitions
For every trading term the creator uses (e.g., liquidity sweep, order block, fair value gap, break of structure, change of character, supply/demand zone, support/resistance, divergence):
- The definition AS USED IN THIS VIDEO (creators often use the same word differently).
- How to identify it objectively on a chart, step by step.
- Timestamp and source label.

Section 4 — Tools, Indicators & Chart Setup
Every indicator with exact settings (periods, sources, colors only if meaningful), chart type, drawing tools, and any other tools. Unknown settings = NOT_STATED.

Section 5 — Market Context & Filters
Higher-timeframe bias rules. When the strategy should be traded. When NOT to trade (news, ranging markets, low volatility, specific days, wide spreads).

Section 6 — Setup Conditions (Pre-Entry Checklist)
A numbered table: rule ID, condition, timeframe, direction, how to verify it objectively, timestamp, source, objectivity.

Section 7 — Entry Rules
For long and for short: trigger, confirmation, order type (market / limit / stop), exact entry location, entry timeframe, what cancels the setup before entry, and maximum waiting time.

Section 8 — Stop-Loss Rules
Placement, buffer (pips / points / ATR / %), minimum and maximum stop size, and what to do if the stop is too wide (skip the trade? reduce size?).

Section 9 — Take-Profit & Trade Management
Take-profit targets (levels or RR), partial closes (% and when), moving the stop to breakeven (exact condition), trailing stop rules, time-based exits, manual early-exit rules, and adding to positions.

Section 10 — Risk & Money Management
Risk % per trade, position sizing method, maximum trades per day or session, daily loss stop, maximum consecutive losses, correlation/exposure rules, and any prop-firm or funded-account advice given in the video.

Section 11 — Time & News Rules
Sessions and killzones (as stated, plus UTC if the timezone is clear), days to avoid, and news handling (how many minutes before and after).

Section 12 — Complete A-to-Z Execution Flow
Numbered steps from preparation (before the session) → analysis → setup → entry → management → exit → post-trade journaling. Every step references the rule IDs it uses.

Section 13 — Example Trades Shown in the Video
For each example: timestamp, instrument, timeframe, direction, date (if visible), entry / stop-loss / take-profit (if visible), result, RR, rule IDs applied, any rule the creator broke or skipped, and whether it was LIVE, DEMO, BACKTEST, HINDSIGHT explanation, or UNKNOWN.
Also state whether the video shows only winning examples (selection bias).

Section 14 — Unverified Creator Claims
Every claim about win rate, profitability, or results, with timestamp, marked UNVERIFIED.

Section 15 — Ambiguities, Gaps & Contradictions
A numbered list. For each item: the issue, why it matters, a clear question for the trader, and a suggested default (labeled as a suggestion).

Section 16 — Measurability Map (for the analytics app)
For every rule ID, can it be checked automatically from normal trade-history data (open/close time, instrument, direction, lot size, entry/exit price, stop-loss, take-profit, commission, P&L)?
- YES: checkable from trade history alone.
- PARTIAL: needs chart / OHLC market data (e.g., "price swept the previous day's high").
- NO: needs the trader's manual checklist answer (e.g., "the order block was valid").
List the data fields each rule needs.

Section 17 — Pre-Trade Journal Checklist
Short yes/no questions the trader ticks for each trade, each linked to a rule ID. Maximum about 15 questions, practical and clear.

Section 18 — Strategy-Specific Mistake Tags
Short tags and what each means (e.g., "Entered without HTF bias", "Stop not beyond the sweep").

Section 19 — Machine-Readable Strategy Spec (JSON)
Output ONE valid JSON code block that follows this exact schema.
- Where a field shows options like "A | B | C", replace it with exactly ONE of those values.
- Use null for anything unknown. Never invent numbers.
- Rule IDs must match the IDs used in the sections above.
- No comments and no trailing commas inside the JSON.

```json
{
  "schemaVersion": "strategy-spec/1.0",
  "generatedBy": "gemini",
  "source": {
    "videos": [
      {
        "url": "",
        "title": "",
        "channel": "",
        "durationText": "",
        "uploadDate": null,
        "accessMode": "FULL | AUDIO_OR_TRANSCRIPT_ONLY",
        "coverageNotes": ""
      }
    ]
  },
  "strategy": {
    "name": "",
    "aliases": [],
    "summary": "",
    "style": "SCALPING | INTRADAY | SWING | POSITION | OTHER",
    "methodology": [],
    "instruments": [],
    "timeframes": { "bias": [], "setup": [], "entry": [] },
    "typicalHoldingTime": null,
    "typicalTradesPerDay": null
  },
  "terms": [
    {
      "term": "",
      "definition": "",
      "identificationSteps": [],
      "timestamp": "",
      "source": "STATED | SHOWN_ONLY | INFERRED"
    }
  ],
  "indicators": [
    {
      "name": "",
      "settings": {},
      "purpose": "",
      "timestamp": "",
      "source": "STATED | SHOWN_ONLY | INFERRED | NOT_STATED"
    }
  ],
  "sessions": [
    {
      "name": "",
      "startTime": null,
      "endTime": null,
      "timezoneAsStated": null,
      "utcStart": null,
      "utcEnd": null,
      "dstNote": null,
      "timestamp": "",
      "source": "STATED | SHOWN_ONLY | INFERRED | NOT_STATED"
    }
  ],
  "rules": [
    {
      "id": "R1",
      "category": "CONTEXT | SETUP | ENTRY | STOP_LOSS | TAKE_PROFIT | MANAGEMENT | RISK | TIME | NEWS | INVALIDATION | OTHER",
      "direction": "LONG | SHORT | BOTH",
      "setupName": "Setup A",
      "text": "",
      "parameters": {},
      "timestamp": "",
      "source": "STATED | SHOWN_ONLY | INFERRED | NOT_STATED",
      "objectivity": "OBJECTIVE | PARTLY_SUBJECTIVE | SUBJECTIVE",
      "measurableVersionSuggestion": null,
      "measurability": "YES | PARTIAL | NO",
      "requiredData": [],
      "checklistQuestion": ""
    }
  ],
  "risk": {
    "riskPerTradePercent": null,
    "positionSizingMethod": null,
    "maxTradesPerDay": null,
    "dailyLossStop": null,
    "maxConsecutiveLosses": null,
    "minRiskReward": null,
    "notes": ""
  },
  "management": {
    "takeProfitTargets": [],
    "partialCloses": [],
    "breakevenRule": null,
    "trailingRule": null,
    "timeExitRule": null
  },
  "executionFlow": [
    { "step": 1, "description": "", "ruleIds": [] }
  ],
  "examples": [
    {
      "timestamp": "",
      "instrument": null,
      "timeframe": null,
      "direction": null,
      "entry": null,
      "stopLoss": null,
      "takeProfit": null,
      "result": null,
      "riskReward": null,
      "ruleIdsApplied": [],
      "rulesBroken": [],
      "context": "LIVE | DEMO | BACKTEST | HINDSIGHT | UNKNOWN"
    }
  ],
  "checklist": [
    { "ruleId": "", "question": "" }
  ],
  "mistakeTags": [
    { "tag": "", "meaning": "" }
  ],
  "creatorClaims": [
    { "claim": "", "timestamp": "", "status": "UNVERIFIED" }
  ],
  "ambiguities": [
    {
      "id": "A1",
      "issue": "",
      "whyItMatters": "",
      "questionForTrader": "",
      "suggestedDefault": null
    }
  ],
  "analystNotes": []
}
```

Section 20 — Roman Urdu Explanation (A to Z)
Explain the full strategy in simple Roman Urdu: what it is, when to trade it, how to find the setup, entry, stop-loss, take-profit, trade management, risk rules, common mistakes, and what is unclear or missing in the video. You may use English trading terms, but explain each one in simple words.

Section 21 — Analyst Notes (optional)
Your own observations, clearly labeled as YOUR suggestions and not part of the strategy: risks of this strategy, missing pieces, and how to test it fairly (for example, how many trades are needed before trusting the results).

FINAL SELF-CHECK (do this silently before answering)
- Every rule has a timestamp and a source label.
- No number is invented; unknowns are null or NOT_STATED.
- Long and short are both covered.
- The JSON is valid and its rule IDs match the sections.
- All creator claims are marked UNVERIFIED.
- Every ambiguity has a clear question for the trader.

=====================================================================
END OF PROMPT
=====================================================================


=====================================================================
VERIFY PROMPT (pehle jawab ke baad isi chat mein bhejein)
=====================================================================
Now go through the video again and audit your own answer:
1. List every rule, number, or timestamp that is wrong, missing, or not supported by the video.
2. List any rule you marked STATED that is actually SHOWN_ONLY or INFERRED.
3. List anything important the video teaches that you missed.
Then output the corrected Section 15 (Ambiguities) and the complete corrected Section 19 (JSON). If nothing needs correction, say so clearly.


=====================================================================
MERGE PROMPT (ek strategy ki kai videos ho jayein to)
=====================================================================
Below are several strategy specs, each extracted from a different video of the SAME strategy.
Merge them into ONE spec using exactly the same output format (Sections 0 to 21) and the same JSON schema (strategy-spec/1.0).
Rules for merging:
- Keep every rule's original video URL and timestamp. The "source.videos" list must contain all videos.
- When videos disagree, do NOT choose one. Add the conflict to Section 15 (Ambiguities) with both versions and a question for the trader.
- Do not add any new rules that none of the videos contain.
- Re-number rule IDs if needed, and keep them consistent everywhere.

[PASTE ALL SPECS HERE]
