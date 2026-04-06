"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Search, ClipboardCheck, Home, Key, Wallet, HelpCircle } from "lucide-react";

export default function Process() {
  const steps = [
    {
      number: "01",
      icon: <Search className="text-brand-red" size={40} />,
      title: "Explore Hubs",
      description: "Search for premium stays near your college. Use our 'Proximity Engine' to find locations with the best commute times and safety scores."
    },
    {
      number: "02",
      icon: <ClipboardCheck className="text-brand-red" size={40} />,
      title: "Virtual or Physical Visit",
      description: "Book a tour. We offer detailed 3D virtual walkthroughs or you can schedule a physical visit to meet the host and see the space."
    },
    {
      number: "03",
      icon: <Wallet className="text-brand-red" size={40} />,
      title: "Reserve & Settle",
      description: "Found the one? Pay a small reservation fee through our secure gateway. We handle all the legal paperwork and agreements for you."
    },
    {
      number: "04",
      icon: <Key className="text-brand-red" size={40} />,
      title: "Move In",
      description: "On move-in day, verify the space one last time. Once you're happy, your deposit is released to the host and you get your keys!"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-brand-charcoal">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-brand-red font-black text-[10px] uppercase tracking-[0.4em] mb-4 block"
            >
              How it works
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-heading font-black tracking-tighter mb-8 leading-none italic"
            >
              The <span className="text-stone-300 not-italic">MoveIn</span> <span className="text-brand-red">Way.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-stone-500 font-medium leading-relaxed"
            >
              We've redesigned the rental experience from the ground up for students. 
              No brokers, no hidden fees, and zero stress.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Step by Step Section */}
      <section className="py-32 px-6 md:px-12 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20">
            <div className="space-y-24">
              {steps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-10 group"
                >
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-2 border-brand-red flex items-center justify-center font-heading font-black text-xl text-brand-red group-hover:bg-brand-red group-hover:text-white transition-all duration-500">
                      {step.number}
                    </div>
                    {i !== steps.length - 1 && (
                      <div className="w-0.5 h-full bg-stone-200 my-4" />
                    )}
                  </div>
                  <div className="pb-12">
                    <div className="mb-6">{step.icon}</div>
                    <h3 className="text-3xl font-heading font-black mb-4 tracking-tight">{step.title}</h3>
                    <p className="text-stone-500 font-medium leading-relaxed max-w-md">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="hidden lg:block sticky top-40 h-[600px]">
               <div className="w-full h-full rounded-[64px] bg-brand-charcoal overflow-hidden relative group">
                  <img 
                    src="/properties/room4.jpg" 
                    alt="Process Illustration" 
                    className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-[2000ms]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-16 left-16 right-16">
                    <div className="w-16 h-16 rounded-2xl bg-brand-red flex items-center justify-center text-white mb-6 shadow-2xl">
                       <Home size={32} />
                    </div>
                    <h3 className="text-3xl font-heading font-black text-white italic">Your future home <br/><span className="text-stone-400 not-italic">starts here.</span></h3>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Hosts Section */}
      <section className="py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto rounded-[64px] bg-brand-red p-12 md:p-24 text-white overflow-hidden relative">
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
             <div>
                <h2 className="text-4xl md:text-6xl font-heading font-black mb-8 italic">Are you a Host?</h2>
                <p className="text-white/80 text-lg font-medium mb-12 max-w-md">Join Pune's most trusted network of premium student housing providers. We handle the discovery, you handle the hospitality.</p>
                <div className="flex flex-wrap gap-4">
                  <div className="px-6 py-3 bg-white/20 rounded-full border border-white/30 text-sm font-black uppercase tracking-widest">Pre-Verified Tenants</div>
                  <div className="px-6 py-3 bg-white/20 rounded-full border border-white/30 text-sm font-black uppercase tracking-widest">Legal Support</div>
                  <div className="px-6 py-3 bg-white/20 rounded-full border border-white/30 text-sm font-black uppercase tracking-widest">Auto-Payments</div>
                </div>
             </div>
             <div className="flex justify-center md:justify-end">
                <Link href="/register">
                  <Button className="bg-brand-charcoal text-white hover:bg-white hover:text-brand-charcoal h-20 px-12 rounded-full font-black uppercase tracking-[0.2em] transition-all scale-110">
                    List Your Property
                  </Button>
                </Link>
             </div>
          </div>
          {/* Abstract circles */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border-[40px] border-white/10" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border-[20px] border-white/10" />
        </div>
      </section>

      <Footer />
    </div>
  );
}
