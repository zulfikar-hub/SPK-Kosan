"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

type CriteriaData = {
  name: string
  bobot: number
  atribut: string
}

interface CriteriaModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CriteriaData) => void
  editingCriteria?: CriteriaData
}


export function CriteriaModal({ isOpen, onClose, onSubmit, editingCriteria }: CriteriaModalProps) {
  const [name, setName] = useState("")
  const [bobot, setBobot] = useState(0.1)
  const [atribut, setAtribut] = useState("Benefit")

  useEffect(() => {
    if (editingCriteria) {
      setName(editingCriteria.name)
      setBobot(editingCriteria.bobot)
      setAtribut(editingCriteria.atribut)
    }
  }, [editingCriteria])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, bobot: Number.parseFloat(bobot.toString()), atribut })
    setName("")
    setBobot(0.1)
    setAtribut("Benefit")
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-lg border border-border p-6 w-full max-w-md shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {editingCriteria ? "Edit Kriteria" : "Tambah Kriteria Baru"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Nama Kriteria</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: Harga, Jarak, Fasilitas"
              className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Bobot ({bobot.toFixed(2)})</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={bobot}
              onChange={(e) => setBobot(Number.parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-foreground/60 mt-1">Range 0.1 - 1.0</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Jenis Atribut</label>
            <select
              value={atribut}
              onChange={(e) => setAtribut(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            >
              <option value="Benefit">Benefit (Semakin tinggi semakin baik)</option>
              <option value="Cost">Cost (Semakin rendah semakin baik)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Batal
            </Button>
            <Button type="submit" className="flex-1">
              {editingCriteria ? "Simpan Perubahan" : "Tambah Kriteria"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
