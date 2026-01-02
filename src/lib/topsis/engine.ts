// lib/topsis/engine.ts

export type KosanData = {
  id_kosan: number;
  // Menggunakan unknown agar bisa menerima Decimal Prisma tanpa error
  harga: unknown;
  jarak: unknown;
  fasilitas: unknown;
  rating: unknown;
  sistem_keamanan: unknown;
};

export function runTopsisLogic(data: KosanData[], weights: number[]) {
  if (data.length === 0) return [];

  // 1. Matriks Keputusan - Konversi semua input ke Number murni
  const matrix = data.map((d) => [
    Number(d.harga),
    Number(d.jarak),
    Number(d.fasilitas),
    Number(d.rating),
    Number(d.sistem_keamanan),
  ]);

  const isBenefit = [false, false, true, true, true]; // Harga & Jarak = Cost
  const cols = matrix[0].length;

  // 2. Normalisasi
  const denom = Array(cols).fill(0);
  for (let j = 0; j < cols; j++) {
    denom[j] = Math.sqrt(matrix.reduce((acc, row) => acc + Math.pow(row[j], 2), 0));
  }

  // 3. Matriks Terbobot
  const weighted = matrix.map((row) =>
    row.map((val, j) => (denom[j] === 0 ? 0 : (val / denom[j]) * weights[j]))
  );

  // 4. Solusi Ideal Positif & Negatif
  const idealPos = Array(cols).fill(0);
  const idealNeg = Array(cols).fill(0);
  for (let j = 0; j < cols; j++) {
    const colValues = weighted.map((r) => r[j]);
    if (isBenefit[j]) {
      idealPos[j] = Math.max(...colValues);
      idealNeg[j] = Math.min(...colValues);
    } else {
      idealPos[j] = Math.min(...colValues);
      idealNeg[j] = Math.max(...colValues);
    }
  }

  // 5. Hitung Skor (Jarak Solusi Ideal)
  const results = weighted.map((row, i) => {
    const dPlus = Math.sqrt(row.reduce((a, v, j) => a + Math.pow(v - idealPos[j], 2), 0));
    const dMin = Math.sqrt(row.reduce((a, v, j) => a + Math.pow(v - idealNeg[j], 2), 0));
    const score = dPlus + dMin === 0 ? 0 : dMin / (dPlus + dMin);
    
    return {
      id_kosan: data[i].id_kosan,
      nilai_preferensi: score,
    };
  });

  // 6. Ranking
  return results
    .sort((a, b) => b.nilai_preferensi - a.nilai_preferensi)
    .map((r, index) => ({ ...r, ranking: index + 1 }));
}