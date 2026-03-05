"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-brand-charcoal text-white py-20 px-6 md:px-12 rounded-t-[64px] mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-[12px] bg-white flex items-center justify-center text-brand-charcoal font-heading font-black text-xl">M.</div>
              <span className="font-heading font-black text-2xl tracking-tighter">MoveIn<span className="text-brand-red">.</span></span>
            </Link>
            <p className="text-stone-400 max-w-sm font-medium leading-relaxed">
              Redesigning the student housing experience in Pune. 
              Built with trust, safety, and proximity at its core.
            </p>
          </div>
          
          <div>
            <h4 className="font-black uppercase tracking-[0.2em] text-[10px] mb-8 text-stone-500">Platform</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/properties" className="hover:text-brand-red transition-colors">Explore Stays</Link></li>
              <li><Link href="/safety" className="hover:text-brand-red transition-colors">Safety First</Link></li>
              <li><Link href="/process" className="hover:text-brand-red transition-colors">Our Process</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-black uppercase tracking-[0.2em] text-[10px] mb-8 text-stone-500">Company</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="#" className="hover:text-brand-red transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-brand-red transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-brand-red transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-stone-500 text-xs font-black uppercase tracking-widest">© 2026 MoveIn Technologies Pvt Ltd.</p>
          <div className="flex gap-8">
             <span className="text-stone-500 text-xs font-black uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Instagram</span>
             <span className="text-stone-500 text-xs font-black uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Twitter</span>
             <span className="text-stone-500 text-xs font-black uppercase tracking-widest cursor-pointer hover:text-white transition-colors">LinkedIn</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
