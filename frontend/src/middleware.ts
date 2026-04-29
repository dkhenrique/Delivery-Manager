import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("jwt")?.value;
  const { pathname } = request.nextUrl;

  // Protect /dashboard routes — redirect to /login if no JWT cookie
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Already authenticated users should not see the login page
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/cadastro",
    "/esqueci-senha",
    "/redefinir-senha",
  ],
};
