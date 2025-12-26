"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface RootProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({ open, onOpenChange, children }: RootProps) {
  return (
    <AnimatePresence>
      {open && (
        <AlertDialogContext.Provider value={{ open, onOpenChange }}>
          {children}
        </AlertDialogContext.Provider>
      )}
    </AnimatePresence>
  );
}

const AlertDialogContext = React.createContext<{
  open: boolean;
  onOpenChange?: (open: boolean) => void;
} | null>(null);

function useAlertDialog() {
  const ctx = React.useContext(AlertDialogContext);
  if (!ctx) throw new Error("AlertDialog components must be used inside <AlertDialog>");
  return ctx;
}

// -----------------------------------------------------
// BACKDROP + WRAPPER
// -----------------------------------------------------

export function AlertDialogContent({ children }: { children: React.ReactNode }) {
  const { onOpenChange } = useAlertDialog();

  return (
    <>
      {/* Background Overlay */}
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onOpenChange?.(false)}
      />

      {/* Card */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 px-4"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="w-full max-w-md bg-white/70 backdrop-blur-xl shadow-xl border border-white/30 rounded-2xl p-6 relative">
          {/* Close Button */}
          <button
            onClick={() => onOpenChange?.(false)}
            className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {children}
        </div>
      </motion.div>
    </>
  );
}

// -----------------------------------------------------
// STRUCTURE
// -----------------------------------------------------

export function AlertDialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2 mb-4">{children}</div>;
}

export function AlertDialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold text-slate-900">{children}</h2>;
}

export function AlertDialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-600">{children}</p>;
}

// -----------------------------------------------------
// BUTTONS
// -----------------------------------------------------

export function AlertDialogCancel({ children }: { children: React.ReactNode }) {
  const { onOpenChange } = useAlertDialog();

  return (
    <button
      onClick={() => onOpenChange?.(false)}
      className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition"
    >
      {children}
    </button>
  );
}

export function AlertDialogAction({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const { onOpenChange } = useAlertDialog();

  function handleClick() {
    onClick?.();
    onOpenChange?.(false);
  }

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition ${className}`}
    >
      {children}
    </button>
  );
}
