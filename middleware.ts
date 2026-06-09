import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@prisma/client/client";

// Edge-safe auth — built from authConfig which has no bcrypt/prisma imports
const { auth } = NextAuth(authConfig);

const intlMiddleware = createMiddleware(routing);

/** Strip /en or /fr prefix to get the canonical route path. */
function canonicalPath(pathname: string): string {
  return pathname.replace(/^\/(en|fr)/, "") || "/";
}

/** Routes that only ADMIN may access (STAFF gets redirected to /admin). */
const ADMIN_ONLY: string[] = [
  "/admin/transactions",
  "/admin/settings",
  "/admin/users",
];

function isAdminOnly(path: string): boolean {
  return ADMIN_ONLY.some((p) => path === p || path.startsWith(p + "/"));
}

export default auth((req) => {
  const { nextUrl } = req;
  const path = canonicalPath(nextUrl.pathname);
  const session = req.auth;
  const isLoggedIn = !!session;
  const role = session?.user?.role as UserRole | undefined;

  // Already logged in → skip the login page
  if (path === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  // All /admin/** routes require a session
  if (path.startsWith("/admin")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // STAFF blocked from admin-only pages
    if (role !== "ADMIN" && isAdminOnly(path)) {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
  }

  // Apply next-intl locale routing for all other requests
  return intlMiddleware(req as NextRequest);
});

export const config = {
  matcher: [
    // Skip Next.js internals, API routes, and static files
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
