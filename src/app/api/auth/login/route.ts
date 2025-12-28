import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      identifier: string; // email atau username
      password: string;
    };

    const { identifier, password } = body;

    // Validasi input frontend
    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Cari user berdasarkan email atau username
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { name: identifier }] },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 401 }
      );
    }

    // Pastikan password ada
    if (!user.password) {
      console.error("LOGIN ERROR: User password kosong!", user);
      return NextResponse.json(
        { error: "User password tidak tersedia" },
        { status: 500 }
      );
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Password salah" },
        { status: 401 }
      );
    }

    // Pastikan JWT secret ada
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("LOGIN ERROR: JWT_SECRET belum di-set di .env");
      return NextResponse.json(
        { error: "Server belum dikonfigurasi dengan benar" },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Simpan token di cookie HTTP-only
    const res = NextResponse.json({
      success: true,
      message: "Login berhasil",
      role: user.role,
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
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
