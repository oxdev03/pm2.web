import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { AppShell, Stack, Tooltip, UnstyledButton, useMantineColorScheme } from '@mantine/core';
import { IconBellCog, IconGauge, IconLayoutDashboard, IconLogout, IconMoonStars, IconServerBolt, IconSettings, IconSun, IconUser } from '@tabler/icons-react';
import classes from './Nav.module.css';

interface NavbarBtnProps {
  icon: React.FC<any>;
  label: string;
  active?: boolean;
  onClick?(): void;
}

function NavbarBtn({ icon: Icon, label, active, onClick }: NavbarBtnProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton onClick={onClick} className={`${classes.link} ${active && classes.active}`}>
        <Icon className={classes.icon} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

interface NavbarLinkProps {
  icon: React.FC<any>;
  label: string;
  active?: boolean;
  href?: string;
}

function NavbarLink({ icon: Icon, label, active, href }: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <Link href={href || ''} className={`${classes.link} ${active && classes.active}`}>
        <Icon stroke={1.5} className={classes.icon} />
      </Link>
    </Tooltip>
  );
}

const navLinks = [
  { icon: IconGauge, label: 'Overview', href: '/' },
  { icon: IconLayoutDashboard, label: 'Process', href: '/process' },
  /* { icon: IconServerBolt, label: 'Server', href: '/server' }, */ // TODO: Add server page, server
  { icon: IconUser, label: 'User Administration', href: '/user' },
  /* { icon: IconBellCog, label: 'Alerts', href: '/alert' }, */
  { icon: IconSettings, label: 'Settings', href: '/settings' },
];

export function Nav() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  //active page
  const router = useRouter();
  let active = navLinks.findIndex((link) => router.pathname === link.href);

  const links = navLinks.map((link, index) => <NavbarLink {...link} key={link.label} active={index === active} />);

  return (
    <AppShell.Navbar p="sm">
      <AppShell.Section grow mt={20}>
        <Stack
          justify="center"
          //spacing={0}
          className={classes.stackLink}
        >
          {links}
        </Stack>
      </AppShell.Section>
      <AppShell.Section>
        <Stack
          justify="center"
          //spacing={0}
          className={classes.stackAction}
        >
          <NavbarBtn icon={dark ? IconSun : IconMoonStars} label="Toggle Theme" onClick={() => toggleColorScheme()} />
          <NavbarBtn icon={IconLogout} label="Logout" onClick={() => signOut()} />
        </Stack>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
