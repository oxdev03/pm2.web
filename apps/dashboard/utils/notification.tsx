import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

export function actionNotification(
  id: string,
  title: string,
  message: string,
  status: "pending" | "success" | "error",
) {
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
}
