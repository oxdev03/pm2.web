import { sendNotification } from "@/utils/notification";
import {
  Accordion,
  ActionIcon,
  Button,
  Checkbox,
  CopyButton,
  Flex,
  Grid,
  Input,
  NumberInput,
  PinInput,
  Stack,
  Title,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { randomId } from "@mantine/hooks";
import { ISetting } from "@pm2.web/typings";
import { IconRefresh, IconCheck, IconCopy, IconDeviceFloppy } from "@tabler/icons-react";
import classes from "./UpdateConfiguration.module.css";
import { trpc } from "@/utils/trpc";

interface UpdateConfigurationProps {
  settings: ISetting;
}

export default function UpdateConfiguration({ settings }: UpdateConfigurationProps) {
  const globalConfiguration = useForm({
    initialValues: {
      polling: {
        backend: settings.polling.backend,
        frontend: settings.polling.frontend,
      },
      excludeDaemon: settings.excludeDaemon,
      logRotation: settings.logRotation,
      registrationCode: settings.registrationCode,
    },
    validate: {
      polling: (val) =>
        val.backend < 1000 || val.frontend < 1000 ? "Update Interval can not be less than 1000ms" : null,
      logRotation: (val) => (val >= 10_000 ? "Log rotation can not be more than 10,000" : null),
      registrationCode: (val) => (val && val.length < 6 ? "Code should include at least 6 numbers" : null),
    },
  });

  const updateSetting = trpc.setting.updateSetting.useMutation({
    onSuccess(data) {
      sendNotification("updateSetting", "Success", data, "success");
    },
    onError(error) {
      sendNotification("updateSetting", "Failed", error.message, "error");
    },
  });

  return (
    <Accordion.Item value="configuration">
      <Accordion.Control>
        <Title order={5}>Configuration</Title>
      </Accordion.Control>
      <Accordion.Panel px="xs">
        <form onSubmit={globalConfiguration.onSubmit((values) => updateSetting.mutate(values))}>
          <Grid grow gutter={"xl"}>
            <Grid.Col span={2}>
              <Stack my={"xs"}>
                <NumberInput
                  label="Backend Update Interval"
                  description="In ms"
                  placeholder="Backend Update Interval"
                  required
                  {...globalConfiguration.getInputProps("polling.backend")}
                  min={1000}
                  step={500}
                />
                <NumberInput
                  label="Frontend Update Interval"
                  description="In ms"
                  placeholder="Frontend Update Interval"
                  required
                  {...globalConfiguration.getInputProps("polling.frontend")}
                  min={1000}
                  step={500}
                />
              </Stack>
            </Grid.Col>
            <Grid.Col span={2}>
              <Stack my={"xs"}>
                <NumberInput
                  label="Log Rotation"
                  description="automatically rotate logs,to meet max logs length"
                  placeholder="Log Rotation"
                  required
                  step={50}
                  {...globalConfiguration.getInputProps("logRotation")}
                />
                <Checkbox
                  label="Exclude Daemon Process"
                  {...globalConfiguration.getInputProps("excludeDaemon", { type: "checkbox" })}
                  description="excludes process with name pm2.web-daemon"
                />
                <Input.Wrapper label="Registration Code" description="requires code for registering new user accounts">
                  <Flex align={"end"} gap={"xs"} wrap={"wrap"}>
                    <PinInput
                      length={6}
                      {...globalConfiguration.getInputProps("registrationCode")}
                      classNames={{
                        input: classes.pinInput,
                      }}
                    />
                    <ActionIcon
                      type="button"
                      title="reload_code"
                      variant="light"
                      color="blue"
                      radius="sm"
                      size={"2rem"}
                      onClick={() => globalConfiguration.setFieldValue("registrationCode", randomId().slice(8, 14))}
                    >
                      <IconRefresh />
                    </ActionIcon>
                    <CopyButton value={globalConfiguration.values.registrationCode} timeout={2000}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? "Copied" : "Copy"} withArrow position="right">
                          <ActionIcon color={copied ? "teal" : "gray"} onClick={copy} variant="light" size={"2rem"}>
                            {copied ? <IconCheck /> : <IconCopy size="1rem" />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Flex>
                </Input.Wrapper>
              </Stack>
              <Flex justify={"flex-end"}>
                <Button
                  type="submit"
                  variant="light"
                  color="teal"
                  leftSection={<IconDeviceFloppy />}
                  mt={"sm"}
                  loading={updateSetting.isPending}
                >
                  Save
                </Button>
              </Flex>
            </Grid.Col>
          </Grid>
        </form>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
