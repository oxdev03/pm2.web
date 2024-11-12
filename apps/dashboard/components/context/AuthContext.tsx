import { auth } from "@/server/auth";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

export interface AuthContextProps {
  session?: Session | null;
  children: React.ReactNode;
}

export default async function AuthContext({ children, session }: AuthContextProps) {
  const serverSession = session || (await auth());
  return <SessionProvider session={serverSession}>{children}</SessionProvider>;
}
