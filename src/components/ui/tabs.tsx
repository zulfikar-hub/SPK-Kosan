import React, { createContext, useContext, useState, ReactNode, FC } from "react";

// 1. Context untuk menyimpan state tab aktif
interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

// 2. Interface Tabs - Sekarang mendukung Controlled (value) dan Uncontrolled (defaultValue)
interface TabsProps {
  defaultValue?: string;
  value?: string;           // Mendukung state dari luar
  onValueChange?: (value: string) => void; // Fungsi untuk mengubah state dari luar
  children: ReactNode;
  className?: string;
}

export const Tabs: FC<TabsProps> = ({ defaultValue, value, onValueChange, children, className }) => {
  // State internal untuk menangani jika user tidak pakai props 'value'
  const [internalTab, setInternalTab] = useState(defaultValue || "");

  // Tentukan tab mana yang aktif: 
  // Jika ada props 'value', pakai itu. Jika tidak, pakai state internal.
  const activeTab = value !== undefined ? value : internalTab;

  const handleTabChange = (newValue: string) => {
    // Jalankan fungsi dari props jika ada
    if (onValueChange) {
      onValueChange(newValue);
    }
    // Update state internal
    setInternalTab(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

// 3. TabsList - Tetap sama seperti punya kamu
interface TabsListProps {
  children: ReactNode;
  className?: string;
}
export const TabsList: FC<TabsListProps> = ({ children, className }) => {
  return (
    <div className={`inline-flex h-12 items-center justify-center rounded-xl bg-slate-100 p-1.5 text-slate-500 shadow-sm ${className || ""}`}>
      {children}
    </div>
  );
};

// 4. TabsTrigger - Tetap menggunakan logika klik kamu
interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}
// --- Update bagian TabsTrigger ---
export const TabsTrigger: FC<TabsTriggerProps> = ({ value, children, className }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used inside Tabs");

  const { activeTab, setActiveTab } = context;

  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
        activeTab === value
          ? "bg-white text-blue-600 shadow-sm" // Efek tombol yang "keluar" saat aktif
          : "hover:bg-slate-200/50 hover:text-slate-700"
      } ${className || ""}`}
    >
      {children}
    </button>
  );
};

// 5. TabsContent - Menampilkan konten jika activeTab cocok
interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}
export const TabsContent: FC<TabsContentProps> = ({ value, children, className }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used inside Tabs");

  const { activeTab } = context;

  if (activeTab !== value) return null;

  return <div className={className}>{children}</div>;
};