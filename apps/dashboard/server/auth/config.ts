import { userModel } from "@pm2.web/mongoose-models";
import { IAcl, IOauth2 } from "@pm2.web/typings";
import { CredentialsSignin, type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import connectDB from "@/server/db/mongodb";
import { fetchSettings } from "@/server/db/settings";
import { AuthErrors } from "@/utils/auth-errors";

import middlewareConfig from "./middleware-config";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    acl?: IAcl;
    oauth2?: IOauth2;
  }
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken: string;
    user: {
      id: string;
      acl?: IAcl;
      oauth2?: IOauth2;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    id: string;
    accessToken: string;
    acl?: IAcl;
    oauth2?: IOauth2;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  // Reuse pages, callbacks from middleware auth config
  ...middlewareConfig,
  providers: [
    Credentials({
      credentials: {
        name: { label: "Username", type: "text", placeholder: "test" },
        email: {
          label: "Email",
          type: "text",
          placeholder: "Enter your email",
        },
        password: { label: "Password", type: "password" },
        terms: {
          label: "I agree to the terms and conditions",
          type: "checkbox",
        },
        type: { label: "type", type: "text" },
        registrationCode: {
          label: "Registration Code",
          type: "text",
          placeholder: "Enter registration code",
        },
      },
      authorize: async (credentials) => {
        await connectDB();
        if (!credentials) throw new LoginError(AuthErrors.InvalidForm);
        const registration = credentials.type === "register";
        if (registration) {
          // test regex lowercase, uppercase
          const accountExists = await userModel.findOne({
            $or: [
              { email: { $regex: new RegExp(credentials.email as string, "i") } },
              { name: { $regex: new RegExp(credentials.name as string, "i") } },
            ],
          });
          const isFirstAccount = (await userModel.countDocuments()) === 0;
          const settings = await fetchSettings();
          if (settings.registrationCode?.length && settings.registrationCode !== credentials.registrationCode)
            throw new LoginError(AuthErrors.InvalidRegistrationCode);

          if (accountExists) {
            throw new LoginError(AuthErrors.AccountExists);
          } else {
            const user = new userModel({
              name: credentials.name,
              email: credentials.email,
              password: credentials.password,
              acl: {
                owner: isFirstAccount,
                admin: false,
                servers: [],
              },
            });
            await user.save().catch((err: Error) => console.log(err));
            const u = user.toJSON();
            if (!isFirstAccount) throw new LoginError(AuthErrors.UnauthorizedRegister);
            return {
              id: u._id,
              ...u,
            };
          }
        } else {
          const user = await userModel.findOne({
            email: { $regex: new RegExp((credentials?.email as string) || "", "i") },
          });
          if (user) {
            //check if auth provider is already linked
            if (user.oauth2?.providerUserId) throw new LoginError(AuthErrors.OAuth2Linked);

            //verify password
            const match = await user.checkPassword((credentials?.password as string) || "");
            if (match) {
              const u = user.toJSON();
              if (!u.acl.owner && !u.acl.admin && !u.acl?.servers?.length) {
                throw new LoginError(AuthErrors.Unauthorized);
              }
              return {
                id: u._id,
                ...u,
              };
            } else {
              throw new LoginError(AuthErrors.IncorrectPassword);
            }
          } else {
            throw new LoginError(AuthErrors.NotRegistered);
          }
        }
      },
    }),
  ],
} satisfies NextAuthConfig;

export class LoginError extends CredentialsSignin {
  code: AuthErrors;

  constructor(auth_error: AuthErrors) {
    super(auth_error);
    this.code = auth_error;
  }
}
