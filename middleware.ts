import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// SET TO TRUE TO ENABLE MAINTENANCE MODE
const MAINTENANCE_MODE = false;

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  // Call next-intl middleware first to handle locale detection and URL rewriting
  const response = intlMiddleware(request);
  
  // The pathname in request.nextUrl might have been rewritten by next-intl (e.g., /en/about)
  // If next-intl rewrites, it returns a new response. We should use the URL from that response
  // for subsequent checks, or the original request.nextUrl if no rewrite happened.
  // For simplicity, we'll use the original request.nextUrl.pathname for checks that
  // should happen *before* locale-aware routing, and then potentially redirect.
  // However, the instruction implies intlMiddleware should run first.
  // Let's use the original request.nextUrl.pathname for checks, and then return the response from intlMiddleware
  // or a custom redirect.

  const { pathname } = request.nextUrl;

  // Custom logic to handle maintenance and admin protection
  const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  // 1. Handle Maintenance Mode
  if (MAINTENANCE_MODE) { // Using the constant for now as per the provided snippet
    // Allow access to the maintenance page itself and public assets
    // We need to account for localized paths like /en/manutencao or /pt/manutencao
    const isMaintenancePage = pathname.endsWith('/manutencao');
    
    if (
      isMaintenancePage ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.includes(".")
    ) {
      return intlMiddleware(request);
    }

    return NextResponse.redirect(new URL("/pt/manutencao", request.url));
  }

  const isAdminPath = pathname.includes("/admin/dashboard");
  if (isAdminPath) {
    const adminSession = request.cookies.get("admin_session");
    if (!adminSession) {
      const locale = pathname.split('/')[1] || 'pt';
      return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(pt|en)/:path*', '/((?!api|_next/static|_next/image|favicon.ico).*)']
};
