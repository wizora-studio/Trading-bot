<!-- Generated from docs/specs/MASTER_PROMPT.md lines 783-811. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

PHASE 8 — TECHNICAL ARCHITECTURE & DATABASE DESIGN
Follow Section 3C (Engineering Quality Standards) and Section 3B (Agent-Independent Working Protocol) in every part of this phase.
Verify and use a clean, modern, production-grade stack. Re-verify every version and recommendation from official sources at build time and record the result in `docs/DECISIONS.md`.
- Framework: Next.js (App Router, latest stable major — the 16.x line as of late 2026; the 15.x line is reaching end of support) + TypeScript (`strict: true`).
- Styling & UI: Tailwind CSS (current major) + shadcn/ui + Lucide Icons.
- Charts: Recharts or Lightweight Charts (by TradingView) for financial equity curves and distributions.
- State & Data Fetching: React Server Components + Server Actions / Route Handlers + TanStack Query (where client caching is needed) + Zustand (minimal UI state only).
- Forms & Validation: React Hook Form + Zod (shared schemas between client and server).
- Math & Dates: `decimal.js` for financial arithmetic, `date-fns` / `date-fns-tz` for strict timezone handling.
- Database & ORM: PostgreSQL + Prisma ORM (current major).
- Auth: Note that Auth.js (NextAuth) is now maintained by the Better Auth team in security-patch-only mode, and its maintainers recommend Better Auth for new projects. Evaluate Better Auth, Clerk, and Supabase Auth; do not start a new project on Auth.js without a strong reason. Always verify sessions on the server, not only in middleware.
- Billing: Abstracted Payment Provider interface. Choose the provider based on the Phase 2 verification of what a Pakistan-based founder can actually onboard with and get paid out from (Paddle, Lemon Squeezy, Stripe Managed Payments, Stripe, or another Merchant of Record).
- AI SDK: Vercel AI SDK or official provider SDK behind a clean adapter interface (supporting multiple model providers interchangeably), with model versions pinned.
- Background Jobs: a job/queue system (e.g., Inngest, Trigger.dev, or pg-boss) for imports, analytics snapshots, AI reports, and Monte Carlo runs, because serverless functions have time limits.
- File Storage: S3-compatible object storage (e.g., Cloudflare R2) for screenshots, with signed URLs, size limits, and image re-encoding to strip metadata (EXIF).
- Rate limiting & cache: a managed Redis-compatible store or database-based limiter.
- Hosting: choose a region close to target users; use connection pooling for serverless Postgres; give a free-tier vs paid cost estimate.
- Observability: error tracking (e.g., Sentry), structured logging, uptime monitoring, and privacy-friendly product analytics.
- Environments: local (Docker Postgres), preview, staging, and production. Use `prisma migrate` (never `db push` in production), seed scripts, automated backups with point-in-time recovery, and a tested restore procedure.
- CI/CD: GitHub Actions running typecheck, lint, unit tests, build, and E2E tests on every pull request; branch protection; automated dependency updates; conventional commit messages.
- Feature flags for releasing risky features gradually.
- Testing: Vitest for unit/math tests + Playwright for E2E tests.

Database Schema Principles:
- Design clean Prisma models for `User`, `TradingAccount` (with `accountType`: NORMAL / FUNDED / BACKTEST), `FundedAccountConfig`, `RiskRuleConfig`, `RuleSetVersion` (versioned, user-confirmed rules), `RuleIntakeSession` (raw user text, parsed draft, open questions, confirmation status), `AccountLifecycleEvent`, `ImportBatch`, `Trade`, `TradeExecution` (for partial fills), `InstrumentSpec`, `SymbolAlias`, `FxRate`, `Strategy`, `StrategyVersion`, `StrategyRule`, `StrategySource` (video URLs and timestamps), `TradeStrategyAssignment`, `StrategyChecklistResponse`, `TradeTag`, `JournalEntry`, `AnalyticsSnapshot`, `AiReport`, `AiUsage`, `TraderProfile`, `TradePlan` (planned trades from the Trade Plan Builder, linked to executed trades), `RiskModelConfig` (versioned Risk Model presets), and `AuditLog`.
- Clearly separate MVP essential tables from Phase 2 tables so the initial schema stays lean and maintainable.
- Enforce multi-tenant isolation (`userId` indexed and checked on every query), with a second layer such as a Prisma client extension that injects the user filter automatically or PostgreSQL Row-Level Security.
- Use database transactions for imports and rollbacks.
