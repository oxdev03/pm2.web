"use client";

import { Flex } from "@mantine/core";

import { useSelected } from "@/components/context/SelectedProvider";
import ProcessItem from "@/components/process/ProcessItem";

export default function ProcessList() {
  const { selectedProcesses, settings } = useSelected();

  return (
    <Flex gap="xs" direction={"column"}>
      {selectedProcesses?.map((process) => <ProcessItem process={process} key={process._id} setting={settings!} />)}
    </Flex>
  );
}
