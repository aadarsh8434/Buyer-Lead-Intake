// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Don't run middleware on auth routes, API routes, and static files
  if (
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname.startsWith("/_next/") ||
    request.nextUrl.pathname.startsWith("/favicon.ico") ||
    request.nextUrl.pathname.startsWith("/signin") ||
    request.nextUrl.pathname.startsWith("/verify-request") ||
    request.nextUrl.pathname.startsWith("/error")
  ) {
    return NextResponse.next();
  }

  // Check for session token
  const sessionToken =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  console.log("Middleware - Session token exists:", !!sessionToken);

  // Check if this is a protected route
  const protectedRoutes = ["/buyers"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // If user is authenticated and trying to access root path, redirect to dashboard
  if (sessionToken && request.nextUrl.pathname === "/") {
    console.log("Authenticated user on root, redirecting to dashboard");
    return NextResponse.redirect(new URL("/buyers", request.url));
  }

  if (isProtectedRoute) {
    if (!sessionToken) {
      console.log("No session token, redirecting to signin");
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    // If we have a session token, let the request continue
    // The actual session validation will happen on the server side
    console.log("Session token found, allowing access");
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
