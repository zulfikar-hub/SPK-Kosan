"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { AnimatedBackground } from "@/components/auth/animated-background"
import { RoleSelector } from "@/components/auth/role-selector"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [role, setRole] = useState<"user" | "admin" | null>(null)

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <AnimatedBackground />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">

          {/* STEP 1 — Belum pilih role */}
          {role === null && (
            <RoleSelector onRoleSelect={(r) => setRole(r)} />
          )}

          {/* STEP 2 — Sudah pilih role */}
          {role !== null && (
            <>
              {isLogin ? (
                <LoginForm
                  role={role}
                  onToggleForm={() => setIsLogin(false)}
                  onBackToRole={() => setRole(null)}
                />
              ) : (
                <RegisterForm
                  role={role}
                  onToggleForm={() => setIsLogin(true)}
                  onBackToRole={() => setRole(null)}
                />
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
