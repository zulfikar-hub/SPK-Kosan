"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, Menu, X, Bot, LogOut, User, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  /** * LOGIKA AUTH UTAMA
   * Default: false (User dianggap belum login saat pertama masuk)
   */
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  // Simulasi cek login (misal dari LocalStorage atau Session)
  useEffect(() => {
    const userSession = localStorage.getItem("isLoggedIn");
    if (userSession === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    window.location.href = "/"; // Redirect ke beranda setelah logout
  };

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Tentang", href: "/about" },
    { 
      name: "Tanya Kami", 
      href: "/faq", 
      icon: <Bot className="w-4 h-4" />
    },  
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* SISI KIRI: LOGO */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center transition-all group-hover:shadow-lg group-hover:shadow-primary/30">
                <span className="text-primary-foreground font-bold text-lg">T</span>
              </div>
              <span className="font-bold text-xl tracking-tight">TOPSIS Kosan</span>
            </Link>
          </div>

          {/* TENGAH: NAVIGASI (Desktop) */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-4 py-2 rounded-full text-sm font-medium transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="relative z-10">{link.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 bg-primary/10 rounded-full"
                        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* SISI KANAN: LOGIN/LOGOUT LOGIC */}
          <div className="flex items-center gap-3">
            
            {!isLoggedIn ? (
              /* JIKA BELUM LOGIN: Tampilkan Tombol Login */
              <Button asChild variant="default" className="rounded-full px-6 shadow-md hover:scale-105 transition-transform">
                <Link href="/auth">
                  <LogIn className="w-4 h-4 mr-2" /> Login
                </Link>
              </Button>
            ) : (
              /* JIKA SUDAH LOGIN: Tampilkan Menu Profil & Logout */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border border-primary/20">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">User Aktif</p>
                      <p className="text-xs text-muted-foreground leading-none">user@mail.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href="/dashboard" className="flex w-full cursor-pointer items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" /> Profil Saya
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer font-medium"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* MOBILE MENU TOGGLE */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* MOBILE NAV OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-0 w-full bg-background border-b md:hidden shadow-xl z-50 p-4"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "p-3 rounded-xl text-base font-medium transition-all",
                    pathname === link.href ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t mt-2">
                {!isLoggedIn ? (
                  <Button asChild className="w-full justify-start rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
                    <Link href="/auth">
                      <LogIn className="w-5 h-5 mr-3" /> Login Sekarang
                    </Link>
                  </Button>
                ) : (
                  <Button variant="destructive" className="w-full justify-start rounded-xl" onClick={handleLogout}>
                    <LogOut className="w-5 h-5 mr-3" /> Logout
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}