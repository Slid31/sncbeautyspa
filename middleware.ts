import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { UserRole } from "@/app/generated/prisma/client";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const { auth } = NextAuth(authConfig);
const intlMiddleware = createMiddleware(routing);

/** Strip /en or /fr prefix to get the canonical route path. */
function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(en|fr)(\/|$)/, "/") || "/";
}

const ADMIN_ONLY = ["/admin/transactions", "/admin/settings", "/admin/users"];

function isAdminOnly(path: string): boolean {
  return ADMIN_ONLY.some((p) => path === p || path.startsWith(p + "/"));
}

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const canonical = stripLocale(pathname);
  const session = req.auth;
  const isLoggedIn = !!session;
  const role = session?.user?.role as UserRole | undefined;

  // Already logged in → skip login page
  if (canonical === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  // Admin routes require a session
  if (canonical.startsWith("/admin")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", canonical);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "ADMIN" && isAdminOnly(canonical)) {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
  }

  // Let next-intl handle locale detection and URL rewriting
  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)" ],
};
