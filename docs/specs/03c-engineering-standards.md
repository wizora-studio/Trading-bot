<!-- Generated from docs/specs/MASTER_PROMPT.md lines 189-221. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

3C. ENGINEERING QUALITY STANDARDS (the code must be clean, consistent, reusable, and well-tested)
Language and types:
- TypeScript `strict: true`. No `any` (use `unknown` plus Zod parsing). No `@ts-ignore` or `eslint-disable` without a comment explaining why and a linked ticket.
- Zod validates every boundary: forms, server actions, route handlers, file imports, AI outputs, environment variables, and database JSON fields.
Architecture and folders:
- `src/app/` routes only (thin pages). `src/features/<feature>/` holds that feature's components, server code, schemas, hooks, and tests. `src/components/ui/` holds design-system primitives (shadcn/ui, customized once to our tokens). `src/components/shared/` holds reusable composites. `src/services/analytics/` is the pure math engine with no framework imports. `src/server/` holds database, auth, AI adapters, and jobs. `src/config/` holds design tokens, thresholds, model routing, and constants.
- Business logic never lives inside UI components. Money and trading math lives only in `src/services/analytics/` as pure functions with tests.
Reusable components (build once, use everywhere):
- Required shared components include: PageHeader, FilterBar, KpiStat, MoneyText, PercentText, RMultipleText, ConfidenceBadge, StatusBadge, RuleMeter, DataTable (sortable, paginated, virtualized for large lists), ChartFrame, EmptyState, ErrorState, LoadingSkeleton, ConfirmDialog, ReadBackCard, ChecklistPanel, TradeTicket, and FormField wrappers.
- Before creating any component, search for an existing one. When similar UI appears a second time, extract it into a shared component.
- All numbers are formatted only through shared formatters (MoneyText, PercentText, RMultipleText). No inline number formatting anywhere.
- All colors, spacing, radii, and font sizes come only from design tokens. No hardcoded hex values or one-off sizes in components.
- No hardcoded user-facing text: all copy lives in i18n dictionaries (English and Roman Urdu).
Code style:
- Small functions with clear names. Split files that grow beyond about 300 lines.
- Every exported function has a short doc comment explaining what it does and why, written so a beginner can understand it.
- Errors are never swallowed. Users see friendly bilingual messages that explain how to fix the problem. Logs carry context but never secrets or personal data.
- Every server action and route handler starts with authorization: `requireUser()` and an ownership check such as `assertOwnsAccount()`.
- Database: Prisma migrations only, transactions for multi-step writes, indexes on every filtered column, no N+1 queries.
Tooling and gates:
- ESLint (Next.js, typescript-eslint strict, jsx-a11y, import ordering), Prettier, pre-commit hooks (lint-staged), and conventional commit messages.
- CI on every change: typecheck, lint, unit tests, build, and E2E tests. Nothing merges with a red check.
- Dependencies: few, popular, actively maintained, license-checked, and pinned. No abandoned packages.
- Performance: React Server Components by default; client components only where interaction is needed; pagination and virtualization for large tables; heavy work in background jobs or Web Workers.
Self-review checklist (run before saying a ticket is done):
- Typecheck, lint, tests, and build all pass.
- No console errors or warnings in the browser.
- Mobile and desktop screenshots reviewed in light and dark themes (Section 3D).
- Accessibility check passed.
- No duplicated logic or one-off components that should be shared.
- Docs and tracking files updated.
Honesty: "zero mistakes" is the goal, but no code is perfect on the first try. The safety net is tests, CI, screenshots, and reviews. Report any known weakness instead of hiding it.
