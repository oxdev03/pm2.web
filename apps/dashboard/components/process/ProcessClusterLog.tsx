import { Paper, ScrollArea, Text } from "@mantine/core";
import { IProcess } from "@pm2.web/typings";

import classes from "@/styles/process.module.css";
import { trpc } from "@/utils/trpc";

interface ProcessClusterLogProps {
  processes: IProcess[];
  refetchInterval: number;
}

export default function ProcessClusterLog({ processes, refetchInterval }: ProcessClusterLogProps) {
  // Get all process IDs for the cluster
  const processIds = processes.map(p => p._id);

  const getLogs = trpc.server.getLogs.useQuery(
    { processIds, limit: 100 },
    {
      refetchInterval: refetchInterval,
      enabled: processIds.length > 0,
    },
  );

  return (
    <Paper radius="md" p="xs" className={classes.processLog} h={"100px"} m="xs">
      <ScrollArea h={"100%"} style={{ overflowX: "hidden" }}>
        <Text fw="bold">Cluster Logs ({processes.length} instances)</Text>
        <div>
          {getLogs?.data?.map((log, index) => (
            <Text
              key={log?._id || index}
              size="md"
              fw={600}
              c={log?.type == "success" ? "teal.6" : log?.type == "error" ? "red.6" : "blue.4"}
              component="pre"
              my="0px"
            >
              {log?.createdAt ? new Date(log.createdAt).toLocaleTimeString() : ''} {log?.message}
            </Text>
          ))}
          {getLogs.error && <div>Error: {getLogs.error.message}</div>}
        </div>
      </ScrollArea>
    </Paper>
    );
}
