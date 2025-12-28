import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      identifier: string; // bisa email atau username
      password: string;
    };

    const { identifier, password } = body;

    // Validasi input
    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Cari user berdasarkan email atau username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { name: identifier } // username disini pakai field 'name'
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 401 }
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

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    // Simpan token di cookie
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
