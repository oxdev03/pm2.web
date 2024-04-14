import { actionNotification, sendNotification } from "@/utils/notification";
import { trpc } from "@/utils/trpc";
import { Accordion, Button, Stack, Title } from "@mantine/core";
import { IconUnlink } from "@tabler/icons-react";
import { signOut } from "next-auth/react";

export default function UnlinkOAuth2() {
  const unlinkOAuth2 = trpc.user.unlinkOAuth2.useMutation({
    onSuccess(data) {
      sendNotification("unlinkOAuth2", "Success", data, "success");
      signOut();
    },
    onError(error) {
      sendNotification("unlinkOAuth2", "Failed", error.message, "error");
    },
  });

  return (
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
          <Button type="submit" variant="light" color="orange" onClick={() => unlinkOAuth2.mutate()}>
            Unlink OAuth2
          </Button>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
