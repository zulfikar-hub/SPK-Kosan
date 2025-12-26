// app/api/topsis/summary/route.ts atau pages/api/topsis/summary.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Import Prisma Client yang sudah dikonfigurasi

// ----------------------------------------------------
// 1. DEFINISI INTERFACE
// ----------------------------------------------------

interface SummaryData {
    totalAlternatives: number;
    avgTopsis: number;
    activeUsers: number;
    totalCriteria: number;
    approvalRate?: number;
}

// ----------------------------------------------------
// 2. IMPLEMENTASI NYATA (MENGGUNAKAN PRISMA)
// ----------------------------------------------------

const getActualSummaryData = async (): Promise<SummaryData> => {
    
    // Gunakan Promise.all untuk mengambil semua data statistik secara paralel 
    const [
        totalKosan,      
        totalPengguna,   
        jumlahKriteria, 
        // Hasil agregasi Rata-rata TOPSIS
        rataRataTopsis,  
    ] = await Promise.all([
                prisma.kosan.count(), 
                prisma.user.count(), 
                prisma.kriteria.count(),
                prisma.hasilTopsis.aggregate({
            _avg: {
                nilai_preferensi: true, // <--- 🔥 PERUBAHAN DI SINI
            },
        }),
    ]);

    const avgTopsisRaw = rataRataTopsis._avg?.nilai_preferensi ?? 0; // <--- 🔥 PERUBAHAN DI SINI
    const formattedAvgTopsis = parseFloat(Number(avgTopsisRaw).toFixed(4));
    return {
        totalAlternatives: totalKosan,
        avgTopsis: formattedAvgTopsis,
        activeUsers: totalPengguna,
        totalCriteria: jumlahKriteria,
        approvalRate: 0.92, 
    };
};

// ----------------------------------------------------
// 3. HANDLER ROUTE GET
// ----------------------------------------------------

export async function GET() {
    try {
        const summaryData = await getActualSummaryData();
        return NextResponse.json(summaryData, { status: 200 });
        
    } catch (error) {
        // Logging error di server untuk debugging
        console.error("Kesalahan saat mengambil data summary dashboard:", error);
        
        // Response error 500 ke klien
        return NextResponse.json(
            { error: 'Gagal memuat data ringkasan sistem. Pastikan koneksi DB aktif.' }, 
            { status: 500 }
        );
    }
}