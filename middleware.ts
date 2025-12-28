import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;

  // ================================
  // 🔓 PUBLIC ROUTES
  // ================================
  const publicRoutes = ["/", "/login", "/register"];

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // ================================
  // 🔓 PUBLIC API
  // ================================
  if (
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register")
  ) {
    return NextResponse.next();
  }

  // ================================
  // 🔐 ADMIN & DASHBOARD
  // ================================
  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=unauthorized", req.url)
      );
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("JWT_SECRET belum diset");
      return NextResponse.redirect(
        new URL("/login?error=server-config", req.url)
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        role: string;
      };

      // 🔐 KHUSUS ADMIN
      if (pathname.startsWith("/admin") && decoded.role !== "admin") {
        return NextResponse.redirect(
          new URL("/login?error=forbidden", req.url)
        );
      }

    } catch {
      return NextResponse.redirect(
        new URL("/login?error=invalid-token", req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
