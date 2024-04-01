import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { SessionProvider } from "next-auth/react";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { theme } from "../theme";

import type { AppProps } from "next/app";
import { trpc } from "@/utils/trpc";

const App = ({ Component, pageProps }: AppProps) => {
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
};

export default trpc.withTRPC(App);
