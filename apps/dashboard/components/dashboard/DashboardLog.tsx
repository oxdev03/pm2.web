import { trpc } from "@/utils/trpc";
import { Flex, ScrollArea, Paper, Text } from "@mantine/core";
import { IconList } from "@tabler/icons-react";
import { useRef } from "react";

interface DashboardLogProps {
  refetchInterval: number;
  processIds: string[];
}

export default function DashboardLog({ refetchInterval, processIds }: DashboardLogProps) {
  const scrollViewport = useRef<HTMLDivElement>(null);
  const { data } = trpc.server.getLogs.useQuery(
    { processIds },
    {
      refetchInterval: refetchInterval,
    },
  );

  const logColor = {
    success: "teal.6",
    error: "red.6",
    warning: "yellow.5",
    info: "blue.4",
  };

  return (
    <>
      <Flex gap={"4px"} align={"center"}>
        <IconList size="1.4rem" stroke={1.5} />
        <Text size="xl" fw={600}>
          Logs
        </Text>
      </Flex>
      <ScrollArea.Autosize viewportRef={scrollViewport} flex={1} mah={"60dvh"}>
        <Paper radius={"md"} p="md" mih={"64dvh"} w={"100%"} maw={"100%"}>
          {data?.length
            ? data?.map((log) => (
                <Text key={log?._id} size="md" fw={600} c={logColor[log?.type || "info"]} component="pre" my="0px">
                  {log?.createdAt?.toISOString()?.split("T")[1].split(".")[0]} {log?.message}
                </Text>
              ))
            : "No logs"}
        </Paper>
      </ScrollArea.Autosize>
    </>
  );
}
