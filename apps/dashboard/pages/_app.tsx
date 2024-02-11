import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { SessionProvider } from "next-auth/react";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { theme } from "../theme";

import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <SessionProvider session={pageProps.session}>
        <MantineProvider theme={theme}>
          <Notifications />
          <Component {...pageProps} />
        </MantineProvider>
      </SessionProvider>
    </>
  );
}
