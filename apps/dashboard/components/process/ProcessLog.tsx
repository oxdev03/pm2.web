import { Card, ScrollArea, Text } from "@mantine/core";

import { trpc } from "@/utils/trpc";

interface ProcessActionProps {
  processId: string;
  refetchInterval: number;
}

export default function ProcessLog({ processId, refetchInterval }: ProcessActionProps) {
  const getLogs = trpc.process.getLogs.useQuery(
    { processId },
    {
      refetchInterval: refetchInterval,
    },
  );

  return (
    <Card radius="md" p="xs" h="150px" m="xs" withBorder>
      <ScrollArea h="100%" style={{ overflowX: "hidden" }}>
        <Text fw="bold">Logs</Text>
        <div>
          {getLogs?.data?.map((log) => (
            <Text
              key={log._id}
              size="md"
              fw={600}
              c={log.type == "success" ? "teal.6" : log.type == "error" ? "red.6" : "blue.4"}
              component="pre"
              my="0px"
            >
              {new Date(log.createdAt)?.toLocaleTimeString()} {log.message}
            </Text>
          ))}
          {getLogs.error && <div>Error: {getLogs.error.message}</div>}
        </div>
      </ScrollArea>
    </Card>
  );
}
