export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// ----------------------------------------------------
// TYPE RESPONSE
// ----------------------------------------------------
interface SummaryData {
  totalAlternatives: number
  avgTopsis: number
  activeUsers: number
  totalCriteria: number
  approvalRate: number
}

// ----------------------------------------------------
// GET
// ----------------------------------------------------
export async function GET() {
  try {
    const [
      totalKosan,
      totalUser,
      totalKriteria,
      avgTopsisResult,
    ] = await Promise.all([
      prisma.kosan.count(),
      prisma.user.count(),
      prisma.kriteria.count(),
      prisma.hasilTopsis.aggregate({
        _avg: {
          nilai_preferensi: true,
        },
      }),
    ])

    // 🔥 FIX Decimal → Number
    const avgTopsisRaw = avgTopsisResult._avg.nilai_preferensi
    const avgTopsis = avgTopsisRaw
      ? Number(avgTopsisRaw)
      : 0

    const response: SummaryData = {
      totalAlternatives: totalKosan,
      avgTopsis: Number(avgTopsis.toFixed(4)),
      activeUsers: totalUser,
      totalCriteria: totalKriteria,
      approvalRate: 92, // contoh statis (%)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ SUMMARY API ERROR:", error)

    return NextResponse.json(
      { error: "Gagal memuat data ringkasan sistem" },
      { status: 500 }
    )
  }
}
