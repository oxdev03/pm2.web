import { sendNotification } from "@/utils/notification";
import { trpc } from "@/utils/trpc";
import { Accordion, Button, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconRefresh } from "@tabler/icons-react";
import { ZodError } from "zod";

export default function UpdatePassword() {
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

  const changePassword = trpc.user.changePassword.useMutation({
    onSuccess(data) {
      sendNotification("changePassword", "Success", data, "success");
    },
    onError(error) {
      let errorMessage = error.message;
      try {
        const zodErrors = JSON.parse(error.message) as ZodError["errors"];
        errorMessage = zodErrors?.[0]?.message;
        passwordForm.setFieldError(zodErrors?.[0]?.path?.[0] as string, errorMessage);
      } catch (err) {
        passwordForm.setFieldError("oldPassword", errorMessage);
      }

      sendNotification("changePassword", "Failed", errorMessage, "error");
    },
  });

  return (
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
        <form onSubmit={passwordForm.onSubmit((values) => changePassword.mutate(values))}>
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
  );
}
