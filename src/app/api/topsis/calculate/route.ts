import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST() {
  try {
    const kosanList = await prisma.kosan.findMany()

    if (kosanList.length === 0) {
      return NextResponse.json({ error: "Data kosan kosong" }, { status: 400 })
    }

    // Konversi Decimal ke number
    const kosan = kosanList.map(k => ({
      id_kosan: k.id_kosan,
      harga: Number(k.harga),
      jarak: Number(k.jarak),
      fasilitas: Number(k.fasilitas),
      rating: Number(k.rating),
      sistem_keamanan: Number(k.sistem_keamanan)
    }))

    // Tahap 1: Normalisasi (sqrt sum of squares)
    const sumSquares = kosan.reduce(
      (acc, k) => ({
        harga: acc.harga + k.harga * k.harga,
        jarak: acc.jarak + k.jarak * k.jarak,
        fasilitas: acc.fasilitas + k.fasilitas * k.fasilitas,
        rating: acc.rating + k.rating * k.rating,
        sistem_keamanan: acc.sistem_keamanan + k.sistem_keamanan * k.sistem_keamanan
      }),
      { harga: 0, jarak: 0, fasilitas: 0, rating: 0, sistem_keamanan: 0 }
    )

    const normalized = kosan.map(k => ({
      id_kosan: k.id_kosan,
      harga: k.harga / Math.sqrt(sumSquares.harga),
      jarak: k.jarak / Math.sqrt(sumSquares.jarak),
      fasilitas: k.fasilitas / Math.sqrt(sumSquares.fasilitas),
      rating: k.rating / Math.sqrt(sumSquares.rating),
      sistem_keamanan: k.sistem_keamanan / Math.sqrt(sumSquares.sistem_keamanan)
    }))

    // Bobot kriteria
    const weights = {
      harga: 0.25,
      jarak: 0.25,
      fasilitas: 0.2,
      rating: 0.15,
      sistem_keamanan: 0.15
    }

    // Tahap 2: Weighted normalization
    const weighted = normalized.map(k => ({
      id_kosan: k.id_kosan,
      harga: k.harga * weights.harga,
      jarak: k.jarak * weights.jarak,
      fasilitas: k.fasilitas * weights.fasilitas,
      rating: k.rating * weights.rating,
      sistem_keamanan: k.sistem_keamanan * weights.sistem_keamanan
    }))

    // Ideal solution
    const idealPlus = {
      harga: Math.min(...weighted.map(k => k.harga)), // COST
      jarak: Math.min(...weighted.map(k => k.jarak)), // COST
      fasilitas: Math.max(...weighted.map(k => k.fasilitas)), // BENEFIT
      rating: Math.max(...weighted.map(k => k.rating)), // BENEFIT
      sistem_keamanan: Math.max(...weighted.map(k => k.sistem_keamanan))
    }

    const idealMinus = {
      harga: Math.max(...weighted.map(k => k.harga)),
      jarak: Math.max(...weighted.map(k => k.jarak)),
      fasilitas: Math.min(...weighted.map(k => k.fasilitas)),
      rating: Math.min(...weighted.map(k => k.rating)),
      sistem_keamanan: Math.min(...weighted.map(k => k.sistem_keamanan))
    }

    // Tahap 3: Hitung nilai preferensi TOPSIS
    const result = weighted.map(k => {
      const dPlus = Math.sqrt(
        (k.harga - idealPlus.harga) ** 2 +
        (k.jarak - idealPlus.jarak) ** 2 +
        (k.fasilitas - idealPlus.fasilitas) ** 2 +
        (k.rating - idealPlus.rating) ** 2 +
        (k.sistem_keamanan - idealPlus.sistem_keamanan) ** 2
      )

      const dMinus = Math.sqrt(
        (k.harga - idealMinus.harga) ** 2 +
        (k.jarak - idealMinus.jarak) ** 2 +
        (k.fasilitas - idealMinus.fasilitas) ** 2 +
        (k.rating - idealMinus.rating) ** 2 +
        (k.sistem_keamanan - idealMinus.sistem_keamanan) ** 2
      )

      const preference = dMinus / (dPlus + dMinus)

      return { id_kosan: k.id_kosan, preference }
    })

    // Rank
    const ranked = result
      .sort((a, b) => b.preference - a.preference)
      .map((r, i) => ({ ...r, ranking: i + 1 }))

    // Clear table
    await prisma.hasilTopsis.deleteMany()

    // Save results
    for (const item of ranked) {
      await prisma.hasilTopsis.create({
        data: {
          id_kosan: item.id_kosan,
          nilai_preferensi: item.preference,
          ranking: item.ranking
        }
      })
    }

    return NextResponse.json({ message: "TOPSIS berhasil dihitung" }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Gagal menghitung TOPSIS" }, { status: 500 })
  }
}
