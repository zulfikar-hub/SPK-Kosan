export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { StatusOperasional, StatusKetersediaan } from "@prisma/client";

/* ============================================
   🔁 Recalculate TOPSIS (Vercel-safe)
============================================ */
async function recalcTopsis() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      console.warn("⚠️ NEXT_PUBLIC_BASE_URL belum diset");
      return;
    }

    await fetch(`${baseUrl}/api/topsis/calculate`, {
      method: "POST",
      cache: "no-store",
    });
  } catch (err) {
    console.error("❌ Gagal memanggil TOPSIS:", err);
  }
}

/* ============================================
   📌 GET — Ambil semua kosan
============================================ */
export async function GET() {
  try {
    const kosanList = await prisma.kosan.findMany({
      orderBy: { id_kosan: "asc" },
      include: { hasiltopsis: true },
    });

    return NextResponse.json(kosanList);
  } catch (error) {
    console.error("❌ GET Kosan Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kosan" },
      { status: 500 }
    );
  }
}

/* ============================================
   📌 POST — Tambah kosan
============================================ */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nama,
      harga,
      jarak,
      fasilitas,
      rating,
      sistem_keamanan,
      description,
    } = body;

    if (
      !nama ||
      harga == null ||
      jarak == null ||
      fasilitas == null ||
      rating == null ||
      sistem_keamanan == null
    ) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const total = await prisma.kosan.count();

    const kosan = await prisma.kosan.create({
      data: {
        nama,
        harga: Number(harga),
        jarak: Number(jarak),
        fasilitas: Number(fasilitas),
        rating: Number(rating),
        sistem_keamanan: Number(sistem_keamanan),
        description: description ?? null,
        ranking: total + 1,
        status_operasional: StatusOperasional.AKTIF,
        status_ketersediaan: StatusKetersediaan.TERSEDIA,
      },
    });

    recalcTopsis();

    return NextResponse.json(
      { message: "Kosan berhasil ditambahkan", data: kosan },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ POST Kosan Error:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan kosan" },
      { status: 500 }
    );
  }
}

/* ============================================
   📌 PUT — Update / Toggle status
============================================ */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id_kosan, toggleStatus, ...rest } = body;

    if (!id_kosan) {
      return NextResponse.json(
        { error: "ID kosan wajib dikirim" },
        { status: 400 }
      );
    }

    const existing = await prisma.kosan.findUnique({
      where: { id_kosan: Number(id_kosan) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Kosan tidak ditemukan" },
        { status: 404 }
      );
    }

    const updated = await prisma.kosan.update({
      where: { id_kosan: Number(id_kosan) },
      data: {
        ...rest,
        harga: rest.harga != null ? Number(rest.harga) : undefined,
        jarak: rest.jarak != null ? Number(rest.jarak) : undefined,
        fasilitas: rest.fasilitas != null ? Number(rest.fasilitas) : undefined,
        rating: rest.rating != null ? Number(rest.rating) : undefined,
        sistem_keamanan:
          rest.sistem_keamanan != null
            ? Number(rest.sistem_keamanan)
            : undefined,
        status_operasional: toggleStatus
          ? existing.status_operasional === StatusOperasional.AKTIF
            ? StatusOperasional.INAKTIF
            : StatusOperasional.AKTIF
          : rest.status_operasional,
      },
    });

    recalcTopsis();

    return NextResponse.json({ message: "Data kosan diperbarui", data: updated });
  } catch (error) {
    console.error("❌ PUT Kosan Error:", error);
    return NextResponse.json(
      { error: "Gagal update kosan" },
      { status: 500 }
    );
  }
}

/* ============================================
   🗑️ DELETE — Hapus kosan (FIX RELASI)
============================================ */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID kosan wajib dikirim (?id=...)" },
        { status: 400 }
      );
    }

    const id_kosan = Number(id);

    // 🔥 WAJIB hapus relasi dulu
    await prisma.hasilTopsis.deleteMany({
      where: { id_kosan },
    });

    await prisma.kosan.delete({
      where: { id_kosan },
    });

    recalcTopsis();

    return NextResponse.json({ message: "Kosan berhasil dihapus" });
  } catch (error) {
    console.error("❌ DELETE Kosan Error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus kosan" },
      { status: 500 }
    );
  }
}
