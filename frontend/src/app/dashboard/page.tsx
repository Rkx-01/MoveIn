import { Navbar } from "@/components/layout/Navbar";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <div className="pt-32 px-6 md:px-12 max-w-7xl mx-auto">
        <h1 className="text-3xl font-heading font-bold mb-8">Dashboard</h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-[var(--border)] shadow-sm">
             <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-2">Active Bookings</h3>
             <p className="text-3xl font-bold">1</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[var(--border)] shadow-sm">
             <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-2">Total Spent</h3>
             <p className="text-3xl font-bold">$3,200</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[var(--border)] shadow-sm">
             <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-2">Saved Properties</h3>
             <p className="text-3xl font-bold">4</p>
          </div>
        </div>

        <h2 className="text-xl font-heading font-bold mb-4">Your upcoming stay</h2>
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-[var(--border)] shadow-sm flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/3 aspect-[4/3] rounded-xl overflow-hidden bg-stone-200">
               <img 
                 src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                 alt="Property"
                 className="w-full h-full object-cover"
               />
            </div>
            <div className="w-full md:w-2/3">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-4">CONFIRMED</div>
              <h3 className="text-2xl font-bold font-heading mb-2">The Atrium Loft</h3>
              <p className="text-stone-500 mb-6">San Francisco, CA</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-stone-500 mb-1">Check-in</p>
                  <p className="font-semibold text-stone-900">Oct 1, 2026</p>
                </div>
                <div>
                  <p className="text-stone-500 mb-1">Check-out</p>
                  <p className="font-semibold text-stone-900">Dec 31, 2026</p>
                </div>
              </div>
            </div>
        </div>
      </div>
    </main>
  );
}
