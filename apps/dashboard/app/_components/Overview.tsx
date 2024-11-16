"use client";

import { useSelected } from "@/components/context/SelectedProvider";
import DashboardLog from "@/components/dashboard/DashboardLog";
import { StatsRing } from "@/components/stats/StatsRing";
import { api } from "@/trpc/react";
import { formatBytes } from "@/utils/format";
import { DonutChart } from "@mantine/charts";
import { Flex, SimpleGrid, Paper } from "@mantine/core";
import ms from "ms";
import { AreaChart } from "recharts";
import classes from "@/styles/index.module.css";

const statChartProps = {
  h: "120px",
  withLegend: true,
  withGradient: true,
  withDots: false,
  withXAxis: false,
  yAxisProps: { width: 55 },
  areaChartProps: { syncId: "stats" },
  connectNulls: true,
};

export default function Overview() {
  const { selectedServers, selectedProcesses, settings } = useSelected();
  const { data } = api.server.getStats.useQuery(
    {
      processIds: selectedProcesses.map((p) => p._id),
      serverIds: selectedServers.map((p) => p._id),
      polling: settings!.polling.backend / 1000,
    },
    {
      refetchInterval: settings!.polling.frontend,
    },
  );

  const chartData = data?.stats?.map((e) => ({ ...e, date: new Date(e._id).toLocaleTimeString() })) || [];

  const onlineCount = selectedProcesses.filter((p) => p.status == "online").length;
  const stoppedCount = selectedProcesses.filter((p) => p.status == "stopped").length;
  const offlineCount = selectedProcesses.filter((p) => p.status == "offline").length;

  return (
    <Flex direction={"column"} rowGap={"md"} flex={1}>
      <SimpleGrid cols={{ base: 1, sm: 4 }}>
        <Paper className={classes.chartBg} p={"xs"}>
          <AreaChart
            {...statChartProps}
            data={chartData}
            dataKey="date"
            type="default"
            valueFormatter={(value) => value.toFixed(1)}
            unit="%"
            series={[
              { name: "processCpu", color: "blue", label: "Process CPU" },
              { name: "serverCpu", color: "grape", label: "Server CPU" },
            ]}
          />
        </Paper>
        <Paper className={classes.chartBg} p={"xs"}>
          <AreaChart
            {...statChartProps}
            data={chartData}
            dataKey="date"
            type="default"
            valueFormatter={(value) => formatBytes(value)}
            series={[
              { name: "processRam", color: "indigo", label: "Process RAM" },
              { name: "serverRam", color: "yellow", label: "Server RAM" },
            ]}
          />
        </Paper>
        <StatsRing
          stat={{
            title: "Uptime",
            stats: [
              {
                label: "Server",
                value: ms(data?.serverUptime || 0),
              },
              {
                label: "Process",
                value: ms(data?.processUptime || 0),
              },
            ],
            progress: 80,
            color: "#8377D1",
            icon: "up",
          }}
        />
        <Paper className={classes.chartBg} p={"md"}>
          <Flex justify={"center"}>
            <DonutChart
              classNames={{
                label: classes.statusLabel,
              }}
              size={220}
              thickness={30}
              style={{ marginBottom: -120 }}
              data={[
                { name: "Online", value: onlineCount, color: "teal.5" },
                { name: "Stopped", value: stoppedCount, color: "yellow.5" },
                { name: "Offline", value: offlineCount, color: "red.6" },
              ]}
              chartLabel={"STATUS"}
              startAngle={180}
              endAngle={0}
            />
          </Flex>
        </Paper>
      </SimpleGrid>
      <DashboardLog refetchInterval={settings!.polling.frontend} processIds={selectedProcesses.map((p) => p._id)} />
    </Flex>
  );
}
