"use client"

import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton" 
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    TooltipProps, // Hanya TooltipProps yang diimpor dari Recharts
} from "recharts"
import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Loader2, Home, BarChart2, PieChart as PieChartIcon } from "lucide-react"
import React from "react" 

// Warna yang Lebih Elegan (Mengambil dari theme/Tailwind)
const COLORS = [
    "hsl(var(--color-primary))", 
    "hsl(var(--color-accent))", 
    "hsl(var(--color-destructive))",
    "#60A5FA",
    "#34D399",
    "#FBBF24",
    "#F87171",
    "#A78BFA",
]

// ----------------------------------------------------
// DEFINISI INTERFACE
// ----------------------------------------------------
interface TopsisData {
    name: string
    value: number
    ranking: number
}

interface TrendData {
    month: string
    alternatives: number
    ratings: number
}

interface StatusData {
    name: string
    value: number
}

interface SummaryData {
    totalAlternatives: number
    avgTopsis: number
    approvalRate: number
    activeUsers: number
}

// 📌 [FIX TYPING] TIPE TOOLTIP: Menggunakan TooltipProps dengan tipe generik yang ketat (string | number)
type CustomTooltipProps = TooltipProps<string | number, string | number>;


// ----------------------------------------------------
// KOMPONEN: Stat Card (Untuk Summary)
// ----------------------------------------------------
interface StatCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    colorClass: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass }) => (
    <Card className={`p-5 flex justify-between items-center ${colorClass} transition-shadow duration-300 hover:shadow-lg`}>
        <div>
            <p className="text-sm font-medium text-foreground/70">{title}</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">
                {typeof value === 'number' ? value.toLocaleString() : value}
            </h3>
        </div>
        <div className="p-3 rounded-full bg-background/20 text-foreground">
            {icon}
        </div>
    </Card>
);

