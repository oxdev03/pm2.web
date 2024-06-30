import { AppShell } from "@mantine/core";
import { ReactNode } from "react";

import { Head } from "../partials/Head";
import { Nav } from "../partials/Nav";
import classes from "./Dashboard.module.css";

export function Dashboard({ children }: { children: ReactNode }) {
  return (
    <>
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
        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </>
  );
}
