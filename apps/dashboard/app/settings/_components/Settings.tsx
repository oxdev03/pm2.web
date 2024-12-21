"use client";

import { Accordion, Badge, Grid, Overlay, Paper, ScrollArea, Title } from "@mantine/core";
import { useSession } from "next-auth/react";

import DatabaseAction from "@/components/settings/DatabaseAction";
import DeleteAccount from "@/components/settings/DeleteAccount";
import UnlinkOAuth2 from "@/components/settings/UnlinkOAuth2";
import UpdateConfiguration from "@/components/settings/UpdateConfiguration";
import UpdatePassword from "@/components/settings/UpdatePassword";
import { api } from "@/trpc/react";

export default function Settings() {
  const { data: session } = useSession();
  const [settings, settingsQuery] = api.setting.getSettings.useSuspenseQuery();
  const hasPermission = session?.user?.acl?.owner || session?.user?.acl?.admin;
  const isOAuth2 = !!session?.user?.oauth2?.provider;

  if (settingsQuery.isError) {
    // TODO: add proper error handling
  }

  return (
    <Grid
      flex={1}
      styles={{
        root: {
          display: "flex",
        },
      }}
    >
      <Grid.Col span={{ lg: 8, md: 7, sm: 6, xs: 12 }}>
        <Paper shadow="sm" radius="md" p={"md"} mih={"100%"} h={"100%"}>
          <Title order={3} style={{ marginBottom: "1rem" }}>
            Configuration
          </Title>
          <ScrollArea>
            <Accordion variant="filled">
              <UpdateConfiguration settings={settings} />
              <DatabaseAction />
            </Accordion>
            {!hasPermission && (
              <Overlay color="#000" backgroundOpacity={0.1} radius={"md"} blur={7} center zIndex={2}>
                <Badge size="xl" variant="outline" color="red">
                  Owner/Admin Permission required
                </Badge>
              </Overlay>
            )}
          </ScrollArea>
        </Paper>
      </Grid.Col>
      <Grid.Col span={{ lg: 4, md: 5, sm: 6, xs: 12 }}>
        <Paper shadow="sm" radius="md" p={"md"} style={{ height: "100%" }}>
          <Title order={3} style={{ marginBottom: "1rem" }}>
            User Settings
          </Title>
          <Accordion variant="filled">
            <UpdatePassword />
            <DeleteAccount />
            {isOAuth2 && <UnlinkOAuth2 />}
          </Accordion>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}
