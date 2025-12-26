"use client"

import { Bell, User } from "lucide-react"
import { motion } from "framer-motion"

export function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="fixed top-0 right-0 left-64 h-16 border-b border-border bg-card flex items-center justify-between px-6 z-40"
    >
      <div className="flex-1" />

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 text-foreground/60 hover:text-foreground transition-colors"
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
        </motion.button>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">Admin Sistem</p>
            <p className="text-xs text-foreground/60">Administrator</p>
          </div>
          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <User size={18} />
          </div>
        </div>
      </div>
    </motion.header>
  )
}
