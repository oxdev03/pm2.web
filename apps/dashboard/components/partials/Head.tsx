import { DefaultSession } from "next-auth";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { forwardRef, useEffect } from "react";

import Access from "@/utils/acess";
import { ActionIcon, AppShell, Box, Center, Divider, Flex, Group, Modal, MultiSelect, rem, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Acl, IProcess } from "@pm2.web/typings";
import {
  IconCircle,
  IconCircleFilled,
  IconDatabaseCog,
  IconFilterCog,
  IconLock,
  IconServerCog,
  IconTestPipe,
} from "@tabler/icons-react";

import { useSelected } from "../context/SelectedProvider";
import { CustomMultiSelect, IItem } from "../misc/MultiSelect/CustomMultiSelect";
import classes from "./Head.module.css";

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
      {!!servers?.length && (
        <>
          <CustomMultiSelect
            leftSection={<IconServerCog />}
            data={
              servers?.map((server) => ({
                value: server._id,
                label: server.name,
                status: new Date(server.updatedAt).getTime() > Date.now() - 1000 * 60 ? "online" : "offline",
                disabled: !server.processes.some((process) => hasAccess(server._id, process._id)), // check whether user has access to any process
              })) || []
            }
            onChange={(values) => {
              selectItem?.(values, "servers");
            }}
            itemComponent={itemComponent}
            placeholder="Select Server"
            searchable
            w={{
              md: "25rem",
            }}
            radius={"md"}
            classNames={{
              pillsList: classes.values,
            }}
            hidePickedOptions
            // zIndex={204}
          />
          <CustomMultiSelect
            leftSection={<IconDatabaseCog />}
            data={
              servers
                ?.map(
                  (server) =>
                    server.processes
                      ?.filter(() => selectedItem?.servers.includes(server._id) || selectedItem?.servers.length === 0)
                      ?.map((process) => ({
                        value: process._id,
                        label: process.name,
                        status: process.status,
                        disabled: !hasAccess(server._id, process._id),
                      })) || [],
                )
                .flat() || []
            }
            itemComponent={itemComponent}
            value={selectedItem?.processes || []}
            onChange={(values) => {
              selectItem(values, "processes");
            }}
            placeholder="Select Process"
            searchable
            w={{
              md: "25rem",
            }}
            maxValues={4}
            radius={"md"}
            withScrollArea
            maxDropdownHeight={200}
            classNames={{
              pillsList: classes.values,
            }}
            style={{
              zIndex: 204,
            }}
            comboboxProps={{
              position: "bottom",
              middlewares: { flip: false, shift: false },
            }}
            hidePickedOptions
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
      <Flex h={"100%"} justify={"space-between"}>
        <Group h={"100%"}>
          <Center
            w={{
              base: rem(42),
              xs: rem(70),
            }}
          >
            <Image alt="logo" src="/logo.png" width={25} height={25} />
          </Center>
        </Group>
        <Group h={"100%"} justify="right" px={"lg"} className={classes.defaultSelectGroup}>
          {MultiSelectItems}
        </Group>
        <Group h={"100%"} justify="right" px={"xs"} className={classes.filterIcon}>
          <ActionIcon variant="light" color="blue" onClick={open}>
            <IconFilterCog size={"1.2rem"} />
          </ActionIcon>
        </Group>
      </Flex>
    </AppShell.Header>
  );
}

function itemComponent(opt: IItem & { status: IProcess["status"] }) {
  return (
    <Flex align="center">
      <Box mr={10}>
        {opt.disabled ? (
          <IconLock size={14} />
        ) : (
          <IconCircleFilled
            size={10}
            style={{
              color: opt.status === "online" ? "#12B886" : opt.status === "stopped" ? "#FCC419" : "#FA5252",
            }}
          />
        )}
      </Box>
      <div>{opt.label}</div>
    </Flex>
  );
}
