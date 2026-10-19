# Risk register

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| RK-01 | MVP scope is too large for one beginner developer, so nothing ships. | High | High | Split into V1-private and V1-beta cuts (OPEN_QUESTIONS C2); one small ticket at a time. | Founder + agent |
| RK-02 | Money math errors (floating point, wrong pip values, wrong contract sizes). | Medium | High | decimal.js, Instrument Specification Registry, hand-calculated golden tests, differential tests. | Agent |
| RK-03 | Prop-firm rules change or are misunderstood, so the app shows "compliant" when the trader is not. | Medium | High | Versioned presets with source URL + verified date, Read-Back, honesty states (UNVERIFIABLE_FROM_CSV, RULE_UNCONFIRMED). | Agent |
| RK-04 | TradingView export format changes or lacks fields (SL/TP, commissions). | Medium | Medium | Verify format in Phase 2; Data Quality Score; manual SL entry. | Agent |
| RK-05 | Product is seen as financial advice or signals. | Low | High | Scope guard, disclaimers, no "best strategy" badges. | Agent |
| RK-06 | Running costs grow beyond a student budget. | Medium | Medium | Free tiers first; ask before any paid service (Section 0). | Founder |
| RK-07 | Small samples (beginner with few trades) produce misleading conclusions. | High | Medium | Confidence badges from one Phase 5 framework on every number. | Agent |
| RK-08 | Strategy data from AI-generated documents or videos contains errors or prompt-injection text. | Medium | Medium | Treat as data, Read-Back, schema validation, UNVERIFIED claims. | Agent |
