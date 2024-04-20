import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import { Dashboard } from "@/components/layouts/Dashboard";
import { CustomMultiSelect } from "@/components/misc/MultiSelect/CustomMultiSelect";
import { IPermissionConstants, Permission, PERMISSIONS } from "@/utils/permission";
import {
  Accordion,
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Grid,
  Group,
  Overlay,
  Paper,
  rem,
  ScrollArea,
  Table,
  Text,
  Title,
  Transition,
} from "@mantine/core";
import { userModel } from "@pm2.web/mongoose-models";
import { IUser, IAclServer } from "@pm2.web/typings";
import {
  IconChartBar,
  IconCircleFilled,
  IconDeviceFloppy,
  IconHistory,
  IconPower,
  IconReload,
  IconTrash,
} from "@tabler/icons-react";

import classes from "../styles/user.module.css";
import { trpc } from "@/utils/trpc";
import UserItem from "@/components/user/table/UserItem";
import { actionNotification } from "@/utils/notification";
import { getServerSideHelpers } from "@/server/helpers";

const permissionData = [
  {
    icon: <IconHistory />,
    value: "LOGS",
    label: "Logs",
    description: "View logs",
  },
  {
    icon: <IconChartBar />,
    value: "MONITORING",
    label: "Monitoring",
    description: "View monitoring/stats",
  },
  {
    icon: <IconReload />,
    value: "RESTART",
    label: "Restart",
    description: "Restart process",
  },
  {
    icon: <IconPower />,
    value: "STOP",
    label: "Stop",
    description: "Stop process",
  },
  {
    icon: <IconTrash />,
    value: "DELETE",
    label: "Delete",
    description: "Delete process",
  },
];

const SelectItemComponent = (item: (typeof permissionData)[0]) => (
  <Group wrap="nowrap">
    <Avatar size={"xs"}>{item.icon}</Avatar>
    <div>
      <Text size="sm">{item.description}</Text>
    </div>
  </Group>
);

const PillComponent = (item: (typeof permissionData)[0]) => (
  <Flex align={"center"} justify={"center"} h={"100%"}>
    <Avatar size={"xs"}>{item.icon}</Avatar>
  </Flex>
);

