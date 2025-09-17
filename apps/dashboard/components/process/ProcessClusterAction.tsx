import { ActionIcon, Flex } from "@mantine/core";
import { IconPower, IconReload, IconSquareRoundedMinus, IconTrash } from "@tabler/icons-react";
import { IProcess } from "@pm2.web/typings";

import classes from "@/styles/process.module.css";
import { sendNotification } from "@/utils/notification";
import { trpc } from "@/utils/trpc";

interface ProcessClusterActionProps {
  processes: IProcess[];
  collapse: () => void;
}

export default function ProcessClusterAction({ processes, collapse }: ProcessClusterActionProps) {
  const processAction = trpc.process.action.useMutation({
    onSuccess(data, variables) {
      if (!data) {
        sendNotification(
          variables.action + variables.processId, 
          `Failed ${variables.action}`, 
          `Server didn't respond`, 
          `error`
        );
      }
    },
  });

  const executeClusterAction = async (action: "RESTART" | "STOP" | "DELETE") => {
    // Execute action on all processes in the cluster sequentially
    for (const process of processes) {
      try {
        await processAction.mutateAsync({
          processId: process._id,
          action,
        });
      } catch (error) {
        console.error(`Failed to ${action} process ${process.name} (${process._id}):`, error);
        sendNotification(
          `cluster-${action}-${process._id}`,
          `Failed ${action} on cluster`,
          `Error on process ${process.name}`,
          "error"
        );
      }
    }
  };

  const isLoading = processAction.isPending;

  return (
    <Flex gap={"5px"}>
      <ActionIcon
        variant="light"
        color="blue"
        radius="sm"
        size={"lg"}
        loading={isLoading && processAction.variables?.action === "RESTART"}
        onClick={() => executeClusterAction("RESTART")}
        disabled={isLoading}
      >
        <IconReload size="1.4rem" />
      </ActionIcon>
      <ActionIcon
        variant="light"
        color="orange"
        radius="sm"
        size={"lg"}
        loading={isLoading && processAction.variables?.action === "STOP"}
        onClick={() => executeClusterAction("STOP")}
        disabled={isLoading}
      >
        <IconPower size="1.4rem" />
      </ActionIcon>
      <ActionIcon
        variant="light"
        color="red"
        radius="sm"
        size={"lg"}
        loading={isLoading && processAction.variables?.action === "DELETE"}
        onClick={() => executeClusterAction("DELETE")}
        disabled={isLoading}
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
        variant={"light"}
        color={"gray.5"}
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
