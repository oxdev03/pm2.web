import { Flex } from "@mantine/core";
import { IconCpu, IconDeviceSdCard, IconHistory } from "@tabler/icons-react";
import ms from "ms";

import { formatBytes } from "@/utils/format";
import { trpc } from "@/utils/trpc";

import ProcessItemMetric from "./ProcessMetric";

interface ProcessActionProps {
  processId: string;
  refetchInterval: number;
  showMetric: boolean;
}

export default function ProcessMetricRow({ processId, refetchInterval, showMetric }: ProcessActionProps) {
  const getStat = trpc.process.getStat.useQuery(
    { processId },
    {
      refetchInterval,
    },
  );

  return (
    <Flex align={"center"} gap={"xs"} wrap={"wrap"}>
      <ProcessItemMetric
        w="75px"
        Icon={IconDeviceSdCard}
        value={showMetric && formatBytes(getStat.data?.memory || 0)}
      />
      <ProcessItemMetric w="55px" Icon={IconCpu} value={showMetric && (getStat.data?.cpu?.toFixed(0) || 0) + "%"} />
      <ProcessItemMetric w="57px" Icon={IconHistory} value={showMetric && ms(getStat.data?.uptime || 0)} />
    </Flex>
  );
}
