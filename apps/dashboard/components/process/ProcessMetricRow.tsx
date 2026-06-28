import { Group, Progress, Text, Tooltip, Stack } from "@mantine/core";
import { IProcess } from "@pm2.web/typings";
import { IconCpu, IconDeviceSdCard, IconHistory } from "@tabler/icons-react";
import ms from "ms";

import { formatBytes } from "@/utils/format";
import { trpc } from "@/utils/trpc";

import ProcessGitMetric from "./ProcessGitMetric";

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

  const cpuValue = showMetric ? (getStat.data?.cpu || 0) : 0;
  const memValue = showMetric ? (getStat.data?.memory || 0) : 0;

  return (
    <Group align="center" gap="xl" wrap="nowrap" style={{ flexGrow: 1 }}>
      {process?.versioning?.url && <ProcessGitMetric versioning={process.versioning} />}
      
      <Tooltip label={`CPU: ${cpuValue.toFixed(1)}%`}>
        <Stack gap={4} style={{ width: 120 }}>
          <Group justify="space-between">
            <Group gap={4}>
              <IconCpu size={14} color="gray" />
              <Text size="xs" fw={700} c="dimmed">CPU</Text>
            </Group>
            <Text size="xs" fw={700}>{showMetric ? `${cpuValue.toFixed(0)}%` : '-'}</Text>
          </Group>
          <Progress value={Math.min(cpuValue, 100)} color="blue" size="sm" radius="xl" />
        </Stack>
      </Tooltip>

      <Tooltip label={`RAM: ${formatBytes(memValue)}`}>
        <Stack gap={4} style={{ width: 120 }}>
          <Group justify="space-between">
            <Group gap={4}>
              <IconDeviceSdCard size={14} color="gray" />
              <Text size="xs" fw={700} c="dimmed">RAM</Text>
            </Group>
            <Text size="xs" fw={700}>{showMetric ? formatBytes(memValue) : '-'}</Text>
          </Group>
          <Progress value={Math.min((memValue / (1024 * 1024 * 1024)) * 100, 100)} color="teal" size="sm" radius="xl" />
        </Stack>
      </Tooltip>

      <Group gap={4}>
        <IconHistory size={16} color="gray" />
        <Text size="sm" fw={700}>{showMetric ? ms(getStat.data?.uptime || 0) : '-'}</Text>
      </Group>
    </Group>
  );
}
