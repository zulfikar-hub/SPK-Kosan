// FILE: src/app/api/analytics/status-kosan/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

// Inisialisasi Prisma Client (Asumsikan di-import dengan benar)
const prisma = new PrismaClient(); 

// Interface untuk mencocokkan output yang dibutuhkan frontend (Pie Chart)
interface StatusData {
    name: string;
    value: number;
}

export async function GET() {
    try {
        // 1. Ambil data status dari database
        const rawStatus = await prisma.kosan.groupBy({
            by: ['status_ketersediaan'],
            where: {
                // HANYA HITUNG KOSAN YANG STATUS OPERASIONALNYA AKTIF
                status_operasional: 'AKTIF', 
            },
            _count: {
                status_ketersediaan: true,
            },
        });

        // 2. Format hasil agar sesuai dengan interface StatusData frontend
        const formattedData: StatusData[] = rawStatus.map(item => ({
            // Mengubah ENUM (misalnya TERSEDIA) menjadi format yang rapi (Tersedia)
            name: item.status_ketersediaan.charAt(0) + item.status_ketersediaan.slice(1).toLowerCase(),
            value: item._count.status_ketersediaan,
        }));

        // 3. Tambahkan status yang mungkin tidak ada (misal: jika semua kosan Tersedia, 'Penuh' harus tetap ada dengan value 0)
        // Ini opsional tetapi disarankan agar Pie Chart selalu konsisten.
        const allStatuses = ['Tersedia', 'Penuh', 'Perawatan'];
        const finalData: StatusData[] = allStatuses.map(statusName => {
            const existing = formattedData.find(d => d.name === statusName);
            return existing || { name: statusName, value: 0 };
        });


        return NextResponse.json(finalData, { status: 200 });

    } catch (error) {
        console.error("Error fetching kosan status:", error);
        return NextResponse.json({ error: "Gagal mengambil data status kosan." }, { status: 500 });
    }
}