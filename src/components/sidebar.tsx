"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Users, Sliders, Home, LogOut, Building2, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    label: "Data Kosan",
    href: "/admin/kosan",
    icon: Building2,
  },
  {
    label: "Data Kriteria",
    href: "/admin/criteria",
    icon: Sliders,
  },
  {
    label: "Kelola Pengguna",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Grafik Analisis",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Chatbot SPK",
    href: "/admin/chatbot",
    icon: MessageCircle,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col"
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-primary text-sidebar-primary-foreground rounded-lg flex items-center justify-center font-bold text-lg">
            S
          </div>
          <div>
            <h1 className="font-semibold text-lg">SPK TOPSIS</h1>
            <p className="text-xs text-sidebar-foreground/60">Kosan</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <motion.button
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200">
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </motion.aside>
  )
}
