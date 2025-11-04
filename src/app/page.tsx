import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { CheckCircle, Calculator, BarChart3, FileText, MapPin, DollarSign, Star, Wifi, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
                  Temukan Kosan Terbaik dengan Sistem Penunjang Keputusan <span className="text-primary">TOPSIS</span>
                </h1>
                <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                  Bandingkan kosan berdasarkan harga, lokasi, fasilitas, dan kenyamanan. Semua perhitungan dilakukan
                  otomatis dan transparan dengan metode TOPSIS berbasis Python.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="text-lg px-8 py-6">
                  <Link href="/dashboard">Coba Sekarang</Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="text-lg px-8 py-6 bg-transparent">
                  <Link href="/about">Pelajari Cara Kerja</Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <Card className="bg-card/50 backdrop-blur border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Hasil Ranking TOPSIS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <span className="font-medium">Kosan Melati</span>
                    <span className="text-primary font-bold">0.85</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Kosan Mawar</span>
                    <span className="font-bold">0.72</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Kosan Anggrek</span>
                    <span className="font-bold">0.68</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why Use This System */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Kenapa Menggunakan Sistem Ini?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Keputusan yang tepat membutuhkan analisis yang objektif dan sistematis
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Objektif & Akurat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Pemilihan kosan dilakukan dengan pendekatan matematis, bukan hanya intuisi.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Calculator className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Cepat & Mudah</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Input data, atur bobot, dapatkan hasil ranking dalam hitungan detik.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Transparan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Semua proses perhitungan TOPSIS dapat ditelusuri kembali.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Fleksibel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Bisa menyesuaikan bobot kriteria sesuai kebutuhan pengguna.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Fitur Utama</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk menemukan kosan ideal
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Perbandingan Multi-Kriteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Bandingkan kosan berdasarkan berbagai kriteria penting</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    <DollarSign className="h-3 w-3" />
                    Harga
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    <MapPin className="h-3 w-3" />
                    Jarak
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    <Wifi className="h-3 w-3" />
                    Fasilitas
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    <Star className="h-3 w-3" />
                    Rating
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    <Shield className="h-3 w-3" />
                    Keamanan
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Pengaturan Bobot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sesuaikan prioritas kriteria sesuai keinginan dan kebutuhan Anda
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Dashboard Interaktif
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Lihat hasil ranking dengan tabel dan grafik yang mudah dipahami</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Laporan Ekspor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Simpan hasil analisis dalam bentuk CSV atau PDF untuk dokumentasi
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cara Kerja</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Proses sederhana dalam 4 langkah mudah</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Masukkan Data Kosan</h3>
              <p className="text-muted-foreground">Input informasi kosan yang ingin dibandingkan</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Tentukan Bobot Kriteria</h3>
              <p className="text-muted-foreground">Atur prioritas sesuai kebutuhan Anda</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Sistem Menghitung</h3>
              <p className="text-muted-foreground">Algoritma TOPSIS bekerja secara otomatis</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-semibold mb-2">Dapatkan Hasil</h3>
              <p className="text-muted-foreground">Peringkat kosan terbaik sesuai preferensi</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Menemukan Kosan Ideal Anda?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Mulai analisis sekarang dan temukan kosan terbaik dengan metode ilmiah yang terpercaya
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
            <Link href="/dashboard">Mulai Analisis Gratis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Butuh integrasi dengan aplikasi kampus atau platform sewa kosan?{" "}
              <a href="mailto:hello@domainanda.com" className="text-primary hover:underline">
                Hubungi kami di hello@domainanda.com
              </a>
            </p>
            <p className="text-sm text-muted-foreground">© 2025 – Sistem Penunjang Keputusan Kosan TOPSIS</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
