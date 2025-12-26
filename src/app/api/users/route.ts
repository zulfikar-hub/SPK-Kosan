export const runtime = "nodejs";

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { user_role, user_status, Prisma } from "@prisma/client";
/* =============================
   TYPE RESPONSE (UNTUK UI)
============================= */
type FormattedUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "aktif" | "inaktif";
  joinDate: string;
};

/* =============================
   FORMAT DATE
============================= */
const formatDate = (date: Date) =>
  date.toISOString().split("T")[0];

/* =============================
   FORMAT USER RESPONSE
============================= */
const formatUserResponse = (
  user: {
    id: number;
    name: string;
    email: string;
    role: user_role;
    status: user_status;
    createdAt: Date;
  }
): FormattedUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role === "ADMIN" ? "admin" : "user",
  status: user.status === "AKTIF" ? "aktif" : "inaktif",
  joinDate: formatDate(user.createdAt),
});

/* =============================
   GET
============================= */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json(users.map(formatUserResponse));
  } catch (error) {
    console.error("❌ GET users error:", error);
    return NextResponse.json({ error: "Gagal mengambil data user" }, { status: 500 });
  }
}

/* =============================
   POST
============================= */
export async function POST(req: Request) {
  try {
    const { name, email, role, password } = await req.json();

    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const roleEnum = role.toUpperCase() as user_role;
    if (!Object.values(user_role).includes(roleEnum)) {
      return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: roleEnum,
        status: user_status.AKTIF,
      },
    });

    return NextResponse.json(
      { message: "User berhasil ditambahkan", data: formatUserResponse(user) },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }

    console.error("❌ POST user error:", error);
    return NextResponse.json({ error: "Gagal menambahkan user" }, { status: 500 });
  }
}

/* =============================
   PUT
============================= */
export async function PUT(req: Request) {
  try {
    const { id, name, email, role, status, password } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID wajib" }, { status: 400 });
    }

    const data: Prisma.userUpdateInput = {};

    if (name) data.name = name;
    if (email) data.email = email;
    if (role) data.role = role.toUpperCase() as user_role;
    if (status) data.status = status.toUpperCase() as user_status;
    if (password) data.password = await bcrypt.hash(password, 10);

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data,
    });

    return NextResponse.json({
      message: "User berhasil diupdate",
      data: formatUserResponse(updated),
    });
  } catch (error) {
    console.error("❌ PUT user error:", error);
    return NextResponse.json({ error: "Gagal update user" }, { status: 500 });
  }
}

/* =============================
   DELETE
============================= */
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID wajib" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error("❌ DELETE user error:", error);
    return NextResponse.json({ error: "Gagal hapus user" }, { status: 500 });
  }
}