// ----------------------------------------------------
// KOMPONEN UTAMA
// ----------------------------------------------------
export default function AnalyticsPage() {
    const [topsisData, setTopsisData] = useState<TopsisData[]>([])
    const [trendData, setTrendData] = useState<TrendData[]>([])
    const [statusData, setStatusData] = useState<StatusData[]>([])
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
    const [isLoading, setIsLoading] = useState(true) 

    const fetchData = async () => {
    setIsLoading(true);
    try {
        const [topsisRes, trendRes, statusRes, summaryRes] = await Promise.all([
            axios.get("/api/hasil-topsis"),
            axios.get("/api/topsis/trend"),
            // 📌 PERBAIKAN: Panggil API status kosan yang baru
            axios.get("/api/topsis/status-kosan"), 
            axios.get("/api/topsis/summary"),
        ]);

        setTopsisData(topsisRes.data as TopsisData[]);
        setTrendData(trendRes.data as TrendData[]);
        // Pastikan tipe data statusData sesuai dengan output API
        setStatusData(statusRes.data as StatusData[]); 
        setSummaryData(summaryRes.data as SummaryData);

    } catch (err) {
        console.error("Gagal mengambil data analytics:", err);
        toast.error("Gagal memuat semua data analitik.");
    } finally {
        setIsLoading(false);
    }
}

    useEffect(() => {
        fetchData()
    }, [])

    const customTooltip = ({ active, payload, label }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-3 bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-xl">
                    <p className="font-bold text-sm text-primary">{String(label)}</p>
                    {payload.map((p, index: number) => (
                        <p key={index} className="text-xs mt-1" style={{ color: p.color as string || 'white' }}>
                            {(p.name as string) || 'Nilai'}: <span className="font-semibold">
                                {typeof p.value === 'number' ? p.value.toFixed(4) : p.value}
                            </span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderChartOrSkeleton = (content: React.ReactNode, height: number = 300) => {
        if (isLoading) {
            return <Skeleton className={`w-full`} style={{ height: `${height}px` }} />;
        }
        return content;
    }

    return (
        <div className="flex">
            <Sidebar />
            <div className="ml-64 w-full min-h-screen bg-background">
                <Header />

                <main className="pt-24 pb-8 px-8">
                    {/* Page Title */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl font-bold text-foreground">Dashboard Analisis</h1>
                        <p className="text-foreground/60 mt-2">Visualisasi data dan tren analisis SPK TOPSIS</p>
                    </motion.div>

                    {/* ---------------------------------------------------- */}
                    {/* 1. SUMMARY STATISTICS (4 Cards - Grid 4) */}
                    {/* ---------------------------------------------------- */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    >
                        {isLoading ? (
                            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[100px]" />)
                        ) : summaryData ? (
                            <>
                                <StatCard
                                    title="Total Kosan"
                                    value={summaryData.totalAlternatives}
                                    icon={<Home className="w-5 h-5" />}
                                    colorClass="border-l-4 border-primary/80"
                                />
                                <StatCard
                                    title="Rata-rata Preferensi"
                                    // 📌 [FIX RUNTIME ERROR]: Cek dan konversi ke Number sebelum toFixed
                                    value={summaryData.avgTopsis ? Number(summaryData.avgTopsis).toFixed(4) : '0.0000'}
                                    icon={<BarChart2 className="w-5 h-5" />}
                                    colorClass="border-l-4 border-green-500/80"
                                />
                                <StatCard
                                    title="Tingkat Persetujuan"
                                    value={`${summaryData.approvalRate}%`}
                                    icon={<PieChartIcon className="w-5 h-5" />}
                                    colorClass="border-l-4 border-yellow-500/80"
                                />
                                <StatCard
                                    title="Pengguna Aktif"
                                    value={summaryData.activeUsers}
                                    icon={<Loader2 className="w-5 h-5" />}
                                    colorClass="border-l-4 border-accent/80"
                                />
                            </>
                        ) : (
                            <div className="col-span-4 text-center text-foreground/50 p-4">Gagal memuat data ringkasan.</div>
                        )}
                    </motion.div>


                    {/* ---------------------------------------------------- */}
                    {/* 2. CHARTS GRID (TOPSIS, TREND, STATUS) - Grid 2 */}
                    {/* ---------------------------------------------------- */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* TOPSIS Values Chart (Bar Chart) */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                            <Card className="p-6">
                                <h2 className="text-xl font-semibold text-foreground mb-4">Nilai Preferensi TOPSIS</h2>
                                {renderChartOrSkeleton(
                                    topsisData.length === 0 ? (
                                        <div className="flex h-[350px] items-center justify-center text-foreground/50">
                                            ⚠️ Tidak ada data TOPSIS.
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart data={topsisData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" vertical={false} />
                                                <XAxis 
                                                    dataKey="name" 
                                                    stroke="hsl(var(--color-foreground))" 
                                                    tickLine={false} 
                                                    axisLine={false}
                                                    angle={-15}
                                                    textAnchor="end"
                                                    height={60}
                                                />
                                                <YAxis stroke="hsl(var(--color-foreground))" domain={[0, 1]} />
                                                <Tooltip content={customTooltip} />
                                                <Bar dataKey="value" name="Nilai Preferensi" fill="hsl(var(--color-primary))" radius={[8, 8, 0, 0]} barSize={30} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ), 350
                                )}
                            </Card>
                        </motion.div>

                        {/* Trend Analysis (Line Chart) */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                            <Card className="p-6">
                                <h2 className="text-xl font-semibold text-foreground mb-4">Tren Bulanan</h2>
                                {renderChartOrSkeleton(
                                    <ResponsiveContainer width="100%" height={350}>
                                        <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" vertical={false} />
                                            <XAxis dataKey="month" stroke="hsl(var(--color-foreground))" />
                                            <YAxis stroke="hsl(var(--color-foreground))" />
                                            <Tooltip content={customTooltip} />
                                            <Legend />
                                            <Line type="monotone" dataKey="alternatives" name="Alternatif Baru" stroke="hsl(var(--color-primary))" strokeWidth={2} dot={{ r: 5 }} />
                                            <Line type="monotone" dataKey="ratings" name="Rata-rata Rating" stroke="hsl(var(--color-accent))" strokeWidth={2} dot={{ r: 5 }} />
                                        </LineChart>
                                    </ResponsiveContainer>, 350
                                )}
                            </Card>
                        </motion.div>
                        
                        {/* Status Distribution (Pie Chart) - Dibuat 1 kolom penuh di bawah*/}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="lg:col-span-2">
                            <Card className="p-6">
                                <h2 className="text-xl font-semibold text-foreground mb-4">Distribusi Status Kosan</h2>
                                {renderChartOrSkeleton(
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
    data={statusData} // <-- statusData kini berisi {name: 'Tersedia', value: 15}
    cx="50%"
    cy="50%"
    // ...
    dataKey="value" // <-- Mengambil nilai dari field 'value'
    // ...
>
   {statusData.map((entry, index) => (
  <Cell
    key={`cell-${index}`}
    fill={COLORS[index % COLORS.length]}
  />
))}
</Pie>
                                            <Tooltip content={({ active, payload }: CustomTooltipProps) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload as StatusData; 
                                                    return (
                                                        <div className="p-2 bg-card border border-border rounded-md shadow-lg">
                                                            <p className="font-semibold">{data.name}</p>
                                                            <p>Total: {data.value}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }} />
                                            <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>, 300
                                )}
                            </Card>
                        </motion.div>

                    </div>
                </main>
            </div>
        </div>
    )
}