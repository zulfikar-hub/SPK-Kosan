// app/api/topsis/calculate/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";


import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { runTopsisLogic } from "@/lib/topsis/engine";

export async function POST() {
  try {
    const [dataKosan, dataKriteria] = await Promise.all([
      prisma.kosan.findMany({ where: { status_operasional: "AKTIF" } }),
      prisma.kriteria.findMany({ orderBy: { id_kriteria: 'asc' } }) 
    ]);

    if (!dataKosan.length) return NextResponse.json({ error: "Data kosong" }, { status: 400 });

    // Ambil bobot dinamis (pastikan urutan di DB sesuai: Harga, Jarak, Fas, Rat, Keam)
    // Jika tidak yakin urutan di DB, mapping berdasarkan nama:
    const weightMap = new Map(dataKriteria.map(c => [c.nama_kriteria.toLowerCase(), Number(c.bobot) / 100]));
    const weights = [
      weightMap.get("harga") || 0.3,
      weightMap.get("jarak") || 0.2,
      weightMap.get("fasilitas") || 0.2,
      weightMap.get("rating") || 0.2,
      weightMap.get("keamanan") || 0.1,
    ];

    const hasilTopsis = runTopsisLogic(dataKosan, weights);

    await prisma.$transaction([
      prisma.hasilTopsis.deleteMany(),
      prisma.hasilTopsis.createMany({ data: hasilTopsis }),
    ]);

    return NextResponse.json({ message: "Berhasil Sinkron", data: hasilTopsis });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal" }, { status: 500 });
  }
}