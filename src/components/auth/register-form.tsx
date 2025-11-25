"use client"

import type React from "react"

import { useState } from "react"
import { motion, easeOut } from "framer-motion"
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react"

interface RegisterFormProps {
  onToggleForm: () => void
}

export function RegisterForm({ onToggleForm }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulasi proses registrasi
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
}
  return (
    <motion.div
      key="register"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Header */}
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
          <p className="text-sm text-slate-600">Buat akun baru Anda sekarang</p>
        </motion.div>

        {/* Glassmorphism Card */}
        <motion.div
          variants={itemVariants}
          className="backdrop-blur-xl bg-white/40 border border-white/20 rounded-2xl p-8 shadow-xl"
        >
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Full Name Input */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Nama Lengkap</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 transition-colors group-focus-within:text-blue-600" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nama lengkap Anda"
                  className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-sm placeholder-slate-400 text-slate-800"
                />
              </div>
              <p className="text-xs text-slate-500">Nama yang akan ditampilkan di profil Anda</p>
            </motion.div>

            {/* Email Input */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 transition-colors group-focus-within:text-blue-600" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@kosan.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-sm placeholder-slate-400 text-slate-800"
                />
              </div>
              <p className="text-xs text-slate-500">Email akan digunakan untuk login</p>
            </motion.div>

            {/* Password Input */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Kata Sandi</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 transition-colors group-focus-within:text-blue-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-white/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-sm placeholder-slate-400 text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-500">Minimal 8 karakter dengan kombinasi huruf dan angka</p>
            </motion.div>

            {/* Confirm Password Input */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Konfirmasi Kata Sandi</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 transition-colors group-focus-within:text-blue-600" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-white/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-sm placeholder-slate-400 text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-500">Harus sama dengan kata sandi di atas</p>
            </motion.div>

            {/* Terms & Conditions */}
            <motion.div variants={itemVariants} className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-500 cursor-pointer accent-blue-500 mt-0.5"
                />
                <span className="text-xs text-slate-600 group-hover:text-slate-800 transition-colors leading-relaxed">
                  Saya setuju dengan{" "}
                  <span className="text-blue-600 font-medium hover:underline">Syarat & Ketentuan</span> dan{" "}
                  <span className="text-blue-600 font-medium hover:underline">Kebijakan Privasi</span> KosanHub
                </span>
              </label>
            </motion.div>

            {/* Register Button */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  </motion.div>
                  Mendaftar...
                </>
              ) : (
                "Buat Akun"
              )}
            </motion.button>

            {/* Divider */}
            <motion.div variants={itemVariants} className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/40 text-slate-500">atau</span>
              </div>
            </motion.div>

            {/* Login Link */}
            <motion.div variants={itemVariants} className="text-center">
              <p className="text-slate-600 text-sm">
                Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={onToggleForm}
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Masuk di sini
                </button>
              </p>
            </motion.div>
          </motion.form>
        </motion.div>

        {/* Footer Info */}
        <motion.div variants={itemVariants} className="text-center text-xs text-slate-500 space-y-1">
          <p>Sistem manajemen kosan yang aman dan terpercaya</p>
          <p>© 2025 KosanHub. Semua hak dilindungi.</p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
