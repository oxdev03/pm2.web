import { SelectedProvider } from "@/components/context/SelectedProvider";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { api } from "@/trpc/server";

import Home from "./_components/Overview";

export default function HomePage() {
  void api.server.getDashBoardData.prefetch();

  return (
    <DashboardLayout provider={SelectedProvider}>
      <Home />
    </DashboardLayout>
  );
}
