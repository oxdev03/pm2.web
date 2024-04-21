import { sendNotification } from "@/utils/notification";
import { trpc } from "@/utils/trpc";
import { Accordion, Button, Flex, Select, Title } from "@mantine/core";
import { useForm } from "@mantine/form";

export default function DatabaseAction() {
  const databaseAction = useForm<{ action: "deleteAll" | "deleteLogs" | "" }>({
    initialValues: {
      action: "",
    },
    validate: {
      action: (val) => (val ? null : "Please select an action"),
    },
  });

  const deleteAll = trpc.setting.deleteAll.useMutation({
    onSuccess(data) {
      sendNotification("deleteAll", "Success", data, "success");
    },
    onError(error) {
      sendNotification("deleteAll", "Deleting all failed", error.message, "error");
    },
  });

  const deleteLogs = trpc.setting.deleteLogs.useMutation({
    onSuccess(data) {
      sendNotification("deleteLogs", "Success", data, "success");
    },
    onError(error) {
      sendNotification("deleteLogs", "Deleting logs failed", error.message, "error");
    },
  });

  return (
    <Accordion.Item value="database_action">
      <Accordion.Control>
        <Title order={5}>Database Management</Title>
      </Accordion.Control>
      <Accordion.Panel px="xs">
        <form
          onSubmit={databaseAction.onSubmit(async () => {
            const action = databaseAction.values.action;
            switch (action) {
              case "":
              case "deleteAll":
                return deleteAll.mutate();
              case "deleteLogs":
                return deleteLogs.mutate();
            }
          })}
        >
          <Flex align={"end"} gap={"lg"}>
            <Select
              label="Database Action"
              placeholder="Select Action"
              data={[
                {
                  label: "Delete Database Server/Process",
                  value: "deleteAll",
                },
                {
                  label: "Delete Logs of Process",
                  value: "deleteLogs",
                },
              ]}
              style={{
                flex: "1",
              }}
              required
              {...databaseAction.getInputProps("action")}
            />
            <Button type="submit" variant="light" color="orange" loading={deleteAll.isPending || deleteLogs.isPending}>
              Run
            </Button>
          </Flex>
        </form>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
