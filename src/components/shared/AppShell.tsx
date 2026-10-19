"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Dialog, Select } from "@/components/ui/primitives";
import { type DictKey, useT } from "@/i18n";
import { ensureSeedStrategies, selectAccount } from "@/store/actions";
import { useApp } from "@/store/appStore";
import { useSelectedAccount } from "@/store/hooks";
import { LoadingSkeleton } from "./blocks";
import { Toaster } from "./toast";
import { useSystemDark } from "./useSystemDark";

interface NavItem {
  href: string;
  key: DictKey;
  icon: IconName;
  fundedOnly?: boolean;
}

const NAV: NavItem[] = [
  { href: "/", key: "nav_dashboard", icon: "dashboard" },
  { href: "/trades/", key: "nav_trades", icon: "trades" },
  { href: "/strategies/", key: "nav_strategies", icon: "strategies" },
  { href: "/funded/", key: "nav_funded", icon: "funded", fundedOnly: true },
  { href: "/rules/", key: "nav_rules", icon: "rules" },
  { href: "/room/", key: "nav_room", icon: "room" },
  { href: "/planner/", key: "nav_planner", icon: "planner" },
  { href: "/journal/", key: "nav_journal", icon: "journal" },
  { href: "/charts/", key: "nav_charts", icon: "chart" },
  { href: "/tools/", key: "nav_tools", icon: "tools" },
  { href: "/import/", key: "nav_import", icon: "import" },
  { href: "/accounts/", key: "nav_accounts", icon: "accounts" },
  { href: "/learn/", key: "nav_learn", icon: "learn" },
  { href: "/settings/", key: "nav_settings", icon: "settings" },
];

/** Applies the chosen theme to <html data-theme>. "system" follows the device. */
function useThemeEffect() {
  const theme = useApp((s) => s.settings.theme);
  useEffect(() => {
    const el = document.documentElement;
    if (theme === "system") el.removeAttribute("data-theme");
    else el.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("ata-theme", theme); // read by the inline script in layout.tsx to avoid a flash
    } catch {
      /* storage blocked: theme still applies after load */
    }
  }, [theme]);
}

export function AppShell({ children }: { children: ReactNode }) {
  const hydrated = useApp((s) => s.hydrated);
  const { t } = useT();
  const pathname = usePathname() || "/";
  const { account, accounts, isCombined } = useSelectedAccount();
  const [moreOpen, setMoreOpen] = useState(false);
  useThemeEffect();

  useEffect(() => {
    if (hydrated) ensureSeedStrategies();
  }, [hydrated]);

  const showFunded = isCombined ? accounts.some((a) => a.type === "FUNDED") : account?.type === "FUNDED";
  const items = NAV.filter((n) => !n.fundedOnly || showFunded);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href.replace(/\/$/, "")));
  const bottom: NavItem[] = [NAV[0]!, NAV[1]!, NAV[2]!, showFunded ? NAV[3]! : NAV[4]!];

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[232px_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-s focus:bg-bg focus:p-2">
        {t("skip_to_content")}
      </a>
      <aside className="no-print sticky top-0 hidden h-screen flex-col gap-0.5 overflow-y-auto border-r border-line px-3 py-5 lg:flex" aria-label={t("main_nav")}>
        <Brand />
        <nav className="mt-4 flex flex-col gap-0.5">
          {items.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.href) ? "page" : undefined}
              className="flex min-h-10 items-center gap-2.5 rounded-s px-2.5 text-muted hover:text-fg aria-[current=page]:bg-soft aria-[current=page]:font-semibold aria-[current=page]:text-fg [&[aria-current=page]_svg]:text-blue"
            >
              <Icon name={n.icon} />
              <span>{t(n.key)}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="no-print sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-line bg-bg px-4 py-2.5">
          <div className="mr-auto lg:hidden">
            <Brand compact />
          </div>
          {hydrated && <AccountSwitcher />}
          {hydrated && <LangThemeButtons />}
        </header>

        <main id="main" className="w-full max-w-[1180px] px-4 pt-4 pb-28 lg:px-8 lg:pt-6 lg:pb-12">
          {hydrated ? children : <LoadingSkeleton />}
        </main>
      </div>

      <nav className="no-print fixed inset-x-0 bottom-0 z-20 grid grid-flow-col border-t border-line bg-bg px-1 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))] lg:hidden" aria-label={t("main_nav")}>
        {bottom.map((n) => (
          <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? "page" : undefined} className="flex min-h-12 flex-col items-center justify-center gap-0.5 text-[11px] text-muted aria-[current=page]:font-semibold aria-[current=page]:text-fg [&[aria-current=page]_svg]:text-blue">
            <Icon name={n.icon} />
            <span>{t(n.key)}</span>
          </Link>
        ))}
        <button type="button" onClick={() => setMoreOpen(true)} className="flex min-h-12 flex-col items-center justify-center gap-0.5 text-[11px] text-muted">
          <Icon name="more" />
          <span>{t("nav_more")}</span>
        </button>
      </nav>

      <Dialog open={moreOpen} onClose={() => setMoreOpen(false)} title={t("nav_more")}>
        <nav className="grid grid-cols-2 gap-2">
          {items.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setMoreOpen(false)} className="flex min-h-12 items-center gap-2 rounded-s border border-line px-3" aria-current={isActive(n.href) ? "page" : undefined}>
              <Icon name={n.icon} className="text-blue" />
              {t(n.key)}
            </Link>
          ))}
        </nav>
      </Dialog>
      <Toaster />
    </div>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <Link href="/" className={`font-bold tracking-tight ${compact ? "text-md" : "px-2.5 text-lg"}`}>
      AI Trading <span className="text-blue">Analyst</span>
    </Link>
  );
}

function AccountSwitcher() {
  const { t } = useT();
  const { accounts } = useSelectedAccount();
  const selected = useApp((s) => s.selectedAccountId);
  if (!accounts.length) return null;
  return (
    <label className="flex items-center gap-2 lg:mr-auto">
      <span className="sr-only">{t("account")}</span>
      <Select value={selected ?? ""} onChange={(e) => selectAccount(e.target.value)} className="max-w-[240px] min-w-[160px]">
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name} ({t(`acc_type_${a.type}` as DictKey)})
          </option>
        ))}
        {accounts.length > 1 && <option value="ALL">{t("acc_combined")}</option>}
      </Select>
    </label>
  );
}

function LangThemeButtons() {
  const { t } = useT();
  const theme = useApp((s) => s.settings.theme);
  const update = useApp((s) => s.update);
  const systemDark = useSystemDark();
  const isDark = theme === "dark" || (theme === "system" && systemDark);
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => update((d) => ({ settings: { ...d.settings, theme: isDark ? "light" : "dark" } }))}
        className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-full border border-line px-3 text-sm max-md:min-h-11"
        aria-label={isDark ? t("theme_light") : t("theme_dark")}
      >
        <Icon name={isDark ? "sun" : "moon"} size={16} />
        <span className="max-sm:hidden">{isDark ? t("theme_light") : t("theme_dark")}</span>
      </button>
    </div>
  );
}
