import { api } from "@/trpc/server";
import Home from "./_components/Overview";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { SelectedProvider } from "@/components/context/SelectedProvider";

export default async function HomePage() {
  void api.server.getDashBoardData.prefetch();

  return (
    <DashboardLayout provider={SelectedProvider}>
      <Home />
    </DashboardLayout>
  );
}
