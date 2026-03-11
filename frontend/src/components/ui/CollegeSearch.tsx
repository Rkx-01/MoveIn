"use client";
import React, { useState, useEffect, useRef } from "react";
import { GraduationCap, Search, MapPin, Loader2, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";
import { getApiUrl } from "@/lib/api";

interface College {
  college_id: string;
  name: string;
  area: string;
  city: {
    name: string;
  };
}

export function CollegeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchColleges = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(getApiUrl(`colleges?q=${encodeURIComponent(query)}`));
        const json = await response.json();
        if (json.success) {
          setResults(json.data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchColleges, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (college: College) => {
    setQuery(college.name);
    setIsOpen(false);
    router.push(`/properties?college_id=${college.college_id}`);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex-1 flex items-center px-6 md:px-8 gap-4">
        <GraduationCap className="text-stone-300 shrink-0" size={28} />
        <input 
          type="text" 
          placeholder="Enter your College hub (e.g. COEP, MIT-WPU)" 
          className="w-full h-16 bg-transparent focus:outline-none font-heading font-black text-2xl tracking-tighter text-brand-charcoal placeholder:text-stone-200"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        {isLoading && <Loader2 className="animate-spin text-brand-red" size={24} />}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-6 bg-white rounded-[32px] shadow-hover border border-stone-100 overflow-hidden z-50 p-2"
          >
            <div className="max-h-[350px] overflow-y-auto space-y-1">
              {results.map((college, i) => (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={college.college_id}
                  onClick={() => handleSelect(college)}
                  className="w-full px-6 py-5 text-left hover:bg-brand-sand rounded-[24px] flex items-center justify-between group transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-300 group-hover:bg-brand-red group-hover:text-white transition-all">
                       <MapPin size={18} />
                    </div>
                    <div>
                      <p className="font-heading font-black text-lg text-brand-charcoal tracking-tight group-hover:text-brand-red transition-colors">{college.name}</p>
                      <p className="text-[9px] text-stone-400 font-black flex items-center gap-1 uppercase tracking-widest mt-1">
                        Located in {college.area}, {college.city.name}
                      </p>
                    </div>
                  </div>
                  <Search size={18} className="text-stone-100 group-hover:text-brand-red transition-all" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-6 bg-brand-charcoal rounded-[40px] shadow-hover p-12 text-center z-50 border-[6px] border-white/5"
          >
            <div className="relative z-10">
               <div className="w-16 h-16 bg-white/10 rounded-[20px] flex items-center justify-center mx-auto mb-8">
                  <Navigation size={32} className="text-brand-red animate-pulse" />
               </div>
               <p className="text-white font-heading font-black italic text-3xl tracking-tighter mb-4 leading-none">Market Expansion <br/>In Progress.</p>
               <p className="text-white/40 font-bold mb-8 max-w-xs mx-auto text-sm">We're currently live in Pune only. Mumbai, Bangalore & Delhi hubs launch in Q3 2026.</p>
               
               <div className="flex flex-col items-center gap-3">
                  <Button className="h-12 px-8 rounded-full bg-brand-red text-white font-black text-[10px] uppercase tracking-widest">
                     Notify Me on Launch
                  </Button>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mt-4">Safe. Verified. On-ground.</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
