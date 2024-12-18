import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { api } from "@/trpc/server";

import Settings from "./_components/Settings";

export default function SettingsPage() {
  void api.setting.getSettings.prefetch();

  return (
    <DashboardLayout>
      <Settings />
    </DashboardLayout>
  );
}
