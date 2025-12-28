"use client";

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
  const [identifier, setIdentifier] = useState(""); // email atau username
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Login gagal");
        setIsLoading(false);
        return;
      }

      // Redirect sesuai role
      if (data.role?.toLowerCase() === "admin") {
        window.location.href = "/admin";
        return;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert("Terjadi kesalahan server");
    }

    setIsLoading(false);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
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
      className="max-w-md mx-auto p-4"
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{config.title}</h1>
          <p className="text-sm text-slate-600">{config.subtitle}</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          variants={itemVariants}
          className="backdrop-blur-xl bg-white/40 border border-white/20 rounded-2xl p-8 shadow-xl"
        >
          <motion.form onSubmit={handleSubmit} className="space-y-5" variants={containerVariants}>
            {/* Identifier Input */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Email atau Username</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="nama@kosan.com atau username"
                  className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-white/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {/* Login Button */}
            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white font-semibold rounded-xl ${config.hoverFrom} ${config.hoverTo} transition-all`}
            >
              {isLoading ? "Masuk..." : config.buttonText}
            </motion.button>

            {/* Register Link */}
            <motion.div variants={itemVariants} className="text-center">
              <p className="text-slate-600 text-sm">
                Belum punya akun?{" "}
                <button type="button" onClick={onToggleForm} className="text-blue-600 font-semibold">
                  Daftar sekarang
                </button>
              </p>
            </motion.div>
          </motion.form>
        </motion.div>

        {/* Back Button */}
        <motion.button
          variants={itemVariants}
          onClick={onBackToRole}
          className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-slate-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke pemilihan tipe akun
        </motion.button>
      </motion.div>
    </motion.div>
  );
}