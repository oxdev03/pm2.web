import { AreaChart, DonutChart } from "@mantine/charts";
import { Card, Center, Flex, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { ISetting } from "@pm2.web/typings";
import { IconActivity, IconClockHour4, IconCpu, IconDeviceSdCard, IconServer } from "@tabler/icons-react";
import ms from "ms";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";

import { SelectedProvider, useSelected } from "@/components/context/SelectedProvider";
import DashboardLog from "@/components/dashboard/DashboardLog";
import { Dashboard } from "@/components/layouts/Dashboard";
import { StatsRing } from "@/components/stats/StatsRing";
import { getServerSideHelpers } from "@/server/helpers";
import { formatBytes } from "@/utils/format";
import { trpc } from "@/utils/trpc";

const statChartProps = {
  h: "300px",
  withLegend: true,
  withGradient: true,
  withDots: false,
  withXAxis: true,
  withYAxis: true,
  yAxisProps: { width: 55 },
  areaChartProps: { syncId: "stats" },
  connectNulls: true,
  curveType: "monotone" as any,
};

function Home({ settings }: { settings: ISetting }) {
  const { selectedServers, selectedProcesses } = useSelected();
  const { data } = trpc.server.getStats.useQuery(
    {
      processIds: selectedProcesses.map((p) => p._id),
      serverIds: selectedServers.map((p) => p._id),
      polling: settings.polling.backend / 1000,
    },
    {
      refetchInterval: settings.polling.frontend,
    },
  );

  const chartData = data?.stats?.map((e) => ({ ...e, date: new Date(e._id).toLocaleTimeString() })) || [];

  const onlineCount = selectedProcesses.filter((p) => p.status == "online").length;
  const stoppedCount = selectedProcesses.filter((p) => p.status == "stopped").length;
  const offlineCount = selectedProcesses.filter((p) => p.status == "offline").length;

  return (
    <Stack gap="xl" flex={1}>
      <Group justify="space-between" align="center">
        <Title order={2}>System Overview</Title>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        <Paper p="xl" radius="md" shadow="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <div>
              <Text c="dimmed" tt="uppercase" fw={700} size="xs">
                Total Servers
              </Text>
              <Text fw={900} size="2.5rem">
                {selectedServers.length}
              </Text>
            </div>
            <ThemeIcon color="cyan" variant="light" size={48} radius="md">
              <IconServer size="1.8rem" />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="xl" radius="md" shadow="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <div>
              <Text c="dimmed" tt="uppercase" fw={700} size="xs">
                Online Processes
              </Text>
              <Group align="flex-end" gap="xs" wrap="nowrap">
                <Text fw={900} size="2.5rem">
                  {onlineCount}
                </Text>
                <Text c="dimmed" pb="sm">
                  / {selectedProcesses.length}
                </Text>
              </Group>
            </div>
            <ThemeIcon
              color={onlineCount === selectedProcesses.length && onlineCount > 0 ? "teal" : "cyan"}
              variant="light"
              size={48}
              radius="md"
            >
              <IconActivity size="1.8rem" />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="xl" radius="md" shadow="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <div>
              <Text c="dimmed" tt="uppercase" fw={700} size="xs">
                Server Uptime
              </Text>
              <Text fw={900} size="2.5rem" style={{ whiteSpace: "nowrap" }}>
                {ms(data?.serverUptime || 0)}
              </Text>
            </div>
            <ThemeIcon color="violet" variant="light" size={48} radius="md">
              <IconClockHour4 size="1.8rem" />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="xl" radius="md" shadow="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <div>
              <Text c="dimmed" tt="uppercase" fw={700} size="xs">
                Process Uptime
              </Text>
              <Text fw={900} size="2.5rem" style={{ whiteSpace: "nowrap" }}>
                {ms(data?.processUptime || 0)}
              </Text>
            </div>
            <ThemeIcon color="grape" variant="light" size={48} radius="md">
              <IconActivity size="1.8rem" />
            </ThemeIcon>
          </Group>
        </Paper>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg">
        <Paper p="xl" shadow="sm" radius="md">
          <Group justify="space-between" mb="lg">
            <Text fw={700} size="lg">
              CPU Usage
            </Text>
            <ThemeIcon color="blue" variant="light" size="lg" radius="xl">
              <IconCpu size="1.2rem" />
            </ThemeIcon>
          </Group>
          <AreaChart
            {...statChartProps}
            data={chartData}
            dataKey="date"
            type="default"
            valueFormatter={(value) => value.toFixed(1) + "%"}
            series={[
              { name: "processCpu", color: "cyan.6", label: "Process CPU" },
              { name: "serverCpu", color: "violet.6", label: "Server CPU" },
            ]}
          />
        </Paper>

        <Paper p="xl" shadow="sm" radius="md">
          <Group justify="space-between" mb="lg">
            <Text fw={700} size="lg">
              Memory Allocation
            </Text>
            <ThemeIcon color="indigo" variant="light" size="lg" radius="xl">
              <IconDeviceSdCard size="1.2rem" />
            </ThemeIcon>
          </Group>
          <AreaChart
            {...statChartProps}
            data={chartData}
            dataKey="date"
            type="default"
            valueFormatter={(value) => formatBytes(value)}
            series={[
              { name: "processRam", color: "teal.6", label: "Process RAM" },
              { name: "serverRam", color: "indigo.6", label: "Server RAM" },
            ]}
          />
        </Paper>
      </SimpleGrid>

      <Paper p="xl" shadow="sm" radius="md">
        <Text fw={700} size="lg" mb="md">
          Process Activity Logs
        </Text>
        <DashboardLog refetchInterval={settings.polling.frontend} processIds={selectedProcesses.map((p) => p._id)} />
      </Paper>
    </Stack>
  );
}

export default function HomePage({}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const dashboardQuery = trpc.server.getDashBoardData.useQuery(undefined, {
    refetchInterval: 5000,
  });
  const data = dashboardQuery.data!;

  if (dashboardQuery.status !== "success") {
    return <></>;
  }

  return (
    <>
      <Head>
        <title>pm2.web</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>
      <SelectedProvider servers={data.servers}>
        <Dashboard>
          <Home settings={data.settings} />
        </Dashboard>
      </SelectedProvider>
    </>
  );
}

export async function getServerSideProps() {
  const helpers = await getServerSideHelpers();

  await helpers.server.getDashBoardData.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
}
