import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// SET TO TRUE TO ENABLE MAINTENANCE MODE
const MAINTENANCE_MODE = false;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (MAINTENANCE_MODE) {
    // Allow access to the maintenance page itself and public assets
    if (
      pathname === "/manutencao" ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") || // Keep APIs working if possible, or handle them too
      pathname.includes(".") // static files
    ) {
      return NextResponse.next();
    }

    // Redirect everything else to maintenance page
    return NextResponse.redirect(new URL("/manutencao", request.url));
  }

  // Protect Admin Dashboard
  if (pathname.startsWith("/admin/dashboard")) {
    const adminSession = request.cookies.get("admin_session");
    if (!adminSession) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
