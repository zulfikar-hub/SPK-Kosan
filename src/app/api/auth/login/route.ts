import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      identifier: string;
      password: string;
    };

    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { name: identifier }] },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 401 }
      );
    }

    if (!user.password) {
      console.error("LOGIN ERROR: User password kosong!", user);
      return NextResponse.json(
        { error: "User password tidak tersedia" },
        { status: 500 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Password salah" },
        { status: 401 }
      );
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("LOGIN ERROR: JWT_SECRET belum di-set di .env");
      return NextResponse.json(
        { error: "Server belum dikonfigurasi dengan benar" },
        { status: 500 }
      );
    }

    // 🔧 PERBAIKAN INTI (ROLE LOWERCASE)
    const role = user.role.toLowerCase();

    const token = jwt.sign(
      { id: user.id, email: user.email, role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const res = NextResponse.json({
      success: true,
      message: "Login berhasil",
      role,
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return res;

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("LOGIN ERROR:", err.message);
      return NextResponse.json(
        { error: "Terjadi kesalahan server", detail: err.message },
        { status: 500 }
      );
    }

    console.error("LOGIN ERROR:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server", detail: "Unknown error" },
      { status: 500 }
    );
  }
}
