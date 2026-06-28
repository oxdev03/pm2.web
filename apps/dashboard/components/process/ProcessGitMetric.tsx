import { Anchor, Group, Badge, Popover, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IProcess } from "@pm2.web/typings";
import { IconGitMerge } from "@tabler/icons-react";

export default function ProcessGitMetric({ versioning }: { versioning?: IProcess["versioning"] }) {
  const [opened, { close, open }] = useDisclosure(false);

  return (
    <Popover withArrow shadow="md" opened={opened} trapFocus>
      <Popover.Target>
        <Badge
          variant="light"
          radius="md"
          size="lg"
          h="30px"
          onMouseEnter={open}
          onMouseLeave={close}
          style={{ cursor: 'pointer' }}
        >
          <Group align="center" gap="xs">
            <IconGitMerge size="1.2rem" />
            <Anchor href={`${versioning?.url}/commit/${versioning?.revision}`} target="_blank" underline="hover">
              {versioning?.branch}
              {versioning?.unstaged && "*"}
            </Anchor>
          </Group>
        </Badge>
      </Popover.Target>
      <Popover.Dropdown style={{ pointerEvents: "none" }}>
        {versioning?.comment?.split("\n")?.map((t, tIdx) => (
          <Text size="sm" key={tIdx}>
            {t}
          </Text>
        ))}
      </Popover.Dropdown>
    </Popover>
  );
}
