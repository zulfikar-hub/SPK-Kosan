export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { StatusOperasional, StatusKetersediaan } from "@prisma/client";

/* ============================================
   📌 Panggil ulang TOPSIS (NON-BLOCKING)
============================================ */
async function recalcTopsis() {
  try {
    await fetch("/api/topsis/calculate", {
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

    return NextResponse.json(kosanList, { status: 200 });
  } catch (error) {
    console.error("❌ GET Kosan Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kosan." },
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
      harga === undefined ||
      jarak === undefined ||
      fasilitas === undefined ||
      rating === undefined ||
      sistem_keamanan === undefined
    ) {
      return NextResponse.json(
        { error: "Semua field wajib diisi." },
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

    recalcTopsis(); // 🔥 jangan block response

    return NextResponse.json(
      { message: "Kosan berhasil ditambahkan", data: kosan },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ POST Kosan Error:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan kosan." },
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
    const {
      id_kosan,
      nama,
      harga,
      jarak,
      fasilitas,
      rating,
      sistem_keamanan,
      description,
      status_operasional,
      status_ketersediaan,
      ranking,
      toggleStatus,
    } = body;

    if (!id_kosan) {
      return NextResponse.json(
        { error: "ID kosan wajib dikirim." },
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

    let newStatusOperasional = existing.status_operasional;
    if (toggleStatus) {
      newStatusOperasional =
        existing.status_operasional === StatusOperasional.AKTIF
          ? StatusOperasional.INAKTIF
          : StatusOperasional.AKTIF;
    } else if (status_operasional) {
      newStatusOperasional = status_operasional;
    }

    let newStatusKetersediaan = existing.status_ketersediaan;
    if (status_ketersediaan) {
      newStatusKetersediaan = status_ketersediaan;
    }

    const updated = await prisma.kosan.update({
      where: { id_kosan: Number(id_kosan) },
      data: {
        nama: nama ?? existing.nama,
        harga: harga !== undefined ? Number(harga) : existing.harga,
        jarak: jarak !== undefined ? Number(jarak) : existing.jarak,
        fasilitas: fasilitas !== undefined ? Number(fasilitas) : existing.fasilitas,
        rating: rating !== undefined ? Number(rating) : existing.rating,
        sistem_keamanan:
          sistem_keamanan !== undefined
            ? Number(sistem_keamanan)
            : existing.sistem_keamanan,
        description: description ?? existing.description,
        ranking: ranking ?? existing.ranking,
        status_operasional: newStatusOperasional,
        status_ketersediaan: newStatusKetersediaan,
      },
    });

    recalcTopsis();

    return NextResponse.json(
      { message: "Data kosan diperbarui", data: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ PUT Kosan Error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate data kosan." },
      { status: 500 }
    );
  }
}

/* ============================================
   📌 DELETE — Hapus kosan
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

    const existing = await prisma.kosan.findUnique({
      where: { id_kosan: Number(id) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Kosan tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.kosan.delete({
      where: { id_kosan: Number(id) },
    });

    recalcTopsis();

    return NextResponse.json(
      { message: "Kosan berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ DELETE Kosan Error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus kosan." },
      { status: 500 }
    );
  }
}
