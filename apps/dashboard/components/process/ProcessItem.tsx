import { Group, Paper, Stack, Transition } from "@mantine/core";
import { IProcess, ISetting } from "@pm2.web/typings";
import { useState } from "react";

import ProcessAction from "./ProcessActionRow";
import ProcessChart from "./ProcessChart";
import ProcessHeader from "./ProcessHeader";
import ProcessLog from "./ProcessLog";
import ProcessMetricRow from "./ProcessMetricRow";

interface ProcessItemProps {
  process: IProcess;
  setting: ISetting;
}

export default function ProcessItem({ process, setting }: ProcessItemProps) {
  const [collapsed, setCollapsed] = useState(true);

  function getStatusColor() {
    switch (process.status) {
      case "online": {
        return "#12B886";
      }
      case "stopped": {
        return "#FCC419";
      }
      default: {
        return "#FA5252";
      }
    }
  }

  return (
    <Paper
      key={process._id}
      radius="md"
      p="md"
      shadow="sm"
      bg="var(--mantine-color-body)"
      style={{
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        border: "1px solid var(--mantine-color-default-border)",
      }}
    >
      <Stack>
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <ProcessHeader statusColor={getStatusColor()} interpreter={process.type} name={process.name} />
          <Group align="center" gap="md" wrap="wrap" justify="flex-end">
            <ProcessMetricRow
              process={process}
              refetchInterval={setting.polling.frontend}
              showMetric={process.status == "online"}
            />
            <ProcessAction processId={process._id} collapse={() => setCollapsed(!collapsed)} />
          </Group>
        </Group>
        <Transition transition="scale-y" duration={500} mounted={!collapsed}>
          {(styles) => (
            <div style={{ ...styles }}>
              <ProcessChart
                processId={process._id}
                refetchInterval={setting.polling.frontend}
                showMetric={process.status == "online"}
              />
              <ProcessLog processId={process._id} refetchInterval={setting.polling.frontend} />
            </div>
          )}
        </Transition>
      </Stack>
    </Paper>
  );
}
