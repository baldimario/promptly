import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare, hash } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
      authorization: {
        params: { prompt: 'consent', access_type: 'offline', response_type: 'code' },
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || 'dummy-client-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy-client-secret',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (user && user.password) {
            const passwordMatch = await compare(credentials.password, user.password);
            if (passwordMatch) {
              return { id: user.id, name: user.name, email: user.email, image: user.image } as any;
            }
            return null;
          }
          if ((credentials as any).name && !user) {
            const hashedPassword = await hash(credentials.password, 10);
            const newUser = await prisma.user.create({
              data: {
                email: credentials.email,
                name: (credentials as any).name,
                password: hashedPassword,
                image: `https://ui-avatars.com/api/?name=${encodeURIComponent((credentials as any).name)}&background=random`,
              },
            });
            return { id: newUser.id, name: newUser.name, email: newUser.email, image: newUser.image } as any;
          }
          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  pages: { signIn: '/login', signOut: '/', error: '/login', newUser: '/signup' },
  callbacks: {
    async signIn({ user, credentials, account, profile }) {
      // Allow credentials flow as-is
      if (credentials) return true;

      // Auto-link verified Google account to an existing user with same email
      if (account?.provider && profile && (profile as any).email) {
        const email = (profile as any).email as string;
        const isGoogle = account.provider === 'google';
        const isGithub = account.provider === 'github';
        // Google supplies email_verified, GitHub does not in the basic profile (we assume verified if provided)
        const emailVerified = isGoogle ? !!(profile as any).email_verified : isGithub ? true : false;
        if (!emailVerified) return !!user?.email; // abort auto-link if not verified
        try {
          const existingUser = await prisma.user.findUnique({ where: { email } });
          if (existingUser) {
            // Check if account already linked
            const existingAccount = await prisma.account.findFirst({
              where: {
                userId: existingUser.id,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            });
            if (!existingAccount) {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  accessToken: (account as any).access_token,
                  refreshToken: (account as any).refresh_token,
                  expiresAt: (account as any).expires_at,
                  tokenType: (account as any).token_type,
                  scope: (account as any).scope,
                  idToken: (account as any).id_token,
                  sessionState: (account as any).session_state,
                },
              });
            }
            // Ensure the session associates with existing user id
            (user as any).id = existingUser.id;
            return true;
          }
        } catch (e) {
          console.error('Auto-link signIn error:', e);
          // Fall through to default behavior
        }
      }
      return !!user?.email;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, user, account }) {
      if (user) {
        (token as any).id = (user as any).id;
        (token as any).provider = account?.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id as string;
      }
      return session;
    },
  },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-for-development',
  debug: process.env.NODE_ENV === 'development',
};
