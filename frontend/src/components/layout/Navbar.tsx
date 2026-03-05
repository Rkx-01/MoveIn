"use client";
import Link from "next/link";
import { Button } from "../ui/Button";
import { Menu, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const checkAuth = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user", e);
        }
      } else {
        setUser(null);
      }
    };

    checkAuth();
    window.addEventListener("auth-change", checkAuth);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("auth-change", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.refresh();
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-6 px-6 md:px-12",
        scrolled ? "glass-premium py-4 shadow-premium" : "bg-transparent py-8"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
             <div className="w-10 h-10 rounded-[12px] bg-brand-charcoal flex items-center justify-center text-white transition-all duration-500 group-hover:bg-brand-red group-hover:rotate-[15deg] group-hover:scale-110">
                <span className="font-heading font-black text-xl">M.</span>
             </div>
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-green border-2 border-[var(--background)] rounded-full" />
          </div>
          <span className="font-heading font-black text-2xl tracking-tighter text-brand-charcoal hidden sm:block">
            MoveIn<span className="text-brand-red">.</span>
          </span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-10">
          <nav className="flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-stone-500">
            <Link href="/properties" className="hover:text-brand-red transition-colors relative group">
              Explore Stays
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand-red transition-all group-hover:w-full" />
            </Link>
            <Link href="/safety" className="hover:text-brand-red transition-colors relative group">
              Safety First
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand-red transition-all group-hover:w-full" />
            </Link>
            <Link href="/process" className="hover:text-brand-red transition-colors relative group">
               Our Process
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand-red transition-all group-hover:w-full" />
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-charcoal">{user.name}</span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-stone-400">{user.role}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden md:flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-brand-charcoal hover:text-brand-red transition-colors">
              <User size={14} /> Partner Access
            </Link>
          )}
          
          <Button variant="ghost" size="icon" className="lg:hidden text-brand-charcoal">
            <Menu size={24} />
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
