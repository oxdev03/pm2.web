import { Flex, Paper, Transition } from "@mantine/core";
import { IProcess, ISetting } from "@pm2.web/typings";
import cx from "clsx";
import { useState } from "react";

import classes from "@/styles/process.module.css";

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
      case "online":
        return "#12B886";
      case "stopped":
        return "#FCC419";
      default:
        return "#FA5252";
    }
  }

  return (
    <Paper
      key={process._id}
      radius="md"
      p="xs"
      shadow="sm"
      className={cx(classes.processItem, {
        [classes.opened]: !collapsed,
        [classes.closed]: collapsed,
      })}
    >
      <Flex direction={"column"}>
        <Flex align={"center"} justify={"space-between"} wrap={"wrap"}>
          <ProcessHeader statusColor={getStatusColor()} interpreter={process.type} name={process.name} />
          <Flex align={"center"} rowGap={"10px"} columnGap={"40px"} wrap={"wrap"} justify={"end"}>
            <ProcessMetricRow
              processId={process._id}
              refetchInterval={setting.polling.frontend}
              showMetric={process.status == "online"}
            />
            <ProcessAction processId={process._id} collapse={() => setCollapsed(!collapsed)} />
          </Flex>
        </Flex>
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
      </Flex>
    </Paper>
  );
}
