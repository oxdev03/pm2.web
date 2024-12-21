import { AreaChart } from "@mantine/charts";
import { Flex } from "@mantine/core";

import { api } from "@/trpc/react";
import { formatBytes } from "@/utils/format";

interface ProcessChartProps {
  processId: string;
  refetchInterval: number;
  showMetric: boolean;
}

export default function ProcessChart({ processId, refetchInterval }: ProcessChartProps) {
  const getStats = api.process.getStats.useQuery(
    {
      processId,
      range: "seconds",
    },
    {
      refetchInterval,
    },
  );

  const chartData =
    getStats?.data
      ?.map((s) => ({
        CPU: s.cpu,
        RAM: s.memory,
        HEAP_USED: s.heapUsed,
        date: new Date(s.timestamp).toLocaleTimeString(),
      }))
      ?.reverse() || [];

  const data1 = [
    {
      RAM: 50_683_904,
      HEAP_USED: 0,
      date: "16:43:56",
    },
    {
      RAM: 52_506_624,
      HEAP_USED: 9_300_869,
      date: "16:44:11",
    },
    {
      RAM: 52_506_624,
      HEAP_USED: 9_300_869,
      date: "16:44:11",
    },
    {
      RAM: 57_565_184,
      HEAP_USED: 6_689_914,
      date: "16:44:21",
    },
    {
      RAM: 57_540_608,
      HEAP_USED: 13_107_200,
      date: "16:44:29",
    },
    {
      RAM: 57_257_984,
      HEAP_USED: 8_661_237,
      date: "16:45:28",
    },
  ];

  return (
    <Flex align={"center"} justify={"space-between"}>
      <AreaChart
        w={"50%"}
        h={"150px"}
        pt={"0.5em"}
        pr="xs"
        data={data1}
        valueFormatter={(value) => formatBytes(value)}
        dataKey="date"
        series={[
          { name: "RAM", color: "yellow", label: "RAM" },
          { name: "HEAP_USED", color: "grape", label: "HEAP USED" },
        ]}
        withLegend
        withGradient
        // withDots={false}
        withXAxis={false}
        areaChartProps={{ syncId: "stats" }}
      />
      <AreaChart
        w={"50%"}
        h={"150px"}
        pt={"0.5em"}
        pr="xs"
        data={chartData}
        dataKey="date"
        type="default"
        yAxisProps={{ domain: [0, 100] }}
        series={[{ name: "CPU", color: "indigo.6" }]}
        withLegend
        withGradient
        withDots={false}
        withXAxis={false}
        areaChartProps={{ syncId: "stats" }}
      />
    </Flex>
  );
}
