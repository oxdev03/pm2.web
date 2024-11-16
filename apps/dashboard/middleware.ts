import NextAuth from "next-auth";
import authConfig from "./server/auth/middleware-config";

export const { auth: middleware } = NextAuth(authConfig)

export const config = { matcher: ["/process", "/settings", "/", "/user"] };
