import { Center, Group, Paper, RingProgress, Text } from '@mantine/core';
import classes from './StatsRing.module.css';

interface StatsRingProps {
  label: string;
  stats: string;
  progress: number;
  color: string;
  icon: 'up' | 'down';
  value?: number;
}

export function StatsRing({ stat }: { stat: StatsRingProps }) {
  return (
    <Paper radius="md" p="xs" key={stat.label} shadow="sm" className={classes.statsRing}>
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
          <Text fw={700} size="md" className={classes.statsRingText}>
            {stat.stats}
          </Text>
        </div>
      </Group>
    </Paper>
  );
}
