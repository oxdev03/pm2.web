import ms from 'ms';
import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { type DefaultSession } from 'next-auth';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useEffect, useState } from 'react';

import { SelectedProvider, useSelected } from '@/components/context/SelectedProvider';
import { Dashboard } from '@/components/layouts/Dashboard';
import { IProcess, IServer } from '@pm2.web/typings';
import { Log } from '@pm2.web/typings';
import { Acl } from '@pm2.web/typings';
import Access from '@/utils/acess';
import { fetchServer, fetchSettings } from '@/utils/fetchSSRProps';
import { formatBytes } from '@/utils/format';
import { IPermissionConstants, PERMISSIONS } from '@/utils/permission';
import { ActionIcon, Flex, Indicator, Paper, ScrollArea, Text, Transition } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBrandJavascript, IconCpu, IconDeviceSdCard, IconHistory, IconPower, IconReload, IconSquareRoundedMinus, IconTrash } from '@tabler/icons-react';
import uniqBy from 'lodash/uniqBy';
import { ISetting } from '@pm2.web/typings';
import { useRouter } from 'next/router';
import ProcessItemMetric from '@/components/stats/ProcessItemMetric';
import ProcessItemHeader from '@/components/misc/ProcessItemHeader';
import cx from 'clsx';
import classes from '../styles/process.module.css';

