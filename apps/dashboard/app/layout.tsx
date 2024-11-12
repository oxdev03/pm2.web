import "@mantine/core/styles.css";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Metadata } from "next";
import React from "react";

import { TRPCReactProvider } from "@/trpc/react";

import { theme } from "../theme";

export const metadata: Metadata = {
  title: "pm2.web",
  description: "pm2.web - Easily monitor your processes, control them with various actions, view logs and set up access controls for users using the dashboard",
  icons: [{ rel: "icon", url: "/logo.png" }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
        <link rel="icon" type="image/png" href="/logo.png" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no" />
      </head>
      <body>
        <TRPCReactProvider>
          <MantineProvider theme={theme}>
            <Notifications />
            {children}
          </MantineProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
