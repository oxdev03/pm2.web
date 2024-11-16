import { api } from "@/trpc/server";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { SelectedProvider } from "@/components/context/SelectedProvider";
import ProcessList from "./_components/ProcessList";

export default async function ProcessPage() {
  void api.server.getDashBoardData.prefetch();

  return (
    <DashboardLayout>
      <SelectedProvider>
        <ProcessList />
      </SelectedProvider>
    </DashboardLayout>
  );
}
