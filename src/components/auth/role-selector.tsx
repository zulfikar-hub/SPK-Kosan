"use client"

import { motion, Variants } from "framer-motion"
import { User, Settings } from "lucide-react"

interface RoleSelectorProps {
  onRoleSelect: (role: "user" | "admin") => void
}

export function RoleSelector({ onRoleSelect }: RoleSelectorProps) {

  // 🟦 Tambahkan tipe Variants di semua variants

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 },
    },
    tap: {
      scale: 0.98,
    },
  }

  return (
    <motion.div
      key="role-selector"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">

        {/* HEADER */}
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              KosanHub
            </h1>
          </div>
          <p className="text-sm text-slate-600">Pilih tipe akun Anda</p>
        </motion.div>

        {/* ROLE CARDS */}
        <motion.div variants={itemVariants} className="space-y-4">

          {/* USER */}
          <motion.button
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => onRoleSelect("user")}
            className="w-full text-left backdrop-blur-xl bg-white/40 border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 text-white">
                  <User className="w-6 h-6" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800">Pencari Kosan</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Cari dan pesan kamar kosan sesuai kebutuhan Anda dengan mudah
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs bg-blue-100/60 text-blue-700 px-2 py-1 rounded-full">Cari kamar</span>
                  <span className="text-xs bg-blue-100/60 text-blue-700 px-2 py-1 rounded-full">Booking</span>
                  <span className="text-xs bg-blue-100/60 text-blue-700 px-2 py-1 rounded-full">Pembayaran</span>
                </div>
              </div>
              <div className="flex-shrink-0 text-blue-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </motion.button>

          {/* ADMIN */}
          <motion.button
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => onRoleSelect("admin")}
            className="w-full text-left backdrop-blur-xl bg-white/40 border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 text-white">
                  <Settings className="w-6 h-6" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800">Pemilik/Pengelola</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Kelola properti kosan Anda, terima booking, dan pantau pendapatan
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs bg-purple-100/60 text-purple-700 px-2 py-1 rounded-full">Kelola kamar</span>
                  <span className="text-xs bg-purple-100/60 text-purple-700 px-2 py-1 rounded-full">Booking</span>
                  <span className="text-xs bg-purple-100/60 text-purple-700 px-2 py-1 rounded-full">Laporan</span>
                </div>
              </div>
              <div className="flex-shrink-0 text-purple-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </motion.button>

        </motion.div>

        {/* FOOTER */}
        <motion.div variants={itemVariants} className="text-center text-xs text-slate-500 space-y-1">
          <p>Sistem manajemen kosan yang aman dan terpercaya</p>
          <p>© 2025 KosanHub. Semua hak dilindungi.</p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
