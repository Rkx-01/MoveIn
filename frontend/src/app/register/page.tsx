"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { Home, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api";

export default function Register() {
  const router = useRouter();
  const [role, setRole] = useState<"Tenant" | "Host">("Tenant");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(getApiUrl("auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Register API Error:", data);
        throw new Error(data.message || data.error || "Registration failed");
      }

      // Store token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Notify Navbar
      window.dispatchEvent(new Event("auth-change"));

      router.push("/properties");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-stone-900 bg-[var(--background)]">
      <div className="w-full flex flex-col justify-center max-w-lg mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 opacity-70 hover:opacity-100 transition-opacity">
            <Home size={18} />
            <span className="font-heading font-bold">MoveIn.</span>
          </Link>
          <h1 className="text-3xl font-heading font-bold mb-2">Create an account</h1>
          <p className="text-stone-500 text-sm">Join the curated network of verified professionals.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded-[2rem] shadow-sm border border-[var(--border)]">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}
          <div className="flex gap-4 mb-4">
             <Button 
                type="button"
                variant="outline" 
                onClick={() => setRole("Tenant")}
                className={`flex-1 w-full ${role === "Tenant" ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/5" : "text-stone-500"}`}
              >
                Tenant
              </Button>
             <Button 
                type="button"
                variant="outline" 
                onClick={() => setRole("Host")}
                className={`flex-1 w-full ${role === "Host" ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/5" : "text-stone-500"}`}
              >
                Host
              </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1 block">First Name</label>
              <Input 
                type="text" 
                placeholder="John" 
                required
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1 block">Last Name</label>
              <Input 
                type="text" 
                placeholder="Doe" 
                required
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1 block">Email</label>
            <Input 
              type="email" 
              placeholder="name@company.com" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1 block">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <Button className="w-full mt-6" size="lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Sign up"}
          </Button>
        </form>
        
        <p className="text-center text-sm text-stone-500 mt-8">
          Already have an account? <Link href="/login" className="font-semibold text-stone-900">Log in</Link>
        </p>
      </div>
    </div>
  );
}
