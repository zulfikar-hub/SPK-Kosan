"use client"

import React, { useState } from "react"
import { motion, Variants } from "framer-motion"
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from "lucide-react"

interface RegisterFormProps {
  role: "user" | "admin" | null
  onToggleForm: () => void
  onBackToRole: () => void
}

export function RegisterForm({ role, onToggleForm, onBackToRole }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: role || "user",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert("Password tidak sama");
    return;
  }

  setIsLoading(true);

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Registrasi gagal");
      return;
    }

    alert("Registrasi berhasil!");
    onToggleForm(); // balik ke login

  } catch  {
    alert("Terjadi kesalahan server");
  } finally {
    setIsLoading(false);
  }
};


  // FIX: gunakan type Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  // FIX: ubah ease: "easeOut" → ease: "easeOut" (valid)
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  const roleConfig = {
    user: {
      title: "Daftar sebagai Pencari Kosan",
      subtitle: "Buat akun baru Anda sekarang",
      buttonText: "Buat Akun",
      gradientFrom: "from-blue-500",
      gradientTo: "to-blue-600",
    },
    admin: {
      title: "Daftar sebagai Pemilik Kosan",
      subtitle: "Daftarkan properti Anda sekarang",
      buttonText: "Buat Akun Pemilik",
      gradientFrom: "from-purple-500",
      gradientTo: "to-purple-600",
    },
  }

  const config = role ? roleConfig[role] : roleConfig.user

  return (
    <motion.div
      key="register"
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">

        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div
              className={`w-10 h-10 bg-gradient-to-br ${
                role === "admin" ? "from-purple-500 to-purple-600" : "from-blue-500 to-blue-600"
              } rounded-lg flex items-center justify-center`}
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              KosanHub
            </h1>
          </div>
          <p className="text-sm text-slate-600">{config.subtitle}</p>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="backdrop-blur-xl bg-white/40 border border-white/20 rounded-2xl p-8 shadow-xl"
        >
          <motion.form onSubmit={handleSubmit} variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">

            {/* Full Name */}
            <motion.div variants={itemVariants}>
              <label className="text-sm font-semibold text-slate-800">Nama Lengkap</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/60 border rounded-xl"
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants}>
              <label className="text-sm font-semibold text-slate-800">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/60 border rounded-xl"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <label className="text-sm font-semibold text-slate-800">Kata Sandi</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/60 border rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </motion.div>

            {/* Confirm Password */}
            <motion.div variants={itemVariants}>
              <label className="text-sm font-semibold text-slate-800">Konfirmasi</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/60 border rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </motion.div>

            {/* Button */}
            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white rounded-xl`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {isLoading ? "Mendaftar..." : config.buttonText}
            </motion.button>

            {/* Login Link */}
            <motion.div variants={itemVariants} className="text-center">
              <button type="button" onClick={onToggleForm} className="text-blue-600 font-semibold">
                Masuk di sini
              </button>
            </motion.div>
          </motion.form>
        </motion.div>

        <motion.button variants={itemVariants} onClick={onBackToRole} className="flex justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
