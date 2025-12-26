"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import  Label  from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AddKosanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: KosanFormData) => void
  editingData?: KosanFormData & { id?: number }
}

export interface KosanFormData {
  nama: string
  harga: number
  jarak: number
  fasilitas: number
  rating: number
  sistem_keamanan: number
  description?: string
}


export function AddKosanModal({ open, onOpenChange, onSubmit, editingData }: AddKosanModalProps) {
  const [formData, setFormData] = useState<KosanFormData>(
    editingData || {
      nama: "",
      harga: 0,
      jarak: 0,
      fasilitas: 0,
      rating: 0,
      sistem_keamanan: 0,
      description: "",
    }
  )

 const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({ nama: "", harga: 0, jarak: 0, fasilitas: 0, rating: 0, sistem_keamanan: 0, description: "" })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
<DialogContent
  className="
    sm:max-w-[800px]
    max-h-[85vh]
    overflow-y-auto
    p-6
    rounded-2xl
    shadow-xl
  "
>        <DialogHeader>
          <DialogTitle>{editingData ? "Edit Kosan" : "Tambah Kosan Baru"}</DialogTitle>
          <DialogDescription>
            {editingData ? "Update informasi kosan" : "Masukkan detail kosan baru ke sistem"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Kosan</Label>
            <Input
              id="nama"
              placeholder="Contoh: Kosan A"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="harga">Harga (Rp)</Label>
            <Input
              id="harga"
              type="number"
              value={formData.harga}
              onChange={(e) => setFormData({ ...formData, harga: Number(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jarak">Jarak (km)</Label>
            <Input
              id="jarak"
              type="number"
              value={formData.jarak}
              onChange={(e) => setFormData({ ...formData, jarak: Number(e.target.value) })}
              required
            />
          </div>

            <div className="space-y-2">
            <Label htmlFor="fasilitas">Fasilitas (nilai)</Label>
            <Input
              id="fasilitas"
              type="number"
              value={formData.fasilitas}
              onChange={(e) => setFormData({ ...formData, fasilitas: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input
                id="rating"
                type="number"
                placeholder="Contoh: 4.8"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number.parseFloat(e.target.value) })}
                min="0"
                max="5"
                step="0.1"
                required
              />
            </div>

            <div className="space-y-2">
            <Label htmlFor="sistem_keamanan">Sistem Keamanan</Label>
            <Input
              id="sistem_keamanan"
              type="number"
              value={formData.sistem_keamanan}
              onChange={(e) =>
                setFormData({ ...formData, sistem_keamanan: Number(e.target.value) })
              }
              required
            />
          </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Textarea
              id="description"
              placeholder="Deskripsikan fasilitas atau informasi penting lainnya..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit">{editingData ? "Update Kosan" : "Tambah Kosan"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
