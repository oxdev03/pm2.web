import { Group, Avatar, Flex, Text } from "@mantine/core";
import { IconHistory, IconChartBar, IconReload, IconPower, IconTrash } from "@tabler/icons-react";

export const permissionData = [
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

export const SelectItemComponent = (item: (typeof permissionData)[0]) => (
  <Group wrap="nowrap">
    <Avatar size={"xs"}>{item.icon}</Avatar>
    <div>
      <Text size="sm">{item.description}</Text>
    </div>
  </Group>
);

export const PillComponent = (item: (typeof permissionData)[0]) => (
  <Flex align={"center"} justify={"center"} h={"100%"}>
    <Avatar size={"xs"}>{item.icon}</Avatar>
  </Flex>
);
