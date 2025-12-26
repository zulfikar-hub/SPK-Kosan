"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Label from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export interface CriteriaFormData {
  nama: string
  tipe: "benefit" | "cost"
  bobot: number
  deskripsi: string
}

export interface AddCriteriaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CriteriaFormData) => void
  defaultValues?: CriteriaFormData
}

export function AddCriteriaModal({ open, onOpenChange, onSubmit, defaultValues }: AddCriteriaModalProps) {
  const [formData, setFormData] = useState<CriteriaFormData>({
    nama: "",
    tipe: "benefit",
    bobot: 0.2,
    deskripsi: "",
  });

  // reset form saat modal dibuka atau defaultValues berubah
  useEffect(() => {
    if (defaultValues) {
      setFormData(defaultValues)
    } else {
      setFormData({ nama: "", tipe: "benefit", bobot: 0.2, deskripsi: "" })
    }
  }, [defaultValues, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{defaultValues ? "Edit Kriteria" : "Tambah Kriteria Baru"}</DialogTitle>
          <DialogDescription>
            {defaultValues ? "Ubah detail kriteria untuk sistem SPK TOPSIS" : "Masukkan detail kriteria untuk sistem SPK TOPSIS"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Kriteria</Label>
            <Input
              id="nama"
              placeholder="Contoh: Harga"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipe">Tipe Kriteria</Label>
            <Select
              value={formData.tipe}
              onValueChange={(value) => setFormData({ ...formData, tipe: value as "benefit" | "cost" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="benefit">Benefit (Semakin tinggi semakin baik)</SelectItem>
                <SelectItem value="cost">Cost (Semakin rendah semakin baik)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bobot">Bobot (%)</Label>
            <Input
              id="bobot"
              type="number"
              placeholder="Contoh: 20"
              value={formData.bobot * 100}
              onChange={(e) => setFormData({ ...formData, bobot: Number(e.target.value) / 100 })}
              min="1"
              max="100"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              placeholder="Jelaskan kriteria ini..."
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit">{defaultValues ? "Update Kriteria" : "Simpan Kriteria"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
