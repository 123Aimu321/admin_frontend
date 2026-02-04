//app/middleware.ts
import { NextResponse } from "next/server";

const protectedRoutes = [
  "/principal/dashboard",
  "/teacher/dashboard",
  "/student/dashboard",
  "/admin/dashboard",
];

export function middleware(req: { cookies: { get: (arg0: string) => { (): any; new(): any; value: any; }; }; nextUrl: { pathname: string; }; url: string | URL | undefined; }) {
  const token = req.cookies.get("access_token")?.value;

  if (!token && protectedRoutes.some((r) => req.nextUrl.pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/principal/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/admin/:path*",
  ],
};
