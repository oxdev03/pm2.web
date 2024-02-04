import ms from 'ms';
import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

import { SelectedProvider, useSelected } from '@/components/context/SelectedProvider';
import { Dashboard } from '@/components/layouts/Dashboard';
import { StatsRing } from '@/components/stats/StatsRing';
import { Log, Status } from '@/types/status';
import { fetchServer, fetchSettings } from '@/utils/fetchSSRProps';
import { Center, Flex, Paper, ScrollArea, SimpleGrid, Text } from '@mantine/core';
import { useQueue } from '@mantine/hooks';
import { IconList } from '@tabler/icons-react';
import { IProcess, Stats } from '@/types/server';
import uniqBy from 'lodash/uniqBy';
import { ISetting } from '@/types/setting';
import { useRouter } from 'next/router';

function Home({ settings }: { settings: ISetting }) {
  const [status, setStatus] = useState<Status | null>();
  const [stats, setStats] = useState<any | null>();
  const { servers, selectItem, selectedItem } = useSelected();
  const scrollViewport = useRef<HTMLDivElement>(null);
  const logsQueue = useQueue<Log>({
    limit: 400,
  });
  const router = useRouter();

  useEffect(() => {
    let lastFetched = Date.now() - 1000 * 60 * 10;
    const fetchData = async () => {
      const body: {
        process?: string[];
        timestamp?: number;
      } = {};
      if (selectedItem?.servers?.length && !selectedItem?.processes?.length)
        body.process = servers
          .filter((server) => selectedItem.servers.includes(server.uuid))
          .map((server) => server.processes.map((process) => process._id))
          .flat();

      if (selectedItem?.processes?.length) body.process = selectedItem.processes;
      body.timestamp = lastFetched;

      const res = await fetch('/api/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      lastFetched = Date.now() - settings.polling.frontend;
      if (res.status != 200) return console.error('Error fetching status', res.status, res.statusText);
      const data = await res.json();
      setStatus(data);
    };
    fetchData();
    const interval = setInterval(fetchData, settings.polling.frontend);
    return () => clearInterval(interval);
  }, [selectedItem]);

  useEffect(() => {
    //refresh ssr props
    const interval = setInterval(async () => {
      router.replace(router.asPath);
    }, Math.min(settings.polling.frontend * 5, 1000 * 50));
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const prLen = selectedItem?.processes?.length;
    const KB_TO_GB = 1024 * 1024 * 1024;

    const allProcesses = servers.map((server) => server?.processes?.map((process) => process) || []).flat();
    const selectedServers = [
      ...(selectedItem?.servers || []),
      ...(allProcesses
        .filter((process) => selectedItem?.processes?.find((item) => item == process._id))
        .map((process) => process.server)
        .filter((item) => !selectedItem?.servers.includes(item || '')) || []),
    ];
    const filteredServer = servers.filter((server) => (selectedServers.length ? selectedServers.includes(server._id) : true));
    const filteredProcess = filteredServer.map((server) => server.processes.map((process) => process)).flat();

    const arbitraryCalc = (key: keyof Stats, defaultValue: number, divideBy?: number) => {
      let reduced = filteredServer.map((process) => process.stats[key]).reduce((a, b) => a + b, defaultValue) || defaultValue;
      if (divideBy) reduced /= divideBy;
      return reduced;
    };

    const cpu = (((prLen ? status?.cpu : arbitraryCalc('cpu', 0, servers.length)) || 0) / KB_TO_GB).toFixed(0);
    const memory = (((prLen ? status?.memory : arbitraryCalc('memory', 0)) || 0) / KB_TO_GB).toFixed(1);
    const load = arbitraryCalc('cpu', 0, servers.length).toFixed(0);

    let memoryMax = Number(arbitraryCalc('memoryMax', 0, KB_TO_GB).toFixed(0));
    if (prLen) memoryMax = memoryMax - Number(memory);
    if (Number(memoryMax) < 0.01) memoryMax = Number(memory);

    const online = status?.onlineCount;
    const total = prLen || filteredProcess.length;
    const uptime = ms((prLen ? status?.uptime : arbitraryCalc('uptime', 0, filteredServer.length)) || 0);

    const filteredLogs = uniqBy([...(logsQueue.state || []), ...(status?.logs || [])], '_id').sort((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? 1 : -1));
    // filter logs and add to queue
    logsQueue.update(() => filteredLogs);

    //scrollViewport?.current?.scrollTo({ top: scrollViewport?.current?.scrollHeight, behavior: 'smooth' });

    setStats({
      cpu,
      load,
      memory,
      memoryMax,
      uptime,
      online,
      total,
    });
  }, [status]);

  return (
    <Flex direction={'column'} rowGap={'md'} >
      <div>
        <SimpleGrid cols={{ base: 1, sm: 4 }}>
          <StatsRing
            stat={{
              label: 'CPU',
              stats: `Server ~${stats?.load || 0}%`,
              progress: stats?.cpu || 0,
              color: 'blue',
              icon: 'up',
            }}
          />
          <StatsRing
            stat={{
              label: 'RAM',
              stats: `${stats?.memory || 0}/${stats?.memoryMax || 0} GB`,
              progress: Number((((stats?.memory || 0) / (stats?.memoryMax || 0)) * 100).toFixed(0)),
              color: 'teal',
              icon: 'up',
            }}
          />
          <StatsRing
            stat={{
              label: 'Uptime',
              stats: stats?.uptime || 0,
              progress: 80,
              color: '#8377D1',
              icon: 'up',
            }}
          />
          <StatsRing
            stat={{
              label: 'Status',
              stats: `${stats?.online || 0}/${stats?.total || 0} online`,
              progress: Number((((stats?.online || 0) / (stats?.total || 0)) * 100).toFixed(0)),
              value: stats?.online || 0,
              color: '#93BEDF',
              icon: 'up',
            }}
          />
        </SimpleGrid>
      </div>
      <Flex gap={'4px'}>
        <Center h="100%" mt={'0.5px'}>
          <IconList size="1.4rem" stroke={1.5} />
        </Center>
        <Text size="xl" fw={600}>
          Logs
        </Text>
      </Flex>
      <Flex mih={'64vh'} h={'64vh'} w={'100%'} direction={'column'} gap={'md'}>
        <ScrollArea
          viewportRef={scrollViewport}
          mih={'100%'}
          h={'100%'}
          styles={{
            viewport: {
              div: {
                height: '100%',
              },
            },
          }}
        >
          <Paper h={'100%'} mih={'100%'} radius={'md'} p="md">
            {logsQueue.state?.length
              ? logsQueue.state?.map((log) => (
                  <Text key={log._id} size="md" fw={600} color={log.type == 'success' ? 'teal.6' : log.type == 'error' ? 'red.6' : 'blue.4'} component="pre" my="0px">
                    {log.createdAt.split('T')[1].split('.')[0]} {log.message}
                  </Text>
                ))
              : 'No logs'}
          </Paper>
        </ScrollArea>
      </Flex>
    </Flex>
  );
}

export default function HomePage({ servers, settings }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>pm2.web</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>
      <SelectedProvider servers={servers}>
        <Dashboard>
          <Home settings={settings} />
        </Dashboard>
      </SelectedProvider>
    </>
  );
}

export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');

  return {
    props: {
      servers: await fetchServer(),
      settings: await fetchSettings(),
    },
  };
}
