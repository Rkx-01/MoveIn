"use client";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { 
  ShieldCheck, 
  MapPin, 
  GraduationCap, 
  Wifi, 
  Shield, 
  Users, 
  MessageCircle, 
  CheckCircle2,
  Star,
  ArrowRight,
  Utensils,
  Zap,
  Loader2,
  Navigation,
  Globe,
  Share2,
  Heart,
  Map as MapIcon
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import { motion } from "framer-motion";

export default function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl(`properties/${id}`))
      .then(res => res.json())
      .then(json => {
        if (json.success) setProperty(json.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Fetch failed:", err);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-sand gap-4">
        <Loader2 className="animate-spin text-brand-red" size={56} strokeWidth={1.5} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Fetching Premium Metadata</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-sand">
        <p className="text-xl font-black text-brand-charcoal opacity-20 italic">Data link failed.</p>
      </div>
    );
  }

  const amenities = JSON.parse(property.amenities || "[]");

  return (
    <main className="min-h-screen bg-brand-sand">
      <Navbar />
      
      <div className="pt-44 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Cinematic Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16"
        >
          <div className="flex-1 space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-charcoal text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-premium">
                 <ShieldCheck size={14} className="text-brand-green" /> 25-Point Audit Complete
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
                 <Globe size={14} className="text-brand-red" /> {property.locality} Hub
              </div>
            </div>
            
            <h1 className="text-5xl md:text-[90px] font-heading font-black leading-[0.85] tracking-[-0.05em] text-brand-charcoal">
              {property.title}<span className="text-brand-red">.</span>
            </h1>
            
            <p className="flex items-center gap-3 text-stone-500 font-bold text-lg">
              <MapPin size={22} className="text-brand-red" /> {property.address}
            </p>
          </div>

          <div className="bg-white p-10 rounded-[48px] border border-stone-100 shadow-premium min-w-[380px] relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
             <div className="relative z-10">
                <div className="flex justify-between items-baseline mb-10">
                   <p className="text-5xl font-heading font-black italic text-brand-charcoal tracking-tighter">
                     ₹{property.price.toLocaleString()}
                     <span className="text-xs font-black text-stone-300 not-italic uppercase tracking-[0.2em] ml-2">/ month</span>
                   </p>
                   <div className="flex items-center gap-2 text-sm font-black bg-stone-50 px-3 py-1.5 rounded-2xl">
                       <Star size={16} className="fill-brand-red text-brand-red" /> {property.safety_score}
                   </div>
                </div>
                
                <div className="space-y-3 mb-10">
                   <Button className="w-full h-18 rounded-[24px] bg-brand-red text-white font-black text-xl shadow-premium hover:bg-brand-charcoal transition-all duration-500 gap-3 group/btn">
                     Book Free Visit <ArrowRight size={22} className="group-hover/btn:translate-x-2 transition-transform" />
                   </Button>
                   <Button variant="outline" className="w-full h-18 rounded-[24px] border-2 border-stone-100 font-black text-stone-400 hover:bg-stone-50 transition-all gap-3">
                     <Users size={20} /> Match with Roommates
                   </Button>
                </div>

                <div className="flex items-center justify-between p-6 bg-brand-sand rounded-[32px] border border-stone-100">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-300">Hub Status</p>
                      <p className="text-sm font-black text-brand-charcoal underline decoration-brand-red decoration-2 underline-offset-4">{property.status}</p>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-stone-300 hover:text-brand-red transition-colors cursor-pointer shadow-sm">
                      <Share2 size={18} />
                   </div>
                </div>
             </div>
          </div>
        </motion.div>

        {/* Cinematic Asymmetrical Gallery */}
        <div className="grid md:grid-cols-4 grid-rows-2 gap-8 h-[700px] mb-32">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="md:col-span-2 md:row-span-2 relative rounded-[60px] overflow-hidden shadow-hover"
          >
            <img 
              src={JSON.parse(property.photo_urls || "[]")[0] || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"} 
              className="w-full h-full object-cover" 
              alt={property.title}
            />
            <div className="absolute inset-0 bg-brand-charcoal/30 opacity-0 hover:opacity-100 transition-opacity duration-700 flex items-center justify-center">
               <div className="glass-premium p-6 rounded-3xl">
                  <span className="font-black text-[10px] uppercase tracking-widest text-brand-charcoal">Main Living Hub</span>
               </div>
            </div>
          </motion.div>
          <div className="relative rounded-[40px] overflow-hidden shadow-premium group">
            <img src="https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
          </div>
          <div className="relative rounded-[40px] overflow-hidden shadow-premium group">
             <img src="https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
          </div>
          <div className="relative rounded-[40px] overflow-hidden shadow-premium group">
            <img src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
          </div>
          <div className="relative rounded-[40px] overflow-hidden bg-brand-charcoal flex items-center justify-center text-white cursor-pointer group shadow-premium">
             <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover opacity-20 group-hover:scale-125 transition-all duration-1000" />
             <div className="absolute text-center">
                <p className="font-heading font-black text-4xl italic">12+</p>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">View Full Set</p>
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_450px] gap-24">
          <div className="space-y-32">
            {/* The Manifest / Description */}
            <section className="space-y-12">
               <div className="flex items-center gap-4">
                  <span className="w-12 h-[1px] bg-brand-red" />
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-brand-red">The Living Strategy</span>
               </div>
               <h2 className="text-4xl md:text-7xl font-heading font-black tracking-[-0.05em] leading-[0.85] text-brand-charcoal italic">Built for <br/><span className="text-stone-300 font-light not-italic">Concentration.</span></h2>
               <p className="text-stone-500 font-medium text-2xl leading-relaxed tracking-tight max-w-3xl">
                 {property.description}
               </p>
               
               <div className="grid md:grid-cols-2 gap-16 pt-12">
                 {[
                   { id: "wifi", label: "Gigabit Link", icon: <Wifi size={24} />, desc: "Fiber-to-the-desk speed" },
                   { id: "food", label: "Nutrition Hub", icon: <Utensils size={24} />, desc: "High-protein meal plans" },
                   { id: "security", label: "Elite Security", icon: <Shield size={24} />, desc: "Biometric & CCTV layer" },
                   { id: "power_backup", label: "Zero Outage", icon: <Zap size={24} />, desc: "Industrial UPS support" }
                 ].filter(item => amenities.includes(item.id)).map(item => (
                   <div key={item.id} className="flex items-start gap-6 group">
                      <div className="w-16 h-16 rounded-[24px] bg-white border border-stone-100 flex items-center justify-center text-brand-red shadow-premium group-hover:bg-brand-red group-hover:text-white transition-all duration-500">
                         {item.icon}
                      </div>
                      <div className="space-y-1">
                         <h5 className="font-heading font-black text-xl tracking-tighter text-brand-charcoal">{item.label}</h5>
                         <p className="text-sm text-stone-400 font-bold">{item.desc}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </section>

            {/* Safety Certification (Deep Contrast) */}
            <section className="bg-brand-charcoal text-white p-16 md:p-24 rounded-[80px] shadow-hover relative overflow-hidden border-[12px] border-white/5">
                <div className="absolute top-0 right-0 w-full h-full bg-brand-red/10 blur-[100px] -z-0" />
                <div className="relative z-10 space-y-20">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                      <div>
                        <h3 className="text-4xl md:text-6xl font-heading font-black leading-none mb-4 italic">Safety <br/>Verified<span className="text-brand-red">.</span></h3>
                        <p className="text-white/40 font-bold text-lg max-w-sm">Every Pune listing undergoes a physical 25-point MoveIn on-ground audit.</p>
                      </div>
                      <div className="p-8 rounded-[40px] border-4 border-brand-red rotate-[5deg] glass-premium">
                         <ShieldCheck size={60} className="text-brand-green" />
                      </div>
                   </div>

                   <div className="grid md:grid-cols-2 gap-12">
                      <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] hover:bg-white/10 transition-all duration-500">
                         <div className="w-12 h-12 rounded-2xl bg-brand-red flex items-center justify-center mb-8">
                            <Navigation size={24} />
                         </div>
                         <h5 className="font-heading font-black text-2xl mb-4 tracking-tighter">Campus Perimeter Audit</h5>
                         <p className="text-white/40 text-sm font-medium leading-relaxed">Map-verified walking routes and society gate security vetting ensured by our local team.</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] hover:bg-white/10 transition-all duration-500">
                         <div className="w-12 h-12 rounded-2xl bg-brand-green flex items-center justify-center mb-8">
                            <CheckCircle2 size={24} />
                         </div>
                         <h5 className="font-heading font-black text-2xl mb-4 tracking-tighter">Hygiene Manifest</h5>
                         <p className="text-white/40 text-sm font-medium leading-relaxed">Systematic check for water RO standards, fire preparedness, and pest control certification.</p>
                      </div>
                   </div>
                </div>
            </section>
          </div>

          <aside className="space-y-12">
            {/* Campus Link Sidebar */}
            <div className="bg-white p-12 rounded-[56px] border border-stone-100 shadow-premium">
               <div className="flex items-center gap-3 text-brand-red font-black text-[10px] uppercase tracking-[0.4em] mb-12">
                  <GraduationCap size={20} /> Campus Context
               </div>
               
               <div className="space-y-12">
                  <div className="p-10 bg-brand-sand rounded-[40px] border border-stone-100 group">
                    <p className="text-[9px] font-black text-stone-300 uppercase tracking-[0.3em] mb-4">Primary Connection</p>
                    <p className="text-3xl font-heading font-black text-brand-charcoal leading-none mb-6 group-hover:text-brand-red transition-colors">{property.linked_college?.name}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400">
                       <MapIcon size={14} className="text-brand-red" /> {property.locality} Hub, Pune
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-8 bg-brand-sand rounded-[32px] border border-stone-100">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-stone-300 uppercase tracking-[0.3em]">Proximity</p>
                        <p className="text-xl font-heading font-black text-brand-charcoal tracking-tight">{property.distance_to_college?.toFixed(1) || 0.4} KM</p>
                     </div>
                     <div className="px-4 py-2 bg-brand-green/10 text-brand-green rounded-full text-[10px] font-black uppercase tracking-widest">
                       Optimal Walk
                     </div>
                  </div>
               </div>

               <div className="mt-12 pt-12 border-t border-stone-50">
                  <Button variant="outline" className="w-full h-16 rounded-[24px] border-2 border-stone-100 font-black text-[11px] uppercase tracking-widest gap-3 group/map hover:border-brand-red/30 transition-all">
                    Show Digital Route <ArrowRight size={18} className="group-hover/map:translate-x-2 transition-transform" />
                  </Button>
               </div>
            </div>

            {/* WhatsApp Integration (High Impact) */}
            <div className="bg-brand-red p-12 rounded-[56px] text-white shadow-premium relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-full bg-brand-charcoal/10 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-[32px] bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 border border-white/20 shadow-xl">
                    <MessageCircle size={36} className="text-white" />
                  </div>
                  <h4 className="text-4xl font-heading font-black mb-4 tracking-tighter">Talk to {property.host?.name?.split(' ')[0] || "Host"}.</h4>
                  <p className="text-white/70 font-bold mb-12">Immediate chat available for safety questions or move-in logistics.</p>
                  <Button className="w-full h-18 rounded-[24px] bg-white text-brand-red font-black text-xl hover:bg-brand-sand transition-all shadow-2xl group/chat">
                    Chat on WhatsApp <ArrowRight className="ml-2 group-hover/chat:translate-x-2 transition-transform" />
                  </Button>
               </div>
            </div>

            <div className="py-8 text-center px-12 space-y-2">
               <p className="text-[9px] font-black text-stone-300 uppercase tracking-[0.5em]">MoveIn Pune Ground Team</p>
               <p className="text-xs font-bold text-stone-400">Available 24/7 for parent coordination and safety escalations.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
