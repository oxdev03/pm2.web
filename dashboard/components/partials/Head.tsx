import Image from 'next/image';
import { forwardRef, useEffect } from 'react';

import { ActionIcon, Box, Center, createStyles, Divider, Flex, Group, Header, Modal, MultiSelect, rem, SelectItemProps, Stack } from '@mantine/core';
import { IconCircle, IconCircleFilled, IconDatabaseCog, IconFilterCog, IconLock, IconServerCog, IconTestPipe } from '@tabler/icons-react';

import { useSelected } from '../context/SelectedProvider';
import { useSession } from 'next-auth/react';
import Access from '@/utils/acess';
import { DefaultSession } from 'next-auth';
import { Acl } from '@/types/user';
import { useDisclosure } from '@mantine/hooks';

const useStyles = createStyles((theme) => ({
  values: {
    flexWrap: 'nowrap',
    overflowX: 'auto',
    '::-webkit-scrollbar': {
      height: '0.4rem',
    },
    '::-webkit-scrollbar-track': {
      boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
      webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
    },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[5],
      borderRadius: '0.3rem',
    },
  },
}));

export function Head() {
  const { classes, cx } = useStyles();
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
          <MultiSelect
            icon={<IconServerCog />}
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
            itemComponent={Item}
            classNames={{
              values: classes.values,
            }}
            zIndex={204}
          />
          <MultiSelect
            icon={<IconDatabaseCog />}
            data={
              servers
                ?.map(
                  (server) =>
                    server.processes
                      ?.filter((process) => selectedItem?.servers.includes(server._id) || selectedItem?.servers.length === 0)
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
            maxSelectedValues={4}
            radius={'md'}
            itemComponent={Item}
            classNames={{
              values: classes.values,
            }}
            zIndex={204}
            dropdownPosition="bottom"
          />
        </>
      )}
    </>
  );

  return (
    <Header height={{ base: 40, xs: 60 }}>
      <Modal
        opened={opened}
        onClose={close}
        title="Server/Process Filter"
        styles={{
          body: {
            overflowY: 'unset',
          },
        }}
      >
        <Stack>{MultiSelectItems}</Stack>
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
        <Group
          h={'100%'}
          position="right"
          px={'lg'}
          sx={(theme) => ({
            [theme.fn.smallerThan('md')]: {
              display: 'none',
            },
          })}
        >
          {MultiSelectItems}
        </Group>
        <Group
          h={'100%'}
          position="right"
          px={'xs'}
          sx={(theme) => ({
            [theme.fn.largerThan('md')]: {
              display: 'none',
            },
          })}
        >
          <ActionIcon variant="light" color="blue" onClick={open}>
            <IconFilterCog size={'1.2rem'} />
          </ActionIcon>
        </Group>
      </Flex>
    </Header>
  );
}

const Item = forwardRef<HTMLDivElement, SelectItemProps & { status: string } & { disabled: boolean }>(({ label, value, disabled, status, ...others }, ref) => {
  return (
    <div ref={ref} {...others}>
      <Flex align="center">
        <Box mr={10}>
          {disabled ? (
            <IconLock size={14} />
          ) : (
            <IconCircleFilled
              size={10}
              style={{
                color: status === 'online' ? '#12B886' : status === 'stopped' ? '#FCC419' : '#FA5252',
              }}
            />
          )}
        </Box>
        <div>{label}</div>
      </Flex>
    </div>
  );
});
