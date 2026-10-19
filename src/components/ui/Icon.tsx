/** Small inline icon set (no icon library needed). Icons are decorative unless a label is given. */
const PATHS = {
  dashboard: '<path d="M3 13h7V3H3zM14 21h7V11h-7zM3 21h7v-5H3zM14 7h7V3h-7z"/>',
  trades: '<path d="M4 6h16M4 12h16M4 18h10" stroke-linecap="round"/>',
  strategies: '<path d="M12 3l8 4-8 4-8-4zM4 12l8 4 8-4M4 17l8 4 8-4" stroke-linejoin="round"/>',
  funded: '<path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z" stroke-linejoin="round"/>',
  rules: '<path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" stroke-linecap="round"/>',
  journal: '<path d="M6 3h11a2 2 0 012 2v16H8a2 2 0 01-2-2zM6 19a2 2 0 012-2h11"/>',
  tools: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2" stroke-linecap="round"/>',
  import: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16" stroke-linecap="round" stroke-linejoin="round"/>',
  learn: '<path d="M2 8l10-5 10 5-10 5zM6 10v5c3 3 9 3 12 0v-5" stroke-linejoin="round"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" stroke-linecap="round"/>',
  more: '<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>',
  chart: '<path d="M3 3v18h18" stroke-linecap="round"/><path d="M7 15l4-4 3 3 5-6" stroke-linecap="round" stroke-linejoin="round"/>',
  room: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4" stroke-linecap="round"/>',
  planner: '<path d="M9 4h6M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2" /><path d="M8 12l3 3 5-6" stroke-linecap="round" stroke-linejoin="round"/>',
  accounts: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.5a3.5 3.5 0 010 7M18.5 14.8c1.6.8 2.6 2.6 3 5.2" stroke-linecap="round"/>',
  up: '<path d="M8 3l5 6H9.5v4h-3V9H3z" fill="currentColor" stroke="none"/>',
  down: '<path d="M8 13L3 7h3.5V3h3v4H13z" fill="currentColor" stroke="none"/>',
  close: '<path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/>',
  check: '<path d="M5 12l5 5 9-10" stroke-linecap="round" stroke-linejoin="round"/>',
  alert: '<path d="M12 3l10 18H2z" stroke-linejoin="round"/><path d="M12 10v5M12 18v.5" stroke-linecap="round"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5" stroke-linecap="round"/>',
  plus: '<path d="M12 5v14M5 12h14" stroke-linecap="round"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" stroke-linejoin="round"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z" stroke-linejoin="round"/>',
  undo: '<path d="M9 14L4 9l5-5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 9h11a5 5 0 010 10h-3" stroke-linecap="round"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M4 20h16" stroke-linecap="round" stroke-linejoin="round"/>',
  play: '<path d="M7 4l12 8-12 8z" stroke-linejoin="round"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke-linecap="round"/>',
  moon: '<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" stroke-linejoin="round"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
  shield: '<path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-1 .7-1.5 1.2-1.5 2.5M12 17v.5" stroke-linecap="round"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18, label, className }: { name: IconName; size?: number; label?: string; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={name === "up" || name === "down" ? "0 0 16 16" : "0 0 24 24"}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={`shrink-0 ${className ?? ""}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: (label ? `<title>${label.replace(/[<>&]/g, "")}</title>` : "") + PATHS[name] }}
    />
  );
}
