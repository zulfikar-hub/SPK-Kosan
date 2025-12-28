"use client";

import type React from "react";
import { useState } from "react";
import { motion, Variants, easeOut } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

interface LoginFormProps {
  role: "user" | "admin" | null;
  onToggleForm: () => void;
  onBackToRole: () => void;
}

export function LoginForm({ role, onToggleForm, onBackToRole }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Login gagal");
      setIsLoading(false);
      return;
    }

    // Token sudah di-set di cookie HTTP-only
    // Redirect sesuai role
    if (data.role?.toLowerCase() === "admin") {
      window.location.href = "/admin";
      return;
    }

    window.location.href = "/dashboard";

  } catch (error) {
    console.error(error);
    alert("Terjadi kesalahan server");
  }

  setIsLoading(false);
};

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: easeOut },
    },
  };

  const roleConfig = {
    user: {
      title: "Login Pencari Kosan",
      subtitle: "Selamat datang kembali",
      buttonText: "Masuk ke Akun",
      gradientFrom: "from-blue-500",
      gradientTo: "to-blue-600",
      hoverFrom: "hover:from-blue-600",
      hoverTo: "hover:to-blue-700",
    },
    admin: {
      title: "Login Pemilik Kosan",
      subtitle: "Kelola properti Anda",
      buttonText: "Masuk ke Dashboard",
      gradientFrom: "from-purple-500",
      gradientTo: "to-purple-600",
      hoverFrom: "hover:from-purple-600",
      hoverTo: "hover:to-purple-700",
    },
  };

  const config = role ? roleConfig[role] : roleConfig.user;

  return (
    <motion.div
      key="login"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div
              className={`w-10 h-10 bg-gradient-to-br ${role === "admin" ? "from-purple-500 to-purple-600" : "from-blue-500 to-blue-600"} rounded-lg flex items-center justify-center`}
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
            {/* Email Input */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Email atau Username</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 transition-colors group-focus-within:text-blue-600" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@kosan.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-sm placeholder-slate-400 text-slate-800"
                />
              </div>
              <p className="text-xs text-slate-500">Masukkan email atau username Anda</p>
            </motion.div>

            {/* Password Input */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Kata Sandi</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 transition-colors group-focus-within:text-blue-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <p className="text-xs text-slate-500">Kata sandi minimal 8 karakter</p>
            </motion.div>

            {/* Remember Me & Forgot Password */}
            <motion.div variants={itemVariants} className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-500 cursor-pointer accent-blue-500"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Ingat saya</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium">
                Lupa kata sandi?
              </a>
            </motion.div>

            {/* Login Button */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className={`w-full py-3 bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white font-semibold rounded-xl ${config.hoverFrom} ${config.hoverTo} transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  </motion.div>
                  Masuk...
                </>
              ) : (
                config.buttonText
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

            {/* Register Link */}
            <motion.div variants={itemVariants} className="text-center">
              <p className="text-slate-600 text-sm">
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={onToggleForm}
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Daftar sekarang
                </button>
              </p>
            </motion.div>
          </motion.form>
        </motion.div>

        {/* Back to Role Selector */}
        <motion.button
          variants={itemVariants}
          onClick={onBackToRole}
          className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-slate-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke pemilihan tipe akun
        </motion.button>

        {/* Footer Info */}
        <motion.div variants={itemVariants} className="text-center text-xs text-slate-500 space-y-1">
          <p>Sistem manajemen kosan yang aman dan terpercaya</p>
          <p>© 2025 KosanHub. Semua hak dilindungi.</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
