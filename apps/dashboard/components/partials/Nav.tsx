import { ActionIcon, AppShell, Stack, Tooltip, useMantineColorScheme, useMantineTheme } from "@mantine/core";
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
import Link from "next/link";
import { useRouter } from "next/router";
import { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";

interface NavbarLinkProps {
  icon: TablerIcon;
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, active, href, onClick }: NavbarLinkProps) {
  const theme = useMantineTheme();

  const content = (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <ActionIcon
        variant={active ? "light" : "subtle"}
        color={active ? theme.primaryColor : "gray"}
        onClick={onClick}
        size="xl"
        radius="md"
      >
        <Icon stroke={1.5} size={22} />
      </ActionIcon>
    </Tooltip>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none" }}>
        {content}
      </Link>
    );
  }

  return content;
}

const navLinks = [
  { icon: IconGauge, label: "Overview", href: "/" },
  { icon: IconLayoutDashboard, label: "Process", href: "/process" },
  {
    icon: IconUser,
    label: "User Administration",
    href: "/user",
    onlyIf: (session: Session | null) => {
      if (session?.user) {
        const acl = session?.user.acl;
        return acl?.admin || acl?.owner;
      }
      return false;
    },
  },
  { icon: IconSettings, label: "Settings", href: "/settings" },
];

export function Nav() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { data: session } = useSession();
  const router = useRouter();

  const links = navLinks
    .filter((link) => (link.onlyIf ? link.onlyIf(session) : true))
    .map((link) => <NavbarLink {...link} key={link.label} active={router.pathname === link.href} />);

  return (
    <AppShell.Navbar p="md">
      <AppShell.Section grow>
        <Stack justify="center" align="center" gap="sm">
          {links}
        </Stack>
      </AppShell.Section>
      <AppShell.Section>
        <Stack justify="center" align="center" gap="sm">
          <NavbarLink
            icon={colorScheme === "dark" ? IconSun : IconMoonStars}
            label="Toggle Theme"
            onClick={() => toggleColorScheme()}
          />
          <NavbarLink icon={IconLogout} label="Logout" onClick={() => signOut()} />
        </Stack>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
