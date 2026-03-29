"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { Home, Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(getApiUrl("auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Login API Error:", data);
        throw new Error(data.message || data.error || "Login failed");
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
    <div className="min-h-screen flex text-stone-900 bg-white">
      {/* Left side Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-24">
        <Link href="/" className="flex items-center gap-2 mb-16 opacity-70 hover:opacity-100 transition-opacity">
          <Home size={18} />
          <span className="font-heading font-bold">MoveIn.</span>
        </Link>
        <h1 className="text-4xl font-heading font-bold mb-2">Welcome back</h1>
        <p className="text-stone-500 mb-8 text-sm">Enter your credentials to access your account.</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}
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
          
          <div className="pt-2 text-right">
            <Link href="#" className="text-sm font-medium text-[var(--primary)] hover:underline">Forgot password?</Link>
          </div>
          
          <Button className="w-full mt-4" size="lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Log in"}
          </Button>
        </form>
        
        <p className="text-center text-sm text-stone-500 mt-8">
          Don't have an account? <Link href="/register" className="font-semibold text-stone-900">Sign up</Link>
        </p>
      </div>
      
      {/* Right side visual */}
      <div className="w-1/2 bg-stone-100 hidden md:flex items-center justify-center relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
          alt="Login aesthetic" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-stone-900/20 mix-blend-multiply" />
        <div className="z-10 text-white max-w-sm px-8 glass p-8 rounded-[2rem]">
          <h2 className="text-2xl font-heading font-bold mb-4">"MoveIn made my relocation to Pune absolutely seamless."</h2>
          <p className="text-sm font-medium opacity-80">— Sarah J., Pune Student</p>
        </div>
      </div>
    </div>
  );
}
