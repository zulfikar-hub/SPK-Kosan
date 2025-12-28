import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    // Validasi input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Cek email
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Role aman
    const finalRole =
      role?.toUpperCase() === "ADMIN" ? "ADMIN" : "USER";

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: finalRole,
      },
    });

    // Response aman (tanpa password)
    return NextResponse.json(
      {
        success: true,
        message: "Register berhasil",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("REGISTER ERROR:", err.message);
      return NextResponse.json(
        { error: "Register gagal", detail: err.message },
        { status: 500 }
      );
    }

    console.error("REGISTER ERROR:", err);
    return NextResponse.json(
      { error: "Register gagal", detail: "Unknown error" },
      { status: 500 }
    );
  }
}
