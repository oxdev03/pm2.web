import { ReactNode, useEffect } from 'react';

import { AppShell, useMantineColorScheme } from '@mantine/core';

import { Head } from '../partials/Head';
import { Nav } from '../partials/Nav';

export function Dashboard({ children }: { children: ReactNode }) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <>
      <AppShell bg={dark ? 'dark.9' : 'gray.1'} header={{ height: { base: 40, xs: 60 } }} navbar={{ width: { base: 40, xs: 75 }, breakpoint: '' }} p='md'>
        <Head />
        <Nav />
        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </>
  );
}
