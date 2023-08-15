// global css
import '../styles/globals.css';

import { getCookie, setCookie } from 'cookies-next';
import { SessionProvider } from 'next-auth/react';
import NextApp, { AppContext, AppProps } from 'next/app';
import { useState } from 'react';

import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

export default function App(props: AppProps & { colorScheme: ColorScheme }) {
  const { Component, pageProps } = props;
  const [colorScheme, setColorScheme] = useState<ColorScheme>(props.colorScheme);

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(nextColorScheme);
    // when color scheme is updated save it to cookie
    setCookie('mantine-color-scheme', nextColorScheme, { maxAge: 60 * 60 * 24 * 30 });
  };

  return (
    <>
      <SessionProvider session={pageProps.session}>
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
          <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme }}>
            <Notifications />
            <Component {...pageProps} />
          </MantineProvider>
        </ColorSchemeProvider>
      </SessionProvider>
    </>
  );
}

App.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  return {
    ...appProps,
    colorScheme: getCookie('mantine-color-scheme', appContext.ctx) || 'light',
  };
};