function Process({ settings }: { settings: ISetting }) {
  const [selection, setSelection] = useState<string[]>([]);
  const [processData, setProcessData] = useState<IProcess[]>([]);
  const [processState, setProcessState] = useState<
    {
      _id: string;
      action: 'restart' | 'stop' | 'delete' | null | undefined;
    }[]
  >([]);
  const [logs, setLogs] = useState<(Log & { process: string })[]>([]);
  const toggleRow = (id: string) => setSelection((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  const { servers, selectItem, selectedItem } = useSelected();
  const { data: session } = useSession();
  const router = useRouter();

  const hasPermission = (process_id: string, server_id: string, permission?: keyof IPermissionConstants) => {
    type DefaultSessionUser = DefaultSession & {
      acl: Acl;
    };
    const user = session?.user as DefaultSessionUser;
    if (!user || !user.acl) return false;
    if (!user?.acl?.owner && !user?.acl?.admin) {
      if (permission) return new Access(user.acl?.servers ?? []).getPerms(server_id, process_id).has(PERMISSIONS[permission]);
      return !!new Access(user.acl?.servers ?? []).getPermsValue(server_id, process_id);
    }
    return true;
  };

  const selectedProcesses = servers
    ?.map((server) => server.processes.filter((process) => selectedItem?.servers?.includes(server._id) || selectedItem?.servers?.length === 0))
    .flat()
    .filter((process) => (selectedItem?.processes?.includes(process._id) || (selectedItem?.processes?.length || 0) === 0) && hasPermission(process._id, process.server));

  const getProcessData = (id: string, property: 'ram' | 'cpu' | 'uptime' | 'status' | 'status_color') => {
    const process = processData.find((process) => process._id === id);
    if (!process) return;
    let status = process.status;
    if (process.status !== 'stopped' && new Date(process.updatedAt).getTime() + (5000 + settings.polling.frontend) < Date.now()) status = 'offline';
    if (property === 'status_color') {
      return status === 'online' ? '#12B886' : status === 'stopped' ? '#FCC419' : '#FA5252';
    }
    if (property === 'status') return process.status;
    if (status != 'online') return;
    if (property === 'uptime') return ms(process.stats?.uptime || 0);
    if (property === 'ram') return formatBytes(Number(process.stats?.memory || 0));
    if (property === 'cpu') return Number(process.stats?.cpu || 0).toFixed(0) + '%';
  };

  const triggerAction = async (id: string, action: 'restart' | 'stop' | 'delete') => {
    const newProcessState = [...processState];
    const processIndex = newProcessState.findIndex((x) => x._id == id);
    if (processIndex == -1) {
      newProcessState.push({
        _id: id,
        action,
      });
    } else {
      newProcessState[processIndex].action = action;
    }
    setProcessState(newProcessState);
    try {
      const res = await fetch('/api/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          id,
        }),
      });
    } catch (e) {
      newProcessState[processIndex].action = null;
      setProcessState(newProcessState);

      notifications.show({
        title: 'Error',
        message: 'Something went wrong, please try again later',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    let lastFetched = Date.now() - 1000 * 60 * 10;
    const fetchData = async () => {
      const body: {
        process?: string[];
        timestamp?: number;
      } = {};
      if (selectedItem?.servers?.length && !selectedItem?.processes?.length)
        body.process = servers
          .filter((server) => selectedItem.servers.includes(server._id))
          .map((server) => server.processes.map((process) => process._id))
          .flat();

      if (selectedItem?.processes?.length) body.process = selectedItem.processes;
      body.timestamp = lastFetched;

      const res = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      lastFetched = Date.now() - settings.polling.frontend;
      const data: IProcess[] = await res.json();
      setProcessData(data);

      setLogs(
        uniqBy(
          [
            ...logs,
            ...data
              .map((process) =>
                process?.logs?.length
                  ? process.logs.map((x) => ({
                      ...x,
                      process: process._id,
                    }))
                  : []
              )
              .flat(),
          ],
          '_id'
        )
      );
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

  // API returns changed (restart|toggle)Count to 0 , which identifies that the action has been completed
  useEffect(() => {
    if (!processData.length || processState.every((x) => !x.action)) return;
    const newProcessState = [...processState];
    for (let i = 0; i < processData.length; i++) {
      const idx = processState.findIndex((x) => x._id == processData[i]._id);
      if (idx == -1) continue;
      if (!processData[i].toggleCount && !processData[i].restartCount) newProcessState[idx].action = null;
    }
    setProcessState(newProcessState);
  }, [processData]);

  return (
    <Flex gap="xs" direction={'column'}>
      {selectedProcesses?.map((process) => (
        <Paper
          key={process._id}
          radius="md"
          p="xs"
          shadow="sm"
          className={cx(classes.processItem, {
            [classes.opened]: selection.includes(process._id),
            [classes.closed]: !selection.includes(process._id),
          })}
          /* sx={(theme) => ({
            transition: '0.5s ease-out max-height',
            maxHeight: selection.includes(process._id) ? '200px' : '55px',
            [theme.fn.smallerThan('sm')]: {
              maxHeight: selection.includes(process._id) ? '200px' : '90px',
            },
            [theme.fn.smallerThan('xs')]: {
              maxHeight: selection.includes(process._id) ? '240px' : '120px',
            },
          })} */
        >
          <Flex direction={'column'}>
            <Flex align={'center'} justify={'space-between'} wrap={'wrap'}>
              <ProcessItemHeader statusColor={getProcessData(process._id, 'status_color')} interpreter={process.type} name={process.name} />
              <Flex align={'center'} rowGap={'10px'} columnGap={'40px'} wrap={'wrap'} justify={'end'}>
                <Flex align={'center'} gap={'xs'}>
                  <ProcessItemMetric w="75px" Icon={IconDeviceSdCard} value={getProcessData(process._id, 'ram')} />
                  <ProcessItemMetric w="55px" Icon={IconCpu} value={getProcessData(process._id, 'cpu')} />
                  <ProcessItemMetric w="57px" Icon={IconHistory} value={getProcessData(process._id, 'uptime')} />
                  {/* TODO: Add once pull feature is added 
                  <ProcessItemMetric w="80" Icon={IconGitBranch} value={'5ac..ed2'} />
                  */}
                </Flex>
                <Flex gap={'5px'}>
                  <ActionIcon
                    variant="light"
                    color="blue"
                    radius="sm"
                    size={'lg'}
                    loading={!!processState.find((x) => x._id == process._id && x.action == 'restart')}
                    onClick={() => triggerAction(process._id, 'restart')}
                    disabled={!hasPermission(process._id, process.server, 'RESTART')}
                  >
                    <IconReload size="1.4rem" />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="orange"
                    radius="sm"
                    size={'lg'}
                    loading={!!processState.find((x) => x._id == process._id && x.action == 'stop')}
                    onClick={() => triggerAction(process._id, 'stop')}
                    disabled={!hasPermission(process._id, process.server, 'STOP')}
                  >
                    <IconPower size="1.4rem" />
                  </ActionIcon>
                  {/* TODO: planned on a later release 
                  <ActionIcon variant="light" color="teal" radius="sm" size={'lg'}>
                    <IconSettings size="1.4rem" />
                  </ActionIcon> */}
                  <ActionIcon
                    variant="light"
                    color="red"
                    radius="sm"
                    size={'lg'}
                    loading={!!processState.find((x) => x._id == process._id && x.action == 'delete')}
                    onClick={() => triggerAction(process._id, 'delete')}
                    disabled={!hasPermission(process._id, process.server, 'DELETE')}
                  >
                    <IconTrash size="1.4rem" />
                  </ActionIcon>
                  <ActionIcon className={classes.colorSchemeLight} variant={'light'} color={'dark.2'} radius="sm" size={'sm'} mr={'-3px'} onClick={() => toggleRow(process._id)}>
                    <IconSquareRoundedMinus size="1.1rem" />
                  </ActionIcon>
                  <ActionIcon className={classes.colorSchemeDark} variant={'subtle'} color={'dark.8'} radius="sm" size={'sm'} mr={'-3px'} onClick={() => toggleRow(process._id)}>
                    <IconSquareRoundedMinus size="1.1rem" />
                  </ActionIcon>
                </Flex>
              </Flex>
            </Flex>
            <Transition transition="scale-y" duration={500} mounted={selection.includes(process._id)}>
              {(styles) => (
                <div style={{ ...styles }}>
                  {/* [x]: Add charts  
                  <Flex align={'center'} justify={'space-between'}>
                    <Paper radius="md" p="xs" bg={dark ? 'dark.8' : 'gray.2'} w={'50%'} h={'100px'} m="xs">
                      Cpu Chart
                    </Paper>
                    <Paper radius="md" p="xs" bg={dark ? 'dark.8' : 'gray.2'} w={'50%'} h={'100px'} m="xs">
                      Ram Chart
                    </Paper>
                  </Flex> */}
                  <Paper radius="md" p="xs" className={classes.processLog} h={'100px'} m="xs">
                    <ScrollArea h={'100%'} style={{ overflowX: 'hidden' }}>
                      <Text fw="bold">Logs</Text>
                      <div>
                        {logs
                          ?.filter((log) => log.process == process._id)
                          ?.map((log) => (
                            <Text key={log._id} size="md" fw={600} color={log.type == 'success' ? 'teal.6' : log.type == 'error' ? 'red.6' : 'blue.4'} component="pre" my="0px">
                              {log.createdAt.split('T')[1].split('.')[0]} {log.message}
                            </Text>
                          ))}
                      </div>
                    </ScrollArea>
                  </Paper>
                </div>
              )}
            </Transition>
          </Flex>
        </Paper>
      ))}
    </Flex>
  );
}

export default function ProcessPage({ servers, settings }: InferGetServerSidePropsType<typeof getServerSideProps>) {
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
          <Process settings={settings} />
        </Dashboard>
      </SelectedProvider>
    </>
  );
}

export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');

  const settings = await fetchSettings();
  return {
    props: {
      servers: await fetchServer(settings.excludeDaemon),
      settings,
    },
  };
}
