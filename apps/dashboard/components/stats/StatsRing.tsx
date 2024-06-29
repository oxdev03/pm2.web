import { Box, Flex, Group, Paper, RingProgress, Text } from "@mantine/core";

import classes from "./StatsRing.module.css";

interface StatsRingProps {
  title: string;
  stats: {
    label: string;
    value: string;
  }[];
  progress: number;
  color: string;
  icon: "up" | "down";
  value?: number;
}

export function StatsRing({ stat }: { stat: StatsRingProps }) {
  return (
    <Paper radius="md" p="xs" key={stat.title} shadow="sm" className={classes.statsRing}>
      <Group align="top">
        <RingProgress
          roundCaps
          sections={[{ value: stat.progress, color: stat.color }]}
          label={
            <Text c={stat.color} fw={700} ta="center" size="lg">
              {stat.value != undefined ? `${stat.value}` : `${stat.progress}%`}
            </Text>
          }
        />
        <Box pt={"sm"}>
          <Text size="1.5em" tt="uppercase" fw={700}>
            {stat.title}
          </Text>
          {stat.stats.map((s) => (
            <Flex gap={"xs"} key={s.label} align={"end"}>
              <Text fw={700} size="xl" className={classes.statsRingLabel}>
                {s.label}:
              </Text>
              <Text fw={600} size="lg" className={classes.statsRingValue}>
                {s.value}
              </Text>
            </Flex>
          ))}
        </Box>
      </Group>
    </Paper>
  );
}
