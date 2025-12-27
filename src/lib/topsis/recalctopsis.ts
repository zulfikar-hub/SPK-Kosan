import prisma from "@/lib/prisma";

export async function recalcTopsis() {
  const data = await prisma.kosan.findMany({
    where: {
      status_operasional: "AKTIF",
    },
  });

  if (data.length === 0) return;

  const matrix = data.map((d) => [
    d.harga,
    d.jarak,
    d.fasilitas,
    d.rating,
    d.sistem_keamanan,
  ]);

  const cols = matrix[0].length;
  const n = matrix.length;

  const normMatrix = Array.from({ length: n }, (_, i) =>
  Array.from({ length: cols }, (__, j) => {
    const denom = Math.sqrt(
      matrix.reduce((acc, row) => {
        const val = Number(row[j]);   
        return acc + val * val;       
      }, 0)
    );

    const current = Number(matrix[i][j]);
    return current / denom;
  })
);


  const weights = [0.3, 0.2, 0.2, 0.2, 0.1];

  const weighted = normMatrix.map((row) =>
    row.map((value, i) => value * weights[i])
  );

  const idealPos = weighted[0].map((_, j) =>
    Math.max(...weighted.map((row) => row[j]))
  );

  const idealNeg = weighted[0].map((_, j) =>
    Math.min(...weighted.map((row) => row[j]))
  );

  const scores = weighted.map((row, i) => {
    const dPlus = Math.sqrt(row.reduce((acc, val, j) => acc + (val - idealPos[j]) ** 2, 0));
    const dMin = Math.sqrt(row.reduce((acc, val, j) => acc + (val - idealNeg[j]) ** 2, 0));
    return {
      id: data[i].id_kosan,
      score: dMin / (dPlus + dMin),
    };
  });

  scores.sort((a, b) => b.score - a.score);

  for (let i = 0; i < scores.length; i++) {
    await prisma.kosan.update({
      where: { id_kosan: scores[i].id },
      data: { ranking: i + 1 },
    });
  }
}
