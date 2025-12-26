import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "TOPSIS Kosan - Sistem Penunjang Keputusan",
  description: "Temukan kosan terbaik dengan sistem penunjang keputusan TOPSIS berbasis Python",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
     <body 
  className={`font-sans antialiased ${GeistSans.variable} ${GeistMono.variable}`}>
  {children}
  <Analytics />
</body>
    </html>
  )
}
