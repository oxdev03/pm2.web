import { Center, Group, Paper, RingProgress, SimpleGrid, Text, useMantineColorScheme } from '@mantine/core';
import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';

interface StatsRingProps {
  label: string;
  stats: string;
  progress: number;
  color: string;
  icon: 'up' | 'down';
  value?: number;
}

const icons = {
  up: IconArrowUpRight,
  down: IconArrowDownRight,
};

export function StatsRing({ stat }: { stat: StatsRingProps }) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  const Icon = icons[stat.icon];
  return (
    <Paper radius="md" p="xs" key={stat.label} shadow="sm" bg={dark ? 'dark.7' : 'white'}>
      <Group>
        <RingProgress
          size={80}
          roundCaps
          thickness={8}
          sections={[{ value: stat.progress, color: stat.color }]}
          label={
            <Text c={stat.color} fw={700} ta="center" size="sm">
              {stat.value != undefined ? `${stat.value}` : `${stat.progress}%`}
            </Text>
          }
        />

        <div>
          <Text size="xl" tt="uppercase" fw={700}>
            {stat.label}
          </Text>
          <Text fw={700} size="md" c={dark ? 'gray.6' : 'gray.7'}>
            {stat.stats}
          </Text>
        </div>
      </Group>
    </Paper>
  );
}
