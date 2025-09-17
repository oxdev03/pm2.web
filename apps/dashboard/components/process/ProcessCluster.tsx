import { Paper, Flex, Transition, Badge, Text } from "@mantine/core";
import { useState } from "react";
import { IProcess, ISetting } from "@pm2.web/typings";
import cx from "clsx";

import ProcessHeader from "./ProcessHeader";
import ProcessClusterChart from "./ProcessClusterChart";
import ProcessClusterLog from "./ProcessClusterLog";
import ProcessClusterMetricRow from "./ProcessClusterMetricRow";
import ProcessClusterAction from "./ProcessClusterAction";
import classes from "@/styles/process.module.css";

interface ProcessClusterProps {
  processes: IProcess[];
  clusterName: string;
  setting: ISetting;
}

export default function ProcessCluster({ processes, clusterName, setting }: ProcessClusterProps) {
  const [collapsed, setCollapsed] = useState(true);

  // Aggregate cluster information
  const onlineCount = processes.filter(p => p.status === "online").length;
  const stoppedCount = processes.filter(p => p.status === "stopped").length;
  const erroredCount = processes.filter(p => p.status === "errored" || p.status === "offline").length;
  
  // Determine overall cluster status
  const getClusterStatus = () => {
    if (onlineCount === processes.length) return "online";
    if (stoppedCount === processes.length) return "stopped";
    if (erroredCount > 0) return "errored";
    return "mixed";
  };

  const getStatusColor = () => {
    switch (getClusterStatus()) {
      case "online": {
        return "#12B886";
      }
      case "stopped": {
        return "#FCC419";
      }
      case "mixed": {
        return "#339AF0";
      }
      default: {
        return "#FA5252";
      }
    }
  };

  // Get primary process for display (prefer online process)
  const primaryProcess = processes.find(p => p.status === "online") || processes[0];

  return (
    <Paper
      key={`cluster-${clusterName}`}
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
          <Flex align={"center"} gap={"sm"}>
            <ProcessHeader 
              statusColor={getStatusColor()} 
              interpreter={primaryProcess.type} 
              name={clusterName}
            />
            <Badge 
              size="sm" 
              variant="light"
              color={getClusterStatus() === "online" ? "green" : getClusterStatus() === "stopped" ? "yellow" : "red"}
            >
              {processes.length} instances
            </Badge>
            {getClusterStatus() === "mixed" && (
              <Text size="xs" c="dimmed">
                {onlineCount} online, {stoppedCount} stopped, {erroredCount} errored
              </Text>
            )}
          </Flex>
          <Flex align={"center"} rowGap={"10px"} columnGap={"40px"} wrap={"wrap"} justify={"end"}>
            <ProcessClusterMetricRow
              processes={processes}
              refetchInterval={setting.polling.frontend}
              showMetric={onlineCount > 0}
            />
            <ProcessClusterAction 
              processes={processes} 
              collapse={() => setCollapsed(!collapsed)} 
            />
          </Flex>
        </Flex>
        <Transition transition="scale-y" duration={500} mounted={!collapsed}>
          {(styles) => (
            <div style={{ ...styles }}>
              <ProcessClusterChart
                processes={processes}
                refetchInterval={setting.polling.frontend}
                showMetric={onlineCount > 0}
                polling={setting.polling.frontend}
              />
              <ProcessClusterLog 
                processes={processes}
                refetchInterval={setting.polling.frontend} 
              />
            </div>
          )}
        </Transition>
      </Flex>
    </Paper>
  );
}
