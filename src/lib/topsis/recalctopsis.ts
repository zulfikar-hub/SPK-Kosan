import prisma from "@/lib/prisma";
import { Kosan, Prisma } from "@prisma/client";

export async function recalcTopsis() {
  const data: Kosan[] = await prisma.kosan.findMany({
    where: {
      status_operasional: "AKTIF",
    },
  });

  if (data.length === 0) return;

  // 1. Matriks Keputusan
  // Gunakan .toNumber() karena tipe data di skema kamu adalah Decimal
  const matrix: number[][] = data.map((d) => [
    (d.harga as Prisma.Decimal).toNumber(),
    (d.jarak as Prisma.Decimal).toNumber(),
    (d.fasilitas as Prisma.Decimal).toNumber(),
    d.rating, // rating sudah Float, jadi tidak perlu .toNumber()
    (d.sistem_keamanan as Prisma.Decimal).toNumber(),
  ]);

  const rows = matrix.length;
  const cols = matrix[0].length;

  // 2. Bobot & Kriteria (false = Cost/Makin kecil makin baik)
  const weights = [0.3, 0.2, 0.2, 0.2, 0.1];
  const isBenefit = [false, false, true, true, true]; // Harga & Jarak biasanya Cost

  // 3. Normalisasi
  const normMatrix: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let j = 0; j < cols; j++) {
    const denom = Math.sqrt(matrix.reduce((acc, row) => acc + Math.pow(row[j], 2), 0));
    for (let i = 0; i < rows; i++) {
      normMatrix[i][j] = denom === 0 ? 0 : matrix[i][j] / denom;
    }
  }

  // 4. Matriks Terbobot
  const weighted = normMatrix.map((row) =>
    row.map((value, j) => value * weights[j])
  );

  // 5. Solusi Ideal Positif & Negatif
  const idealPos: number[] = [];
  const idealNeg: number[] = [];
  for (let j = 0; j < cols; j++) {
    const columnValues = weighted.map((row) => row[j]);
    if (isBenefit[j]) {
      idealPos[j] = Math.max(...columnValues);
      idealNeg[j] = Math.min(...columnValues);
    } else {
      idealPos[j] = Math.min(...columnValues);
      idealNeg[j] = Math.max(...columnValues);
    }
  }

  // 6. Hitung Skor Akhir
  const scores = weighted.map((row, i) => {
    const dPlus = Math.sqrt(row.reduce((acc, val, j) => acc + Math.pow(val - idealPos[j], 2), 0));
    const dMin = Math.sqrt(row.reduce((acc, val, j) => acc + Math.pow(val - idealNeg[j], 2), 0));
    return {
      id: data[i].id_kosan,
      score: (dPlus + dMin) === 0 ? 0 : dMin / (dPlus + dMin),
    };
  });

  // 7. Urutkan & Update Ranking
  scores.sort((a, b) => b.score - a.score);

  const updates = scores.map((item, index) =>
    prisma.kosan.update({
      where: { id_kosan: item.id },
      data: { ranking: index + 1 },
    })
  );

  await prisma.$transaction(updates);
}