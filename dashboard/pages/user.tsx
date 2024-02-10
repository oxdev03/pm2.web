import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { forwardRef, useEffect, useState } from 'react';

import { GithubIcon } from '@/components/icons/github';
import { GoogleIcon } from '@/components/icons/google';
import { Dashboard } from '@/components/layouts/Dashboard';
import connectDB from '@/middleware/mongodb';
import UserModel from '@/models/user';
import { IServer } from '@/types/server';
import { IUser, Server } from '@/types/user';
import { fetchServer, fetchSettings } from '@/utils/fetchSSRProps';
import { IPermissionConstants, Permission, PERMISSIONS } from '@/utils/permission';
import {
  Accordion,
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Grid,
  Group,
  MultiSelect,
  NativeSelect,
  Overlay,
  Paper,
  rem,
  ScrollArea,
  Table,
  Text,
  Title,
  Transition,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconChartBar, IconCheck, IconCircleFilled, IconDeviceFloppy, IconHistory, IconMail, IconPower, IconReload, IconTrash, IconX } from '@tabler/icons-react';
import classes from '../styles/user.module.css';
import { CustomMultiSelect, IItem } from '@/components/misc/MultiSelect/CustomMultiSelect';

const permissionData = [
  {
    icon: <IconHistory />,
    value: 'LOGS',
    label: 'Logs',
    description: 'View logs',
  },
  {
    icon: <IconChartBar />,
    value: 'MONITORING',
    label: 'Monitoring',
    description: 'View monitoring/stats',
  },
  {
    icon: <IconReload />,
    value: 'RESTART',
    label: 'Restart',
    description: 'Restart process',
  },
  {
    icon: <IconPower />,
    value: 'STOP',
    label: 'Stop',
    description: 'Stop process',
  },
  {
    icon: <IconTrash />,
    value: 'DELETE',
    label: 'Delete',
    description: 'Delete process',
  },
];

const SelectItemComponent = (item: (typeof permissionData)[0]) => (
  <Group wrap="nowrap">
    <Avatar size={'xs'}>{item.icon}</Avatar>
    <div>
      <Text size="sm">{item.description}</Text>
    </div>
  </Group>
);

const PillComponent = (item: (typeof permissionData)[0]) => (
  <Flex align={'center'} justify={'center'} h={'100%'}>
    <Avatar size={'xs'}>{item.icon}</Avatar>
  </Flex>
);

