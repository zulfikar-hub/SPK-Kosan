"use client";

import { useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import  Slider  from "@/components/ui/slider";
import { Navigation } from "@/components/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Home,
  MapPin,
  DollarSign,
  Star,
  Wifi,
  Shield,
  Camera,
} from "lucide-react";

// --- IMPORT ENGINE PUSAT ---
import { runTopsisLogic } from "@/lib/topsis/engine";

interface KosanData {
  id_kosan: number;
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
  bobot: number;
}

export default function DashboardPage() {
  const [kosanList, setKosanList] = useState<KosanData[]>([]);
  const [kriteriaList, setKriteriaList] = useState<Kriteria[]>([]);
  const [bobotSementara, setBobotSementara] = useState<Record<string, number>>({});
  const [hasCalculated, setHasCalculated] = useState(false);

  // 1. Fetch Data Kosan
  useEffect(() => {
    const fetchKosan = async () => {
      try {
        const res = await fetch("/api/kosan");
        if (!res.ok) throw new Error("Gagal mengambil data kosan");
        const data = await res.json();
        setKosanList(data);
      } catch (error) {
        console.error("Gagal ambil data kosan:", error);
      }
    };
    fetchKosan();
  }, []);

  // 2. Fetch Kriteria & Sinkronisasi Awal
  useEffect(() => {
    const fetchKriteria = async () => {
      try {
        const res = await fetch("/api/kriteria");
        const data = await res.json();
        setKriteriaList(data);

        const initialBobot: Record<string, number> = {};
        data.forEach((k: Kriteria) => {
          const key = (k.nama ?? k.nama_kriteria ?? "").toLowerCase().replace(/\s+/g, "_");
          // Konversi dari desimal (0.2) ke bulat (20) jika perlu
          const nilaiBulat = k.bobot <= 1 ? Math.round(k.bobot * 100) : k.bobot;
          initialBobot[key] = nilaiBulat;
        });
        setBobotSementara(initialBobot);
      } catch (error) {
        console.error("Error fetching criteria:", error);
      }
    };
    fetchKriteria();
  }, []);

  // --- FUNGSI UNTUK MENANGANI PERUBAHAN SLIDER ---
  const handleSliderChange = (key: string, value: number) => {
    setBobotSementara((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // --- FUNGSI HITUNG MENGGUNAKAN ENGINE PUSAT ---
  const calculateTOPSIS = () => {
    if (!kosanList.length) return;

    // Urutan weightsArray harus sesuai dengan urutan kolom di Engine
    const weightsArray = [
      (bobotSementara["harga"] || 0) / 100,
      (bobotSementara["jarak"] || 0) / 100,
      (bobotSementara["fasilitas"] || 0) / 100,
      (bobotSementara["rating"] || 0) / 100,
      (bobotSementara["sistem_keamanan"] || 0) / 100,
    ];

    // Panggil Engine Pusat dengan casting agar aman dari Decimal Prisma
const hasilTopsis = runTopsisLogic(kosanList as KosanData[], weightsArray);
    // Update list kosan dengan hasil skor
    const updatedList = kosanList.map((k) => {
      const match = hasilTopsis.find(
        (h) => h.id_kosan.toString() === k.id_kosan.toString()
      );

      return {
        ...k,
        skor: match ? Number(match.nilai_preferensi.toFixed(3)) : 0,
      };
    });

    // Urutkan berdasarkan skor tertinggi (Ranking 1 di atas)
    setKosanList(updatedList.sort((a, b) => (b.skor ?? 0) - (a.skor ?? 0)));
    setHasCalculated(true);
  };

  const totalPersen = Object.values(bobotSementara).reduce((s, v) => s + (Number(v) || 0), 0);

  const icons: Record<string, ReactNode> = {
    harga: <DollarSign className="h-6 w-6 text-purple-600" />,
    jarak: <MapPin className="h-6 w-6 text-cyan-500" />,
    fasilitas: <Wifi className="h-6 w-6 text-yellow-500" />,
    rating: <Star className="h-6 w-6 text-green-500" />,
    sistem_keamanan: <Shield className="h-6 w-6 text-red-500" />,
  };

  const chartData = kosanList.map((kosan) => ({
    nama: kosan.nama,
    skor: kosan.skor || 0,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard TOPSIS</h1>
          <p className="text-muted-foreground">Kelola data kosan dan analisis dengan metode TOPSIS</p>
        </div>

        {/* --- STAT CARDS --- */}
        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Kosan</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kosanList.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Kosan Terbaik</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold truncate">
                {hasCalculated && kosanList[0] ? kosanList[0].nama : "-"}
              </div>
              <p className="text-xs text-muted-foreground">Skor: {hasCalculated ? kosanList[0]?.skor : "-"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Harga</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kosanList.length > 0
                  ? new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(
                      kosanList.reduce((sum, k) => sum + Number(k.harga), 0) / kosanList.length
                    )
                  : "Rp 0"}
              </div>
              <p className="text-xs text-muted-foreground">Per bulan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status Analisis</CardTitle>
              <Badge variant={hasCalculated ? "default" : "secondary"}>
                {hasCalculated ? "Selesai" : "Belum Dihitung"}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mt-2 italic">
                {hasCalculated ? "Data sudah akurat" : "Atur bobot lalu klik hitung"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="data" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="data">Data Kosan</TabsTrigger>
            <TabsTrigger value="bobot">Bobot Kriteria</TabsTrigger>
            <TabsTrigger value="hasil">Hasil Analisis</TabsTrigger>
            <TabsTrigger value="keamanan">Keamanan</TabsTrigger>
          </TabsList>

          {/* TAB DATA KOSAN */}
          <TabsContent value="data">
            <Card>
              <CardHeader><CardTitle>Daftar Kosan</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Jarak</TableHead>
                      <TableHead>Fasilitas</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Keamanan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kosanList.map((k) => (
                      <TableRow key={k.id_kosan}>
                        <TableCell className="font-medium">{k.nama}</TableCell>
                        <TableCell>Rp {Number(k.harga).toLocaleString("id-ID")}</TableCell>
                        <TableCell>{k.jarak} km</TableCell>
                        <TableCell>{k.fasilitas}/10</TableCell>
                        <TableCell>{k.rating}/5</TableCell>
                        <TableCell>{k.sistem_keamanan}/10</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB BOBOT KRITERIA */}
          <TabsContent value="bobot" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Bobot Kriteria</CardTitle>
                <p className="text-sm text-muted-foreground">Sesuaikan prioritas Anda (Total: {totalPersen}%)</p>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                  {kriteriaList.map((k) => {
                    const key = (k.nama ?? k.nama_kriteria ?? "").toLowerCase().replace(/\s+/g, "_");
                    const currentVal = bobotSementara[key] || 0;
                    return (
                      <div key={k.id} className="bg-white p-4 rounded-xl border flex flex-col items-center">
                        <div className="flex flex-col items-center mb-4">
                          {icons[key] || <Calculator className="h-6 w-6" />}
                          <span className="font-medium mt-2 capitalize">{key.replace("_", " ")}</span>
                        </div>
                        <Slider
                          value={[currentVal]}
                          onValueChange={(v: number[]) => handleSliderChange(key, v[0])}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                        <div className="mt-2 text-sm font-bold">{currentVal}%</div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-right font-bold text-lg">
                  Total: <span className={totalPersen === 100 ? "text-green-600" : "text-red-500"}>{totalPersen}%</span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(bobotSementara).map(([name, value]) => ({ name, value }))}
                        cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {Object.keys(bobotSementara).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={["#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444"][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB HASIL ANALISIS */}
          <TabsContent value="hasil">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Hasil Analisis TOPSIS</CardTitle>
                <Button onClick={calculateTOPSIS} disabled={kosanList.length === 0 || totalPersen !== 100}>
                  <Calculator className="h-4 w-4 mr-2" /> Hitung Sekarang
                </Button>
              </CardHeader>
              <CardContent>
                {hasCalculated ? (
                  <div className="space-y-8">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Nama</TableHead>
                          <TableHead>Skor</TableHead>
                          <TableHead>Visual</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kosanList.map((k, i) => (
                          <TableRow key={k.id_kosan}>
                            <TableCell><Badge variant={i === 0 ? "default" : "outline"}>#{i+1}</Badge></TableCell>
                            <TableCell className="font-medium">{k.nama}</TableCell>
                            <TableCell>{k.skor}</TableCell>
                            <TableCell><Progress value={(k.skor || 0) * 100} className="w-24" /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="nama" />
                          <YAxis domain={[0, 1]} />
                          <Tooltip />
                          <Bar dataKey="skor" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Pastikan total bobot 100% lalu klik Hitung.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB KEAMANAN */}
          <TabsContent value="keamanan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Analisis Sistem Keamanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Kosan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Nilai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kosanList.map((k) => (
                      <TableRow key={k.id_kosan}>
                        <TableCell className="font-medium">{k.nama}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {k.sistem_keamanan >= 8 ? "Sangat Aman" : k.sistem_keamanan >= 6 ? "Aman" : "Cukup"}
                          </Badge>
                        </TableCell>
                        <TableCell>{k.sistem_keamanan}/10</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

        
        </Tabs>
      </div>
    </div>
  );
}