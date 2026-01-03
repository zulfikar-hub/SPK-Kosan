export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await prisma.kosan.groupBy({
      by: ['createdAt'],
      _count: { id_kosan: true },
      _avg: { rating: true }
    })

    const formatted = result.map(r => ({
      month: new Date(r.createdAt).toLocaleString("id-ID", { month: "short" }),
      alternatives: r._count.id_kosan,
      ratings: Number(r._avg.rating ?? 0).toFixed(2)
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Trend API Error:", error)
    return NextResponse.json({ error: "Gagal ambil data tren" }, { status: 500 })
  }
}
