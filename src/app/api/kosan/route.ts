export const dynamic = "force-dynamic"; // ⬅️ FIX UTAMA

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 📌 GET: Ambil semua data kosan
export async function GET() {
  try {
    const kosanList = await prisma.kosan.findMany({
      orderBy: { id_kosan: "asc" },
    });

    return NextResponse.json(kosanList, { status: 200 });
  } catch (error) {
    console.error("❌ Gagal mengambil data kosan:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kosan." },
      { status: 500 }
    );
  }
}

// 📌 POST: Tambah data kosan baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nama, harga, jarak, fasilitas, rating, sistem_keamanan } = body;

    if (!nama || !harga || !jarak || !fasilitas || !rating || !sistem_keamanan) {
      return NextResponse.json(
        { error: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    const kosan = await prisma.kosan.create({
      data: {
        nama,
        harga: Number(harga),
        jarak: Number(jarak),
        fasilitas: Number(fasilitas),
        rating: Number(rating),
        sistem_keamanan: Number(sistem_keamanan),
      },
    });

    return NextResponse.json(
      { message: "✅ Kosan berhasil ditambahkan", data: kosan },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Gagal menambahkan kosan:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan kosan ke database." },
      { status: 500 }
    );
  }
}

// 📌 PUT: Update data kosan
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id_kosan, nama, harga, jarak, fasilitas, rating, sistem_keamanan } = body;

    if (!id_kosan) {
      return NextResponse.json(
        { error: "ID kosan wajib dikirim untuk update." },
        { status: 400 }
      );
    }

    const existing = await prisma.kosan.findUnique({
      where: { id_kosan: Number(id_kosan) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Kosan tidak ditemukan." },
        { status: 404 }
      );
    }

    const updated = await prisma.kosan.update({
      where: { id_kosan: Number(id_kosan) },
      data: {
        nama: nama ?? existing.nama,
        harga: harga !== undefined ? Number(harga) : existing.harga,
        jarak: jarak !== undefined ? Number(jarak) : existing.jarak,
        fasilitas:
          fasilitas !== undefined ? Number(fasilitas) : existing.fasilitas,
        rating: rating !== undefined ? Number(rating) : existing.rating,
        sistem_keamanan:
          sistem_keamanan !== undefined
            ? Number(sistem_keamanan)
            : existing.sistem_keamanan,
      },
    });

    return NextResponse.json(
      { message: "✅ Data kosan berhasil diupdate", data: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Gagal mengupdate kosan:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate data kosan." },
      { status: 500 }
    );
  }
}

// 📌 DELETE: Hapus kosan
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id_kosan = searchParams.get("id");

    if (!id_kosan) {
      return NextResponse.json(
        { error: "ID kosan wajib dikirim untuk hapus data." },
        { status: 400 }
      );
    }

    const existing = await prisma.kosan.findUnique({
      where: { id_kosan: Number(id_kosan) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Kosan tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.kosan.delete({
      where: { id_kosan: Number(id_kosan) },
    });

    return NextResponse.json(
      { message: "🗑️ Kosan berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Gagal menghapus kosan:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data kosan." },
      { status: 500 }
    );
  }
}
