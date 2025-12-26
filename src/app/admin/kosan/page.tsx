"use client"

import { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Building2,
    MapPin,
    DollarSign,
    Users,
    Star,
    Eye,
    ToggleLeft as Toggle2,
    Plus,
    Edit2,
    Trash2,
    Shield,
} from "lucide-react"
import axios from "axios"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AddKosanModal, type KosanFormData } from "@/components/add-kosan-modal"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"

// ----------------------------------------------------
// 📌 PERBAIKAN: Update Interface Kosan sesuai skema baru (status_operasional, status_ketersediaan)
// ----------------------------------------------------
interface HasilTopsis {
    id_hasil: number
    id_kosan: number
    nilai_preferensi: number
    ranking: number
}

interface Kosan {
    id_kosan: number
    nama: string
    harga: number
    jarak: number
    fasilitas: number
    rating: number
    sistem_keamanan: number
    hasiltopsis?: HasilTopsis[] // ⬅️ ARRAY
    ranking: number
    // 📌 PERBAIKAN 1: Ganti 'status' menjadi field yang baru
    status_operasional: "AKTIF" | "INAKTIF"
    status_ketersediaan: "TERSEDIA" | "PENUH" | "PERAWATAN" 
    description?: string | null
    createdAt?: string
    updatedAt?: string
}

// ----------------------------------------------------
// KOMPONEN UTAMA
// ----------------------------------------------------

