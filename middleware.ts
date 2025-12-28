import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;

  // ================================
  // 🔓 API PUBLIC (TANPA LOGIN)
  // ================================
  const publicApiRoutes = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/kosan",
    "/api/kriteria",
    "/api/topsis",
    "/api/hasil-topsis",
  ];

  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // ================================
  // 🔐 ADMIN PAGE
  // ================================
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=unauthorized", req.url)
      );
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as { role: string };

      // ✅ ROLE HARUS KONSISTEN
      if (decoded.role !== "ADMIN") {
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
  matcher: [
    "/api/:path*",
    "/admin/:path*",
  ],
};
