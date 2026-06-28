import { Badge, Group, Text } from "@mantine/core";
import { Icon, IconProps } from "@tabler/icons-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export default function ProcessItemMetric({
  w,
  Icon,
  value,
}: {
  w?: string;
  Icon: any;
  value?: string | undefined | boolean;
}) {
  return (
    <Badge variant="light" radius="md" size="lg" h="30px">
      <Group align="center" gap="xs">
        <Icon size="1.2rem" />
        <Text size="sm" fw={600}>{value || ""}</Text>
      </Group>
    </Badge>
  );
}
