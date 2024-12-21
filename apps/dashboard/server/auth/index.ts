import NextAuth, { NextAuthResult } from "next-auth";
import { cache } from "react";

import { authConfig } from "./config";

const nextAuth = NextAuth(authConfig);
// WORKAROUND: microsoft/TypeScript#42873
const auth: NextAuthResult["auth"] = cache(nextAuth.auth);

const { handlers, signIn, signOut } = NextAuth(authConfig);

export { auth, handlers, signIn, signOut };
