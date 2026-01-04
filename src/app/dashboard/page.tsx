"use client";

import { useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [activeTab, setActiveTab] = useState("bobot");

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

  // --- FUNGSI UNTUK MENANGANI PERUBAHAN BOBOT (DROPDOWN) ---
const handleBobotChange = (key: string, value: number) => {
  setBobotSementara((prev) => ({
    ...prev,
    [key]: value,
  }));
};

  // --- FUNGSI HITUNG MENGGUNAKAN ENGINE PUSAT ---
// --- FUNGSI HITUNG MENGGUNAKAN ENGINE PUSAT ---
const calculateTOPSIS = () => {
  // Pastikan data ada dan total bobot tepat 100%
  if (!kosanList.length || totalPersen !== 100) {
    alert("Total bobot harus 100% sebelum menghitung!");
    return;
  }

  // Urutan weightsArray harus sesuai dengan urutan kolom di Engine
  const weightsArray = [
    (bobotSementara["harga"] || 0) / 100,
    (bobotSementara["jarak"] || 0) / 100,
    (bobotSementara["fasilitas"] || 0) / 100,
    (bobotSementara["rating"] || 0) / 100,
    (bobotSementara["sistem_keamanan"] || 0) / 100,
  ];

  // 1. Panggil Engine Pusat
  const hasilTopsis = runTopsisLogic(kosanList as KosanData[], weightsArray);

  // 2. Update list kosan dengan hasil skor dari engine
  const updatedList = kosanList.map((k) => {
    const match = hasilTopsis.find(
      (h) => h.id_kosan.toString() === k.id_kosan.toString()
    );

    return {
      ...k,
      skor: match ? Number(match.nilai_preferensi.toFixed(3)) : 0,
    };
  });

  // 3. Urutkan berdasarkan skor tertinggi (Ranking 1 di atas)
  const sortedList = [...updatedList].sort((a, b) => (b.skor ?? 0) - (a.skor ?? 0));
  
  setKosanList(sortedList);
  setHasCalculated(true);

  // 4. OTOMATIS PINDAH KE TAB HASIL
  setActiveTab("hasil"); 
};

// Menghitung total bobot secara real-time
const totalPersen = Object.values(bobotSementara).reduce(
  (acc, val) => acc + (Number(val) || 0), 
  0
);
  const icons: Record<string, ReactNode> = {
    harga: <DollarSign className="h-6 w-6 text-purple-600" />,
    jarak: <MapPin className="h-6 w-6 text-cyan-500" />,
    fasilitas: <Wifi className="h-6 w-6 text-yellow-500" />,
    rating: <Star className="h-6 w-6 text-green-500" />,
    sistem_keamanan: <Shield className="h-6 w-6 text-red-500" />,
  };

 // Data untuk Grafik Batang (Bar Chart)
const chartData = kosanList
  .filter(k => (k.skor ?? 0) > 0) // Hanya tampilkan yang sudah ada skornya
  .map((kosan) => ({
    nama: kosan.nama.length > 10 ? kosan.nama.substring(0, 10) + "..." : kosan.nama,
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

<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="data">Data Kosan</TabsTrigger>
            <TabsTrigger value="bobot">Bobot Kriteria</TabsTrigger>
            <TabsTrigger value="hasil">Hasil Analisis</TabsTrigger>
            <TabsTrigger value="keamanan">Keamanan</TabsTrigger>
          </TabsList>

          {/* TAB DATA KOSAN */}
          <TabsContent value="data">
  <Card className="border-none shadow-sm">
    <CardHeader>
      <CardTitle className="text-xl font-bold text-slate-800">Daftar Kosan</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-bold">Nama Kosan</TableHead>
            <TableHead className="font-bold">Harga</TableHead>
            <TableHead className="font-bold">Jarak</TableHead>
            <TableHead className="font-bold">Fasilitas</TableHead>
            <TableHead className="font-bold">Rating</TableHead>
            <TableHead className="font-bold">Keamanan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {kosanList.map((k) => (
            <TableRow key={k.id_kosan} className="hover:bg-slate-50/50 transition-colors">
              <TableCell className="font-semibold text-slate-700">{k.nama}</TableCell>
              <TableCell>
                <span className="text-green-600 font-medium">
                  Rp {Number(k.harga).toLocaleString("id-ID")}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <span>{k.jarak} km</span>
                </div>
              </TableCell>
              
              {/* Kolom Fasilitas - Skala 5 */}
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-700">{Number(k.fasilitas)}</span>
                  <span className="text-slate-400 text-[10px] font-medium">/ 5</span>
                </div>
              </TableCell>
              
              {/* Kolom Rating - Skala 5 dengan Ikon Bintang */}
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-slate-700">{k.rating}</span>
                </div>
              </TableCell>

              {/* Kolom Keamanan - Skala 5 */}
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-bold text-slate-700">{Number(k.sistem_keamanan)}</span>
                  <span className="text-slate-400 text-[10px] font-medium">/ 5</span>
                </div>
              </TableCell>
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
      <p className="text-sm text-muted-foreground">
        Tentukan tingkat kepentingan setiap kriteria (Total: {totalPersen}%)
      </p>
    </CardHeader>
    <CardContent className="space-y-8">
      {/* GRID DROPDOWN DENGAN LABEL KHUSUS */}
      <div className="grid md:grid-cols-3 gap-6">
        {kriteriaList.map((k) => {
          const key = (k.nama ?? k.nama_kriteria ?? "").toLowerCase().replace(/\s+/g, "_");
          const currentVal = bobotSementara[key] || 0;

          // Mapping label berdasarkan nama kriteria
         const labels: Record<string, { t: string; v: number }[]> = {
  harga: [
    { t: "Sangat Murah (30%)", v: 30 },
    { t: "Murah (25%)", v: 25 },
    { t: "Cukup (20%)", v: 20 },
    { t: "Mahal (15%)", v: 15 },
    { t: "Sangat Mahal (10%)", v: 10 }
  ],
  jarak: [
    { t: "Sangat Dekat (30%)", v: 30 },
    { t: "Dekat (25%)", v: 25 },
    { t: "Cukup (20%)", v: 20 },
    { t: "Jauh (15%)", v: 15 },
    { t: "Sangat Jauh (10%)", v: 10 }
  ],
  fasilitas: [
    { t: "Sangat Lengkap (30%)", v: 30 },
    { t: "Lengkap (25%)", v: 25 },
    { t: "Cukup (20%)", v: 20 },
    { t: "Kurang (15%)", v: 15 },
    { t: "Sangat Kurang (10%)", v: 10 }
  ],
  rating: [
    { t: "Sangat Puas (30%)", v: 30 },
    { t: "Puas (25%)", v: 25 },
    { t: "Cukup (20%)", v: 20 },
    { t: "kurang (15%)", v: 15 },
    { t: "Sangat kurang (10%)", v: 10 }
  ],
  sistem_keamanan: [
    { t: "Sangat Aman (30%)", v: 30 },
    { t: "Aman (25%)", v: 25 },
    { t: "Cukup (20%)", v: 20 },
    { t: "Rawan (15%)", v: 15 },
    { t: "Sangat Rawan (10%)", v: 10 }
  ],
};

const options = labels[key] || [
  { t: "Sangat Tinggi (30%)", v: 30 },
  { t: "Tinggi (25%)", v: 25 },
  { t: "Cukup (20%)", v: 20 },
  { t: "Rendah (15%)", v: 15 },
  { t: "Sangat Rendah (10%)", v: 10 }
];

          return (
            <div key={k.id} className="bg-white p-5 rounded-xl border shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {icons[key] || <Calculator className="h-5 w-5" />}
                </div>
                <span className="font-semibold capitalize text-sm">{key.replace("_", " ")}</span>
              </div>

              <select
                className="w-full p-2 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                value={currentVal}
                onChange={(e) => handleBobotChange(key, Number(e.target.value))}
              >
                <option value={0}>-- Pilih Prioritas --</option>
                {options.map((opt) => (
                  <option key={opt.v} value={opt.v}>{opt.t}</option>
                ))}
              </select>

              <div className="mt-3 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                Nilai: {currentVal}%
              </div>
            </div>
          );
        })}
      </div>

      {/* VALIDASI TOTAL DAN TOMBOL HITUNG */}
      <div className="flex flex-col md:flex-row justify-between items-center border-t pt-6 gap-4">
        <div className="flex flex-col">
          <div className="text-xl font-bold">
            Total Bobot: <span className={totalPersen === 100 ? "text-green-600" : "text-red-500"}>{totalPersen}%</span>
          </div>
          {totalPersen !== 100 && (
            <span className="text-xs text-red-500 italic">Total harus 100% untuk menghitung</span>
          )}
        </div>
        
        <Button 
          onClick={calculateTOPSIS} 
          disabled={totalPersen !== 100}
          className="w-full md:w-48 bg-primary shadow-lg transition-all active:scale-95"
        >
          <Calculator className="mr-2 h-4 w-4" />
          Hitung TOPSIS
        </Button>
      </div>

      {/* PIE CHART TANPA ERROR ESLINT */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={Object.entries(bobotSementara)
                .filter((entry) => entry[1] > 0)
                .map(([name, value]) => ({ 
                  name: name.replace("_", " "), 
                  value: Number(value) 
                }))}
              cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
              label={({ name, value }) => `${name}: ${value}%`}
            >
              {Object.entries(bobotSementara)
                .filter((entry) => entry[1] > 0)
                .map((item, index) => (
                  <Cell 
                    key={`cell-${item[0]}-${index}`} 
                    fill={["#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444"][index % 5]} 
                  />
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
          <TabsContent value="hasil" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle>Hasil Analisis TOPSIS</CardTitle>
      <p className="text-sm text-muted-foreground italic">
        Menampilkan peringkat kosan berdasarkan preferensi bobot yang Anda tentukan.
      </p>
    </CardHeader>
    <CardContent>
      {hasCalculated ? (
        <div className="space-y-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Nama Kosan</TableHead>
                <TableHead>Skor Akhir</TableHead>
                <TableHead>Visualisasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kosanList.map((k, i) => (
                <TableRow key={k.id_kosan} className={i === 0 ? "bg-green-50/50" : ""}>
                  <TableCell>
                    <Badge variant={i === 0 ? "default" : "outline"} className={i === 0 ? "bg-green-600" : ""}>
                      #{i + 1}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold">{k.nama}</TableCell>
                  <TableCell>{k.skor}</TableCell>
                  <TableCell>
                    <Progress value={(k.skor || 0) * 100} className="w-24 h-2" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Bar Chart untuk Visualisasi Ranking */}
          <div className="h-72 mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="nama" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 1]} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="skor" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Calculator className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">Belum Ada Analisis</h3>
          <p className="text-sm text-muted-foreground max-w-[250px]">
            Silakan atur bobot kriteria terlebih dahulu pada tab <b>Bobot</b>.
          </p>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>
          {/* TAB KEAMANAN */}
          <TabsContent value="keamanan" className="animate-in fade-in slide-in-from-bottom-2">
  <Card className="border-none shadow-lg shadow-slate-200/50">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-xl font-bold">
        <Shield className="h-6 w-6 text-blue-600" />
        Analisis Sistem Keamanan
      </CardTitle>
      <p className="text-sm text-muted-foreground">
        Klasifikasi tingkat keamanan berdasarkan fasilitas keamanan terpasang.
      </p>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="font-bold">Nama Kosan</TableHead>
            <TableHead className="font-bold text-center">Tingkat Keamanan</TableHead>
            <TableHead className="font-bold text-right">Skor Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {kosanList.map((k) => {
            // Logika baru untuk skala 1-5
            const nilai = Number(k.sistem_keamanan);
            let statusLabel = "Cukup";
            let badgeClass = "bg-slate-100 text-slate-600 border-none"; // Default Cukup

            if (nilai >= 4.5) {
              statusLabel = "Sangat Aman";
              badgeClass = "bg-emerald-100 text-emerald-700 border-none font-bold";
            } else if (nilai >= 3) {
              statusLabel = "Aman";
              badgeClass = "bg-amber-100 text-amber-700 border-none font-bold";
            }

            return (
              <TableRow key={k.id_kosan} className="hover:bg-slate-50/30 transition-colors">
                <TableCell className="font-medium text-slate-700">{k.nama}</TableCell>
                <TableCell className="text-center">
                  <Badge className={`px-3 py-1 rounded-full ${badgeClass}`}>
                    {statusLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                    <span className="font-bold text-slate-700">{nilai}</span>
                    <span className="text-slate-400 text-[10px]">/ 5</span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
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