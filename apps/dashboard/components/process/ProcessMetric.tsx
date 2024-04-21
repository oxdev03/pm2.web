import { Flex, Paper, Text } from "@mantine/core";
import { Icon, IconProps } from "@tabler/icons-react";
import classes from "@/styles/process.module.css";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export default function ProcessItemMetric({
  w,
  Icon,
  value,
}: {
  w?: string;
  Icon: ForwardRefExoticComponent<Omit<IconProps, "ref"> & RefAttributes<Icon>>;
  value?: string | undefined | boolean;
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
