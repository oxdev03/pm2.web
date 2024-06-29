import { ActionIcon,Flex } from "@mantine/core";
import { IconPower, IconReload, IconSquareRoundedMinus,IconTrash } from "@tabler/icons-react";

import classes from "@/styles/process.module.css";
import { sendNotification } from "@/utils/notification";
import { trpc } from "@/utils/trpc";

interface ProcessActionProps {
  processId: string;
  collapse: () => void;
}

export default function ProcessAction({ processId, collapse }: ProcessActionProps) {
  const processAction = trpc.process.action.useMutation({
    onSuccess(data, variables) {
      if (!data) {
        sendNotification(variables.action + processId, `Failed ${variables.action}`, `Server didn't respond`, `error`);
      }
    },
  });

  return (
    <Flex gap={"5px"}>
      <ActionIcon
        variant="light"
        color="blue"
        radius="sm"
        size={"lg"}
        loading={processAction.isPending && processAction.variables.action === "RESTART"}
        onClick={() =>
          processAction.mutate({
            processId,
            action: "RESTART",
          })
        }
        disabled={processAction.isPending}
      >
        <IconReload size="1.4rem" />
      </ActionIcon>
      <ActionIcon
        variant="light"
        color="orange"
        radius="sm"
        size={"lg"}
        loading={processAction.isPending && processAction.variables.action === "STOP"}
        onClick={() =>
          processAction.mutate({
            processId,
            action: "STOP",
          })
        }
        disabled={processAction.isPending}
      >
        <IconPower size="1.4rem" />
      </ActionIcon>
      <ActionIcon
        variant="light"
        color="red"
        radius="sm"
        size={"lg"}
        loading={processAction.isPending && processAction.variables.action === "DELETE"}
        onClick={() =>
          processAction.mutate({
            processId,
            action: "DELETE",
          })
        }
        disabled={processAction.isPending}
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
