import Image from 'next/image';
import { forwardRef, useEffect } from 'react';

import { ActionIcon, AppShell, Box, Center, Divider, Flex, Group, Modal, MultiSelect, rem, Stack } from '@mantine/core';
import { IconCircle, IconCircleFilled, IconDatabaseCog, IconFilterCog, IconLock, IconServerCog, IconTestPipe } from '@tabler/icons-react';

import { useSelected } from '../context/SelectedProvider';
import { useSession } from 'next-auth/react';
import Access from '@/utils/acess';
import { DefaultSession } from 'next-auth';
import { Acl } from '@/types/user';
import { useDisclosure } from '@mantine/hooks';
import classes from './Head.module.css';
import { ResourceMultiSelect } from '../misc/ResourceMultiSelect';

export function Head() {
  const { servers, selectItem, selectedItem } = useSelected();
  const { data: session } = useSession();
  const [opened, { open, close }] = useDisclosure(false);

  const hasAccess = (server_id: string, process_id: string) => {
    type DefaultSessionUser = DefaultSession & {
      acl: Acl;
    };
    const user = session?.user as DefaultSessionUser;
    if (!user || !user.acl) return false;
    if (!user?.acl?.owner && !user?.acl?.admin) {
      return !!new Access(user.acl?.servers ?? []).getPermsValue(server_id, process_id);
    }
    return true;
  };

  const MultiSelectItems = (
    <>
      {servers?.length && (
        <>
          <ResourceMultiSelect
            leftSection={<IconServerCog />}
            data={
              servers?.map((server) => ({
                value: server._id,
                label: server.name,
                status: new Date(server.updatedAt).getTime() > Date.now() - 1000 * 60 ? 'online' : 'offline',
                disabled: !server.processes.some((process) => hasAccess(server._id, process._id)), // check whether user has access to any process
              })) || []
            }
            onChange={(values) => {
              selectItem?.(values, 'servers');
            }}
            placeholder="Select Server"
            searchable
            w={{
              md: '25rem',
            }}
            radius={'md'}
            classNames={{
              pillsList: classes.value,
            }}
            // zIndex={204}
          />
          <ResourceMultiSelect
            leftSection={<IconDatabaseCog />}
            data={
              servers
                ?.map(
                  (server) =>
                    server.processes
                      ?.filter(() => selectedItem?.servers.includes(server._id) || selectedItem?.servers.length === 0)
                      ?.map((process) => ({ value: process._id, label: process.name, status: process.status, disabled: !hasAccess(server._id, process._id) })) || []
                )
                .flat() || []
            }
            value={selectedItem?.processes || []}
            onChange={(values) => {
              selectItem(values, 'processes');
            }}
            placeholder="Select Process"
            searchable
            w={{
              md: '25rem',
            }}
            maxValues={4}
            radius={'md'}
            //zIndex={204}
            classNames={{
              pillsList: classes.value,
            }}
            comboboxProps={{ position: 'bottom', middlewares: { flip: false, shift: false } }}
          />
        </>
      )}
    </>
  );

  return (
    <AppShell.Header>
      <Modal opened={opened} onClose={close} title="Server/Process Filter" className={classes.modal} zIndex={200}>
        <Stack
          style={{
            zIndex: 203,
          }}
        >
          {MultiSelectItems}
        </Stack>
      </Modal>
      <Flex h={'100%'} justify={'space-between'}>
        <Group h={'100%'}>
          <Center
            w={{
              base: rem(42),
              xs: rem(70),
            }}
          >
            <Image alt="logo" src="/logo.png" width={25} height={25} />
          </Center>
        </Group>
        <Group h={'100%'} justify="right" px={'lg'} className={classes.defaultSelectGroup}>
          {MultiSelectItems}
        </Group>
        <Group h={'100%'} justify="right" px={'xs'} className={classes.filterIcon}>
          <ActionIcon variant="light" color="blue" onClick={open}>
            <IconFilterCog size={'1.2rem'} />
          </ActionIcon>
        </Group>
      </Flex>
    </AppShell.Header>
  );
}
