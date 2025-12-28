import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const kosanList = await prisma.kosan.findMany({
      where: {
        status_operasional: "AKTIF",
      },
    });

    if (kosanList.length === 0) {
      return NextResponse.json(
        { error: "Data kosan kosong" },
        { status: 400 }
      );
    }

    const kosan = kosanList.map(k => ({
      id_kosan: k.id_kosan,
      harga: Number(k.harga),
      jarak: Number(k.jarak),
      fasilitas: Number(k.fasilitas),
      rating: Number(k.rating),
      sistem_keamanan: Number(k.sistem_keamanan),
    }));

    // ================= NORMALISASI =================
    const sumSquares = kosan.reduce(
      (acc, k) => ({
        harga: acc.harga + k.harga ** 2,
        jarak: acc.jarak + k.jarak ** 2,
        fasilitas: acc.fasilitas + k.fasilitas ** 2,
        rating: acc.rating + k.rating ** 2,
        sistem_keamanan: acc.sistem_keamanan + k.sistem_keamanan ** 2,
      }),
      { harga: 0, jarak: 0, fasilitas: 0, rating: 0, sistem_keamanan: 0 }
    );

    const safeDiv = (val: number, sum: number) =>
      sum === 0 ? 0 : val / Math.sqrt(sum);

    const normalized = kosan.map(k => ({
      id_kosan: k.id_kosan,
      harga: safeDiv(k.harga, sumSquares.harga),
      jarak: safeDiv(k.jarak, sumSquares.jarak),
      fasilitas: safeDiv(k.fasilitas, sumSquares.fasilitas),
      rating: safeDiv(k.rating, sumSquares.rating),
      sistem_keamanan: safeDiv(k.sistem_keamanan, sumSquares.sistem_keamanan),
    }));

    // ================= BOBOT =================
    const weights = {
      harga: 0.25,
      jarak: 0.25,
      fasilitas: 0.2,
      rating: 0.15,
      sistem_keamanan: 0.15,
    };

    const weighted = normalized.map(k => ({
      id_kosan: k.id_kosan,
      harga: k.harga * weights.harga,
      jarak: k.jarak * weights.jarak,
      fasilitas: k.fasilitas * weights.fasilitas,
      rating: k.rating * weights.rating,
      sistem_keamanan: k.sistem_keamanan * weights.sistem_keamanan,
    }));

    // ================= SOLUSI IDEAL =================
    const idealPlus = {
      harga: Math.min(...weighted.map(k => k.harga)),
      jarak: Math.min(...weighted.map(k => k.jarak)),
      fasilitas: Math.max(...weighted.map(k => k.fasilitas)),
      rating: Math.max(...weighted.map(k => k.rating)),
      sistem_keamanan: Math.max(...weighted.map(k => k.sistem_keamanan)),
    };

    const idealMinus = {
      harga: Math.max(...weighted.map(k => k.harga)),
      jarak: Math.max(...weighted.map(k => k.jarak)),
      fasilitas: Math.min(...weighted.map(k => k.fasilitas)),
      rating: Math.min(...weighted.map(k => k.rating)),
      sistem_keamanan: Math.min(...weighted.map(k => k.sistem_keamanan)),
    };

    // ================= PREFERENSI =================
    const ranked = weighted
      .map(k => {
        const dPlus = Math.sqrt(
          (k.harga - idealPlus.harga) ** 2 +
          (k.jarak - idealPlus.jarak) ** 2 +
          (k.fasilitas - idealPlus.fasilitas) ** 2 +
          (k.rating - idealPlus.rating) ** 2 +
          (k.sistem_keamanan - idealPlus.sistem_keamanan) ** 2
        );

        const dMinus = Math.sqrt(
          (k.harga - idealMinus.harga) ** 2 +
          (k.jarak - idealMinus.jarak) ** 2 +
          (k.fasilitas - idealMinus.fasilitas) ** 2 +
          (k.rating - idealMinus.rating) ** 2 +
          (k.sistem_keamanan - idealMinus.sistem_keamanan) ** 2
        );

        return {
          id_kosan: k.id_kosan,
          nilai_preferensi: dMinus / (dPlus + dMinus),
        };
      })
      .sort((a, b) => b.nilai_preferensi - a.nilai_preferensi)
      .map((r, i) => ({ ...r, ranking: i + 1 }));

    // ================= SIMPAN (AMAN) =================
    await prisma.$transaction([
      prisma.hasilTopsis.deleteMany(),
      prisma.hasilTopsis.createMany({
        data: ranked,
      }),
    ]);

    return NextResponse.json(
      { message: "TOPSIS berhasil dihitung" },
      { status: 200 }
    );
  } catch (err) {
    console.error("TOPSIS ERROR:", err);
    return NextResponse.json(
      { error: "Gagal menghitung TOPSIS" },
      { status: 500 }
    );
  }
}