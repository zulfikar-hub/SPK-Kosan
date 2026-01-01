"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import Label from "@/components/ui/label";
import Slider from "@/components/ui/slider";
import { Navigation } from "@/components/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import React, { ReactNode } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calculator,
  Download,
  Home,
  MapPin,
  DollarSign,
  Star,
  Wifi,
  Shield,
  Camera,
} from "lucide-react";
interface KosanData {
  id_kosan: string;
  nama: string;
  harga: number;
  jarak: number;
  fasilitas: number;
  rating: number;
  sistem_keamanan: number;
  skor?: number;
}

interface Kriteria {
  id: number;
  nama?: string;
  nama_kriteria?: string;
  bobot: number; // DISIMPAN DALAM DESIMAL (0.25)
}

export default function DashboardPage() {
  useEffect(() => {
    const fetchKosan = async () => {
      try {
        const res = await fetch("/api/kosan"); // ambil dari API kamu
        if (!res.ok) throw new Error("Gagal mengambil data kosan");
        const data = await res.json();
        setKosanList(data); // isi hasilnya ke state
      } catch (error) {
        console.error("Gagal ambil data kosan:", error);
      }
    };
    fetchKosan();
  }, []);
const [kosanList, setKosanList] = useState<KosanData[]>([]);
const [kriteriaList, setKriteriaList] = useState<Kriteria[]>([]);
const [bobotSementara, setBobotSementara] = useState<Record<string, number>>({});
const [hasCalculated, setHasCalculated] = useState(false);

  useEffect(() => {
  const fetchKriteria = async () => {
    const res = await fetch("/api/kriteria");
    const data = await res.json();

    setKriteriaList(data);

    // ambil bobot DB sebagai default
    const initialBobot = data.reduce((acc: Record<string, number>, k: Kriteria) => {
      const key = (k.nama ?? k.nama_kriteria ?? "")
        .toLowerCase()
        .replace(/\s+/g, "_");

      acc[key] = k.bobot; // sudah desimal (0.25)
      return acc;
    }, {});

    setBobotSementara(initialBobot);
  };

  fetchKriteria();
}, []);

  const getBobot = (key: string): number => {
  const value = bobotSementara[key];

  // fallback aman
  if (typeof value !== "number") return 0;

  return value / 100; // persen → desimal
};

  const calculateTOPSIS = () => {
  if (!kosanList.length) return;

  // 1. SUM SQUARE
  const sum = kosanList.reduce(
    (a, k) => ({
      harga: a.harga + k.harga ** 2,
      jarak: a.jarak + k.jarak ** 2,
      fasilitas: a.fasilitas + k.fasilitas ** 2,
      rating: a.rating + k.rating ** 2,
      sistem_keamanan: a.sistem_keamanan + k.sistem_keamanan ** 2,
    }),
    { harga: 0, jarak: 0, fasilitas: 0, rating: 0, sistem_keamanan: 0 }
  );

  // 2. NORMALISASI + BOBOT
  const weighted = kosanList.map(k => ({
    ...k,
    harga: (k.harga / Math.sqrt(sum.harga)) * getBobot("harga"),
    jarak: (k.jarak / Math.sqrt(sum.jarak)) * getBobot("jarak"),
    fasilitas:
      (k.fasilitas / Math.sqrt(sum.fasilitas)) * getBobot("fasilitas"),
    rating:
      (k.rating / Math.sqrt(sum.rating)) * getBobot("rating"),
    sistem_keamanan:
      (k.sistem_keamanan / Math.sqrt(sum.sistem_keamanan)) *
      getBobot("sistem_keamanan"),
  }));

  // 3. SOLUSI IDEAL
  const idealPlus = {
    harga: Math.min(...weighted.map(k => k.harga)),
    jarak: Math.min(...weighted.map(k => k.jarak)),
    fasilitas: Math.max(...weighted.map(k => k.fasilitas)),
    rating: Math.max(...weighted.map(k => k.rating)),
    sistem_keamanan: Math.max(...weighted.map(k => k.sistem_keamanan)),
  };

  const idealMinus = {
    harga: Math.max(...weighted.map(k => k.harga)),
    jarak: Math.max(...weighted.map(k => k.jarak)),
    fasilitas: Math.min(...weighted.map(k => k.fasilitas)),
    rating: Math.min(...weighted.map(k => k.rating)),
    sistem_keamanan: Math.min(...weighted.map(k => k.sistem_keamanan)),
  };

  // 4. NILAI PREFERENSI
  const result = weighted.map(k => {
    const dPlus = Math.sqrt(
      (k.harga - idealPlus.harga) ** 2 +
      (k.jarak - idealPlus.jarak) ** 2 +
      (k.fasilitas - idealPlus.fasilitas) ** 2 +
      (k.rating - idealPlus.rating) ** 2 +
      (k.sistem_keamanan - idealPlus.sistem_keamanan) ** 2
    );

    const dMinus = Math.sqrt(
      (k.harga - idealMinus.harga) ** 2 +
      (k.jarak - idealMinus.jarak) ** 2 +
      (k.fasilitas - idealMinus.fasilitas) ** 2 +
      (k.rating - idealMinus.rating) ** 2 +
      (k.sistem_keamanan - idealMinus.sistem_keamanan) ** 2
    );

    return {
      ...k,
      skor: +(dMinus / (dPlus + dMinus)).toFixed(3),
    };
  });

  setKosanList(result.sort((a, b) => (b.skor ?? 0) - (a.skor ?? 0)));
  setHasCalculated(true);
};

  // === Data Chart ===
  const chartData = kosanList.map((kosan) => ({
    nama: kosan.nama,
    skor: kosan.skor || 0,
  }));
  const totalBobot =
  kriteriaList.length > 0
    ? kriteriaList.reduce((sum, k) => sum + (k.bobot ?? 0), 0)
    : Object.values(bobotSementara).reduce((sum, v) => sum + (v ?? 0), 0);

    const totalPersen = totalBobot * 100;
  // Ganti warna tiap segmen
  // const COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444"];

  const icons: Record<string, ReactNode> = {
    harga: <DollarSign className="h-6 w-6 text-purple-600" />,
    jarak: <MapPin className="h-6 w-6 text-cyan-500" />,
    fasilitas: <Wifi className="h-6 w-6 text-yellow-500" />,
    rating: <Star className="h-6 w-6 text-green-500" />,
    sistem_keamanan: <Shield className="h-6 w-6 text-red-500" />,
  };
  // Fungsi ubah slider
  const handleSliderChange = (index: number, newValue: number) => {
  const updated = [...kriteriaList];
  updated[index].bobot = newValue / 100;
  setKriteriaList(updated);

  const key = (updated[index].nama ?? updated[index].nama_kriteria ?? "")
    .toLowerCase()
    .replace(/\s+/g, "_");

  setBobotSementara(prev => ({
    ...prev,
    [key]: newValue / 100,
  }));
};

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard TOPSIS</h1>
          <p className="text-muted-foreground">
            Kelola data kosan dan analisis dengan metode TOPSIS
          </p>
        </div>

        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6 mb-8">
          {/* 🏠 Total Kosan */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kosan</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kosanList.length}</div>
              <p className="text-xs text-muted-foreground">Kosan terdaftar</p>
            </CardContent>
          </Card>

          {/* ⭐ Kosan Terbaik */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Kosan Terbaik
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold truncate max-w-[180px]">
                {hasCalculated && kosanList.length > 0
                  ? kosanList[0].nama
                  : "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                Skor:{" "}
                {hasCalculated && kosanList.length > 0
                  ? kosanList[0].skor?.toFixed(3)
                  : "-"}
              </p>
            </CardContent>
          </Card>

          {/* 💰 Rata-rata Harga */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rata-rata Harga
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kosanList.length > 0
                  ? new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(
                      kosanList.reduce(
                        (sum, k) =>
                          sum + Number(String(k.harga).replace(/\D/g, "")), // ubah string ke angka murni
                        0
                      ) / kosanList.length
                    )
                  : "-"}
              </div>
              <p className="text-xs text-muted-foreground">Per bulan</p>
            </CardContent>
          </Card>

          {/* 🧮 Status Analisis */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Status Analisis
              </CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant={hasCalculated ? "default" : "secondary"}>
                  {hasCalculated ? "Selesai" : "Belum"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Perhitungan TOPSIS
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="data" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="data">Data Kosan</TabsTrigger>
            <TabsTrigger value="bobot">Bobot Kriteria</TabsTrigger>
            <TabsTrigger value="hasil">Hasil Analisis</TabsTrigger>
            <TabsTrigger value="keamanan">Analisis Keamanan</TabsTrigger>
            <TabsTrigger value="laporan">Laporan</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Kosan</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Jarak</TableHead>
                      <TableHead>Fasilitas</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Sistem Keamanan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kosanList.map((kosan) => (
                      <TableRow key={kosan.id_kosan}>
                        <TableCell className="font-medium">
                          {kosan.nama}
                        </TableCell>
                        <TableCell>
                          Rp {Number(kosan.harga).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>{kosan.jarak} km</TableCell>
                        <TableCell>{kosan.fasilitas}/10</TableCell>
                        <TableCell>{kosan.rating}/5</TableCell>
                        <TableCell>{kosan.sistem_keamanan}/10</TableCell>
                        <TableCell className="flex gap-2">
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bobot" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Bobot Kriteria</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Sesuaikan bobot setiap kriteria sesuai prioritas Anda (Total:{" "}
                  {totalBobot}%)
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Grid Slider */}
                <div className="grid md:grid-cols-3 gap-6">
                  {kriteriaList.map((k, index) => {
                    // ✅ Ganti baris ini dengan versi yang lebih aman
                    const keyNormalized = (k.nama ?? k.nama_kriteria ?? "")
                      .toLowerCase()
                      .replace(/\s+/g, "_");

                    const icon = icons[keyNormalized] || null;

                    return (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-xl shadow flex flex-col items-center"
                      >
                        {/* Nama & Icon */}
                        <div className="flex flex-col items-center mb-3">
                          {icon}
                          <span className="font-medium text-gray-700 mt-1 text-center">
                            {k.nama ?? k.nama_kriteria}
                          </span>
                        </div>

                        {/* Slider */}
                        <Slider
                          value={[k.bobot * 100]} // tampil 20%
                          onValueChange={(v) => handleSliderChange(index, v[0])}
                          max={100}
                          step={5}
                          className="w-full mt-2"
                        />

                        {/* Persentase */}
                        <div className="mt-1 text-sm font-medium">
                          {(k.bobot * 100).toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Total Bobot */}
                <div className="text-right font-medium">
  Total Bobot:{" "}
  <span
    className={Math.round(totalPersen) === 100 ? "text-green-600" : "text-red-500"}
  >
    {Math.round(totalPersen)}%
  </span>
</div>
                {/* Pie Chart */}
                {/* Pie Chart */}
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          kriteriaList.length > 0
                            ? kriteriaList.map((k) => {
                                const namaKriteria =
                                  k?.nama ??
                                  k?.nama_kriteria ??
                                  "Tidak diketahui";
                                const bobot = k.bobot ?? 0;
                                return {
                                  key: namaKriteria,
                                  value: bobot,
                                  displayValue: (bobot * 100).toFixed(0),
                                };
                              })
                            : Object.entries(bobotSementara).map(
                                ([nama, val]) => ({
                                  key: nama,
                                  value: val,
                                  displayValue: (val * 100).toFixed(0),
                                })
                              )
                        }
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ payload }) =>
                          `${payload.key}: ${payload.displayValue}%`
                        }
                      >
                        {(kriteriaList.length > 0
                          ? kriteriaList
                          : Object.entries(bobotSementara).map(
                              ([nama, bobot]) => ({
                                nama,
                                bobot,
                              })
                            )
                        ).map((k, index) => {
                          // Buat variabel nama yang aman
                          const namaKey: string =
                            "nama" in k
                              ? (k.nama ?? "")
                              : "nama_kriteria" in k
                                ? ((k as { nama_kriteria?: string })
                                    .nama_kriteria ?? "")
                                : "";

                          const lower = namaKey.toLowerCase();

                          // Warna berdasarkan nama
                          const colorMap: Record<string, string> = {
                            harga: "#8b5cf6",
                            jarak: "#06b6d4",
                            fasilitas: "#f59e0b",
                            rating: "#10b981",
                            sistem_keamanan: "#ef4444",
                          };

                          const fallbackColors = [
                            "#8b5cf6",
                            "#06b6d4",
                            "#f59e0b",
                            "#10b981",
                            "#ef4444",
                          ];
                          const color =
                            colorMap[lower] ||
                            fallbackColors[index % fallbackColors.length];

                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Pie>

                      {/* Tooltip agar tampil nilai bobot saat hover */}
                      <Tooltip
                        formatter={(value: number) =>
                          `${(value * 100).toFixed(0)}%`
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hasil" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Hasil Analisis TOPSIS</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {hasCalculated
                      ? "Perhitungan selesai"
                      : "Klik tombol hitung untuk memulai analisis"}
                  </p>
                </div>
                
                <Button
                  onClick={calculateTOPSIS}
                  disabled={kosanList.length === 0}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Hitung TOPSIS
                </Button>

              </CardHeader>
              <CardContent>
                {hasCalculated ? (
                  <div className="space-y-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Peringkat</TableHead>
                          <TableHead>Nama Kosan</TableHead>
                          <TableHead>Skor TOPSIS</TableHead>
                          <TableHead>Progress</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kosanList.map((kosan, index) => (
                          <TableRow key={kosan.id_kosan}>
                            <TableCell>
                              <Badge
                                variant={index === 0 ? "default" : "secondary"}
                              >
                                #{index + 1}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {kosan.nama}
                            </TableCell>
                            <TableCell>{kosan.skor}</TableCell>
                            <TableCell>
                              <Progress
                                value={(kosan.skor || 0) * 100}
                                className="w-24"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="nama" />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => [value, "Skor TOPSIS"]}
                          />
                          <Bar dataKey="skor" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Belum ada hasil analisis. Klik tombol &quot;Hitung
                      TOPSIS&quot; untuk memulai.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keamanan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Camera className="h-5 w-5 text-primary" />
                  Analisis Sistem Keamanan
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Nilai keamanan tiap kosan berdasarkan hasil TOPSIS gabungan.
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Kosan</TableHead>
                      <TableHead>Nilai Sistem Keamanan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kosanList.map((k) => (
                      <TableRow key={k.id_kosan}>
                        <TableCell>{k.nama}</TableCell>
                        <TableCell>{k.sistem_keamanan}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="laporan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ekspor Laporan</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Unduh hasil analisis dalam berbagai format untuk dokumentasi
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button variant="outline" disabled={!hasCalculated}>
                    <Download className="h-4 w-4 mr-2" />
                    Unduh CSV
                  </Button>
                  <Button variant="outline" disabled={!hasCalculated}>
                    <Download className="h-4 w-4 mr-2" />
                    Unduh PDF
                  </Button>
                </div>
                {!hasCalculated && (
                  <p className="text-sm text-muted-foreground">
                    Lakukan perhitungan TOPSIS terlebih dahulu untuk
                    mengaktifkan fitur ekspor.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
