import { Flex } from "@mantine/core";
import { IProcess } from "@pm2.web/typings";
import { IconCpu, IconDeviceSdCard, IconHistory } from "@tabler/icons-react";
import ms from "ms";

import { formatBytes } from "@/utils/format";
import { trpc } from "@/utils/trpc";

import ProcessGitMetric from "./ProcessGitMetric";
import ProcessItemMetric from "./ProcessMetric";

interface ProcessClusterMetricRowProps {
  processes: IProcess[];
  refetchInterval: number;
  showMetric: boolean;
}

export default function ProcessClusterMetricRow({ processes, refetchInterval, showMetric }: ProcessClusterMetricRowProps) {
  // Get stats for all processes in the cluster
  const statsQueries = processes.map(process => 
    trpc.process.getStat.useQuery(
      { processId: process._id },
      {
        refetchInterval,
        enabled: process.status === "online", // Only fetch stats for online processes
      }
    )
  );

  // Calculate aggregated metrics
  const aggregatedMetrics = () => {
    if (!showMetric) return { memory: 0, cpu: 0, uptime: 0 };

    let totalMemory = 0;
    let totalCpu = 0;
    let oldestUptime = 0;

    statsQueries.forEach((query, index) => {
      if (query.data && processes[index].status === "online") {
        totalMemory += query.data.memory || 0;
        totalCpu += query.data.cpu || 0;
        
        // For uptime, we want the oldest (highest value) among online processes
        if (query.data.uptime && query.data.uptime > oldestUptime) {
          oldestUptime = query.data.uptime;
        }
      }
    });

    return {
      memory: totalMemory,
      cpu: totalCpu,
      uptime: oldestUptime,
    };
  };

  const metrics = aggregatedMetrics();
  
  // Get primary process for Git versioning info (prefer online process)
  const primaryProcess = processes.find(p => p.status === "online") || processes[0];

  return (
    <Flex align={"center"} gap={"xs"} wrap={"wrap"}>
      {primaryProcess?.versioning?.url && <ProcessGitMetric versioning={primaryProcess.versioning} />}
      <ProcessItemMetric
        w="75px"
        Icon={IconDeviceSdCard}
        value={showMetric && formatBytes(metrics.memory)}
      />
      <ProcessItemMetric 
        w="55px" 
        Icon={IconCpu} 
        value={showMetric && (metrics.cpu.toFixed(0) || 0) + "%"} 
      />
      <ProcessItemMetric 
        w="57px" 
        Icon={IconHistory} 
        value={showMetric && ms(metrics.uptime)} 
      />
      </Flex>
    );
}