export default function KosanPage() {
    const [kosanList, setKosanList] = useState<Kosan[]>([]);
    const [selectedKosan, setSelectedKosan] = useState<Kosan | null>(null)
    // 📌 PERBAIKAN 2: Ganti kosanStatus state untuk melacak status_operasional
    const [kosanStatus, setKosanStatus] = useState<Record<number, string>>({}) 
    const [addModalOpen, setAddModalOpen] = useState(false)
    const [editingKosan, setEditingKosan] = useState<Kosan | null>(null)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null)
    const [searchText, setSearchText] = useState('');
    
    // --- Load Data Awal
    useEffect(() => {
        const loadData = async () => {
            let fetchedKosanData: Kosan[] = []; 

            try {
                // Endpoint API seharusnya mengembalikan data lengkap termasuk hasil TOPSIS
                const kosanRes = await fetch("/api/kosan", { cache: "no-store" });
                if (!kosanRes.ok) {
                    throw new Error(`Gagal fetch /api/kosan. Status: ${kosanRes.status}`);
                }

                const rawData = await kosanRes.json();
                if (!Array.isArray(rawData)) {
                    console.error("API /api/kosan tidak mengembalikan Array.", rawData);
                } else {
                    fetchedKosanData = rawData as Kosan[];
                }
                
                setKosanList(fetchedKosanData); 
                
                // 📌 PERBAIKAN 3: Ambil status_operasional
                const statusMap: Record<number, string> = {};
                fetchedKosanData.forEach((k) => (statusMap[k.id_kosan] = k.status_operasional));
                setKosanStatus(statusMap);

            } catch (err) {
                console.error("Gagal load kosan", err);
                toast.error("Gagal memuat data kosan!");
                
                setKosanList([]); 
                setKosanStatus({});
            }
        };

        loadData();
    }, []);
    
    // --- helper tampilkan warna TOPSIS (menggunakan nilai_preferensi)
    const getTopsisColor = (score: number) => {
        if (score >= 0.85) return "text-green-600"
        if (score >= 0.75) return "text-blue-600"
        if (score >= 0.65) return "text-yellow-600"
        return "text-red-600"
    }

    // 📌 PERBAIKAN 4: Sesuaikan getStatusColor dengan ENUM baru ('AKTIF'/'INAKTIF')
    const getStatusColor = (status: string) => {
        return status === "AKTIF" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    }

    // --- Normalisasi kriteria (Logika ini tetap aman, hanya menggunakan angka kriteria)
    const criteriaRange = useMemo(() => {
        // ... (Logika criteriaRange tetap sama)
        if (!Array.isArray(kosanList) || kosanList.length === 0) {
            return {
                harga: { min: 0, max: 1 },
                jarak: { min: 0, max: 1 },
                fasilitas: { min: 0, max: 1 },
                rating: { min: 0, max: 5 },
                keamanan: { min: 0, max: 1 },
            }
        }

        const MIN_MAX = {
            harga: { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY },
            jarak: { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY },
            fasilitas: { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY },
            rating: { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY },
            keamanan: { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY },
        }

        kosanList.forEach((k) => {
            MIN_MAX.harga.min = Math.min(MIN_MAX.harga.min, k.harga)
            MIN_MAX.harga.max = Math.max(MIN_MAX.harga.max, k.harga)
            MIN_MAX.jarak.min = Math.min(MIN_MAX.jarak.min, k.jarak)
            MIN_MAX.jarak.max = Math.max(MIN_MAX.jarak.max, k.jarak)
            MIN_MAX.fasilitas.min = Math.min(MIN_MAX.fasilitas.min, k.fasilitas)
            MIN_MAX.fasilitas.max = Math.max(MIN_MAX.fasilitas.max, k.fasilitas)
            MIN_MAX.rating.min = Math.min(MIN_MAX.rating.min, k.rating)
            MIN_MAX.rating.max = Math.max(MIN_MAX.rating.max, k.rating)
            MIN_MAX.keamanan.min = Math.min(MIN_MAX.keamanan.min, k.sistem_keamanan)
            MIN_MAX.keamanan.max = Math.max(MIN_MAX.keamanan.max, k.sistem_keamanan)
        })

        return MIN_MAX
    }, [kosanList])

    function normalize(value: number, min: number, max: number, invert = false) {
        if (max === min) return 1 
        const normalized = (value - min) / (max - min)
        return invert ? 1 - normalized : normalized
    }

    const selectedNormalized = useMemo(() => {
        if (!selectedKosan) return null
        return {
            harga: normalize(selectedKosan.harga, criteriaRange.harga.min, criteriaRange.harga.max, true), 
            jarak: normalize(selectedKosan.jarak, criteriaRange.jarak.min, criteriaRange.jarak.max, true), 
            fasilitas: normalize(selectedKosan.fasilitas, criteriaRange.fasilitas.min, criteriaRange.fasilitas.max, false),
            rating: normalize(selectedKosan.rating, criteriaRange.rating.min, criteriaRange.rating.max, false),
            keamanan: normalize(selectedKosan.sistem_keamanan, criteriaRange.keamanan.min, criteriaRange.keamanan.max, false),
        }
    }, [selectedKosan, criteriaRange])
    // --- End Normalisasi

    // --- Recalculate TOPSIS (Muat Ulang Data)
    const recalculateTopsis = async () => {
        try {
            const res = await fetch("/api/topsis/calculate", { method: "POST" });
            if (!res.ok) throw new Error(`Gagal menghitung TOPSIS. Status: ${res.status}`);

            // Ambil data kosan terbaru (sudah termasuk hasiltopsis)
            const kosanRes = await fetch("/api/kosan", { cache: "no-store" });
            if (!kosanRes.ok) throw new Error(`Gagal fetch kosan. Status: ${kosanRes.status}`);
            
            const kosanData = await kosanRes.json(); 
            if (Array.isArray(kosanData)) {
                setKosanList(kosanData as Kosan[]);
                // Perbarui state status lokal
                const statusMap: Record<number, string> = {};
                kosanData.forEach((k: Kosan) => (statusMap[k.id_kosan] = k.status_operasional));
                setKosanStatus(statusMap);
            } else {
                setKosanList([]); 
                console.error("API /api/kosan tidak mengembalikan Array data yang diharapkan.", kosanData);
                toast.error("Format data TOPSIS yang diterima tidak valid.");
            }

        } catch (err) {
            console.error("Kesalahan saat menghitung ulang TOPSIS:", err);
            toast.error("Gagal menghitung ulang TOPSIS");
            setKosanList([]); 
        }
    };

    // --- Tambah kosan 
    const handleAddKosan = async (data: KosanFormData) => {
        try {
            const res = await fetch("/api/kosan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            
            if (!res.ok) throw new Error(`Gagal menambah kosan. Status: ${res.status}`);

            setAddModalOpen(false);
            toast.success("Kosan berhasil ditambahkan!");
            await recalculateTopsis();
        } catch (err) {
            console.error("Gagal menambah kosan", err);
            toast.error("Gagal menambah kosan!");
        }
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    // --- Edit kosan
    const handleEditKosan = async (data: KosanFormData) => {
        if (!editingKosan) return;

        try {
            // 📌 PERBAIKAN 5: Perbaiki URL fetch (mengirim PUT ke /api/kosan yang akan dihandle oleh API PUT)
            // Note: API backend /api/kosan menganggap PUT untuk update data atau toggle status
            const res = await fetch(`/api/kosan`, {
                method: "PUT", 
                headers: { "Content-Type": "application/json" },
                // Kirim id_kosan dan data yang diupdate
                body: JSON.stringify({ id_kosan: editingKosan.id_kosan, ...data }), 
            });
            
            if (!res.ok) throw new Error(`Gagal mengedit kosan. Status: ${res.status}`);

            setAddModalOpen(false);
            setEditingKosan(null);
            toast.success("Kosan berhasil diupdate!");

            await recalculateTopsis();
        } catch (err) {
            console.error("Gagal mengedit kosan", err);
            toast.error("Gagal mengedit kosan!");
        }
    };

    // --- Delete kosan
    const handleDeleteKosan = async (id_kosan: number) => {
        try {
            // 📌 PERBAIKAN 6: Menggunakan URL Query Parameter untuk DELETE
            const res = await fetch(`/api/kosan?id=${id_kosan}`, { method: "DELETE" }); 
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`Gagal menghapus kosan. Status: ${res.status}. Pesan: ${errorData.error || 'Unknown error'}`);
            }

            setDeleteModalOpen(false);
            setSelectedDeleteId(null);
            toast.success("Kosan berhasil dihapus!");

            await recalculateTopsis(); 
        } catch (err) {
            console.error("Gagal menghapus kosan", err);
            const errorMessage = err instanceof Error ? err.message : "Gagal menghapus data kosan!";
            toast.error(errorMessage);
        }
    };

    // --- Toggle status kosan
    const handleStatusToggle = async (id_kosan: number) => {
        try {
            // Kirim request PUT ke /api/kosan dengan toggleStatus: true
            const res = await axios.put("/api/kosan", { id_kosan, toggleStatus: true });
            
            if (res.status !== 200) {
                throw new Error(`Gagal mengubah status. Status: ${res.status}`);
            }
            // 📌 PERBAIKAN 7: Akses status_operasional dari response data
            const updatedKosan = res.data.data; 
            
            // Pembaruan Status Lokal Instan
            setKosanList(prev =>
                Array.isArray(prev) 
                    ? prev.map(k => (
                        k.id_kosan === id_kosan 
                            ? { 
                                ...k, 
                                status_operasional: updatedKosan.status_operasional, // Gunakan status_operasional baru
                                hasiltopsis: k.hasiltopsis 
                            } 
                            : k
                    ))
                : []
            );
            
            // Perbarui status map untuk Summary
            setKosanStatus(prev => ({
                ...prev, 
                [id_kosan]: updatedKosan.status_operasional
            }));

            toast.success("Status berhasil diubah!");

            await recalculateTopsis(); // Lakukan recalc TOPSIS setelah update status
        } catch (err) {
            console.error("Gagal toggle status:", err);
            toast.error("Gagal mengubah status!");
        }
    };

    // helper untuk menampilkan rata-rata TOPSIS
    const averageTopsis = useMemo(() => {
        if (!Array.isArray(kosanList) || kosanList.length === 0) {
            return 0;
        }
        const vals = kosanList.map((k) => 
            Number(k.hasiltopsis?.[0]?.nilai_preferensi ?? 0)
        );
        const validVals = vals.filter((v) => v > 0);
        if (validVals.length === 0) return 0;
        const sum = validVals.reduce((a, b) => a + b, 0);
        return sum / validVals.length; 

    }, [kosanList]);

    const displayedKosan = useMemo(() => {
        if (!Array.isArray(kosanList) || kosanList.length === 0) {
            return [];
        }
        const searchLower = searchText.toLowerCase().trim();
        if (!searchLower) {
            return kosanList; 
        }
        return kosanList.filter((k) => {
            const nameMatches = k.nama.toLowerCase().includes(searchLower);
            return nameMatches; 
        });
        
    }, [kosanList, searchText]);

    return (
        <div className="flex">
            <Sidebar />

            <div className="ml-64 w-full min-h-screen bg-background"> {/* 📌 Tambah w-full */}
                <Header />

                <main className="pt-24 pb-8 px-6">
                    {/* Page Title */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Data Kosan</h1>
                                <p className="text-foreground/60 mt-2">Kelola dan lihat analisis data kosan dengan TOPSIS scores</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="text"
                                    placeholder="Cari nama kosan..."
                                    value={searchText} 
                                    onChange={handleSearch} 
                                    className="border p-2 rounded-md bg-card focus:border-primary transition-colors"
                                />

                                <Button
                                    className="gap-2"
                                    onClick={() => {
                                        setEditingKosan(null)
                                        setAddModalOpen(true)
                                    }}
                                >
                                    <Plus size={20} />
                                    Tambah Kosan
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        {/* Total Kosan */}
                        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-foreground/60">Total Kosan</p>
                                    <p className="text-2xl font-bold text-foreground">{kosanList.length}</p>
                                </div>
                                <Building2 className="text-blue-600 dark:text-blue-400" size={32} />
                            </div>
                        </Card>

                        {/* Kosan Aktif */}
                        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-foreground/60">Kosan Aktif</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {/* 📌 PERBAIKAN 8: Cek status_operasional === "AKTIF" */}
                                        {kosanList.filter((k) => k.status_operasional === "AKTIF").length}
                                    </p>
                                </div>
                                <Toggle2 className="text-green-600 dark:text-green-400" size={32} />
                            </div>
                        </Card>

                        {/* Rata-rata TOPSIS */}
                        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-foreground/60">Rata-rata TOPSIS</p>
                                    <p className="text-2xl font-bold text-foreground">{(Number(averageTopsis) || 0).toFixed(2)
                                    }</p>
                                </div>
                                <Star className="text-purple-600 dark:text-purple-400" size={32} />
                            </div>
                        </Card>

                        {/* Rating Tertinggi */}
                        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-foreground/60">Rating Tertinggi</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {kosanList.length > 0 ? Math.max(...kosanList.map((k) => k.rating)).toFixed(1) : 'N/A'}
                                    </p>
                                </div>
                                <Star className="text-orange-600 dark:text-orange-400" size={32} fill="currentColor" />
                            </div>
                        </Card>
                    </div>

                    {/* Table */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <Card className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
            <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                    {/* Hati-hati dengan whitespace di sini. Jika error, gabungkan baris TH */}
                    <TableHead className="text-center font-semibold">Rank</TableHead>
                    <TableHead className="font-semibold">Nama Kosan</TableHead>
                    <TableHead className="font-semibold">Jarak (km)</TableHead>
                    <TableHead className="text-center font-semibold">Harga</TableHead>
                    <TableHead className="text-center font-semibold">Fasilitas</TableHead>
                    <TableHead className="text-center font-semibold">Rating</TableHead>
                    <TableHead className="text-center font-semibold">Keamanan</TableHead>
                    <TableHead className="text-center font-semibold">TOPSIS Score</TableHead>
                    <TableHead className="text-center font-semibold">Status Operasional</TableHead>
                    <TableHead className="text-center font-semibold">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {displayedKosan.length > 0 ? (
                    displayedKosan.map((kosan) => {
                        const currentStatus = kosanStatus[kosan.id_kosan] || kosan.status_operasional;
const topsisValue = Number(
  kosan.hasiltopsis?.[0]?.nilai_preferensi ?? 0
);                        
                        return (
                            // BARIS <tr> DIKOMPRES SEDIKIT AGAR LEBIH AMAN DARI WHITESPACE
                            <TableRow key={kosan.id_kosan} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedKosan(kosan)}>
                                {/* Ranking */}
                                <TableCell className="text-center font-bold text-primary">
  {kosan.hasiltopsis?.[0]?.ranking ?? "-"}
                                </TableCell>

                                {/* Nama Kosan */}
                                <TableCell className="min-w-[200px]">
                                    <span className="font-medium">{kosan.nama}</span>
                                </TableCell>

                                {/* Jarak */}
                                <TableCell className="text-sm text-foreground/70">
                                    {kosan.jarak} km
                                </TableCell>

                                {/* Harga */}
                                <TableCell className="min-w-[150px]">
                                    <span className="font-medium">Rp {Number(kosan.harga).toLocaleString('id-ID')}</span> 
                                </TableCell>

                                {/* Fasilitas */}
                                <TableCell className="text-center text-sm font-medium">
                                    {kosan.fasilitas}
                                </TableCell>

                                {/* Rating */}
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Star size={16} className="text-yellow-500" fill="currentColor" />
                                        <span className="font-medium text-sm">{kosan.rating}</span>
                                    </div>
                                </TableCell>

                                {/* Keamanan */}
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-sm">
                                        <Shield size={16} className="text-blue-600" />
                                        <span className="font-medium text-foreground/70 max-w-[130px] truncate">
                                            {kosan.sistem_keamanan}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* Nilai TOPSIS */}
                                <TableCell className="text-center">
                                    <span className={`font-bold text-lg ${getTopsisColor(topsisValue)}`}>
                                        {topsisValue.toFixed(2)}
                                    </span>
                                </TableCell>

                                {/* Status Operasional */}
                                <TableCell className="text-center">
                                    <Badge className={getStatusColor(currentStatus)}>
                                        {currentStatus === "AKTIF" ? "Aktif" : "Non-aktif"} 
                                    </Badge>
                                </TableCell>

                                {/* Aksi */}
                                {/* Bagian Aksi sangat rentan terhadap whitespace di antara tombol */}
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        {/* Detail */}
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedKosan(kosan); }} title="Lihat detail" className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                                            <Eye size={18} className="text-primary" />
                                        </button>

                                        {/* Edit */}
                                        <button onClick={(e) => { e.stopPropagation(); setEditingKosan(kosan); setAddModalOpen(true); }} title="Edit kosan" className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors text-blue-600 dark:text-blue-400">
                                            <Edit2 size={18} />
                                        </button>

                                        {/* Delete */}
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedDeleteId(kosan.id_kosan); setDeleteModalOpen(true); }} title="Hapus kosan" className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors text-red-600 dark:text-red-400">
                                            <Trash2 size={18} />
                                        </button>

                                        {/* Toggle Status */}
                                        <button onClick={(e) => { e.stopPropagation(); handleStatusToggle(kosan.id_kosan); }} title="Ubah status operasional" className="p-2 hover:bg-muted rounded-lg transition-colors">
                                            <Toggle2 size={18} className="text-foreground/60" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })
                ) : (
                    // Kasus Data Kosong
                    <TableRow>
                        <TableCell colSpan={10} className="text-center py-6 text-foreground/60">
                            {kosanList.length === 0 && searchText === '' ? "Tidak ada data kosan yang ditemukan." : "Data tidak ditemukan."}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Detail Modal (Perlu disesuaikan) */}
                    {selectedKosan && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                            onClick={() => setSelectedKosan(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.95, y: 20 }}
                                className="bg-card rounded-lg border border-border p-6 max-w-2xl w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-foreground">{selectedKosan.nama}</h2>
                                    <button
                                        onClick={() => setSelectedKosan(null)}
                                        className="text-foreground/60 hover:text-foreground text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <p className="text-sm text-foreground/60 mb-1">Status Operasional</p>
                                        <Badge className={getStatusColor(selectedKosan.status_operasional)}>
                                            {selectedKosan.status_operasional === "AKTIF" ? "Aktif" : "Non-aktif"}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground/60 mb-1">Status Ketersediaan</p>
                                        <Badge className={selectedKosan.status_ketersediaan === "TERSEDIA" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                            {selectedKosan.status_ketersediaan}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground/60 mb-1">Jarak</p>
                                        <p className="font-semibold text-foreground flex items-center gap-2">
                                            <MapPin size={18} className="text-primary" />
                                            {selectedKosan.jarak} km
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground/60 mb-1">Harga</p>
                                        <p className="font-semibold text-foreground flex items-center gap-2">
                                            <DollarSign size={18} className="text-green-600" />
                                            Rp {Number(selectedKosan.harga).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground/60 mb-1">Fasilitas</p>
                                        <p className="font-semibold text-foreground flex items-center gap-2">
                                            <Users size={18} className="text-blue-600" />
                                            {selectedKosan.fasilitas} item
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground/60 mb-1">Rating</p>
                                        <p className="font-semibold text-foreground flex items-center gap-2">
                                            <Star size={18} className="text-yellow-500" fill="currentColor" />
                                            {selectedKosan.rating} / 5.0
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-foreground/60 mb-1">Sistem Keamanan</p>
                                        <p className="font-semibold text-foreground flex items-center gap-2">
                                            <Shield size={18} className="text-blue-600" />
                                            {selectedKosan.sistem_keamanan}
                                        </p>
                                    </div>
                                </div>

                                {/* Bagian kriteria: (logic normalisasi tetap sama) */}
                                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                                    <h3 className="font-semibold text-foreground mb-4">Score per Kriteria (tampilan)</h3>
                                    <div className="space-y-3">
                                        {/* Harga (Cost) */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-foreground/70">Harga (Cost)</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-32 bg-border rounded-full h-2">
                                                    <div
                                                        className="bg-primary h-full rounded-full transition-all"
                                                        style={{ width: `${((selectedNormalized?.harga ?? 0) * 100).toFixed(2)}%` }}
                                                    />
                                                </div>
                                                <span className="font-semibold text-foreground w-12 text-right">
                                                    {((selectedNormalized?.harga ?? normalize(selectedKosan.harga, criteriaRange.harga.min, criteriaRange.harga.max, true)) ).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Jarak (Cost) */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-foreground/70">Jarak (Cost)</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-32 bg-border rounded-full h-2">
                                                    <div
                                                        className="bg-primary h-full rounded-full transition-all"
                                                        style={{ width: `${((selectedNormalized?.jarak ?? 0) * 100).toFixed(2)}%` }}
                                                    />
                                                </div>
                                                <span className="font-semibold text-foreground w-12 text-right">
                                                    {((selectedNormalized?.jarak ?? normalize(selectedKosan.jarak, criteriaRange.jarak.min, criteriaRange.jarak.max, true))).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Fasilitas (Benefit) */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-foreground/70">Fasilitas (Benefit)</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-32 bg-border rounded-full h-2">
                                                    <div
                                                        className="bg-primary h-full rounded-full transition-all"
                                                        style={{ width: `${((selectedNormalized?.fasilitas ?? 0) * 100).toFixed(2)}%` }}
                                                    />
                                                </div>
                                                <span className="font-semibold text-foreground w-12 text-right">
                                                    {((selectedNormalized?.fasilitas ?? normalize(selectedKosan.fasilitas, criteriaRange.fasilitas.min, criteriaRange.fasilitas.max, false))).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Rating (Benefit) */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-foreground/70">Rating (Benefit)</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-32 bg-border rounded-full h-2">
                                                    <div
                                                        className="bg-primary h-full rounded-full transition-all"
                                                        style={{ width: `${((selectedNormalized?.rating ?? 0) * 100).toFixed(2)}%` }}
                                                    />
                                                </div>
                                                <span className="font-semibold text-foreground w-12 text-right">
                                                    {((selectedNormalized?.rating ?? normalize(selectedKosan.rating, criteriaRange.rating.min, criteriaRange.rating.max, false))).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Keamanan (Benefit) */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-foreground/70">Keamanan (Benefit)</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-32 bg-border rounded-full h-2">
                                                    <div
                                                        className="bg-primary h-full rounded-full transition-all"
                                                        style={{ width: `${((selectedNormalized?.keamanan ?? 0) * 100).toFixed(2)}%` }}
                                                    />
                                                </div>
                                                <span className="font-semibold text-foreground w-12 text-right">
                                                    {((selectedNormalized?.keamanan ?? normalize(selectedKosan.sistem_keamanan, criteriaRange.keamanan.min, criteriaRange.keamanan.max, false))).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedKosan.description && (
                                    <div>
                                        <p className="text-sm text-foreground/60 mb-2">Deskripsi</p>
                                        <p className="text-foreground">{selectedKosan.description}</p>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
                                    <Button variant="outline" onClick={() => setSelectedKosan(null)}>
                                        Tutup
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Modals */}
                    <AddKosanModal
                        open={addModalOpen}
                        onOpenChange={setAddModalOpen}
                        onSubmit={editingKosan ? handleEditKosan : handleAddKosan}
                        editingData={
                            editingKosan
                                ? {
                                    ...editingKosan,
                                    description: editingKosan.description ?? ""
                                }
                                : undefined
                        } 
                    />

                    <DeleteConfirmationModal
                        open={deleteModalOpen}
                        onOpenChange={(open) => {
                            setDeleteModalOpen(open)
                            if (!open) setSelectedDeleteId(null)
                        }}
                        title="Hapus Kosan"
                        description="Apakah Anda yakin ingin menghapus kosan ini? Tindakan ini tidak dapat dibatalkan."
                        onConfirm={() => {
                            if (selectedDeleteId) handleDeleteKosan(selectedDeleteId)
                        }}
                        onCancel={() => {
                            setDeleteModalOpen(false)
                            setSelectedDeleteId(null)
                        }}
                    />

                </main>
            </div>
        </div>
    )
}