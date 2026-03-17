"use client";
import { Navbar } from "@/components/layout/Navbar";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  ShieldCheck,
  GraduationCap,
  Loader2,
  Navigation,
  Globe,
  Settings2,
  Map as MapIcon,
  LayoutGrid,
  ChevronRight,
  Info
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { getApiUrl } from "@/lib/api";

// Dynamically import Map to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/ui/MapComponent"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-stone-100 rounded-[40px] animate-pulse flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-stone-300">Initializing Proximity Engine...</div>
});

function PropertiesContent() {
  const searchParams = useSearchParams();
  const initialCollegeId = searchParams.get("college_id");

  const [properties, setProperties] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [collegeData, setCollegeData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  
  // Filter States
  const [budget, setBudget] = useState(20000);
  const [gender, setGender] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      let url = getApiUrl(`properties?page=${page}&limit=20&max_budget=${budget}`);
      if (initialCollegeId) url += `&college_id=${initialCollegeId}`;
      if (gender) url += `&gender_preference=${gender}`;
      if (amenities.length > 0) url += `&amenities=${amenities.join(",")}`;

      const response = await fetch(url);
      const json = await response.json();
      if (json.success) {
        setProperties(json.data);
        setTotal(json.meta.total);
      }
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [initialCollegeId, budget, gender, amenities, page]);

  useEffect(() => {
    if (initialCollegeId) {
       fetch(getApiUrl(`colleges/${initialCollegeId}`))
         .then(res => res.json())
         .then(json => {
            if (json.success) setCollegeData(json.data);
         });
    }
  }, [initialCollegeId]);

  const toggleAmenity = (amenity: string) => {
    setAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <main className="min-h-screen bg-brand-sand">
      <Navbar />
      
      <div className="pt-44 pb-32 px-6 md:px-12 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16 px-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-charcoal text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                 <Globe size={14} className="text-brand-red" /> Live Proximity Engine
              </div>
              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
                 <ShieldCheck size={14} /> Pune Hub V1
              </div>
            </div>
            <h1 className="text-4xl md:text-7xl font-heading font-black tracking-[-0.05em] leading-[0.85] text-brand-charcoal">
              {collegeData ? `Near ${collegeData.name}` : "Explore All Stays."}
            </h1>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
             <div className="bg-white px-6 py-4 rounded-[20px] shadow-premium border border-stone-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
                   <Info size={18} />
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">Data Source</p>
                   <p className="text-[10px] font-black uppercase text-brand-charcoal">Google Places Live</p>
                </div>
             </div>

             <div className="flex bg-white p-2 rounded-[24px] border border-stone-100 shadow-premium">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`h-12 px-6 rounded-[18px] flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "grid" ? 'bg-brand-charcoal text-white shadow-premium' : 'text-stone-300 hover:text-brand-charcoal'}`}
                >
                  <LayoutGrid size={16} /> List
                </button>
                <button 
                  onClick={() => setViewMode("map")}
                  className={`h-12 px-6 rounded-[18px] flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "map" ? 'bg-brand-charcoal text-white shadow-premium' : 'text-stone-300 hover:text-brand-charcoal'}`}
                >
                  <MapIcon size={16} /> Map
                </button>
             </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-[340px_1fr] gap-12">
          {/* 1. SIDEBAR FILTERS */}
          <aside className="hidden lg:block space-y-8">
            <div className="bg-white p-10 rounded-[48px] border border-stone-100 shadow-premium sticky top-32">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-stone-300 mb-12 flex items-center gap-3 border-b border-stone-50 pb-6">
                <Settings2 size={16} className="text-brand-red" /> Filter Lab
              </h3>
              
              <div className="space-y-12">
                {/* Budget Range */}
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-charcoal">Monthly Budget</label>
                    <span className="text-lg font-heading font-black italic text-brand-red tracking-tight">₹{(budget/1000).toFixed(0)}k</span>
                  </div>
                  <div className="px-2">
                    <input 
                      type="range" 
                      min="5000" 
                      max="20000" 
                      step="500" 
                      className="w-full accent-brand-red h-[3px] bg-stone-100 rounded-full appearance-none cursor-pointer" 
                      value={budget}
                      onChange={(e) => setBudget(parseInt(e.target.value))}
                    />
                    <div className="flex justify-between mt-4 text-[9px] font-black uppercase tracking-widest text-stone-300">
                      <span>₹5k</span>
                      <span>₹20k</span>
                    </div>
                  </div>
                </div>

                {/* Preference Switcher */}
                <div className="space-y-6">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-charcoal">Gender Preference</label>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: "Boys Hub", value: "Boys" },
                      { label: "Girls Hub", value: "Girls" },
                      { label: "Co-Living", value: "Co-Living" }
                    ].map((pref) => (
                      <button 
                        key={pref.value} 
                        className={`text-[10px] h-12 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 border ${gender === pref.value ? 'bg-brand-charcoal text-white border-brand-charcoal shadow-premium translate-x-1' : 'bg-transparent text-stone-400 border-stone-100 hover:border-brand-red/30'}`}
                        onClick={() => setGender(gender === pref.value ? "" : pref.value)}
                      >
                        {pref.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Essentials Checklist */}
                <div className="space-y-6">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-charcoal">The Essentials</label>
                  <div className="space-y-5">
                    {[
                      { label: "Gigabit Wi-Fi", id: "wifi" },
                      { label: "Ghar Ka Khana", id: "food" },
                      { label: "MoveIn Verified", id: "security" },
                      { label: "Power Backup", id: "power_backup" }
                    ].map((item) => (
                      <label key={item.id} className="flex items-center gap-4 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${amenities.includes(item.id) ? 'bg-brand-red border-brand-red rotate-[15deg] scale-110 shadow-premium' : 'bg-stone-50 border-stone-100 group-hover:border-brand-red/30'}`}>
                           {amenities.includes(item.id) && <ShieldCheck size={14} className="text-white" />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={amenities.includes(item.id)}
                          onChange={() => toggleAmenity(item.id)}
                        />
                        <span className={`text-xs font-black uppercase tracking-widest transition-colors ${amenities.includes(item.id) ? 'text-brand-charcoal' : 'text-stone-300 group-hover:text-stone-500'}`}>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-16 pt-10 border-t border-stone-50">
                 <Button className="w-full h-16 rounded-[24px] bg-brand-charcoal text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-red transition-all duration-500 shadow-premium" onClick={() => fetchProperties()}>
                    Recalibrate Match
                 </Button>
              </div>
            </div>
          </aside>

          {/* 2. MAIN CONTENT AREA */}
          <div className="space-y-12">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                   key="loading"
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   exit={{ opacity: 0 }}
                   className="flex flex-col items-center justify-center py-64 gap-8 bg-white rounded-[60px] border border-stone-100 shadow-premium"
                >
                   <div className="relative">
                      <Loader2 className="animate-spin text-brand-red" size={80} strokeWidth={1.5} />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <span className="font-heading font-black text-xs">M.</span>
                      </div>
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-300">Auditing Real-time Stays</p>
                </motion.div>
              ) : viewMode === "grid" ? (
                <motion.div 
                   key="grid"
                   initial="hidden"
                   animate="show"
                   variants={{
                     hidden: { opacity: 0 },
                     show: {
                       opacity: 1,
                       transition: { staggerChildren: 0.1 }
                     }
                   }}
                   className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16 px-4"
                >
                    {properties.map((prop) => (
                      <motion.div 
                        key={prop.property_id}
                        variants={{
                          hidden: { opacity: 0, scale: 0.95, y: 20 },
                          show: { opacity: 1, scale: 1, y: 0 }
                        }}
                      >
                        <PropertyCard 
                          id={prop.property_id} 
                          title={prop.title} 
                          location={prop.locality} 
                          price={prop.price} 
                          image={prop.photo_urls ? JSON.parse(prop.photo_urls)[0] : "/properties/room1.jpg"}
                          isVerified={prop.is_verified}
                          safetyScore={prop.safety_score}
                          distanceFromCollege={prop.distance_to_college ? parseFloat(prop.distance_to_college.toFixed(1)) : 0.8}
                        />
                      </motion.div>
                    ))}
                    {properties.length === 0 && (
                      <div className="col-span-full py-40 text-center bg-white rounded-[60px] border border-stone-100">
                         <p className="text-4xl font-heading font-black tracking-tighter text-brand-charcoal mb-4">No Verified Hits.</p>
                         <p className="text-stone-400 font-medium max-w-sm mx-auto">Try expanding your budget or changing your hub preferences.</p>
                      </div>
                    )}
                </motion.div>
              ) : (
                <motion.div 
                  key="map"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-[750px] w-full bg-white rounded-[60px] border border-stone-100 shadow-hover p-4 overflow-hidden sticky top-32"
                >
                    <MapComponent 
                      properties={properties} 
                      center={collegeData ? [parseFloat(collegeData.latitude), parseFloat(collegeData.longitude)] : [18.5204, 73.8567]} 
                      college={collegeData}
                    />
                </motion.div>
              )}
            </AnimatePresence>
            
            {!isLoading && properties.length > 0 && (
               <div className="pt-32 flex flex-col items-center gap-4">
                  <div className="w-1 h-20 bg-gradient-to-t from-transparent via-stone-200 to-transparent" />
                  <p className="text-[9px] font-black uppercase tracking-[0.6em] text-stone-300">Live Pune Feed Active</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PropertiesListing() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-brand-sand">
        <Loader2 className="animate-spin text-brand-red" size={48} />
      </div>
    }>
      <PropertiesContent />
    </Suspense>
  );
}
