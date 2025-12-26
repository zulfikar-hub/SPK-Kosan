"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/navigation";
import {
  CheckCircle,
  Calculator,
  BarChart3,
  FileText,
  MapPin,
  DollarSign,
  Star,
  Wifi,
  Shield,
  ArrowRight,
  Info
} from "lucide-react";
import Link from "next/link";

type TopsisRank = {
  name: string;
  value: number;
  ranking: number;
};

export default function HomePage() {
  const [topRank, setTopRank] = useState<TopsisRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRanking() {
      try {
        const res = await fetch("/api/hasil-topsis");
        const data: TopsisRank[] = await res.json();

        // ambil TOP 3 ranking
        const top3 = data
          .sort((a, b) => a.ranking - b.ranking)
          .slice(0, 3);

        setTopRank(top3);
      } catch (err) {
        console.error("Gagal ambil ranking TOPSIS", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRanking();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
     <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center min-h-[calc(100vh-80px)]">
      {/* Efek Background Dekoratif */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* SISI KIRI: TEXT & CTA */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              SPK Berbasis WEB
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-extrabold text-balance leading-[1.15] tracking-tight">
                Temukan Kosan Terbaik <br />
                Metode <span className="text-primary italic">TOPSIS</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground text-pretty leading-relaxed max-w-xl">
                Bandingkan kosan berdasarkan harga, lokasi, dan fasilitas secara otomatis. 
                Keputusan lebih akurat dengan perhitungan sistem penunjang keputusan.
              </p>
            </div>

            <div className="flex flex-row items-center gap-3">
              <Button asChild size="default" className="gap-2 px-6 h-11">
                <Link href="/dashboard">
                  Coba Sekarang <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="default"
                asChild
                className="gap-2 px-6 h-11 border border-transparent hover:border-border transition-all"
              >
                <Link href="/about">
                  <Info className="h-4 w-4" /> Pelajari
                </Link>
              </Button>
            </div>
          </div>

          {/* SISI KANAN: VISUALISASI CARD (DIBUAT LEBIH PADAT) */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <Card className="relative bg-card/80 backdrop-blur-sm border-primary/20 shadow-xl overflow-hidden">
              <CardHeader className="pb-3 bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Hasil Ranking Teratas
                </CardTitle>
              </CardHeader>
             <CardContent className="p-4 space-y-3">
  {loading && (
    <p className="text-center text-xs text-muted-foreground">
      Memuat ranking...
    </p>
  )}

  {!loading && topRank.length === 0 && (
    <p className="text-center text-xs text-muted-foreground">
      Belum ada hasil TOPSIS
    </p>
  )}

  {!loading &&
    topRank.map((item, index) => (
      <div
        key={index}
        className={`flex items-center justify-between p-2.5 rounded-lg border transition-transform
          ${
            item.ranking === 1
              ? "bg-primary/10 border-primary/20"
              : "bg-muted/50 border-border/50"
          }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold
              ${
                item.ranking === 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted-foreground/20 text-muted-foreground"
              }`}
          >
            {item.ranking}
          </span>
          <span className="font-semibold text-sm">{item.name}</span>
        </div>

        <div className="flex flex-col items-end">
          <span className="font-bold text-sm">
            {item.value.toFixed(3)}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase">
            Skor Topsis
          </span>
        </div>
      </div>
    ))}

  <div className="pt-2 text-[10px] text-center text-muted-foreground italic">
    *Data diambil otomatis dari hasil perhitungan TOPSIS
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Kenapa Menggunakan Sistem Ini?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Keputusan yang tepat membutuhkan analisis yang objektif dan
              sistematis
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
                  Pemilihan kosan dilakukan dengan pendekatan matematis, bukan
                  hanya intuisi.
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
                  Input data, atur bobot, dapatkan hasil ranking dalam hitungan
                  detik.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Transparan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Semua proses perhitungan TOPSIS dapat ditelusuri kembali.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Fleksibel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bisa menyesuaikan bobot kriteria sesuai kebutuhan pengguna.
                </p>
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
                <p className="text-muted-foreground mb-4">
                  Bandingkan kosan berdasarkan berbagai kriteria penting
                </p>
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
                  Sesuaikan prioritas kriteria sesuai keinginan dan kebutuhan
                  Anda
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
                <p className="text-muted-foreground">
                  Lihat hasil ranking dengan tabel dan grafik yang mudah
                  dipahami
                </p>
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
                  Simpan hasil analisis dalam bentuk CSV atau PDF untuk
                  dokumentasi
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
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Proses sederhana dalam 3 langkah mudah</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Lihat Data Kosan</h3>
              <p className="text-muted-foreground">Telusuri informasi kosan yang tersedia dalam sistem</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Atur Bobot Kriteria</h3>
              <p className="text-muted-foreground">Sesuaikan prioritas kriteria sesuai kebutuhan Anda</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Dapatkan Hasil Ranking</h3>
              <p className="text-muted-foreground">Sistem TOPSIS menghitung dan menampilkan peringkat kosan terbaik</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Siap Menemukan Kosan Ideal Anda?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Mulai analisis sekarang dan temukan kosan terbaik dengan metode
            ilmiah yang terpercaya
          </p>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="text-lg px-8 py-6"
          >
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
              <a
                href="mailto:hello@domainanda.com"
                className="text-primary hover:underline"
              >
                Hubungi kami di hello@domainanda.com
              </a>
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 – Sistem Penunjang Keputusan Kosan TOPSIS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
