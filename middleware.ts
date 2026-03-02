import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("auth_session");

  // Allow access to auth-related API routes and static files
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Redirect to login if no session and not on login/onboarding page
  if (!session && pathname !== "/login" && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If session exists and on login/onboarding, redirect to home
  if (session && (pathname === "/login" || pathname === "/onboarding")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
