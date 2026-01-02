"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, Menu, X, Bot, LogOut, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
// Import Dropdown Menu dari Shadcn
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
  
  // SIMULASI STATE LOGIN: Gantilah ini dengan logika auth asli kamu (misal dari context/session)
  const [isLoggedIn, setIsLoggedIn] = useState(true); 

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Tentang", href: "/about" },
    { 
      name: "Tanya Kami", 
      href: "/faq", 
      icon: <Bot className="w-4 h-4 transition-transform group-hover:rotate-12" />
    },  
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* LOGO SECTION */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">T</span>
              </div>
              <span className="font-bold text-xl tracking-tight">TOPSIS Kosan</span>
            </Link>
          </div>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300",
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {link.name}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 bg-primary/10 rounded-full"
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT SECTION: AUTH & MENU */}
          <div className="flex items-center space-x-3">
            
            {isLoggedIn ? (
              /* USER LOGGED IN: Profile Dropdown */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src="https://github.com/shadcn.png" alt="Admin" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Admin Kosan</p>
                      <p className="text-xs leading-none text-muted-foreground">admin@topsis.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" /> Pengaturan
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                    onClick={() => setIsLoggedIn(false)}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Keluar (Logout)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* USER NOT LOGGED IN: Login Link */
              <div className="flex items-center space-x-2">
                 <Link
                  href="/auth"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Button asChild size="sm" className="rounded-full px-5 shadow-lg shadow-primary/20">
                  <Link href="/dashboard">Mulai</Link>
                </Button>
              </div>
            )}

            {/* MOBILE MENU BUTTON */}
            <button 
              className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE NAV OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-16 left-0 w-full bg-background border-b md:hidden shadow-xl z-50 overflow-hidden"
          >
            <div className="flex flex-col p-4 space-y-2 bg-background">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl text-base font-medium transition-colors",
                    pathname === link.href ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  )}
                >
                  {link.name}
                  {link.icon}
                </Link>
              ))}
              <hr className="my-2 border-muted" />
              
              {isLoggedIn ? (
                <button
                  className="flex items-center p-3 text-red-600 font-medium hover:bg-red-50 rounded-xl transition-colors"
                  onClick={() => {
                    setIsLoggedIn(false);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-5 h-5 mr-3" /> Logout
                </button>
              ) : (
                <Link
                  href="/auth"
                  className="flex items-center p-3 text-foreground font-medium hover:bg-muted rounded-xl transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5 mr-3" /> Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}