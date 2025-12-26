// src/app/admin/layout.tsx

import type React from "react"
import type { Metadata } from "next"
// 🔥 AKTIFKAN DAN IMPORT FONT GEIST
import { GeistSans, GeistMono } from "geist/font" 
import { Analytics } from "@vercel/analytics/next"
import "../globals.css"

// Variabel Geist sudah diekspor sebagai GeistSans dan GeistMono
// Tidak perlu pendefinisian const baru jika Anda menggunakan paket 'geist/font'

export const metadata: Metadata = {
    title: "SPK TOPSIS Dashboard - Kosan",
    description: "Admin Dashboard untuk Sistem Pendukung Keputusan Pemilihan Kosan",
    generator: "v0.app",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="id">
            <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
                {children}
                <Analytics />
            </body>
        </html>
    )
}