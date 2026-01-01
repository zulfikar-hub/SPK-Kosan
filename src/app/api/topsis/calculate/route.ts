import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type KosanNumeric = {
  id_kosan: number;
  harga: number;
  jarak: number;
  fasilitas: number;
  rating: number;
  sistem_keamanan: number;
};

export async function POST() {
  try {
    const data = await prisma.kosan.findMany({
      where: { status_operasional: "AKTIF" },
    });

    if (!data.length) {
      return NextResponse.json({ error: "Data kosong" }, { status: 400 });
    }

    const kosan: KosanNumeric[] = data.map(k => ({
      id_kosan: k.id_kosan,
      harga: Number(k.harga),
      jarak: Number(k.jarak),
      fasilitas: Number(k.fasilitas),
      rating: Number(k.rating),
      sistem_keamanan: Number(k.sistem_keamanan),
    }));

    // ================= NORMALISASI =================
    const denom = {
      harga: Math.sqrt(kosan.reduce((a, k) => a + k.harga ** 2, 0)),
      jarak: Math.sqrt(kosan.reduce((a, k) => a + k.jarak ** 2, 0)),
      fasilitas: Math.sqrt(kosan.reduce((a, k) => a + k.fasilitas ** 2, 0)),
      rating: Math.sqrt(kosan.reduce((a, k) => a + k.rating ** 2, 0)),
      sistem_keamanan: Math.sqrt(kosan.reduce((a, k) => a + k.sistem_keamanan ** 2, 0)),
    };

    const normalized = kosan.map(k => ({
      id_kosan: k.id_kosan,
      harga: k.harga / denom.harga,
      jarak: k.jarak / denom.jarak,
      fasilitas: k.fasilitas / denom.fasilitas,
      rating: k.rating / denom.rating,
      sistem_keamanan: k.sistem_keamanan / denom.sistem_keamanan,
    }));

    // ================= BOBOT (DEFAULT) =================
    const w = {
      harga: 0.25,
      jarak: 0.25,
      fasilitas: 0.2,
      rating: 0.15,
      sistem_keamanan: 0.15,
    };

    const weighted = normalized.map(k => ({
      id_kosan: k.id_kosan,
      harga: k.harga * w.harga,
      jarak: k.jarak * w.jarak,
      fasilitas: k.fasilitas * w.fasilitas,
      rating: k.rating * w.rating,
      sistem_keamanan: k.sistem_keamanan * w.sistem_keamanan,
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
    const hasil = weighted
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

    // ================= SIMPAN =================
    await prisma.$transaction([
      prisma.hasilTopsis.deleteMany(),
      prisma.hasilTopsis.createMany({ data: hasil }),
    ]);

    return NextResponse.json({ message: "TOPSIS berhasil" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal menghitung TOPSIS" }, { status: 500 });
  }
}
