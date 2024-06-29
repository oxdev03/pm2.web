import cx from "clsx";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

import { AppShell, Stack, Tooltip, UnstyledButton, useMantineColorScheme } from "@mantine/core";
import {
  IconGauge,
  IconLayoutDashboard,
  IconLogout,
  IconMoonStars,
  IconSettings,
  IconSun,
  IconUser,
  TablerIcon,
} from "@tabler/icons-react";

import classes from "./Nav.module.css";
import { Session } from "next-auth";

interface NavbarBtnProps {
  icon: TablerIcon;
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
  icon: TablerIcon;
  label: string;
  active?: boolean;
  href?: string;
}

function NavbarLink({ icon: Icon, label, active, href }: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <Link href={href || ""} className={`${classes.link} ${active && classes.active}`}>
        <Icon stroke={1.5} className={classes.icon} />
      </Link>
    </Tooltip>
  );
}

const navLinks = [
  { icon: IconGauge, label: "Overview", href: "/" },
  { icon: IconLayoutDashboard, label: "Process", href: "/process" },
  /* { icon: IconServerBolt, label: 'Server', href: '/server' }, */ // TODO: Add server page, server
  {
    icon: IconUser,
    label: "User Administration",
    href: "/user",
    filter: (session: Session | null) => {
      if (session?.user) {
        const acl = session?.user.acl;
        return acl?.admin || acl?.owner;
      }
      return false;
    },
  },
  /* { icon: IconBellCog, label: 'Alerts', href: '/alert' }, */
  { icon: IconSettings, label: "Settings", href: "/settings" },
];

export function Nav() {
  const { toggleColorScheme } = useMantineColorScheme();
  const { data: session } = useSession();
  //active page
  const router = useRouter();
  const active = navLinks.findIndex((link) => router.pathname === link.href);

  const links = navLinks
    .filter((link) => (link.filter ? link.filter(session) : true))
    .map((link, index) => <NavbarLink {...link} key={link.label} active={index === active} />);

  return (
    <AppShell.Navbar p="sm">
      <AppShell.Section grow mt={20}>
        <Stack justify="center" className={classes.stackLink}>
          {links}
        </Stack>
      </AppShell.Section>
      <AppShell.Section>
        <Stack justify="center" className={classes.stackAction}>
          <Tooltip label="Toggle Theme" position="right" transitionProps={{ duration: 0 }}>
            <Link href={""} className={classes.link} onClick={() => toggleColorScheme()}>
              <IconSun stroke={1.5} className={cx(classes.icon, classes.colorSchemeLight)} />
              <IconMoonStars stroke={1.5} className={cx(classes.icon, classes.colorSchemeDark)} />
            </Link>
          </Tooltip>
          <NavbarBtn icon={IconLogout} label="Logout" onClick={() => signOut()} />
        </Stack>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
