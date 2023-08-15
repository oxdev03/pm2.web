import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

import connectDB from '../../../middleware/mongodb';
import User from '../../../models/user';
import { fetchSettings } from '@/utils/fetchSSRProps';

const providers = () => {
  const p = [];
  if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
    p.push(
      GithubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      })
    );
  }
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    p.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
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
          const accountExists = await User.findOne({ $or: [{ email: { $regex: new RegExp(credentials.email, 'i') } }, { name: { $regex: new RegExp(credentials.name, 'i') } }] });
          const is1stAccount = (await User.countDocuments()) === 0;
          const settings = await fetchSettings();
          if (settings.registrationCode?.length && settings.registrationCode !== credentials.registrationCode) throw new Error('InvalidRegistrationCode');

          if (accountExists) {
            throw new Error('AccountExists');
          } else {
            const user = new User({
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
          const user = await User.findOne({ email: { $regex: new RegExp(credentials?.email || '', 'i') } });
          if (user) {
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
