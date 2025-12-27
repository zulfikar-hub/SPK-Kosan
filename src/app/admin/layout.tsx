// src/app/admin/layout.tsx

import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"

// ❌ DIHAPUS (tidak boleh di admin layout)
// import { GeistSans, GeistMono } from "geist/font" 
// import "../globals.css"

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
        // ❌ <html> dan <body> DIHAPUS
        <section className="min-h-screen">
            {children}
            <Analytics />
        </section>
    )
}
