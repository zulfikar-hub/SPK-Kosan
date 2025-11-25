import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import Link from "next/link";

export function Navigation() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  T
                </span>
              </div>
              <span className="font-bold text-xl">TOPSIS Kosan</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Beranda
              </Link>
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Tentang
              </Link>
              <Link
                href="/faq"
                className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                FAQ
              </Link>
            </div>
          </div>

          {/* Tombol kanan */}
          <div className="flex items-center space-x-4">
            {/* Icon Login */}
            <Link
              href="/auth"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition"
            >
              <LogIn className="w-5 h-5" />
              <span className="hidden sm:block text-sm">Login</span>
            </Link>

            {/* Button Mulai Sekarang */}
            <Button asChild>
              <Link href="/dashboard">Mulai Sekarang</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
