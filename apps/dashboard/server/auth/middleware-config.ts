import { NextAuthConfig, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";

// TODO: Currently next.js middleware only supports edge runtime
// This can be removed once next.js provides a option to switch to node.js runtime
export default {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [Credentials],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && account.access_token) token.accessToken = account.access_token;

      if (user) {
        token.acl = user.acl;
        token.oauth2 = user.oauth2;
        if (user.id) token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken;
      session.user.id = token.id;
      session.user.acl = token.acl;
      session.user.oauth2 = token.oauth2;

      return session;
    },
    async authorized({ auth }) {
      return !!auth?.user && !!auth.user.id;
    },
  },
} satisfies NextAuthConfig;
