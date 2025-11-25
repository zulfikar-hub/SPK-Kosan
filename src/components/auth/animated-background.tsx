"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: event.clientX / window.innerWidth, // normalisasi 0-1
        y: event.clientY / window.innerHeight,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Fungsi helper untuk offset objek berdasarkan mouse
  const offset = (base: number, factor: number) => base + factor * (mousePosition.x - 0.5) * 30

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Gradient background elements */}
      <motion.div
        className="absolute top-10 right-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          x: [0, 50, offset(0, 50)],
          y: [0, 80, offset(0, 80)],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          x: [0, -60, offset(0, -60)],
          y: [0, -80, offset(0, -80)],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Animated House */}
      <motion.div
        className="absolute top-20 left-1/4 text-blue-400 opacity-30"
        animate={{
          y: [0, -20, 0],
          x: offset(0, 10), // bergerak sedikit horizontal mengikuti mouse
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <svg className="w-48 h-48" viewBox="0 0 200 200" fill="none">
          <path d="M100 30L160 80L160 170H40L40 80L100 30Z" stroke="currentColor" strokeWidth="2" fill="none" />
          <rect x="80" y="130" width="40" height="40" stroke="currentColor" strokeWidth="2" />
          <rect x="55" y="95" width="25" height="25" stroke="currentColor" strokeWidth="2" />
          <rect x="120" y="95" width="25" height="25" stroke="currentColor" strokeWidth="2" />
          <rect x="55" y="130" width="15" height="15" stroke="currentColor" strokeWidth="1.5" />
          <rect x="130" y="130" width="15" height="15" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </motion.div>

      {/* Animated Key */}
      <motion.div
        className="absolute bottom-32 right-1/4 text-blue-400 opacity-25"
        animate={{
          rotate: [0, 10, -10, 0],
          x: [0, 10, -10, offset(0, 10)],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 14c-1.66 0-3-1.34-3-3 0-1.31.84-2.41 2-2.83V3h6v2h4v2h2v2h-2v4c0 1.66-1.34 3-3 3h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3H7zm0-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
        </svg>
      </motion.div>

      {/* Animated Light Bulb */}
      <motion.div
        className="absolute top-1/3 right-12 text-yellow-300 opacity-20"
        animate={{
          opacity: [0.15, 0.35, 0.15],
          x: offset(0, 5), // sedikit horizontal
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-20C5.1 1 2 4.1 2 8c0 2.4 1.2 4.5 3 5.8V17c0 .5.5 1 1 1h12c.5 0 1-.5 1-1v-3.2c1.8-1.3 3-3.4 3-5.8 0-3.9-3.1-7-7-7z" />
        </svg>
      </motion.div>

      {/* Animated Door/Window */}
      <motion.div
        className="absolute bottom-1/4 left-12 text-blue-400 opacity-20"
        animate={{
          x: [0, 5, -5, offset(0, 5)],
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <svg className="w-36 h-36" viewBox="0 0 200 240" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="30" y="40" width="140" height="160" />
          <rect x="40" y="50" width="120" height="140" />
          <circle cx="145" cy="120" r="5" fill="currentColor" />
          <circle cx="35" cy="80" r="3" fill="currentColor" />
          <circle cx="35" cy="160" r="3" fill="currentColor" />
        </svg>
      </motion.div>

      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 0.6, 0.3],
            x: offset(0, i * 5),
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  )
}
