import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { UserRole } from "@prisma/client/client";

interface Props {
  allow: UserRole[];
  redirectTo?: string;
  children: React.ReactNode;
}

/**
 * Server component that renders children only when the session role matches.
 * Use inside admin page layouts as a second line of defence after middleware.
 */
export async function RoleGuard({ allow, redirectTo = "/admin", children }: Props) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!allow.includes(session.user.role as UserRole)) redirect(redirectTo);

  return <>{children}</>;
}
