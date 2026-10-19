<!-- Generated from docs/specs/MASTER_PROMPT.md lines 836-850. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

PHASE 10 — SECURITY, PRIVACY, AND COMPLIANCE
Implement defense-in-depth security:
- Strict server-side authorization on every API route and Server Action (never trust client-passed `userId` or `accountId` without verifying ownership).
- Auth hardening: email verification, optional two-factor authentication (TOTP or passkeys), login rate limiting, bot protection on sign-up, and session revocation.
- CSV/XLSX upload hardening: file size limits, MIME/extension checks, CSV formula injection sanitization (stripping leading `=`, `+`, `-`, `@` in exported/displayed cells), row count caps per upload, and decompression limits (XLSX files are ZIP archives, so protect against "zip bombs"). Choose a maintained spreadsheet parsing library and check its security advisories before use.
- Security headers (including a Content Security Policy), an OWASP Top 10 / ASVS checklist, and automated dependency vulnerability scanning.
- Encryption in transit and at rest, secrets management, and key rotation.
- Environment variable validation at startup using Zod (`env.ts`) so secrets never leak to the client bundle.
- Audit log for security-relevant events.
- Data retention policy and a full deletion workflow, including when deleted data disappears from backups.
- Legal documents: Terms of Service, Privacy Policy, Cookie notice, AI disclosure, Refund Policy, and a list of subprocessors (hosting, database, AI provider, payment provider, email).
- Regulatory map (verify current status at build time): Pakistan currently relies on PECA 2016 (as amended) and has a Personal Data Protection Bill that was not enacted as of 2026 — monitor it; GDPR for EU users; UK GDPR; Saudi Arabia's PDPL; UAE; India's DPDP Act. Decide cookie consent and data residency based on the target markets.
- Marketing compliance: no profit or pass-rate promises; disclose any prop-firm affiliate relationships; keep the analytics independent from affiliate incentives.
- Prominent financial disclaimer across reports and landing pages: Educational and analytical tool only; not financial or investment advice.
