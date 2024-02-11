import { Flex, Paper, Text } from "@mantine/core";
import { TablerIconsProps } from "@tabler/icons-react";

import classes from "./ProcessItemMetric.module.css";

export default function ProcessItemMetric({
  w,
  Icon,
  value,
}: {
  w?: string;
  Icon: React.ElementType<TablerIconsProps>;
  value: string | undefined;
}) {
  return (
    <Paper className={classes.processMetric} radius="md" p={"4px"} px={"10px"}>
      <Flex align={"center"} justify={"space-between"} gap={"5px"} w={w || "50px"}>
        <Icon size="1.2rem" />
        <Text size="md">{value || ""}</Text>
      </Flex>
    </Paper>
  );
}