export default function User({}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const dashboardQuery = trpc.server.getDashBoardData.useQuery(true);
  const usersQuery = trpc.user.getUsers.useQuery();
  const servers = dashboardQuery.data?.servers || []!;
  const users = usersQuery.data || [];

  const [selection, setSelection] = useState<string[]>([]);
  const [perms, setPerms] = useState<IAclServer[]>(
    servers.map((server) => ({
      server: server._id,
      processes: server.processes.map((process) => ({
        process: process._id,
        perms: 0,
      })),
      perms: 0,
    })),
  );

  const updatePerms = trpc.user.setCustomPermission.useMutation({
    onMutate() {
      actionNotification(`update-perms`, "Updating permissions", "Please wait...", "pending");
    },
    onError(error) {
      actionNotification(`update-perms`, "Failed to update permissions", error.message, "error");
    },
    onSuccess(data) {
      actionNotification(`update-perms`, "Permissions updated", data, "success");
      refreshSSRProps();
    },
  });

  const toggleRow = (id: string) =>
    setSelection((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  const toggleAll = () =>
    setSelection((current) =>
      current.length === users.filter((x) => !x.acl.owner && !x.acl.admin).length
        ? []
        : users.filter((x) => !x.acl.owner && !x.acl.admin).map((item) => item._id),
    );

  const router = useRouter();

  const updatePermsState = (server_id: string, process_id: string, new_perms: string[]) => {
    const newPerms = [...perms];
    const serverIndex = newPerms.findIndex((x) => x.server == server_id);
    if (serverIndex !== -1) {
      if (process_id) {
        const processIndex = newPerms[serverIndex].processes.findIndex((x) => x.process == process_id);
        if (processIndex !== -1) {
          newPerms[serverIndex].processes[processIndex].perms = new Permission().add(
            ...new_perms.map((x) => PERMISSIONS[x as keyof IPermissionConstants]),
          ).value;
        }
      } else {
        newPerms[serverIndex].perms = new Permission().add(
          ...new_perms.map((x) => PERMISSIONS[x as keyof IPermissionConstants]),
        ).value;
        // process should inherit server perms , if server perms is changed
        newPerms[serverIndex].processes = newPerms[serverIndex].processes.map((process) => ({
          ...process,
          perms: new Permission().add(...new_perms.map((x) => PERMISSIONS[x as keyof IPermissionConstants])).value,
        }));
      }
    }
    setPerms(newPerms);
  };

  const getSelectedPerms = (server_id: string, process_id?: string) => {
    const server = perms.find((x) => x.server == server_id);
    if (server) {
      if (process_id) {
        const process = server.processes.find((x) => x.process == process_id);
        if (process) {
          return new Permission(process.perms).toArray();
        }
      } else {
        return new Permission(server.perms).toArray();
      }
    }
    return [];
  };

  const getUserRole = (item: Omit<IUser, "password" | "updatedAt">) => {
    return item.acl?.owner ? "owner" : item.acl?.admin ? "admin" : item.acl?.servers?.length ? "custom" : "none";
  };

  const refreshSSRProps = () => {
    router.replace(router.asPath);
  };

  useEffect(() => {
    if (!perms.length) return;
    const selectedUsers = users.filter((x) => selection.includes(x._id));
    const newPerms = [...perms];

    for (const perm of newPerms) {
      perm.perms = new Permission().add(
        ...Permission.common(
          ...selectedUsers.map((x) => x.acl.servers.find((y) => y.server == perm.server)?.perms ?? 0),
        ),
      ).value;
      perm.processes = perm.processes.map((process) => ({
        ...process,
        perms: new Permission().add(
          ...Permission.common(
            ...selectedUsers.map(
              (x) =>
                x.acl.servers.find((y) => y.server == perm.server)?.processes.find((z) => z.process == process.process)
                  ?.perms ?? perm.perms,
            ),
          ),
        ).value,
      }));
    }

    setPerms(newPerms);
  }, [selection]);

  return (
    <>
      <Head>
        <title>pm2.web</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>
      <Dashboard>
        <Grid
          flex={1}
          styles={{
            root: {
              display: "flex",
            },
          }}
        >
          <Grid.Col span={{ lg: 6, md: 12 }}>
            {/* 3/5 2/5 */}
            <Paper shadow="sm" radius="md" p={"sm"} style={{ height: "100%" }}>
              <ScrollArea>
                <Table miw={600} verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: rem(40) }}>
                        <Checkbox
                          onChange={toggleAll}
                          checked={selection.length === users.length}
                          indeterminate={selection.length > 0 && selection.length !== users.length}
                        />
                      </Table.Th>
                      <Table.Th style={{ fontSize: rem(17) }}>User</Table.Th>
                      <Table.Th style={{ fontSize: rem(17) }}>Email</Table.Th>
                      <Table.Th style={{ fontSize: rem(17) }}>Permission</Table.Th>
                      <Table.Th style={{ width: rem(50) }}></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {users.map((item) => (
                      <UserItem
                        key={item._id}
                        selected={selection.includes(item._id)}
                        selectUser={toggleRow}
                        authProvider={item?.oauth2?.provider}
                        userId={item._id}
                        email={item.email}
                        name={item.name}
                        refresh={refreshSSRProps}
                        role={getUserRole(item)}
                      />
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ lg: 6, md: 12 }}>
            <Paper shadow="sm" radius="md" style={{ height: "100%" }} p={"lg"} px={"md"} pb={"sm"}>
              <Flex direction={"column"} h="100%">
                <Title order={4} style={{ marginBottom: "1rem" }}>
                  Custom Permissions
                </Title>
                <Flex direction={"column"} justify={"space-between"} h="100%">
                  <ScrollArea h={490}>
                    <Accordion
                      chevronPosition="left"
                      classNames={{
                        content: classes.content,
                      }}
                    >
                      {servers.map((item) => (
                        <Accordion.Item value={item._id} key={item._id}>
                          <Flex
                            align={"center"}
                            direction={"row"}
                            justify={{
                              base: "start",
                              sm: "space-between",
                            }}
                            wrap={{
                              base: "wrap",
                              sm: "nowrap",
                            }}
                          >
                            <Accordion.Control>
                              <Flex align={"center"} direction={"row"} gap={rem(4)}>
                                <IconCircleFilled
                                  size={12}
                                  style={{
                                    color:
                                      new Date(item.updatedAt).getTime() > Date.now() - 1000 * 60 * 4
                                        ? "#12B886"
                                        : "#FA5252",
                                    marginTop: "2.5px",
                                  }}
                                />
                                {item.name}
                              </Flex>
                            </Accordion.Control>
                            <CustomMultiSelect
                              classNames={{
                                pill: classes.value,
                                pillsList: classes.values,
                              }}
                              value={getSelectedPerms(item._id)}
                              onChange={(values) => updatePermsState(item._id, "", values)}
                              data={permissionData}
                              itemComponent={SelectItemComponent}
                              pillComponent={PillComponent}
                              placeholder="Select Permissions"
                              variant="filled"
                              radius={"md"}
                              size="sm"
                              w={{
                                sm: "24rem",
                              }}
                              pl={{
                                base: "3rem",
                                sm: "unset",
                              }}
                            />
                          </Flex>
                          <Accordion.Panel p={"0px"}>
                            {item.processes?.map((process) => (
                              <div key={process._id}>
                                <Box py={"xs"}>
                                  <Flex
                                    align={"center"}
                                    direction={"row"}
                                    justify={"space-between"}
                                    wrap={{
                                      base: "wrap",
                                      sm: "nowrap",
                                    }}
                                  >
                                    <Flex align={"center"} direction={"row"} gap={rem(4)}>
                                      <IconCircleFilled
                                        size={10}
                                        style={{
                                          color:
                                            process.status === "online"
                                              ? "#12B886"
                                              : process.status === "stopped"
                                                ? "#FCC419"
                                                : "#FA5252",
                                          marginTop: "3px",
                                        }}
                                      />
                                      {process.name}
                                    </Flex>
                                    <CustomMultiSelect
                                      classNames={{
                                        pill: classes.value,
                                        pillsList: classes.values,
                                      }}
                                      value={getSelectedPerms(item._id, process._id)}
                                      data={permissionData}
                                      itemComponent={SelectItemComponent}
                                      pillComponent={PillComponent}
                                      placeholder="Select Permissions"
                                      onChange={(values) => updatePermsState(item._id, process._id, values)}
                                      variant="filled"
                                      radius={"sm"}
                                      size="xs"
                                      w="14rem"
                                    />
                                  </Flex>
                                </Box>
                                <Divider />
                              </div>
                            ))}
                          </Accordion.Panel>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                    <Transition mounted={!selection?.length} transition="fade" duration={500}>
                      {(styles) => (
                        <Overlay color="#000" backgroundOpacity={0.1} radius={"md"} blur={7} center style={styles}>
                          <Badge size="xl" variant="outline">
                            Select a User First
                          </Badge>
                        </Overlay>
                      )}
                    </Transition>
                  </ScrollArea>
                  <Flex justify={"flex-end"} direction={"row"}>
                    <Button
                      variant="light"
                      color="teal"
                      radius="sm"
                      size={"sm"}
                      leftSection={<IconDeviceFloppy />}
                      loading={updatePerms.isPending}
                      disabled={!selection.length}
                      onClick={() =>
                        updatePerms.mutate({
                          userIds: selection,
                          perms: perms,
                        })
                      }
                    >
                      Save
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
            </Paper>
          </Grid.Col>
        </Grid>
      </Dashboard>
    </>
  );
}

export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  const helpers = getServerSideHelpers();

  await helpers.server.getDashBoardData.prefetch();
  await helpers.user.getUsers.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
}
