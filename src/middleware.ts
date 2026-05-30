import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/patient", "/doctor", "/admin", "/nurse"];

const authRoutes = ["/login"];

const roleDashboard: Record<string, string> = {
  DOCTOR: "/doctor",
  PATIENT: "/patient",
  ADMIN: "/admin",
  NURSE: "/nurse/queue",
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isRscRequest =
    request.nextUrl.searchParams.has("_rsc") ||
    request.headers.get("rsc") === "1" ||
    request.headers.get("next-router-prefetch") === "1";
  if (isRscRequest) return NextResponse.next();

  const token =
    request.cookies.get("auth_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  const userRole = request.cookies.get("user_role")?.value;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    const dashboardPath = roleDashboard[userRole || "PATIENT"] || "/patient";
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
