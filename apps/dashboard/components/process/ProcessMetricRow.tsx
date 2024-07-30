import { Flex } from "@mantine/core";
import { IProcess } from "@pm2.web/typings";
import { IconCpu, IconDeviceSdCard, IconHistory } from "@tabler/icons-react";
import ms from "ms";

import { formatBytes } from "@/utils/format";
import { trpc } from "@/utils/trpc";

import ProcessGitMetric from "./ProcessGitMetric";
import ProcessItemMetric from "./ProcessMetric";

interface ProcessActionProps {
  process: IProcess;
  refetchInterval: number;
  showMetric: boolean;
}

export default function ProcessMetricRow({ process, refetchInterval, showMetric }: ProcessActionProps) {
  const getStat = trpc.process.getStat.useQuery(
    { processId: process._id },
    {
      refetchInterval,
    },
  );

  return (
    <Flex align={"center"} gap={"xs"} wrap={"wrap"}>
      {process?.versioning?.url && <ProcessGitMetric versioning={process.versioning} />}
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
