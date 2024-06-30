import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/charts/styles.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";

import { trpc } from "@/utils/trpc";

import { theme } from "../theme";

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
