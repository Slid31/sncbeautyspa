import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@/app/generated/prisma/client";

/** Require an authenticated session. Redirects to /login if not present. */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

/** Require ADMIN role. Redirects to /admin if role is insufficient. */
export async function requireAdmin() {
  const session = await requireAuth();
  if ((session.user.role as UserRole) !== "ADMIN") redirect("/admin");
  return session;
}

/** Get the current session without throwing. Returns null if unauthenticated. */
export async function getSession() {
  return auth();
}
