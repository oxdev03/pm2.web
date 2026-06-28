import { Box, Flex, Group, Card, RingProgress, Text } from "@mantine/core";

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
    <Card radius="md" p="md" key={stat.title} shadow="sm" withBorder>
      <Group align="top">
        <RingProgress
          roundCaps
          sections={[{ value: stat.progress, color: stat.color }]}
          label={
            <Text c={stat.color} fw={700} ta="center" size="lg">
              {stat.value == undefined ? `${stat.progress}%` : `${stat.value}`}
            </Text>
          }
        />
        <Box pt={"sm"}>
          <Text size="1.5em" tt="uppercase" fw={700}>
            {stat.title}
          </Text>
          {stat.stats.map((s) => (
            <Flex gap={"xs"} key={s.label} align={"end"}>
              <Text fw={700} size="md" c="dimmed">
                {s.label}:
              </Text>
              <Text fw={600} size="md">
                {s.value}
              </Text>
            </Flex>
          ))}
        </Box>
      </Group>
    </Card>
  );
}
