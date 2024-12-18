import { SelectedProvider } from "@/components/context/SelectedProvider";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { api } from "@/trpc/server";

import ProcessList from "./_components/ProcessList";

export default function ProcessPage() {
  void api.server.getDashBoardData.prefetch();

  return (
    <DashboardLayout provider={SelectedProvider}>
      <ProcessList />
    </DashboardLayout>
  );
}
