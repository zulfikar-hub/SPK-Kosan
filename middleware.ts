import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value || null;
  const pathname = req.nextUrl.pathname;

  // 🔓 API YANG BOLEH DIAKSES TANPA LOGIN
  const publicApiRoutes = [
    "/api/kosan",
    "/api/kriteria",
    "/api/hasil-topsis",
    "/api/topsis",
  ];

  // kalau API publik → lewati middleware
  if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 🔐 ADMIN PAGE
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=unauthorized", req.url)
      );
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as { role: string };

      if (decoded.role !== "admin") {
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
