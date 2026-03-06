"use client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { 
  ArrowRight, 
  ShieldCheck, 
  Search,
  MapPin,
  Building2,
  TrendingUp,
  Map as MapIcon,
  Globe,
  Star,
  Zap,
  CheckCircle2,
  Navigation,
  Quote,
  GraduationCap,
  Users
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from 'next/link';
import { CollegeSearch } from "@/components/ui/CollegeSearch";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/api";

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);

  useEffect(() => {
    fetch(getApiUrl("properties?limit=3&is_verified=true"))
      .then(res => res.json())
      .then(json => {
        if (json.success) setFeaturedProperties(json.data);
      })
      .catch(err => console.error("Featured fetch failed:", err));
  }, []);
  const popularColleges = [
    { name: "COEP Tech", area: "Shivajinagar" },
    { name: "MIT-WPU", area: "Kothrud" },
    { name: "SPPU", area: "Ganeshkhind" },
    { name: "Symbiosis", area: "Viman Nagar" },
  ];

  const puneLocalities = [
    { name: "Kothrud", count: 42, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800" },
    { name: "Viman Nagar", count: 38, image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800" },
    { name: "Shivajinagar", count: 25, image: "https://images.unsplash.com/photo-1470075801209-17f9ec0cada6?w=800" },
    { name: "Baner", count: 31, image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <main className="min-h-screen bg-brand-sand selection:bg-brand-red selection:text-white">
      <Navbar />
      
      {/* 1. ASYMMETRICAL HERO */}
      <section className="relative pt-44 pb-32 px-6 md:px-12 min-h-[90vh] flex flex-col justify-center overflow-hidden">
        {/* Visual Background Elements */}
        <div className="absolute top-20 right-[-10%] w-[40%] aspect-square bg-brand-red/10 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-10 left-[-5%] w-[30%] aspect-square bg-brand-green/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-20 items-center">
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8, ease: "circOut" }}
               className="space-y-12"
            >
                <div className="space-y-6">
                   <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-charcoal text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                      <Globe size={14} className="text-brand-red" /> 04 Hubs Live in Pune
                   </div>
                   <h1 className="text-6xl md:text-[110px] font-heading font-black leading-[0.85] tracking-[-0.05em] text-brand-charcoal">
                      Find Your <br/>
                      Next Home <br/>
                      <span className="italic font-light text-stone-300">Near Campus.</span>
                   </h1>
                   <p className="text-xl text-stone-500 max-w-lg font-medium leading-relaxed">
                     Modern student living audited and verified by our on-ground team. If they are far from home, we take <span className="text-brand-charcoal font-black underline decoration-brand-red decoration-2 underline-offset-4">responsibility.</span>
                   </p>
                </div>

                {/* Hero Integrated Search */}
                <div className="relative group max-w-2xl">
                   <div className="absolute -inset-2 bg-brand-red/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                   <div className="relative flex flex-col md:flex-row bg-white p-3 rounded-[32px] shadow-premium border border-stone-100 group-focus-within:border-brand-red transition-all duration-300">
                      <div className="flex-[1.5] border-r border-stone-100">
                         <CollegeSearch />
                      </div>
                      <Link href="/properties" className="flex items-center">
                        <Button className="h-16 px-12 rounded-[24px] bg-brand-red text-white font-black text-xs uppercase tracking-widest gap-2 hover:bg-brand-charcoal transition-all duration-500 shadow-premium">
                           Explore Stays <ArrowRight size={18} />
                        </Button>
                      </Link>
                   </div>
                </div>
            </motion.div>

            {/* Asymmetrical Visual Layer */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1, delay: 0.2, ease: "circOut" }}
               className="hidden lg:block relative"
            >
                {/* Decorative background circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-2 border-stone-100 rounded-full -z-10 opacity-50" />
                
                <div className="relative aspect-[3/4] rounded-[60px] overflow-hidden shadow-hover rotate-[-3deg] group border-[12px] border-white">
                   <img 
                    src="/properties/room1.jpg" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms]" 
                    alt="Premium Living"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-white p-8 rounded-[40px] shadow-premium rotate-[6deg] border border-stone-100 backdrop-blur-md flex flex-col items-center justify-center text-center">
                   <ShieldCheck size={40} className="text-brand-red mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest leading-tight text-brand-charcoal">25-Point <br/> Safety Audit</p>
                </div>
                
                <div className="absolute -bottom-10 -left-10 bg-brand-charcoal p-8 rounded-[40px] shadow-premium rotate-[-6deg] text-white">
                   <p className="text-4xl font-heading font-black mb-1">100%</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Verified Hosts</p>
                </div>

                {/* New Floating Element */}
                <div className="absolute top-1/2 -right-20 translate-y-[-50%] bg-white py-4 px-6 rounded-2xl shadow-premium border border-stone-50 animate-bounce-slow">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-brand-green rounded-full animate-ping" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Live in Pune</span>
                   </div>
                </div>
            </motion.div>
        </div>
      </section>

      {/* 2. TRUST STRIP */}
      <section className="py-20 border-y border-stone-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 overflow-hidden">
           <motion.div 
             variants={containerVariants}
             initial="hidden"
             whileInView="show"
             viewport={{ once: true }}
             className="flex flex-wrap justify-center md:justify-between items-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
          >
              {[
                { icon: <ShieldCheck />, text: "Parent-First Verification" },
                { icon: <CheckCircle2 />, text: "Legal Contract Support" },
                { icon: <TrendingUp />, text: "Proximity Data Engine" },
                { icon: <Star />, text: "Verified Host network" }
              ].map((item, i) => (
                <motion.div key={i} variants={itemVariants} className="flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em]">
                   <span className="text-brand-red">{item.icon}</span> {item.text}
                </motion.div>
              ))}
           </motion.div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-32 px-6 md:px-12">
         <div className="max-w-7xl mx-auto">
            <div className="max-w-xl mb-24">
               <span className="text-brand-red font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">The Process</span>
               <h2 className="text-5xl md:text-7xl font-heading font-black leading-none tracking-tighter text-brand-charcoal italic italic">Simple. Transparent. <span className="text-stone-300 font-light not-italic">Secure.</span></h2>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
               {[
                 { 
                   step: "01", 
                   title: "Search Campus", 
                   desc: "Enter your college name. Our proximity engine finds stays within walking distance.",
                   icon: <GraduationCap size={44} /> 
                 },
                 { 
                   step: "02", 
                   title: "Explore Stays", 
                   desc: "Review 100% verified listings with HD photos, real safety scores, and amenities.",
                   icon: <Building2 size={44} /> 
                 },
                 { 
                   step: "03", 
                   title: "Book Securely", 
                   desc: "Lock your stay with a digital contract and verified payment system.",
                   icon: <ShieldCheck size={44} /> 
                 }
               ].map((item, i) => (
                 <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="relative p-12 bg-white rounded-[48px] shadow-premium hover:shadow-hover transition-all duration-500 border border-stone-100 group"
                 >
                    <span className="text-7xl font-heading font-black text-stone-50 absolute top-8 right-12 transition-colors group-hover:text-brand-red/10">{item.step}</span>
                    <div className="text-brand-red mb-8 transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500">
                      {item.icon}
                    </div>
                    <h4 className="text-2xl font-heading font-black mb-4 tracking-tighter text-brand-charcoal">{item.title}</h4>
                    <p className="text-stone-500 font-medium leading-relaxed">{item.desc}</p>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 4. PUNE FOCUS SECTION */}
      <section className="py-32 px-6 md:px-12 bg-brand-charcoal rounded-[80px] mx-6 md:mx-12 overflow-hidden relative border-[12px] border-white/5">
         <div className="absolute top-0 right-0 w-full h-full bg-brand-red/5 -z-0" />
         <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-24">
               <div className="max-w-2xl">
                  <span className="text-brand-red font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Launch Phase: Pune</span>
                  <h2 className="text-5xl md:text-8xl font-heading font-black text-white leading-none tracking-tighter italic">Student Living <br/><span className="text-white/20 font-light not-italic underline decoration-brand-red decoration-2 underline-offset-8">In The Hub.</span></h2>
               </div>
               <Link href="/properties">
                 <Button variant="outline" className="h-16 px-10 rounded-[20px] border-white/20 text-white hover:bg-white hover:text-brand-charcoal font-black text-xs uppercase tracking-widest transition-all duration-500">
                    Explore Pune Stays
                 </Button>
               </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
               {puneLocalities.map((area, i) => (
                 <motion.div 
                    key={i} 
                    whileHover={{ scale: 0.98, opacity: 0.9 }}
                    className="relative aspect-[4/5] rounded-[48px] overflow-hidden group cursor-pointer"
                 >
                    <img src={area.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal to-transparent opacity-80" />
                    <div className="absolute bottom-10 left-10 text-white">
                       <h4 className="text-2xl font-heading font-black mb-1">{area.name}</h4>
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{area.count} Stays</p>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 5. FEATURED PROPERTIES */}
      <section className="py-32 px-6 md:px-12">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
               <div>
                  <h2 className="text-5xl font-heading font-black tracking-tighter text-brand-charcoal">Featured Spaces.</h2>
                  <p className="text-stone-500 font-medium mt-2">Verified premium stays with 9.5+ Safety Scores.</p>
               </div>
               <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-brand-red hover:text-brand-red cursor-pointer transition-colors"><ArrowRight className="rotate-180" size={20} /></div>
                  <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:border-brand-red hover:text-brand-red cursor-pointer transition-colors"><ArrowRight size={20} /></div>
               </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
               {featuredProperties.length > 0 ? (
                 featuredProperties.map((prop) => (
                   <PropertyCard 
                     key={prop.property_id}
                     id={prop.property_id} 
                     title={prop.title} 
                     location={prop.locality} 
                     price={prop.price} 
                     image={prop.photo_urls ? JSON.parse(prop.photo_urls)[0] : "/properties/room1.jpg"}
                     isVerified={prop.is_verified}
                     safetyScore={prop.safety_score}
                     distanceFromCollege={prop.distance_to_college || 0.4}
                   />
                 ))
               ) : (
                 /* Skeleton / Fallback */
                 Array.from({ length: 3 }).map((_, i) => (
                   <div key={i} className="aspect-[4/5] bg-stone-100 rounded-[48px] animate-pulse" />
                 ))
               )}
            </div>
         </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-32 px-6 md:px-12 bg-white">
         <div className="max-w-7xl mx-auto flex flex-col items-center">
            <Quote size={60} className="text-brand-red mb-12 opacity-20" />
            <div className="max-w-4xl text-center space-y-12">
               <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="text-3xl md:text-5xl font-heading font-black tracking-tight leading-[1.1] text-brand-charcoal"
               >
                  "Moving to Pune for COEP was stressful, but MoveIn made finding a safe place effortless. The 25-point safety audit gave my parents peace of mind."
               </motion.p>
               <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-stone-200 overflow-hidden border-2 border-brand-red">
                     <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="font-heading font-black tracking-tighter text-xl">Arjun Mehta</h5>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Student, COEP Tech</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 7. ROADMAP SECTION */}
      <section className="py-32 px-6 md:px-12 mb-32">
         <div className="max-w-7xl mx-auto bg-brand-charcoal rounded-[60px] p-12 md:p-24 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-brand-red/10 to-transparent -z-0" />
            <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
               <div className="space-y-12">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60 border border-white/10">
                     <TrendingUp size={14} className="text-brand-red" /> Growth Roadmap
                  </div>
                  <h2 className="text-5xl md:text-7xl font-heading font-black text-white leading-none tracking-tighter italic">Beyond Pune. <br/><span className="text-white/20 font-light not-italic italic">Scaling Safety.</span></h2>
                  <p className="text-white/50 text-xl font-medium max-w-md">We're expanding our on-ground audit team to the next Tier 1 student cities. Quality over quantity, always.</p>
               </div>
               
               <div className="space-y-6">
                  {[
                    { city: "Mumbai (Powai Hub)", status: "Active Launch", date: "Q3 2026", active: true },
                    { city: "Bangalore (HSR Hub)", status: "On-ground Audit", date: "Q4 2026", active: false },
                    { city: "Delhi NCR (Hauz Khas)", status: "Planning Phase", date: "Q1 2027", active: false }
                  ].map((item, i) => (
                    <div key={i} className={`p-8 rounded-[32px] border ${item.active ? 'bg-white border-white text-brand-charcoal' : 'bg-white/5 border-white/10 text-white/40'} flex justify-between items-center transition-all duration-500`}>
                       <div>
                          <p className="font-heading font-black text-xl tracking-tighter">{item.city}</p>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${item.active ? 'text-brand-red' : 'text-white/20'}`}>{item.status}</p>
                       </div>
                       <span className="font-black text-xs uppercase tracking-widest">{item.date}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* 8. FOOTER */}
      <Footer />
    </main>
  );
}
