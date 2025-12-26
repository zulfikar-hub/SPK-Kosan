"use client"

import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { StatCard } from "@/components/stat-card" // Asumsi StatCard sudah diimpor
import { Card } from "@/components/ui/card" // Card dari Shadcn
import { Skeleton } from "@/components/ui/skeleton" // Skeleton untuk Loading State
import { Building2, Users, Sliders, Trophy, TrendingUp, Loader2 } from "lucide-react"
import {
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    TooltipProps
} from "recharts"
import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { toast } from "sonner"
import React from "react"

// ----------------------------------------------------
// DEFINISI INTERFACE (SAMA SEPERTI DI ANALYTIC PAGE SEBELUMNYA)
// ----------------------------------------------------

interface TopsisData {
    name: string // Nama Alternatif
    value: number // Nilai Preferensi (Ci)
    ranking: number
}

interface SummaryData {
    totalAlternatives: number // Total Kosan
    avgTopsis: number // Rata-rata Topsis
    approvalRate: number // Tingkat Persetujuan
    activeUsers: number // Pengguna Aktif
    totalCriteria: number // Asumsi API summary juga menyediakan ini
}

// Tipe untuk Custom Tooltip
type CustomTooltipProps = TooltipProps<string | number, string | number>;


// ----------------------------------------------------
// KOMPONEN: Custom Tooltip
// ----------------------------------------------------

// Custom Tooltip untuk BarChart
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        // Data yang kita ambil dari API: { name: "Kosan A", value: 0.87 }
        const topsisValue = payload[0].value;
        return (
            <div className="p-3 bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-xl text-foreground">
                <p className="font-bold text-sm text-primary">{String(label)}</p>
                <p className="text-xs mt-1">
                    Nilai Preferensi Ci: <span className="font-semibold">{Number(topsisValue).toFixed(4)}</span>
                </p>
            </div>
        );
    }
    return null;
};


// ----------------------------------------------------
// KOMPONEN UTAMA DASHBOARD
// ----------------------------------------------------

