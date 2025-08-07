import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare, hash } from 'bcryptjs';

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

export const authOptions = {
  // Use Prisma adapter for database integration with OAuth providers
  adapter: PrismaAdapter(prisma),
  // Configure authentication providers
  providers: [
    // OAuth providers with proper environment variables
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || 'dummy-client-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy-client-secret',
    }),
    // Email/Password authentication with database storage
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" } // For registration
      },
      async authorize(credentials) {
        // Check for required fields
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        try {
          // For login - check if user exists
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });
          
          // User exists, verify password for login
          if (user && user.password) {
            const passwordMatch = await compare(credentials.password, user.password);
            
            if (passwordMatch) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
              };
            }
            return null; // Password doesn't match
          }
          
          // For registration (if user doesn't exist and name is provided)
          if (credentials.name && !user) {
            // Hash the password
            const hashedPassword = await hash(credentials.password, 10);
            
            // Create the user in the database
            const newUser = await prisma.user.create({
              data: {
                email: credentials.email,
                name: credentials.name,
                password: hashedPassword,
                image: `https://ui-avatars.com/api/?name=${encodeURIComponent(credentials.name)}&background=random`,
              },
            });
            
            return {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              image: newUser.image,
            };
          }
          
          return null; // No matching conditions
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
    newUser: '/signup'
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }: { 
      user: any; 
      account: any | null; 
      profile?: any; 
      email?: { verificationRequest?: boolean }; 
      credentials?: Record<string, any>; 
    }) {
      // For credentials provider, we've already checked in authorize
      if (credentials) return true;
      
      // For OAuth providers, we can perform additional validation if needed
      if (user?.email) {
        // Check if this OAuth account is allowed to sign in
        return true;
      }
      
      return false; // Default: deny sign in
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, user, account, profile }: { token: JWT, user: any, account: any, profile?: any }) {
      // If the user object exists, it means we just signed in
      if (user) {
        token.id = user.id;
        token.provider = account?.provider;
      }
      return token;
    },
    async session({ session, token }: { session: Session, token: JWT }) {
      // Add user id to the session
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-for-development",
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
