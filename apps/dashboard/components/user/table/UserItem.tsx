import { ActionIcon, Checkbox, Group, NativeSelect, Table, Text } from "@mantine/core";
import { IconMail, IconTrash } from "@tabler/icons-react";
import cx from "clsx";

import { GithubIcon } from "@/components/icons/github";
import { GoogleIcon } from "@/components/icons/google";
import { actionNotification } from "@/utils/notification";
import { trpc } from "@/utils/trpc";

import classes from "./UserItem.module.css";

interface UserItemProps {
  selected: boolean;
  selectUser: (userId: string) => void;
  refresh: () => void;
  userId: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "custom" | "none";
  authProvider: "github" | "google" | undefined;
}

export default function UserItem({
  selected,
  selectUser,
  userId,
  name,
  email,
  authProvider,
  role,
  refresh,
}: UserItemProps) {
  const selectDisabled = role == "admin" || role == "owner";
  const userRoles = ["OWNER", "ADMIN", "CUSTOM", "NONE"] as const;
  type UserRole = (typeof userRoles)[number];
  const deleteUser = trpc.user.deleteUser.useMutation({
    onMutate({ userId }) {
      actionNotification(userId, `Deleting user: ${name}`, `Please Wait ...`, "pending");
    },
    onError(error) {
      actionNotification(userId, `Failed to delete user: ${name}`, error.message, "error");
    },
    onSuccess(data) {
      actionNotification(userId, `Deleted User: ${name}`, data, "success");
      refresh();
    },
  });

  const updateUser = trpc.user.updateRole.useMutation({
    onMutate({ userId, role }) {
      actionNotification(userId, `Updating role to ${capitalizeFirst(role)}`, `Please Wait ...`, "pending");
    },
    onError(error, { role }) {
      actionNotification(userId, `Failed to update role to ${capitalizeFirst(role)}`, error.message, "error");
    },
    onSuccess(data, { role }) {
      actionNotification(userId, `Updated role to ${capitalizeFirst(role)}`, data, "success");
      refresh();
    },
  });

  return (
    <Table.Tr className={cx({ [classes.rowSelected]: selected })} data-cy="user-item" data-cy-id={email}>
      <Table.Td>
        <Checkbox
          checked={selected}
          onChange={() => selectUser(userId)}
          disabled={selectDisabled}
          data-cy="user-item-select"
        />
      </Table.Td>
      <Table.Td>
        <Group gap="sm">
          <>
            {!authProvider && <IconMail />}
            {authProvider == "github" && <GithubIcon />}
            {authProvider == "google" && <GoogleIcon />}
          </>
          <Text size="sm" fw={500} data-cy="user-item-name">
            {name}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td data-cy="user-item-email">{email}</Table.Td>
      <Table.Td>
        <NativeSelect
          data={userRoles.map((x) => {
            return {
              label: capitalizeFirst(x),
              value: x,
              disabled: x == "CUSTOM",
            };
          })}
          variant="filled"
          value={role.toUpperCase()}
          disabled={updateUser.isPending}
          data-cy="user-item-role"
          onChange={(e) => {
            const role = e.target.value as UserRole;
            updateUser.mutate({ userId, role: role });
          }}
        />
      </Table.Td>
      <Table.Td>
        <ActionIcon
          variant="light"
          color="red.4"
          radius="sm"
          size={"lg"}
          loading={deleteUser.isPending}
          onClick={() => deleteUser.mutate({ userId: userId })}
          data-cy="user-item-delete"
        >
          <IconTrash size="1.4rem" />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
}

function capitalizeFirst(str: string): string {
  const lw = str.toLowerCase();
  return lw.charAt(0).toUpperCase() + lw.slice(1);
}