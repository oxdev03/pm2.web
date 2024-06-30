import { Accordion, Button, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconTrash } from "@tabler/icons-react";
import { signOut } from "next-auth/react";

import { sendNotification } from "@/utils/notification";
import { trpc } from "@/utils/trpc";

export default function DeleteAccount() {
  const deleteForm = useForm({
    initialValues: {
      password: "",
    },
    validate: {
      password: (val) => (val.length <= 6 ? "Password should include at least 6 characters" : null),
    },
  });

  const deleteAccount = trpc.user.deleteAccount.useMutation({
    onSuccess(data) {
      sendNotification("deleteAccount", "Success", data, "success");
      signOut();
    },
    onError(error) {
      sendNotification("deleteAccount", "Failed", error.message, "error");
      deleteForm.setFieldError("password", error.message);
    },
  });

  return (
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
        <form onSubmit={deleteForm.onSubmit((values) => deleteAccount.mutate({ password: values.password }))}>
          <Stack my={"xs"}>
            <TextInput
              label="Password"
              placeholder="Password"
              required
              type="password"
              {...deleteForm.getInputProps("password")}
            />
            <Button type="submit" variant="light" color="red" loading={deleteAccount.isPending}>
              Delete Account
            </Button>
          </Stack>
        </form>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
