"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import  Label  from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export interface KosanFormData {
  nama: string
  harga: number
  jarak: number
  fasilitas: number
  rating: number
  sistem_keamanan: number
  description?: string
}

interface AddKosanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: KosanFormData) => void
  editingData?: KosanFormData & { id?: number }
}

export function AddKosanModal({ open, onOpenChange, onSubmit, editingData }: AddKosanModalProps) {
  const initialData: KosanFormData = {
    nama: "", harga: 0, jarak: 0, fasilitas: 3, rating: 4, sistem_keamanan: 3, description: ""
  }

  const [formData, setFormData] = useState<KosanFormData>(initialData)

  useEffect(() => {
    if (open) {
      setFormData(editingData ? { ...editingData, description: editingData.description ?? "" } : initialData)
    }
  }, [editingData, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl">{editingData ? "Edit Data Kosan" : "Tambah Kosan Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); onOpenChange(false); }} className="space-y-5">
          
          {/* Input Teks & Angka Biasa */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Nama Kosan</Label>
              <Input value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} required />
            </div>
            <div className="space-y-1">
              <Label>Harga (Rp/Bulan)</Label>
              <Input type="number" value={formData.harga || ""} onChange={(e) => setFormData({...formData, harga: Number(e.target.value)})} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Jarak ke Kampus (km)</Label>
              <Input type="number" step="0.1" value={formData.jarak || ""} onChange={(e) => setFormData({...formData, jarak: Number(e.target.value)})} required />
            </div>
            <div className="space-y-1">
              <Label>Rating User (1-5)</Label>
              <Input type="number" step="0.1" min="1" max="5" value={formData.rating || ""} onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})} required />
            </div>
          </div>

          {/* Pilihan Skor Fasilitas (Klik Langsung) */}
          <div className="space-y-2">
            <Label>Kualitas Fasilitas (1-5)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant={formData.fasilitas === num ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setFormData({ ...formData, fasilitas: num })}
                >
                  {num}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic">1: Sangat Minim, 5: Mewah</p>
          </div>

          {/* Pilihan Keamanan (Klik Langsung) */}
          <div className="space-y-2">
            <Label>Tingkat Keamanan (1-5)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant={formData.sistem_keamanan === num ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setFormData({ ...formData, sistem_keamanan: num })}
                >
                  {num}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic">1: Gembok, 3: CCTV+Jaga, 5: Security 24 Jam</p>
          </div>

          <div className="space-y-1">
            <Label>Deskripsi Tambahan</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit">{editingData ? "Update Data" : "Simpan Kosan"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}