"use client";

import { format } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { useSession } from "../../lib/session";
import { Panel } from "../../ui";

export default function DashboardPage() {
  const { user } = useSession();
  const { t } = useI18n();

  return (
    <>
      <h1 className="text-2xl font-semibold">
        {format(t.invoicer.dashboard.welcome, { name: user?.name.split(" ")[0] ?? "" })}
      </h1>
      <p className="mt-1 text-sm text-foreground/60">{user?.company?.name}</p>
      <Panel className="mt-6">
        <p className="text-sm text-foreground/70">{t.invoicer.dashboard.empty}</p>
      </Panel>
    </>
  );
}
