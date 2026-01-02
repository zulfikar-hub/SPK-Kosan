// lib/topsis/recalctopsis.ts
import prisma from "@/lib/prisma";
import { runTopsisLogic } from "./engine";

export async function recalcTopsis() {
  const [dataKosan, dataKriteria] = await Promise.all([
    prisma.kosan.findMany({ where: { status_operasional: "AKTIF" } }),
    prisma.kriteria.findMany()
  ]);

  if (dataKosan.length === 0) return;

  const weightMap = new Map(dataKriteria.map(c => [c.nama_kriteria.toLowerCase(), Number(c.bobot) / 100]));
  const weights = [
    weightMap.get("harga") || 0.3,
    weightMap.get("jarak") || 0.2,
    weightMap.get("fasilitas") || 0.2,
    weightMap.get("rating") || 0.2,
    weightMap.get("keamanan") || 0.1,
  ];

  const hasilTopsis = runTopsisLogic(dataKosan, weights);

  const updates = hasilTopsis.map((item) =>
    prisma.kosan.update({
      where: { id_kosan: item.id_kosan },
      data: { ranking: item.ranking },
    })
  );

  await prisma.$transaction(updates);
}