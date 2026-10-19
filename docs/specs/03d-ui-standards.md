<!-- Generated from docs/specs/MASTER_PROMPT.md lines 222-236. Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->

3D. UI QUALITY STANDARDS (the interface must look professional, calm, and trustworthy)
- Visual reference: the file `dashboard-preview.html` (which I will provide) is the starting point for look and feel. Keep its direction and improve it.
- Palette: only black, white, and blue plus their shades (Phase 9 color rules). Profit/loss meaning comes from signs, arrows, labels, and patterns, never from color alone.
- Design tokens in ONE file (colors, spacing on a 4px base scale, radius scale, font sizes, line heights, shadows). Tailwind and shadcn/ui read from these tokens.
- Typography: one well-crafted sans-serif family with tabular figures (the preview uses IBM Plex Sans; verify the license and pick finally in DECISIONS.md). All numbers use tabular figures.
- Layout: every page uses the same template (PageHeader, optional FilterBar, content). Desktop has a left sidebar; mobile has a bottom navigation bar. Consistent spacing and alignment everywhere. Minimum touch target of 44px on mobile.
- Every page and component has all states designed: loading (skeleton), empty (with a clear next action), error (what went wrong and how to fix it), success feedback (toast), and confirmation dialogs for destructive actions.
- Forms: inline validation messages in simple bilingual language, sensible defaults, and keyboard-friendly.
- Charts: one shared ChartFrame with titles, axis labels, tooltips, and a data-table alternative.
- Copy: simple words, sentence case, and every trading term has a tooltip (English + Roman Urdu).
- Motion: subtle and purposeful only, and fully respects reduced-motion settings.
- Component gallery: a `/dev/components` page (development only) shows every shared component in every state, in both themes, so consistency can be checked at a glance.
- UI quality gate (required before any UI ticket is "done"): take Playwright screenshots of every changed page at 375px, 768px, and 1280px widths in light and dark themes. Review them against this checklist: alignment, spacing, contrast, overflow, cut-off text, consistent components, and correct profit/loss encoding. Fix all issues before finishing.
- Performance budget: fast first load on a mid-range phone (target LCP under 2.5 seconds) and no layout shift.
