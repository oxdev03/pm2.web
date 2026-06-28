import { AppShell, Container } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ReactNode } from "react";

import { Head } from "../partials/Head";
import { Nav } from "../partials/Nav";

export function Dashboard({ children }: { children: ReactNode }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 80, breakpoint: "sm", collapsed: { mobile: !mobileOpened } }}
      padding="xl"
      bg="var(--mantine-color-body)"
    >
      <Head mobileOpened={mobileOpened} toggleMobile={toggleMobile} />
      <Nav />
      <AppShell.Main display="flex" style={{ flexDirection: "column", minHeight: "100vh" }}>
        <Container size="xl" w="100%" flex={1} display="flex" style={{ flexDirection: "column" }}>
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
