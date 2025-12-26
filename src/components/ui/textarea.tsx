import * as React from "react"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}

      <textarea
        {...props}
        className={`w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm shadow-sm 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none
          ${error ? "border-red-500" : ""}
          ${className}`}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
