import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { DefaultSession } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";

import { Dashboard } from "@/components/layouts/Dashboard";
import { fetchSettings } from "@/utils/fetchSSRProps";
import {
  Accordion,
  ActionIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  CopyButton,
  Flex,
  Grid,
  Input,
  NumberInput,
  Overlay,
  Paper,
  PinInput,
  rem,
  ScrollArea,
  Select,
  Stack,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { randomId } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Acl } from "@pm2.web/typings";
import { IconCheck, IconCopy, IconDeviceFloppy, IconRefresh, IconTrash, IconUnlink, IconX } from "@tabler/icons-react";

import classes from "../styles/settings.module.css";

export default function Settings({ settings }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession();
  const [acl, setAcl] = useState(false);
  const [isOAuth2, setIsOAuth2] = useState(false);

  const passwordForm = useForm({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      oldPassword: (val) => (val.length <= 6 ? "Password should include at least 6 characters" : null),
      newPassword: (val) => (val.length <= 6 ? "Password should include at least 6 characters" : null),
      confirmPassword: (val) => (val.length <= 6 ? "Password should include at least 6 characters" : null),
    },
  });

  const deleteForm = useForm({
    initialValues: {
      password: "",
    },
    validate: {
      password: (val) => (val.length <= 6 ? "Password should include at least 6 characters" : null),
    },
  });

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

  const databaseAction = useForm({
    initialValues: {
      action: "",
    },
    validate: {
      action: (val) => (val ? null : "Please select an action"),
    },
  });

  const notification = (id: string, title: string, message: string, status: "pending" | "success" | "error") => {
    if (status == "pending") {
      notifications.show({
        id,
        title,
        message,
        color: "blue",
        autoClose: false,
        withCloseButton: false,
      });
    } else {
      notifications.update({
        id,
        title,
        message,
        color: status == "success" ? "green" : "red",
        icon: status == "success" ? <IconCheck /> : <IconX />,
        autoClose: 5000,
        withCloseButton: true,
      });
    }
  };

  const handleDatabaseAction = async (action: "delete" | "delete_logs") => {
    notification(action, "Performing Action", "Please wait...", "pending");
    const res = await fetch(`/api/settings/action`, {
      method: "POST",
      body: JSON.stringify({ action }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const statusCode = res.status;
    const data = await res.json();
    if (statusCode == 200) {
      notification(action, "Success", data.message, "success");
    } else {
      notification(action, "Error", data.message, "error");
    }
  };

  const handleConfigurationUpdate = async (values: typeof globalConfiguration.values) => {
    notification("configuration", "Updating Configuration", "Please wait...", "pending");
    const res = await fetch(`/api/settings/configuration`, {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const statusCode = res.status;
    const data = await res.json();
    if (statusCode == 200) {
      notification("configuration", "Success", data.message, "success");
    } else {
      notification("configuration", "Error", data.message, "error");
    }
  };

  const handlePasswordUpdate = async (values: typeof passwordForm.values) => {
    notification("password", "Updating Password", "Please wait...", "pending");
    const res = await fetch(`/api/settings/user`, {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const statusCode = res.status;
    const data = await res.json();
    if (statusCode == 200) {
      notification("password", "Success", data.message, "success");
    } else {
      notification("password", "Error", data.message, "error");
      if (data.field) {
        passwordForm.setFieldError(data.field, data.message);
      }
    }
  };

  const handleDeleteAccount = async (values: typeof deleteForm.values) => {
    notification("delete", "Deleting Account", "Please wait...", "pending");
    const res = await fetch(`/api/settings/user`, {
      method: "DELETE",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const statusCode = res.status;
    const data = await res.json();
    if (statusCode == 200) {
      notification("delete", "Success", data.message, "success");
      signOut();
    } else {
      notification("delete", "Error", data.message, "error");
      deleteForm.setFieldError("password", data.message);
    }
  };

  const handleUnlinkOAuth2 = async () => {
    notification("unlink", "Unlinking OAuth2", "Please wait...", "pending");
    const res = await fetch(`/api/settings/oauth2`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const statusCode = res.status;
    const data = await res.json();
    if (statusCode == 200) {
      notification("unlink", "Success", data.message, "success");
      signOut();
    } else {
      notification("unlink", "Error", data.message, "error");
    }
  };

  useEffect(() => {
    type DefaultSessionUser = DefaultSession & {
      acl: Acl;
    };
    const user = session?.user as DefaultSessionUser;
    if (user?.acl?.owner || user?.acl?.admin) {
      setAcl(true);
    } else {
      setAcl(false);
    }

    const accessToken = session && "accessToken" in session && (session as { accessToken: string })?.accessToken;
    if (accessToken && (accessToken.startsWith("gho") || accessToken.startsWith("ya29"))) {
      setIsOAuth2(true);
    } else {
      setIsOAuth2(false);
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>pm2.web</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>

      <Dashboard>
        <Grid
          flex={1}
          styles={{
            root: {
              display: "flex",
            },
          }}
        >
          <Grid.Col span={{ lg: 8, md: 7, sm: 6, xs: 12 }}>
            <Paper shadow="sm" radius="md" p={"md"} mih={"100%"} h={"100%"}>
              <Title order={3} style={{ marginBottom: "1rem" }}>
                Configuration
              </Title>
              <ScrollArea>
                <Accordion variant="filled">
                  <Accordion.Item value="configuration">
                    <Accordion.Control>
                      <Title order={5}>Configuration</Title>
                    </Accordion.Control>
                    <Accordion.Panel px="xs">
                      <form
                        onSubmit={globalConfiguration.onSubmit(
                          async (values) => await handleConfigurationUpdate(values),
                        )}
                      >
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
                              <Input.Wrapper
                                label="Registration Code"
                                description="requires code for registering new user accounts"
                              >
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
                                    onClick={() =>
                                      globalConfiguration.setFieldValue("registrationCode", randomId().slice(8, 14))
                                    }
                                  >
                                    <IconRefresh />
                                  </ActionIcon>
                                  <CopyButton value={globalConfiguration.values.registrationCode} timeout={2000}>
                                    {({ copied, copy }) => (
                                      <Tooltip label={copied ? "Copied" : "Copy"} withArrow position="right">
                                        <ActionIcon
                                          color={copied ? "teal" : "gray"}
                                          onClick={copy}
                                          variant="light"
                                          size={"2rem"}
                                        >
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
                              >
                                Save
                              </Button>
                            </Flex>
                          </Grid.Col>
                        </Grid>
                      </form>
                    </Accordion.Panel>
                  </Accordion.Item>
                  <Accordion.Item value="database_management">
                    <Accordion.Control>
                      <Title order={5}>Database Management</Title>
                    </Accordion.Control>
                    <Accordion.Panel px="xs">
                      <form
                        onSubmit={databaseAction.onSubmit(async () => {
                          await handleDatabaseAction(databaseAction.values.action as "delete" | "delete_logs");
                        })}
                      >
                        <Flex align={"end"} gap={"lg"}>
                          <Select
                            label="Database Action"
                            placeholder="Select Action"
                            data={[
                              {
                                label: "Delete Database Server/Process",
                                value: "delete",
                              },
                              {
                                label: "Delete Logs of Process",
                                value: "delete_logs",
                              },
                            ]}
                            style={{
                              flex: "1",
                            }}
                            required
                            {...databaseAction.getInputProps("action")}
                          />
                          <Button type="submit" variant="light" color="orange">
                            Run
                          </Button>
                        </Flex>
                      </form>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
                {!acl && (
                  <Overlay color="#000" backgroundOpacity={0.1} radius={"md"} blur={7} center zIndex={2}>
                    <Badge size="xl" variant="outline" color="red">
                      Owner/Admin Permission required
                    </Badge>
                  </Overlay>
                )}
              </ScrollArea>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ lg: 4, md: 5, sm: 6, xs: 12 }}>
            <Paper shadow="sm" radius="md" p={"md"} style={{ height: "100%" }}>
              <Title order={3} style={{ marginBottom: "1rem" }}>
                User Settings
              </Title>
              <Accordion variant="filled">
                <Accordion.Item value="password">
                  <Accordion.Control
                    icon={
                      <IconRefresh
                        style={{
                          marginTop: "0.1rem",
                        }}
                      />
                    }
                  >
                    <Title order={5}>Update Password</Title>
                  </Accordion.Control>
                  <Accordion.Panel px="xs">
                    <form onSubmit={passwordForm.onSubmit(async (values) => await handlePasswordUpdate(values))}>
                      <Stack my={"xs"}>
                        <TextInput
                          label="Old Password"
                          placeholder="Old Password"
                          required
                          type="password"
                          {...passwordForm.getInputProps("oldPassword")}
                        />
                        <TextInput
                          label="New Password"
                          placeholder="New Password"
                          required
                          type="password"
                          {...passwordForm.getInputProps("newPassword")}
                        />
                        <TextInput
                          label="Confirm Password"
                          placeholder="Confirm Password"
                          required
                          type="password"
                          {...passwordForm.getInputProps("confirmPassword")}
                        />
                        <Button type="submit" variant="light" color="blue">
                          Update Password
                        </Button>
                      </Stack>
                    </form>
                  </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="delete">
                  <Accordion.Control
                    icon={
                      <IconTrash
                        style={{
                          marginTop: "0.1rem",
                        }}
                      />
                    }
                  >
                    <Title order={5}>Delete Account</Title>
                  </Accordion.Control>
                  <Accordion.Panel px="xs">
                    <form onSubmit={deleteForm.onSubmit(async (values) => await handleDeleteAccount(values))}>
                      <Stack my={"xs"}>
                        <TextInput
                          label="Password"
                          placeholder="Password"
                          required
                          type="password"
                          {...deleteForm.getInputProps("password")}
                        />
                        <Button type="submit" variant="light" color="red">
                          Delete Account
                        </Button>
                      </Stack>
                    </form>
                  </Accordion.Panel>
                </Accordion.Item>
                {isOAuth2 && (
                  <>
                    <Accordion.Item value="unlink">
                      <Accordion.Control
                        icon={
                          <IconUnlink
                            style={{
                              marginTop: "0.1rem",
                            }}
                          />
                        }
                      >
                        <Title order={5}>Unlink OAuth2</Title>
                      </Accordion.Control>
                      <Accordion.Panel px="xs">
                        <Stack my={"xs"}>
                          <Button type="submit" variant="light" color="orange" onClick={handleUnlinkOAuth2}>
                            Unlink OAuth2
                          </Button>
                        </Stack>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </>
                )}
              </Accordion>
            </Paper>
          </Grid.Col>
        </Grid>
      </Dashboard>
    </>
  );
}

export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  return {
    props: {
      settings: await fetchSettings(),
    },
  };
}
