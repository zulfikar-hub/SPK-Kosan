// lib/topsis/engine.ts

export type KosanData = {
  id_kosan: number;
  harga: unknown;
  jarak: unknown;
  fasilitas: unknown;
  rating: unknown;
  sistem_keamanan: unknown;
};

// --- 1. FUNGSI HELPER PENILAIAN (SCORING 1-5) ---

const getPoinHarga = (val: number) => {
  if (val <= 500000) return 5;
  if (val <= 1000000) return 4;
  if (val <= 1500000) return 3;
  if (val <= 2000000) return 2;
  return 1;
};

const getPoinJarak = (val: number) => {
  if (val <= 0.5) return 5;
  if (val <= 1.5) return 4;
  if (val <= 3) return 3;
  if (val <= 5) return 2;
  return 1;
};

const getPoinFasilitas = (val: number) => {
  if (val >= 8) return 5;
  if (val >= 6) return 4;
  if (val >= 4) return 3;
  if (val >= 2) return 2;
  return 1;
};

const getPoinRating = (val: number) => {
  if (val >= 4.5) return 5;
  if (val >= 3.5) return 4;
  if (val >= 2.5) return 3;
  if (val >= 1.5) return 2;
  return 1;
};

const getPoinKeamanan = (val: number) => {
  if (val >= 8) return 5;
  if (val >= 6) return 4;
  if (val >= 4) return 3;
  if (val >= 2) return 2;
  return 1;
};

// --- 2. FUNGSI UTAMA ENGINE TOPSIS ---

export function runTopsisLogic(data: KosanData[], weights: number[]) {
  if (data.length === 0) return [];

  // 1. Matriks Keputusan - Konversi input mentah ke SKOR POIN (1-5)
  const matrix = data.map((d) => [
    getPoinHarga(Number(d.harga)),
    getPoinJarak(Number(d.jarak)),
    getPoinFasilitas(Number(d.fasilitas)),
    getPoinRating(Number(d.rating)),
    getPoinKeamanan(Number(d.sistem_keamanan)),
  ]);

  /**
   * Catatan: isBenefit sekarang semuanya TRUE.
   * Karena pada fungsi helper di atas, kriteria Cost (Harga & Jarak) 
   * sudah dibalik logikanya (Semakin baik = Poin semakin tinggi).
   */
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
    // Karena sudah dikonversi ke poin 1-5, semua kolom bersifat Benefit
    idealPos[j] = Math.max(...colValues);
    idealNeg[j] = Math.min(...colValues);
  }

  // 5. Hitung Skor (Kedekatan Relatif terhadap Solusi Ideal)
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