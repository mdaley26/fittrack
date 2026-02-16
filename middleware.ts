import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/workouts", "/templates", "/exercises", "/profile"];

function isProtected(pathname: string) {
  return protectedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get("fittrack-token")?.value;
  const isAuth = !!token;
  const pathname = req.nextUrl.pathname;

  if (isProtected(pathname) && !isAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if ((pathname === "/login" || pathname === "/register") && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/workouts/:path*", "/templates/:path*", "/exercises/:path*", "/profile/:path*", "/login", "/register"],
};
