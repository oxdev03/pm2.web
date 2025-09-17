import { AreaChart } from "@mantine/charts";
import { Flex } from "@mantine/core";
import { IProcess } from "@pm2.web/typings";

import { formatBytes } from "@/utils/format";
import { trpc } from "@/utils/trpc";

interface ProcessClusterChartProps {
  processes: IProcess[];
  refetchInterval: number;
  showMetric: boolean;
  polling: number;
}

export default function ProcessClusterChart({ processes, refetchInterval, showMetric }: ProcessClusterChartProps) {
  // Get online processes only
  const onlineProcesses = processes.filter(p => p.status === "online");

  // Get stats for all online processes individually
  const statsQueries = onlineProcesses.map(process => 
    trpc.process.getStats.useQuery(
      { processId: process._id, range: "seconds" },
      {
        refetchInterval,
        enabled: showMetric,
      }
    )
  );

  // Aggregate data by timestamp for cumulative charts
  const chartData = (() => {
    if (!showMetric || onlineProcesses.length === 0) return [];

    const aggregatedData: { [timestamp: string]: { CPU: number, RAM: number, HEAP_USED: number, count: number } } = {};

    // Sum all stats by timestamp
    statsQueries.forEach((query) => {
      if (query.data) {
        query.data.forEach((stat) => {
          const timestamp = stat.timestamp;
          if (!aggregatedData[timestamp]) {
            aggregatedData[timestamp] = { CPU: 0, RAM: 0, HEAP_USED: 0, count: 0 };
          }
          aggregatedData[timestamp].CPU += stat.cpu || 0;
          aggregatedData[timestamp].RAM += stat.memory || 0;
          aggregatedData[timestamp].HEAP_USED += stat.heapUsed || 0;
          aggregatedData[timestamp].count += 1;
        });
      }
    });

    // Convert to chart format
    return Object.entries(aggregatedData)
      .map(([timestamp, data]) => ({
        CPU: data.CPU,
        RAM: data.RAM,
        HEAP_USED: data.HEAP_USED,
        date: new Date(timestamp).toLocaleTimeString(),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  })();

  if (!showMetric || onlineProcesses.length === 0) {
    return null;
  }

  return (
    <Flex align={"center"} justify={"space-between"}>
      <AreaChart
        w={"50%"}
        h={"150px"}
        pt={"0.5em"}
        pr="xs"
        data={chartData}
        valueFormatter={(value) => formatBytes(value)}
        dataKey="date"
        type="default"
        series={[
          { name: "RAM", color: "yellow" },
          { name: "HEAP_USED", color: "grape", label: "HEAP USED" },
        ]}
        withLegend
        withGradient
        withDots={false}
        withXAxis={false}
        areaChartProps={{ syncId: "cluster-stats" }}
      />
      <AreaChart
        w={"50%"}
        h={"150px"}
        pt={"0.5em"}
        pr="xs"
        data={chartData}
        dataKey="date"
        type="default"
        yAxisProps={{ domain: [0, 100 * onlineProcesses.length] }} // Scale based on number of processes for cumulative CPU
        series={[{ name: "CPU", color: "indigo.6" }]}
        withLegend
        withGradient
        withDots={false}
        withXAxis={false}
        areaChartProps={{ syncId: "cluster-stats" }}
      />
    </Flex>
    );
}
