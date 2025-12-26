// FILE: src/app/api/kosan/route.ts

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
// 📌 Perbaikan: Impor ENUM yang diperlukan
import prisma from "@/lib/prisma";
import { StatusOperasional, StatusKetersediaan } from "@prisma/client"; 

/* ============================================
    📌 Fungsi panggil API TOPSIS setelah CRUD
============================================ */
async function recalcTopsis() {
    try {
        // Menggunakan fetch standar untuk memanggil API lokal
        // Ganti NEXT_PUBLIC_BASE_URL dengan URL dasar Anda, misalnya http://localhost:3000
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/topsis/calculate`, {
            method: "POST",
            cache: "no-store",
        });
    } catch (err) {
        console.error("❌ Gagal memanggil API TOPSIS:", err);
    }
}

/* ============================================
    📌 GET — Ambil semua kosan
============================================ */
export async function GET() {
    try {
        const kosanList = await prisma.kosan.findMany({
            orderBy: { id_kosan: "asc" },
            include: { hasiltopsis: true },
        });

        return NextResponse.json(kosanList, { status: 200 });
    } catch (error) {
        console.error("❌ GET Kosan Error:", error);
        return NextResponse.json(
            { error: "Gagal mengambil data kosan." },
            { status: 500 }
        );
    }
}

/* ============================================
    📌 POST — Tambah kosan
============================================ */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            nama,
            harga,
            jarak,
            fasilitas,
            rating,
            sistem_keamanan,
            description,
        } = body;

        if (
            !nama ||
            harga === undefined ||
            jarak === undefined ||
            fasilitas === undefined ||
            rating === undefined ||
            sistem_keamanan === undefined
        ) {
            return NextResponse.json(
                { error: "Semua field wajib diisi." },
                { status: 400 }
            );
        }

        const total = await prisma.kosan.count();

        const kosan = await prisma.kosan.create({
            data: {
                nama,
                harga: Number(harga),
                jarak: Number(jarak),
                fasilitas: Number(fasilitas),
                rating: Number(rating),
                sistem_keamanan: Number(sistem_keamanan),
                description: description ?? null,
                ranking: total + 1,
                // 📌 PERBAIKAN: Gunakan status_operasional dan status_ketersediaan dengan nilai ENUM
                status_operasional: StatusOperasional.AKTIF, // Default: Selalu AKTIF saat dibuat
                status_ketersediaan: StatusKetersediaan.TERSEDIA, // Default: Selalu TERSEDIA saat dibuat
            },
        });

        await recalcTopsis();

        return NextResponse.json(
            { message: "Kosan berhasil ditambahkan dan TOPSIS diperbarui", data: kosan },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST Kosan Error:", error);
        return NextResponse.json(
            { error: "Gagal menambahkan kosan." },
            { status: 500 }
        );
    }
}

/* ============================================
    📌 PUT — Update kosan (Termasuk Toggle Status)
============================================ */
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const {
            id_kosan,
            nama,
            harga,
            jarak,
            fasilitas,
            rating,
            sistem_keamanan,
            description,
            // 📌 PERBAIKAN: Ambil field yang baru
            status_operasional, 
            status_ketersediaan, 
            ranking,
            toggleStatus, 
        } = body;

        if (!id_kosan) {
            return NextResponse.json(
                { error: "ID kosan wajib dikirim." },
                { status: 400 }
            );
        }

        const existing = await prisma.kosan.findUnique({
            where: { id_kosan: Number(id_kosan) },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Kosan tidak ditemukan." },
                { status: 404 }
            );
        }

        // 📌 PERBAIKAN: Logika Penentuan Status Operasional Baru
        let newStatusOperasional = existing.status_operasional;
        if (toggleStatus) {
            // Toggle status_operasional antara AKTIF dan INAKTIF
            newStatusOperasional = existing.status_operasional === StatusOperasional.AKTIF 
                ? StatusOperasional.INAKTIF 
                : StatusOperasional.AKTIF;
        } else if (status_operasional !== undefined) {
            // Jika dikirim dari frontend, pastikan konversi/pencocokan string ke ENUM
            if (status_operasional === StatusOperasional.AKTIF || status_operasional === StatusOperasional.INAKTIF) {
                 newStatusOperasional = status_operasional;
            }
        }
        
        // 📌 PERBAIKAN: Logika Penentuan Status Ketersediaan Baru
        let newStatusKetersediaan = existing.status_ketersediaan;
        if (status_ketersediaan !== undefined) {
             if (
                status_ketersediaan === StatusKetersediaan.TERSEDIA || 
                status_ketersediaan === StatusKetersediaan.PENUH || 
                status_ketersediaan === StatusKetersediaan.PERAWATAN
             ) {
                newStatusKetersediaan = status_ketersediaan;
            }
        }


        const updated = await prisma.kosan.update({
            where: { id_kosan: Number(id_kosan) },
            data: {
                nama: nama ?? existing.nama,
                harga: harga !== undefined ? Number(harga) : existing.harga,
                jarak: jarak !== undefined ? Number(jarak) : existing.jarak,
                fasilitas:
                    fasilitas !== undefined ? Number(fasilitas) : existing.fasilitas,
                rating: rating !== undefined ? Number(rating) : existing.rating,
                sistem_keamanan:
                    sistem_keamanan !== undefined
                        ? Number(sistem_keamanan)
                        : existing.sistem_keamanan,
                description: description ?? existing.description,
                ranking: ranking ?? existing.ranking,
                
                // 📌 PERBAIKAN: Update field yang benar
                status_operasional: newStatusOperasional,
                status_ketersediaan: newStatusKetersediaan,
            },
        });

        await recalcTopsis();

        return NextResponse.json(
            { message: "✅ Data kosan diperbarui", data: updated },
            { status: 200 }
        );
    } catch (error) {
        console.error("❌ PUT Kosan Error:", error);
        return NextResponse.json(
            { error: "Gagal mengupdate data kosan." },
            { status: 500 }
        );
    }
}

/* ============================================
    📌 DELETE — Hapus kosan (MENGGUNAKAN QUERY PARAMETER)
============================================ */
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id_kosan_str = searchParams.get("id"); 

        if (!id_kosan_str) {
            return NextResponse.json(
                { error: "ID kosan wajib dikirim via Query Parameter (e.g., ?id=123)." },
                { status: 400 } 
            );
        }

        const id_kosan = Number(id_kosan_str);
        
        const existing = await prisma.kosan.findUnique({
            where: { id_kosan: id_kosan },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Kosan tidak ditemukan." },
                { status: 404 }
            );
        }

        await prisma.kosan.delete({
            where: { id_kosan: id_kosan },
        });

        await recalcTopsis();
        
        return NextResponse.json(
            { message: "🗑️ Kosan berhasil dihapus" },
            { status: 200 }
        );
    } catch (error) {
        console.error("❌ DELETE Kosan Error:", error);
        return NextResponse.json(
            { error: "Gagal menghapus data kosan (Internal Server Error)." },
            { status: 500 }
        );
    }
}