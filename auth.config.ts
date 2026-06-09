/**
 * Edge-safe auth configuration — no Node.js-only imports (no bcrypt, no prisma, no pg).
 * Imported by middleware (Edge runtime) and spread into the full auth.ts config.
 */
import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/app/generated/prisma/client";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: UserRole }).role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
};
