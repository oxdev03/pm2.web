import { Flex, ActionIcon } from "@mantine/core";
import { IconReload, IconPower, IconTrash, IconSquareRoundedMinus } from "@tabler/icons-react";

import classes from "@/styles/process.module.css";

interface ProcessActionProps {
  processId: string;
  collapse: () => void;
}

export default function ProcessAction({ processId, collapse }: ProcessActionProps) {
  return (
    <Flex gap={"5px"}>
      <ActionIcon
        variant="light"
        color="blue"
        radius="sm"
        size={"lg"}
        loading={true}
        onClick={() => undefined}
        disabled={false}
      >
        <IconReload size="1.4rem" />
      </ActionIcon>
      <ActionIcon
        variant="light"
        color="orange"
        radius="sm"
        size={"lg"}
        loading={true}
        onClick={() => undefined}
        disabled={false}
      >
        <IconPower size="1.4rem" />
      </ActionIcon>
      <ActionIcon
        variant="light"
        color="red"
        radius="sm"
        size={"lg"}
        loading={true}
        onClick={() => undefined}
        disabled={false}
      >
        <IconTrash size="1.4rem" />
      </ActionIcon>
      <ActionIcon
        className={classes.colorSchemeLight}
        variant={"light"}
        color={"dark.2"}
        radius="sm"
        size={"sm"}
        mr={"-3px"}
        onClick={collapse}
      >
        <IconSquareRoundedMinus size="1.1rem" />
      </ActionIcon>
      <ActionIcon
        className={classes.colorSchemeDark}
        variant={"subtle"}
        color={"dark.8"}
        radius="sm"
        size={"sm"}
        mr={"-3px"}
        onClick={collapse}
      >
        <IconSquareRoundedMinus size="1.1rem" />
      </ActionIcon>
    </Flex>
  );
}
