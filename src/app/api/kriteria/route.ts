import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ✅ Ambil semua data kriteria
export async function GET() {
  try {
    const kriteriaList = await prisma.kriteria.findMany({
      orderBy: { id_kriteria: "asc" },
    });

    return NextResponse.json(kriteriaList, { status: 200 });
  } catch (error) {
    console.error("❌ Gagal mengambil data kriteria:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kriteria." },
      { status: 500 }
    );
  }
}

// ✅ Tambah data kriteria baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nama_kriteria, bobot, tipe, deskripsi } = body;

    if (!nama_kriteria || bobot === undefined || !tipe) {
      return NextResponse.json(
        { error: "Semua field (nama_kriteria, bobot, tipe) wajib diisi." },
        { status: 400 }
      );
    }

    if (!["benefit", "cost"].includes(tipe)) {
      return NextResponse.json(
        { error: "Tipe hanya boleh 'benefit' atau 'cost'." },
        { status: 400 }
      );
    }

   const kriteria = await prisma.kriteria.create({
  data: {
    nama_kriteria,
    bobot: Number(bobot),
    tipe,
    deskripsi: deskripsi || "", // default kosong kalau tidak diisi
  },
});


    return NextResponse.json(
      { message: "✅ Kriteria berhasil ditambahkan.", data: kriteria },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Gagal menambahkan kriteria:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menambahkan kriteria." },
      { status: 500 }
    );
  }
}

// ✅ Update data kriteria
export async function PUT(req: Request) {
  try {
    const body = await req.json();
const { id_kriteria, nama_kriteria, bobot, tipe, deskripsi } = body;

    if (!id_kriteria) {
      return NextResponse.json(
        { error: "ID kriteria wajib dikirim." },
        { status: 400 }
      );
    }

    const existing = await prisma.kriteria.findUnique({
      where: { id_kriteria: Number(id_kriteria) },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Kriteria tidak ditemukan." },
        { status: 404 }
      );
    }

    const updated = await prisma.kriteria.update({
  where: { id_kriteria: Number(id_kriteria) },
  data: {
    nama_kriteria: nama_kriteria ?? existing.nama_kriteria,
    bobot: bobot !== undefined ? Number(bobot) : existing.bobot,
    tipe: tipe ?? existing.tipe,
    deskripsi: deskripsi ?? existing.deskripsi,
  },
});

    return NextResponse.json(
      { message: "✅ Kriteria berhasil diupdate.", data: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Gagal update kriteria:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat update kriteria." },
      { status: 500 }
    );
  }
}

// ✅ Hapus kriteria
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID kriteria wajib dikirim." },
        { status: 400 }
      );
    }

    await prisma.kriteria.delete({ where: { id_kriteria: Number(id) } });

    return NextResponse.json(
      { message: "✅ Kriteria berhasil dihapus." },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Gagal hapus kriteria:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus kriteria." },
      { status: 500 }
    );
  }
}
