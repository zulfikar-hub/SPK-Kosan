import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f9fafb",
        border: "#e5e7eb",
        card: "#ffffff",
        sidebar: "#1f2937",
        "sidebar-foreground": "#d1d5db",
        "sidebar-accent": "#3b82f6",
        "sidebar-accent-foreground": "#ffffff",
        accent: "#10b981",
        destructive: "#ef4444",
        primary: "#3b82f6",
        "primary-foreground": "#ffffff",
        muted: "#9ca3af",
      },
    },
  },
  plugins: [],
}

export default config
