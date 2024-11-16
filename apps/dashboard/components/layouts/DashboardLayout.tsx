import "server-only";

import { AppShell, AppShellMain } from "@mantine/core";
import { FC, Fragment, ReactNode } from "react";

import { Head } from "../partials/Head";
import { Nav } from "../partials/Nav";
import classes from "./Dashboard.module.css";
import AuthContext from "../context/AuthContext";
import { HydrateClient } from "@/trpc/server";

interface DashboardLayoutProps {
  children: ReactNode;
  provider?: FC<{ children: ReactNode }>; // Optional provider component
}

export function DashboardLayout({ children, provider }: DashboardLayoutProps) {
  const OptionalProvider = provider || Fragment;

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
            <OptionalProvider>
              <Head />
              <Nav />
              <AppShellMain>{children}</AppShellMain>
            </OptionalProvider>
          </AppShell>
        </AuthContext>
      </main>
    </HydrateClient>
  );
}
