import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { IAcl } from "@pm2.web/typings";
import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      acl?: IAcl;
    } & DefaultSession["user"];
  }
}

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
