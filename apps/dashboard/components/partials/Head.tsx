import { ActionIcon, AppShell, Box, Burger, Center, Flex, Group, Modal, rem, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IProcess } from "@pm2.web/typings";
import { IconCircleFilled, IconDatabaseCog, IconFilterCog, IconLock, IconServerCog } from "@tabler/icons-react";
import Image from "next/image";
import { useSession } from "next-auth/react";

import Access from "@/utils/access";

import { useSelected } from "../context/SelectedProvider";
import { CustomMultiSelect, IItem } from "../misc/MultiSelect/CustomMultiSelect";

export function Head({ mobileOpened, toggleMobile }: { mobileOpened?: boolean; toggleMobile?: () => void }) {
  const { servers, selectItem, selectedItem } = useSelected();
  const { data: session } = useSession();
  const [opened, { open, close }] = useDisclosure(false);

  const hasAccess = (server_id: string, process_id: string) => {
    const user = session?.user;
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
                disabled: !server.processes.some((process) => hasAccess(server._id, process._id)),
              })) || []
            }
            onChange={(values) => {
              selectItem?.(values, "servers");
            }}
            itemComponent={itemComponent}
            placeholder="Select Server"
            searchable
            w={{ md: "15rem", base: "100%" }}
            radius="md"
            hidePickedOptions
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
            w={{ md: "15rem", base: "100%" }}
            maxValues={4}
            radius="md"
            withScrollArea
            maxDropdownHeight={200}
            style={{ zIndex: 204 }}
            comboboxProps={{ position: "bottom", middlewares: { flip: false, shift: false } }}
            hidePickedOptions
          />
        </>
      )}
    </>
  );

  return (
    <AppShell.Header>
      <Modal opened={opened} onClose={close} title="Server/Process Filter" zIndex={200}>
        <Stack style={{ zIndex: 203 }}>{MultiSelectItems}</Stack>
      </Modal>
      <Flex h="100%" justify="space-between" align="center" pr="xl">
        <Group h="100%" gap={0}>
          {toggleMobile && <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" ml="md" />}
          <Center w={80} h="100%">
            <Image
              alt="logo"
              src="/logo.png"
              width={30}
              height={30}
              style={{ filter: "drop-shadow(0px 0px 8px rgba(0,0,0,0.5))" }}
            />
          </Center>
        </Group>

        <Group h="100%" justify="right" gap="md">
          <Group display={{ base: "none", lg: "flex" }} gap="md">
            {MultiSelectItems}
          </Group>
          <ActionIcon
            variant="light"
            color="cyan"
            onClick={open}
            size="lg"
            radius="md"
            display={{ base: "flex", lg: "none" }}
          >
            <IconFilterCog size="1.2rem" />
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