export default function Dashboard() {
    const [topsisData, setTopsisData] = useState<TopsisData[]>([])
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDataUpdated, setIsDataUpdated] = useState(false)

    // Mencari Kosan dengan Nilai TOPSIS Tertinggi untuk StatCard Trophy
    const findHighestTopsis = useCallback((): { name: string, value: number } => {
        if (!topsisData || topsisData.length === 0) {
            return { name: "N/A", value: 0 };
        }
        
        // Cari objek dengan nilai 'value' (TOPSIS) tertinggi
        const highest = topsisData.reduce((prev, current) => 
            (prev.value > current.value) ? prev : current
        );

        return { 
            name: highest.name, 
            value: highest.value 
        };
    }, [topsisData]);


    const fetchData = async () => {
        setIsLoading(true);
        try {
            // [1] PANGGILAN API
            const [topsisRes, summaryRes] = await Promise.all([
                // Endpoint 1: Data Chart
                axios.get("/api/hasil-topsis"),
                // Endpoint 2: Data Summary (STAT CARDS)
                axios.get("/api/topsis/summary"), 
            ]);

            // [2] PENETAPAN STATE
            // Penetapan untuk Chart (Nilai TOPSIS per Kosan)
            setTopsisData(topsisRes.data as TopsisData[]);
            
            // 📌 PERBAIKAN UTAMA: Menggunakan summaryRes untuk Summary Data
            setSummaryData(summaryRes.data as SummaryData); 

            setIsDataUpdated(true);
            toast.success("Data dashboard berhasil dimuat.");

        } catch (err) {
            console.error("Gagal mengambil data dashboard:", err);
            toast.error("Gagal memuat data. Periksa endpoint API: /api/hasil-topsis & /api/topsis/summary");
            setIsDataUpdated(false); 
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [])
    const highestTopsis = findHighestTopsis();
    const renderChartOrSkeleton = (content: React.ReactNode, height: number = 300) => {
        if (isLoading) {
            return <Skeleton className={`w-full`} style={{ height: `${height}px` }} />;
        }
        return content;
    }
    const renderStatCard = () => {
        if (isLoading) {
            return Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[100px]" />);
        }
        if (!summaryData) {
            return (
                <div className="col-span-4 text-center text-foreground/50 p-4">Data ringkasan tidak tersedia.</div>
            );
        }

        return (
            <>
                {/* 1. Jumlah Kosan (dari totalAlternatives) */}
                <StatCard 
                    title="Total Kosan Terdaftar" 
                    value={summaryData.totalAlternatives || 0} 
                    icon={Building2} 
                    trend="Data terbaru" 
                    delay={0.1} 
                />
                
                {/* 2. Pengguna Aktif (dari activeUsers) */}
                <StatCard 
                    title="Pengguna Aktif" 
                    value={summaryData.activeUsers || 0} 
                    icon={Users} 
                    trend="Minggu ini" 
                    delay={0.2} 
                />
                
                {/* 3. Jumlah Kriteria (dari totalCriteria) */}
                <StatCard 
                    title="Jumlah Kriteria" 
                    value={summaryData.totalCriteria || 'N/A'} 
                    icon={Sliders} 
                    delay={0.3} 
                />
                
                {/* 4. Nilai TOPSIS Tertinggi (dihitung dari topsisData) */}
                <StatCard 
                    title="Nilai TOPSIS Tertinggi" 
                    value={highestTopsis.value ? highestTopsis.value.toFixed(4) : '0.0000'} 
                    icon={Trophy} 
                    trend={highestTopsis.name} 
                    delay={0.4} 
                />
            </>
        )
    }

    return (
        <div className="flex">
            <Sidebar />

            <div className="ml-64 w-full min-h-screen bg-background">
                <Header />

                <main className="pt-24 pb-8 px-6">
                    {/* Page Title */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                        <p className="text-foreground/60 mt-2">Ringkasan statistik sistem SPK TOPSIS</p>
                    </motion.div>

                    {/* Statistics Cards */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    >
                        {renderStatCard()}
                    </motion.div>

                    {/* Charts Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {/* TOPSIS Values Chart */}
                        <Card className="lg:col-span-2 p-6 hover:shadow-lg transition-shadow">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold text-foreground">Nilai Preferensi TOPSIS</h2>
                                <p className="text-sm text-foreground/60">Perbandingan nilai TOPSIS untuk setiap kosan</p>
                            </div>
                            {renderChartOrSkeleton(
                                topsisData.length === 0 ? (
                                    <div className="flex h-[300px] items-center justify-center text-foreground/50">
                                        ⚠️ Tidak ada data kosan untuk ditampilkan.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={topsisData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" vertical={false} />
                                            <XAxis 
                                                dataKey="name" 
                                                stroke="hsl(var(--color-foreground))" 
                                                angle={-15} 
                                                textAnchor="end" 
                                                height={60}
                                            />
                                            <YAxis stroke="hsl(var(--color-foreground))" domain={[0, 1]} />
                                            <Tooltip content={<CustomTooltip />} />
                                            {/* Data Key menggunakan 'value' sesuai interface TopsisData */}
                                            <Bar dataKey="value" name="Nilai TOPSIS" fill="hsl(var(--color-primary))" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ), 300
                            )}
                        </Card>

                        {/* Status Box */}
                        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20 p-6 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                                    <TrendingUp className="text-primary" size={24} />
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">Status Data</h3>
                                <p className="text-sm text-foreground/60">Sistem terupdate dengan data terbaru dari database.</p>
                            </div>
                            {/* Loading / Success Indicator */}
                            <motion.div
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 2, repeat: isLoading ? Number.POSITIVE_INFINITY : 0 }}
                                className="mt-4 flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-accent" />
                                        <span className="text-xs text-accent">Memuat data...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className={`w-2 h-2 ${isDataUpdated ? 'bg-green-500' : 'bg-red-500'} rounded-full`} />
                                        <span className={`text-xs ${isDataUpdated ? 'text-green-500' : 'text-red-500'}`}>
                                            {isDataUpdated ? 'Data berhasil diperbarui' : 'Gagal memuat data terakhir'}
                                        </span>
                                    </>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    )
}