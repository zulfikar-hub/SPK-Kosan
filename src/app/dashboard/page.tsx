"use client";

import { useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Slider from "@/components/ui/slider";
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
  bobot: number; // Disimpan DB (0.25)
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
          // Konversi desimal DB (0.25) ke Slider (25)
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

  // Helper untuk mendapatkan bobot desimal (0.25) untuk rumus
  const getBobotDesimal = (key: string) => {
    const value = bobotSementara[key];
    return value ? value / 100 : 0;
  };

  const handleSliderChange = (key: string, value: number) => {
    setBobotSementara((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const calculateTOPSIS = () => {
    if (!kosanList.length) return;

    // 1. SUM SQUARE (Penyebut Normalisasi)
    const sum = kosanList.reduce(
      (a, k) => ({
        harga: a.harga + Number(k.harga || 0) ** 2,
        jarak: a.jarak + Number(k.jarak || 0) ** 2,
        fasilitas: a.fasilitas + Number(k.fasilitas || 0) ** 2,
        rating: a.rating + Number(k.rating || 0) ** 2,
        sistem_keamanan: a.sistem_keamanan + Number(k.sistem_keamanan || 0) ** 2,
      }),
      { harga: 0, jarak: 0, fasilitas: 0, rating: 0, sistem_keamanan: 0 }
    );

    // 2. NORMALISASI TERBOBOT
    const weighted = kosanList.map((k) => ({
      ...k,
      w_harga: (k.harga / (Math.sqrt(sum.harga) || 1)) * getBobotDesimal("harga"),
      w_jarak: (k.jarak / (Math.sqrt(sum.jarak) || 1)) * getBobotDesimal("jarak"),
      w_fasilitas: (k.fasilitas / (Math.sqrt(sum.fasilitas) || 1)) * getBobotDesimal("fasilitas"),
      w_rating: (k.rating / (Math.sqrt(sum.rating) || 1)) * getBobotDesimal("rating"),
      w_sistem_keamanan: (k.sistem_keamanan / (Math.sqrt(sum.sistem_keamanan) || 1)) * getBobotDesimal("sistem_keamanan"),
    }));

    // 3. SOLUSI IDEAL (Cost: Harga, Jarak | Benefit: Fasilitas, Rating, Keamanan)
    const idealPlus = {
      harga: Math.min(...weighted.map((k) => k.w_harga)),
      jarak: Math.min(...weighted.map((k) => k.w_jarak)),
      fasilitas: Math.max(...weighted.map((k) => k.w_fasilitas)),
      rating: Math.max(...weighted.map((k) => k.w_rating)),
      sistem_keamanan: Math.max(...weighted.map((k) => k.w_sistem_keamanan)),
    };

    const idealMinus = {
      harga: Math.max(...weighted.map((k) => k.w_harga)),
      jarak: Math.max(...weighted.map((k) => k.w_jarak)),
      fasilitas: Math.min(...weighted.map((k) => k.w_fasilitas)),
      rating: Math.min(...weighted.map((k) => k.w_rating)),
      sistem_keamanan: Math.min(...weighted.map((k) => k.w_sistem_keamanan)),
    };

    // 4. NILAI PREFERENSI
    const result = weighted.map((k) => {
      const dPlus = Math.sqrt(
        (k.w_harga - idealPlus.harga) ** 2 +
        (k.w_jarak - idealPlus.jarak) ** 2 +
        (k.w_fasilitas - idealPlus.fasilitas) ** 2 +
        (k.w_rating - idealPlus.rating) ** 2 +
        (k.w_sistem_keamanan - idealPlus.sistem_keamanan) ** 2
      );

      const dMinus = Math.sqrt(
        (k.w_harga - idealMinus.harga) ** 2 +
        (k.w_jarak - idealMinus.jarak) ** 2 +
        (k.w_fasilitas - idealMinus.fasilitas) ** 2 +
        (k.w_rating - idealMinus.rating) ** 2 +
        (k.w_sistem_keamanan - idealMinus.sistem_keamanan) ** 2
      );

      const skorAkhir = dMinus / (dPlus + dMinus);
      return {
        ...k,
        skor: isNaN(skorAkhir) ? 0 : Number(skorAkhir.toFixed(3)),
      };
    });

    setKosanList(result.sort((a, b) => (b.skor ?? 0) - (a.skor ?? 0)));
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Status Analisis</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={hasCalculated ? "default" : "secondary"}>
                {hasCalculated ? "Selesai" : "Belum"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="data" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="data">Data Kosan</TabsTrigger>
            <TabsTrigger value="bobot">Bobot Kriteria</TabsTrigger>
            <TabsTrigger value="hasil">Hasil Analisis</TabsTrigger>
            <TabsTrigger value="keamanan">Keamanan</TabsTrigger>
            <TabsTrigger value="laporan">Laporan</TabsTrigger>
          </TabsList>

          {/* --- TAB DATA --- */}
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

          {/* --- TAB BOBOT --- */}
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
                          {icons[key]}
                          <span className="font-medium mt-2 capitalize">{key.replace("_", " ")}</span>
                        </div>
                        <Slider
                          value={[currentVal]}
                          onValueChange={(v) => handleSliderChange(key, v[0])}
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
                        data={Object.entries(bobotSementara).map(([name, val]) => ({ name, value: val }))}
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

          {/* --- TAB HASIL --- */}
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

          {/* --- TAB KEAMANAN --- */}
          <TabsContent value="keamanan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Analisis Sistem Keamanan
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Nilai keamanan tiap kosan berdasarkan hasil survei sistem keamanan (Skala 1-10).
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Kosan</TableHead>
                      <TableHead>Fasilitas CCTV / Penjaga</TableHead>
                      <TableHead>Nilai Keamanan</TableHead>
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