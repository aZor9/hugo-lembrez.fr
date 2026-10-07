import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import {
  LOGIN_MAX_ATTEMPTS,
  LOGIN_WINDOW_MS,
  getClientIp,
  isRateLimited,
  recordFailure,
  resetAttempts,
} from "./rate-limit";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase();
        const ipKey = `login:ip:${getClientIp(req?.headers)}`;
        const emailKey = `login:email:${email}`;

        if (
          isRateLimited(ipKey, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS) ||
          isRateLimited(emailKey, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS)
        ) {
          throw new Error("RateLimited");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        const isValid = user
          ? await bcrypt.compare(credentials.password, user.password)
          : false;

        if (!user || !isValid) {
          recordFailure(ipKey, LOGIN_WINDOW_MS);
          recordFailure(emailKey, LOGIN_WINDOW_MS);
          return null;
        }

        resetAttempts(emailKey);
        return { id: user.id, email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  return user;
}