export default function User({ users, servers }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const aclPerms = {
    logs: false,
    monitoring: false,
    settings: false,
    restart: false,
    stop: false,
    delete: false,
  };
  const [selection, setSelection] = useState<string[]>([]);
  const [perms, setPerms] = useState<Server[]>(
    servers.map((server) => ({
      server: server._id,
      processes: server.processes.map((process) => ({
        process: process._id,
        perms: 0,
      })),
      perms: 0,
    }))
  );

  const toggleRow = (id: string) => setSelection((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  const toggleAll = () =>
    setSelection((current) => (current.length === users.filter((x) => !x.acl.owner && !x.acl.admin).length ? [] : users.filter((x) => !x.acl.owner && !x.acl.admin).map((item) => item._id)));

  const router = useRouter();

  const notification = (id: string, title: string, message: string, status: 'pending' | 'success' | 'error') => {
    if (status == 'pending') {
      notifications.show({
        id,
        title,
        message,
        color: 'blue',
        autoClose: false,
        withCloseButton: false,
      });
    } else {
      notifications.update({
        id,
        title,
        message,
        color: status == 'success' ? 'green' : 'red',
        icon: status == 'success' ? <IconCheck /> : <IconX />,
        autoClose: 5000,
        withCloseButton: true,
      });
    }
  };

  const deleteUser = async (id: string) => {
    const rnd = Math.random().toString(36).substring(7);
    notification(`delete-user-${id}-${rnd}`, 'Deleting user', 'Please wait...', 'pending');
    const res = await fetch(`/api/user?id=${id}`, {
      method: 'DELETE',
    });
    const statusCode = res.status;
    const data = await res.json();

    router.replace(router.asPath); // hacky way to refresh page

    if (statusCode !== 200) notification(`delete-user-${id}-${rnd}`, 'Failed to delete user', data.message, 'error');
    else if (statusCode === 200) notification(`delete-user-${id}-${rnd}`, 'User deleted', data.message, 'success');
  };

  const updateRole = async (id: string, permission: string) => {
    const rnd = Math.random().toString(36).substring(7);
    notification(`update-user-${id}-${rnd}`, 'Updating user', 'Please wait...', 'pending');
    const res = await fetch(`/api/user`, {
      method: 'PATCH',
      body: JSON.stringify({
        id,
        permission,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const statusCode = res.status;
    const data = await res.json();

    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.replace(router.asPath); // hacky way to refresh page

    if (statusCode !== 200) notification(`update-user-${id}-${rnd}`, 'Failed to update user', data.message, 'error');
    else if (statusCode === 200) notification(`update-user-${id}-${rnd}`, 'User updated', data.message, 'success');
  };

  const updatePermsState = (server_id: string, process_id: string, new_perms: string[]) => {
    const newPerms = [...perms];
    const serverIndex = newPerms.findIndex((x) => x.server == server_id);
    if (serverIndex !== -1) {
      if (process_id) {
        const processIndex = newPerms[serverIndex].processes.findIndex((x) => x.process == process_id);
        if (processIndex !== -1) {
          newPerms[serverIndex].processes[processIndex].perms = new Permission().add(...new_perms.map((x) => PERMISSIONS[x as keyof IPermissionConstants])).value;
        }
      } else {
        newPerms[serverIndex].perms = new Permission().add(...new_perms.map((x) => PERMISSIONS[x as keyof IPermissionConstants])).value;
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

  const updatePerms = async () => {
    const rnd = Math.random().toString(36).substring(7);
    notification(`update-perms-${rnd}`, 'Updating permissions', 'Please wait...', 'pending');
    const res = await fetch(`/api/user`, {
      method: 'POST',
      body: JSON.stringify({
        perms,
        users: selection,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const statusCode = res.status;
    const data = await res.json();

    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.replace(router.asPath); // hacky way to refresh page

    if (statusCode !== 200) notification(`update-perms-${rnd}`, 'Failed to update permissions', data.message, 'error');
    else if (statusCode === 200) notification(`update-perms-${rnd}`, 'Permissions updated', data.message, 'success');
  };

  useEffect(() => {
    if (!perms.length) return;
    const selectedUsers = users.filter((x) => selection.includes(x._id));
    const newPerms = [...perms];

    for (const perm of newPerms) {
      perm.perms = new Permission().add(...Permission.common(...selectedUsers.map((x) => x.acl.servers.find((y) => y.server == perm.server)?.perms ?? 0))).value;
      perm.processes = perm.processes.map((process) => ({
        ...process,
        perms: new Permission().add(
          ...Permission.common(...selectedUsers.map((x) => x.acl.servers.find((y) => y.server == perm.server)?.processes.find((z) => z.process == process.process)?.perms ?? perm.perms))
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
              display: 'flex',
            },
          }}
        >
          <Grid.Col span={{ lg: 6, md: 12 }}>
            {/* 3/5 2/5 */}
            <Paper shadow="sm" radius="md" p={'sm'} style={{ height: '100%' }}>
              <ScrollArea>
                <Table miw={600} verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: rem(40) }}>
                        <Checkbox onChange={toggleAll} checked={selection.length === users.length} indeterminate={selection.length > 0 && selection.length !== users.length} />
                      </Table.Th>
                      <Table.Th style={{ fontSize: rem(17) }}>User</Table.Th>
                      <Table.Th style={{ fontSize: rem(17) }}>Email</Table.Th>
                      <Table.Th style={{ fontSize: rem(17) }}>Permission</Table.Th>
                      <Table.Th style={{ width: rem(50) }}></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {users.map((item) => {
                      const selected = selection.includes(item._id);
                      return (
                        <Table.Tr key={item._id} className={`${selected ? classes.rowSelected : ''}`}>
                          <Table.Td>
                            <Checkbox checked={selection.includes(item._id)} onChange={() => toggleRow(item._id)} disabled={item.acl.admin || item.acl.owner} />
                          </Table.Td>
                          <Table.Td>
                            <Group gap="sm">
                              <>
                                {!item.oauth2 && <IconMail />}
                                {item?.oauth2?.provider == 'github' && <GithubIcon />}
                                {item.oauth2?.provider == 'google' && <GoogleIcon />}
                              </>
                              <Text size="sm" fw={500}>
                                {item.name}
                              </Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>{item.email}</Table.Td>
                          <Table.Td>
                            <NativeSelect
                              data={['Owner', 'Admin', 'Custom', 'None'].map((x) => {
                                return { label: x, value: x.toLowerCase(), disabled: x == 'Custom' };
                              })}
                              variant="filled"
                              value={item.acl?.owner ? 'owner' : item.acl?.admin ? 'admin' : item.acl?.servers?.length ? 'custom' : 'none'}
                              onChange={(e) => updateRole(item._id, e.currentTarget.value)}
                            />
                          </Table.Td>
                          <Table.Td>
                            <ActionIcon variant="light" color="red.4" radius="sm" size={'lg'} onClick={() => deleteUser(item._id)}>
                              <IconTrash size="1.4rem" />
                            </ActionIcon>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Paper>{' '}
          </Grid.Col>
          <Grid.Col span={{ lg: 6, md: 12 }}>
            <Paper shadow="sm" radius="md" style={{ height: '100%' }} p={'lg'} px={'md'} pb={'sm'}>
              <Flex direction={'column'} h="100%">
                <Title order={4} style={{ marginBottom: '1rem' }}>
                  Custom Permissions
                </Title>
                <Flex direction={'column'} justify={'space-between'} h="100%">
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
                            align={'center'}
                            direction={'row'}
                            justify={{
                              base: 'start',
                              sm: 'space-between',
                            }}
                            wrap={{
                              base: 'wrap',
                              sm: 'nowrap',
                            }}
                          >
                            <Accordion.Control>
                              <Flex align={'center'} direction={'row'} gap={rem(4)}>
                                <IconCircleFilled
                                  size={12}
                                  style={{
                                    color: new Date(item.updatedAt).getTime() > Date.now() - 1000 * 60 * 4 ? '#12B886' : '#FA5252',
                                    marginTop: '2.5px',
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
                              onChange={(values) => updatePermsState(item._id, '', values)}
                              data={permissionData}
                              itemComponent={SelectItemComponent}
                              pillComponent={PillComponent}
                              placeholder="Select Permissions"
                              variant="filled"
                              radius={'md'}
                              size="sm"
                              w={{
                                sm: '24rem',
                              }}
                              pl={{
                                base: '3rem',
                                sm: 'unset',
                              }}
                            />
                          </Flex>
                          <Accordion.Panel p={'0px'}>
                            {item.processes?.map((process) => (
                              <div key={process._id}>
                                <Box py={'xs'}>
                                  <Flex
                                    align={'center'}
                                    direction={'row'}
                                    justify={'space-between'}
                                    wrap={{
                                      base: 'wrap',
                                      sm: 'nowrap',
                                    }}
                                  >
                                    <Flex align={'center'} direction={'row'} gap={rem(4)}>
                                      <IconCircleFilled
                                        size={10}
                                        style={{
                                          color: process.status === 'online' ? '#12B886' : process.status === 'stopped' ? '#FCC419' : '#FA5252',
                                          marginTop: '3px',
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
                                      radius={'sm'}
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
                        <Overlay color="#000" backgroundOpacity={0.1} radius={'md'} blur={7} center style={styles}>
                          <Badge size="xl" variant="outline">
                            Select a User First
                          </Badge>
                        </Overlay>
                      )}
                    </Transition>
                  </ScrollArea>
                  <Flex justify={'flex-end'} direction={'row'}>
                    <Button variant="light" color="teal" radius="sm" size={'sm'} leftSection={<IconDeviceFloppy />} disabled={!selection.length} onClick={updatePerms}>
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
  await connectDB();
  const users = await UserModel.find(
    {},
    {
      password: 0,
      updatedAt: 0,
    }
  ).lean();
  const settings = await fetchSettings();
  return {
    props: {
      users: JSON.parse(JSON.stringify(users)) as Omit<IUser, 'password' | 'updatedAt'>[],
      servers: await fetchServer(settings.excludeDaemon),
    },
  };
}
