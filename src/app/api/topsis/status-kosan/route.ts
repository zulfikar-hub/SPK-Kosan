export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { StatusOperasional } from "@prisma/client";

interface StatusData {
  name: string;
  value: number;
}

export async function GET() {
  try {
    const rawStatus = await prisma.kosan.groupBy({
      by: ['status_ketersediaan'],
      where: {
        status_operasional: StatusOperasional.AKTIF,
      },
      _count: {
        status_ketersediaan: true,
      },
    });

    const formattedData: StatusData[] = rawStatus.map((item) => ({
      name:
        item.status_ketersediaan.charAt(0) +
        item.status_ketersediaan.slice(1).toLowerCase(),
      value: item._count.status_ketersediaan,
    }));

    // ✅ TAMBAHKAN INI
    const allStatuses: string[] = [
      'Tersedia',
      'Penuh',
      'Perawatan',
    ];

    const finalData: StatusData[] = allStatuses.map((status) => {
      const existing = formattedData.find((d) => d.name === status);
      return existing || { name: status, value: 0 };
    });

    return NextResponse.json(finalData, { status: 200 });
  } catch (error) {
    console.error("Error fetching kosan status:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data status kosan." },
      { status: 500 }
    );
  }
}