"use client";

import { Disclaimer, PageHeader } from "@/components/shared/blocks";
import { Section } from "@/components/ui/primitives";
import { useT } from "@/i18n";
import { useSelectedAccount } from "@/store/hooks";
import { PositionSizeCalculator } from "./PositionSizeCalculator";
import { PropFirmCalculator } from "./PropFirmCalculator";

export function ToolsPage() {
  const { t } = useT();
  const { account } = useSelectedAccount();
  return (
    <div>
      <PageHeader title={t("nav_tools")} description={t("tools_desc")} />
      <Section title={t("psc_title")} hint={t("psc_hint")}>
        <PositionSizeCalculator defaultBalance={account?.startingBalance ?? "10000"} currency={account?.baseCurrency ?? "USD"} />
      </Section>
      <Section title={t("pfc_title")} hint={t("pfc_hint")}>
        <PropFirmCalculator />
      </Section>
      <Disclaimer />
    </div>
  );
}
