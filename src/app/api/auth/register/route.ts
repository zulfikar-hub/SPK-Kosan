import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    // Validasi input simple
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Cek apakah email sudah terdaftar
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Pastikan role valid
    const finalRole =
      role?.toUpperCase() === "ADMIN" ? "ADMIN" : "USER";

    // Create user baru
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: finalRole,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Register berhasil",
        user,
      },
      { status: 200 }
    );

  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error";

    console.error("REGISTER ERROR:", errorMessage);

    return NextResponse.json(
      { error: "Register gagal", detail: errorMessage },
      { status: 500 }
    );
  }
}
