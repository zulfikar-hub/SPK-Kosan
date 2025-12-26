"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

export interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  children: React.ReactNode
}

export function Select({ value, onValueChange, placeholder, disabled, children }: SelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm shadow-sm
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-60"
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {children}
      </select>

      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
    </div>
  )
}

export function SelectTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>
}

export function SelectValue() {
  return null
}
