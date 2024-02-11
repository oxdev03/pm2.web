import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider, { GithubEmail } from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

import connectDB from '../../../middleware/mongodb';
import { fetchSettings } from '@/utils/fetchSSRProps';
import { userModel } from '@pm2.web/mongoose-models';

const providers = () => {
  const p = [];

  if (process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID && process.env.GITHUB_SECRET) {
    p.push(
      GithubProvider({
        clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_SECRET,
        userinfo: {
          url: 'https://api.github.com/user',
          async request({ client, tokens }) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const profile = await client.userinfo(tokens.access_token!);

            if (!profile.email) {
              // If the user does not have a public email, get another via the GitHub API
              // See https://docs.github.com/en/rest/users/emails#list-public-email-addresses-for-the-authenticated-user
              const res = await fetch('https://api.github.com/user/emails', {
                headers: { Authorization: `token ${tokens.access_token}` },
              });

              if (res.ok) {
                const emails: GithubEmail[] = await res.json();
                profile.email = (emails.find((e) => e.primary) ?? emails[0]).email;
              }
            }
            
            if (!profile.email) throw new Error('NoEmail');

            const user = await userModel.findOne({ email: { $regex: new RegExp(profile.email, 'i') } });

            if (!user) throw new Error('NotRegistered');
            //check if auth provider is already linked
            if (!user.oauth2?.provider) {
              user.oauth2 = {
                provider: 'github',
                providerUserId: profile?.id?.toString() as string,
              };
              await user.save();
            }

            const u = user.toJSON();

            if (!u.acl.owner && !u.acl.admin && !u.acl?.servers?.length) throw new Error('Unauthorized');

            // spread userObj to use in profile function
            return {
              ...profile,
              ...{
                id: user._id,
                name: user.name,
                email: user.email,
              },
              userObj: u,
            };
          },
        },
        profile(profile) {
          return {
            id: profile.id.toString(),
            name: profile.name ?? profile.login,
            email: profile.email,
            image: profile.avatar_url,
            ...profile.userObj,
          };
        },
      })
    );
  }

  if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    p.push(
      GoogleProvider({
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    );
  }

  p.push(
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        name: { label: 'Username', type: 'text', placeholder: 'test' },
        email: { label: 'Email', type: 'text', placeholder: 'Enter your email' },
        password: { label: 'Password', type: 'password' },
        terms: { label: 'I agree to the terms and conditions', type: 'checkbox' },
        type: { label: 'type', type: 'text' },
        registrationCode: { label: 'Registration Code', type: 'text', placeholder: 'Enter registration code' },
      },
      async authorize(credentials, req) {
        await connectDB();
        if (!credentials) throw new Error('InvalidForm');
        const registration = credentials.type === 'register';
        if (registration) {
          // test regex lowercase, uppercase
          const accountExists = await userModel.findOne({ $or: [{ email: { $regex: new RegExp(credentials.email, 'i') } }, { name: { $regex: new RegExp(credentials.name, 'i') } }] });
          const is1stAccount = (await userModel.countDocuments()) === 0;
          const settings = await fetchSettings();
          if (settings.registrationCode?.length && settings.registrationCode !== credentials.registrationCode) throw new Error('InvalidRegistrationCode');

          if (accountExists) {
            throw new Error('AccountExists');
          } else {
            const user = new userModel({
              name: credentials.name,
              email: credentials.email,
              password: credentials.password,
              acl: {
                owner: is1stAccount,
                admin: false,
                servers: [],
              },
            });
            await user.save().catch((err: Error) => console.log(err));
            const u = user.toJSON();
            if (!is1stAccount) throw new Error('UnauthorizedRegister');
            return {
              id: u._id,
              ...u,
            };
          }
        } else {
          const user = await userModel.findOne({ email: { $regex: new RegExp(credentials?.email || '', 'i') } });
          if (user) {
            //check if auth provider is already linked
            if (user.oauth2?.providerUserId) throw new Error('OAuth2Linked');

            //verify password
            const match = await user.checkPassword(credentials?.password || '');
            if (match) {
              const u = user.toJSON();
              if (!u.acl.owner && !u.acl.admin && !u.acl?.servers?.length) throw new Error('Unauthorized');
              return {
                id: u._id,
                ...u,
              };
            } else {
              throw new Error('IncorrectPassword');
            }
          } else {
            throw new Error('NotRegistered');
          }
        }
      },
    })
  );

  return p;
};

export const authOptions = {
  providers: providers(),
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, account, user }: { token: JWT; account: any; user: any }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.id = user.id;
      }
      if (user) token.acl = user.acl;
      return token;
    },
    async session({ session, token, user }: { session: any; token: JWT; user: any }) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken;
      session.user.id = token.id;
      session.user.acl = token.acl;

      return session;
    },
  },
};

export default NextAuth(authOptions);
