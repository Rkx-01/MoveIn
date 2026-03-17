"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, ShieldCheck, GraduationCap, Navigation2, Info } from "lucide-react";
import { motion } from "framer-motion";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  image?: string;
  isVerified?: boolean;
  safetyScore?: number;
  distanceFromCollege?: number;
  nearbyColleges?: string;
}

export function PropertyCard({ 
  id, 
  title, 
  location, 
  price, 
  image, 
  isVerified = true,
  safetyScore = 9.5,
  distanceFromCollege = 0.8,
}: PropertyCardProps) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative"
    >
      <Link href={`/properties/${id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] bg-stone-100 shadow-premium transition-all duration-500 group-hover:shadow-hover">
          {image ? (
            <img 
              src={image} 
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const fallbacks = [
                  '/properties/room1.jpg',
                  '/properties/room2.jpg',
                  '/properties/room3.jpg',
                  '/properties/room4.jpg'
                ];
                // Use a stable fallback based on the property ID to avoid flickering
                const index = Math.abs(id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % fallbacks.length;
                target.src = fallbacks[index];
                target.onerror = null; // Prevent infinite loop
              }}
            />
          ) : (
            <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400">
              No Image
            </div>
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/80 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" />

          {/* Top Badges */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
            {isVerified ? (
              <div className="glass-premium px-4 py-2 rounded-full flex items-center gap-2">
                <ShieldCheck size={14} className="text-brand-green" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-charcoal">Verified</span>
              </div>
            ) : (
              <div className="bg-brand-charcoal/50 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/20">
                <Info size={14} className="text-stone-300" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Unverified</span>
              </div>
            )}
            <button className="w-10 h-10 rounded-full glass-premium flex items-center justify-center text-brand-charcoal hover:text-brand-red pointer-events-auto transition-all duration-300">
              <Heart size={20} className="group-hover:fill-brand-red group-hover:stroke-brand-red" />
            </button>
          </div>

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-8 left-8 right-8 text-white transform transition-transform duration-500 group-hover:translate-y-[-8px]">
            <div className="flex items-center gap-2 mb-2">
               <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest">
                 {safetyScore} Safety Score
               </span>
            </div>
            <h3 className="font-heading font-black text-2xl leading-tight mb-2 tracking-tighter">
              {title}
            </h3>
            <div className="flex items-center gap-4 text-white/70">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                <MapPin size={12} /> {(location || "").split(',')[0] || "Pune"}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                <GraduationCap size={12} /> {distanceFromCollege} KM
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between items-center px-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-1">Monthly Pricing</span>
            <div className="flex items-baseline gap-1">
               <span className="font-heading font-black text-2xl text-brand-charcoal tracking-tighter italic">₹{price.toLocaleString()}</span>
               <span className="text-sm font-bold text-stone-400"> / mo</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-charcoal flex items-center justify-center text-white transition-all duration-500 group-hover:bg-brand-red group-hover:rotate-12">
             <Navigation2 size={20} className="fill-current" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
