"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import axios from "axios"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit2, Trash2, Plus } from "lucide-react"
import { AddCriteriaModal, type CriteriaFormData } from "@/components/add-criteria-modal"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"

interface Criterion {
  id_kriteria: number
  nama_kriteria: string
  tipe: "benefit" | "cost"
  bobot: number
  deskripsi: string
}

export default function CriteriaPage() {
  const [criteria, setCriteria] = useState<Criterion[]>([])
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editData, setEditData] = useState<Criterion | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Ambil data kriteria dari API
  const fetchCriteria = async () => {
    try {
      const res = await axios.get("/api/kriteria")
      setCriteria(res.data)
    } catch (err) {
      console.error(err)
      toast.error("Gagal mengambil data kriteria")
    }
  }

  useEffect(() => {
    fetchCriteria()
  }, [])

  // Tambah kriteria
  const handleAddCriteria = async (data: CriteriaFormData) => {
    try {
      const res = await axios.post("/api/kriteria", {
        nama_kriteria: data.nama,
        bobot: data.bobot,
        tipe: data.tipe,
        deskripsi: data.deskripsi,
      })
      setCriteria((prev) => [...prev, res.data.data])
      toast.success("Kriteria berhasil ditambahkan")
    } catch (err) {
      console.error(err)
      toast.error("Gagal menambahkan kriteria")
    }
  }

  // Update kriteria
  const handleUpdateCriteria = async (id: number, data: CriteriaFormData) => {
  try {
    const res = await axios.put("/api/kriteria", {
      id_kriteria: id,
      nama_kriteria: data.nama,
      tipe: data.tipe,
      bobot: data.bobot,
      deskripsi: data.deskripsi,
    });

    const updated = res.data.data;
    setCriteria(prev =>
      prev.map(c => (c.id_kriteria === id ? { ...c, ...updated } : c))
    );
    toast.success("Kriteria berhasil diupdate");
  } catch (err) {
    console.error(err);
    toast.error("Gagal update kriteria");
  }
};


  // Hapus kriteria
  const handleDeleteCriteria = async (id: number) => {
    try {
      await axios.delete(`/api/kriteria?id=${id}`)
      setCriteria(prev => prev.filter(c => c.id_kriteria !== id))
      setDeleteModalOpen(false)
      setSelectedId(null)
      toast.success("Kriteria berhasil dihapus")
    } catch (err) {
      console.error(err)
      toast.error("Gagal menghapus kriteria")
    }
  }

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-8 px-6">
          {/* Page Title */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Data Kriteria</h1>
                <p className="text-foreground/60 mt-2">Kelola kriteria untuk penilaian SPK TOPSIS</p>
              </div>
              <Button className="gap-2" onClick={() => setAddModalOpen(true)}>
                <Plus size={20} />
                Tambah Kriteria
              </Button>
            </div>
          </motion.div>

          {/* Criteria Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold">Nama Kriteria</TableHead>
                      <TableHead className="font-semibold">Tipe</TableHead>
                      <TableHead className="font-semibold text-center">Bobot (%)</TableHead>
                      <TableHead className="font-semibold">Deskripsi</TableHead>
                      <TableHead className="font-semibold text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criteria.map((item, index) => (
                      <motion.tr
                        key={item.id_kriteria}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">{item.nama_kriteria}</TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              item.tipe === "benefit"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {item.tipe === "benefit" ? "Benefit" : "Cost"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">{(item.bobot * 100).toFixed(0)}%</TableCell>
                        <TableCell className="text-foreground/70">{item.deskripsi}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground/70 hover:text-foreground"
                              onClick={() => {
                                setEditData(item)
                                setEditModalOpen(true)
                              }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors text-red-600 dark:text-red-400"
                              onClick={() => {
                                setSelectedId(item.id_kriteria)
                                setDeleteModalOpen(true)
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </motion.div>

          {/* Summary Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg"
          >
            <p className="text-sm text-foreground/70">
              <span className="font-semibold">Total Bobot:</span>{" "}
              {(criteria.reduce((sum, c) => sum + (Number(c.bobot) || 0), 0) * 100).toFixed(0)}%
              {" - "}
              {(criteria.reduce((sum, c) => sum + (Number(c.bobot) || 0), 0) * 100).toFixed(0) === "100"
                ? "Sistem siap untuk analisis SPK TOPSIS"
                : "Bobot harus 100%"}
            </p>
          </motion.div>

          {/* Modals */}
          <AddCriteriaModal
  open={addModalOpen || editModalOpen}
  onOpenChange={(open) => {
    if (!open) setEditModalOpen(false);
    setAddModalOpen(open && !editModalOpen);
  }}
  defaultValues={editData ? {
    nama: editData.nama_kriteria,
    tipe: editData.tipe,
    bobot: editData.bobot,
    deskripsi: editData.deskripsi
  } : undefined}
  onSubmit={(data) => {
    if (editData) {
      handleUpdateCriteria(editData.id_kriteria, data);
      setEditData(null);
      setEditModalOpen(false);
    } else {
      handleAddCriteria(data);
      setAddModalOpen(false);
    }
  }}
/>
          <DeleteConfirmationModal
            open={deleteModalOpen}
            onOpenChange={setDeleteModalOpen}
            title="Hapus Kriteria"
            description="Apakah Anda yakin ingin menghapus kriteria ini? Tindakan ini tidak dapat dibatalkan."
            onConfirm={() => selectedId && handleDeleteCriteria(selectedId)}
          />
        </main>
      </div>
    </div>
  )
}
