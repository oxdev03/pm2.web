import "server-only";

import { AppShell, AppShellMain } from "@mantine/core";
import { ReactNode } from "react";

import { Head } from "../partials/Head";
import { Nav } from "../partials/Nav";
import classes from "./Dashboard.module.css";
import AuthContext from "../context/AuthContext";
import { HydrateClient } from "@/trpc/server";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <HydrateClient>
      <main>
        <AuthContext>
          <AppShell
            classNames={{
              root: classes.appShellRoot,
              main: classes.appShellMain,
            }}
            header={{ height: { base: 40, xs: 60 } }}
            navbar={{ width: { base: 40, xs: 75 }, breakpoint: "" }}
            padding="md"
          >
            <Head />
            <Nav />
            <AppShellMain>{children}</AppShellMain>
          </AppShell>
        </AuthContext>
      </main>
    </HydrateClient>
  );
}
