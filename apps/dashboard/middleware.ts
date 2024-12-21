import NextAuth, { NextAuthResult } from "next-auth";

import authConfig from "./server/auth/middleware-config";

const nextAuth = NextAuth(authConfig);
// WORKAROUND: microsoft/TypeScript#42873
export const middleware: NextAuthResult["auth"] = nextAuth.auth;

export const config = { matcher: ["/process", "/settings", "/", "/user"] };
