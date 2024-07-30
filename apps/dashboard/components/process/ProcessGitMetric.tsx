import { Anchor, Flex, Paper, Popover, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IProcess } from "@pm2.web/typings";
import { IconGitMerge } from "@tabler/icons-react";

import classes from "@/styles/process.module.css";

export default function ProcessGitMetric({ versioning }: { versioning?: IProcess["versioning"] }) {
  const [opened, { close, open }] = useDisclosure(false);

  return (
    <Popover withArrow shadow="md" opened={opened} trapFocus>
      <Popover.Target>
        <Paper
          className={classes.processMetric}
          radius="md"
          p={"4px"}
          px={"10px"}
          onMouseEnter={open}
          onMouseLeave={close}
        >
          <Flex align={"center"} justify={"space-between"} gap={"5px"} w={"5em"}>
            <IconGitMerge size="1.2rem" />
            <Anchor href={`${versioning?.url}/commit/${versioning?.revision}`} target="_blank" underline="hover">
              {versioning?.branch}
              {versioning?.unstaged && "*"}
            </Anchor>
          </Flex>
        </Paper>
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
