import { api } from "@/trpc/server";
import UserAdministration from "./_components/UserAdministration";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

export default async function UserAdministrationPage() {
  void api.server.getDashBoardData.prefetch();
  void api.user.getUsers.prefetch();

  return (
    <DashboardLayout>
      <UserAdministration />
    </DashboardLayout>
  );
}
