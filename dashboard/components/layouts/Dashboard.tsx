import { ReactNode, useEffect } from 'react';

import { IServer, SelectItem, StateSelectedItem } from '@/types/server';
import { AppShell, useMantineColorScheme } from '@mantine/core';

import { Head } from '../partials/Head';
import { Nav } from '../partials/Nav';

export function Dashboard({ children }: { children: ReactNode }) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <>
      <AppShell navbar={<Nav />} header={<Head />} bg={dark ? 'dark.9' : 'gray.1'}>
        {children}
      </AppShell>
    </>
  );
}