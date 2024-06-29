import { Checkbox,Grid, Paper, rem, ScrollArea, Table } from "@mantine/core";
import { IUser } from "@pm2.web/typings";

import UserItem from "./table/UserItem";

interface UserManagementProps {
  setSelection: React.Dispatch<React.SetStateAction<string[]>>;
  selection: string[];
  users: IUser[];
  refreshUsers: () => void;
}

export default function UserManagement({ selection, setSelection, users, refreshUsers }: UserManagementProps) {
  const toggleRow = (id: string) =>
    setSelection((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  const toggleAll = () =>
    setSelection((current) =>
      current.length === users.filter((x) => !x.acl.owner && !x.acl.admin).length
        ? []
        : users.filter((x) => !x.acl.owner && !x.acl.admin).map((item) => item._id),
    );

  return (
    <>
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
                    refresh={() => refreshUsers()}
                    role={getUserRole(item)}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      </Grid.Col>
    </>
  );
}


const getUserRole = (item: Omit<IUser, "password" | "updatedAt">) => {
  return item.acl?.owner ? "owner" : item.acl?.admin ? "admin" : item.acl?.servers?.length ? "custom" : "none";
};