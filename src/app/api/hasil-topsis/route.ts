export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const data = await prisma.hasilTopsis.findMany({
      include: {
        kosan: {
          select: {
            nama: true,
          },
        },
      },
      orderBy: {
        ranking: "asc",
      },
    });

    const result = data.map((item) => ({
      name: item.kosan.nama,
      value: item.nilai_preferensi.toNumber(), // ✅ TOPSIS SCORE
      ranking: item.ranking,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ ERROR TOPSIS API:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data TOPSIS" },
      { status: 500 }
    );
  }
}
