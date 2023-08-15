import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Center, createStyles, Navbar, rem, Stack, Tooltip, UnstyledButton, useMantineColorScheme } from '@mantine/core';
import { IconBellCog, IconGauge, IconLayoutDashboard, IconLogout, IconMoonStars, IconServerBolt, IconSettings, IconSun, IconUser } from '@tabler/icons-react';

const useStyles = createStyles((theme) => ({
  link: {
    width: rem(50),
    height: rem(50),
    borderRadius: theme.radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
    },
  },

  active: {
    '&, &:hover': {
      backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
      color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
    },
  },
}));

interface NavbarBtnProps {
  icon: React.FC<any>;
  label: string;
  active?: boolean;
  onClick?(): void;
}

function NavbarBtn({ icon: Icon, label, active, onClick }: NavbarBtnProps) {
  const { classes, cx } = useStyles();
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton onClick={onClick} className={cx(classes.link, { [classes.active]: active })}>
        <Icon size="1.2rem" stroke={1.5} />
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
  const { classes, cx } = useStyles();
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <Link href={href || ''} className={cx(classes.link, { [classes.active]: active })}>
        <Icon size="1.2rem" stroke={1.5} />
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
    <Navbar width={{ base: 75 }} p="sm">
      <Navbar.Section grow mt={20}>
        <Stack justify="center" spacing={0}>
          {links}
        </Stack>
      </Navbar.Section>
      <Navbar.Section>
        <Stack justify="center" spacing={0}>
          <NavbarBtn icon={dark ? IconSun : IconMoonStars} label="Toggle Theme" onClick={() => toggleColorScheme()} />
          <NavbarBtn icon={IconLogout} label="Logout" onClick={() => signOut()} />
        </Stack>
      </Navbar.Section>
    </Navbar>
  );
}
