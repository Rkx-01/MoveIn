"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, UserCheck, Eye, Star, Heart } from "lucide-react";

export default function Safety() {
  const safetyFeatures = [
    {
      icon: <ShieldCheck className="text-brand-red" size={32} />,
      title: "The Safety Score",
      description: "Our proprietary algorithm analyzes over 50 data points including area crime rates, fire safety, and emergency exit accessibility to give every property a score out of 10."
    },
    {
      icon: <UserCheck className="text-brand-red" size={32} />,
      title: "Host Verification",
      description: "Every host on MoveIn undergoes a mandatory legal background check and physical document verification before they can list their property."
    },
    {
      icon: <Eye className="text-brand-red" size={32} />,
      title: "Physical Audits",
      description: "Our team personally visits and audits properties to verify that the photos and amenities listed match the actual reality of the space."
    },
    {
      icon: <Lock className="text-brand-red" size={32} />,
      title: "Secure Payments",
      description: "Your deposit is held in a secure escrow account and only released to the host after you've successfully moved in and verified the keys."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-brand-charcoal">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 md:px-12 bg-stone-50">
        <div className="max-w-7xl mx-auto text-center">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-brand-red font-black text-[10px] uppercase tracking-[0.4em] mb-4 block"
          >
            Peace of Mind
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-heading font-black tracking-tighter mb-8 leading-none italic"
          >
            Safety <span className="text-stone-300 not-italic">First.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-stone-500 font-medium"
          >
            At MoveIn, we believe that finding a home should be exciting, not stressful. 
            That's why we've built the most robust safety infrastructure in student housing.
          </motion.p>
        </div>
      </section>

      {/* Safety Score Section */}
      <section className="py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-[64px] overflow-hidden bg-brand-charcoal flex items-center justify-center p-12"
            >
              <div className="text-center">
                <div className="text-brand-red text-9xl font-heading font-black mb-4">9.8</div>
                <div className="text-white font-black uppercase tracking-[0.3em] text-sm">Average Safety Score</div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-10 left-10 w-20 h-20 border-t-4 border-l-4 border-brand-red rounded-tl-3xl opacity-30" />
              <div className="absolute bottom-10 right-10 w-20 h-20 border-b-4 border-r-4 border-brand-red rounded-br-3xl opacity-30" />
            </motion.div>
            
            <div>
              <h2 className="text-4xl md:text-5xl font-heading font-black mb-8 leading-tight">How we calculate the <span className="text-brand-red italic">Safety Score.</span></h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center shrink-0">
                    <ShieldCheck className="text-brand-charcoal" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Location DNA</h4>
                    <p className="text-stone-500 text-sm">Proximity to police stations, hospitals, and well-lit public transport routes.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center shrink-0">
                    <Lock className="text-brand-charcoal" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Facility Security</h4>
                    <p className="text-stone-500 text-sm">CCTV coverage, 24/7 security personnel, and biometric access controls.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center shrink-0">
                    <Heart className="text-brand-charcoal" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Community Trust</h4>
                    <p className="text-stone-500 text-sm">Verified reviews from past residents focusing specifically on safety and comfort.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 md:px-12 bg-brand-charcoal text-white rounded-[64px] mx-6 md:mx-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-heading font-black mb-4 italic">Our Core Pillars.</h2>
            <p className="text-stone-400 font-medium">Standards that every MoveIn property must meet.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {safetyFeatures.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-[32px] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
              >
                <div className="mb-6 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center bg-stone-50 p-20 rounded-[64px] border border-stone-100">
          <h2 className="text-4xl font-heading font-black mb-6">Ready to find a safe home?</h2>
          <p className="text-stone-500 mb-10 font-medium">Browse our hand-picked selection of verified premium stays in Pune.</p>
          <a 
            href="/properties" 
            className="inline-flex h-16 items-center px-10 bg-brand-red text-white font-black uppercase tracking-widest text-xs rounded-full hover:bg-brand-charcoal transition-all hover:scale-105 active:scale-95"
          >
            Explore Verified Stays
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
