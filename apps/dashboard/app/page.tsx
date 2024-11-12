import { HydrateClient, api } from "@/trpc/server";
import AuthContext from "@/components/context/AuthContext";
import Home from "./_components/Overview";

export default async function HomePage() {
  void api.server.getDashBoardData.prefetch();

  return (
    <HydrateClient>
      <main>
        <AuthContext>
          <Home />
        </AuthContext>
      </main>
    </HydrateClient>
  );
}
