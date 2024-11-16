import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import Settings from "./_components/Settings";
import { api } from "@/trpc/server";

export default async function SettingsPage() {
  void api.setting.getSettings.prefetch();

  return (
    <DashboardLayout>
      <Settings />
    </DashboardLayout>
  );
}
