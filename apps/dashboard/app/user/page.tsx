import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { api } from "@/trpc/server";

import UserAdministration from "./_components/UserAdministration";

export default function UserAdministrationPage() {
  void api.server.getDashBoardData.prefetch();
  void api.user.getUsers.prefetch();

  return (
    <DashboardLayout>
      <UserAdministration />
    </DashboardLayout>
  );
}
