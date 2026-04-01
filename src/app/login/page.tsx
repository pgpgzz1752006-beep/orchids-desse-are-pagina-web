"use client";

import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/cuenta";
  const { user, loading: authLoading, signIn } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace(redirectTo);
  }, [user, authLoading, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signIn(email, password);
    if (err) {
      if (err.includes("Invalid login")) setError("Correo o contraseña incorrectos.");
      else setError(err);
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (user) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0E0F12] font-['Montserrat'] transition-colors duration-300 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-16">
        <div className="w-full max-w-[440px]">
          <div className="bg-white dark:bg-[#12141A] rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.10)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.40)] border border-[#EFEFEF] dark:border-[#1E2028] px-8 py-10 md:px-10 md:py-12">

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <a href="/">
                <Image src="/brand/logo-light.webp" alt="Diseñare Promocionales" width={260} height={90} className="h-[90px] w-auto object-contain block dark:hidden" priority />
                <Image src="/brand/logo-dark.webp" alt="Diseñare Promocionales" width={260} height={90} className="h-[90px] w-auto object-contain hidden dark:block" priority />
              </a>
            </div>

            <h1 className="text-[24px] md:text-[26px] font-bold text-[#111111] dark:text-white text-center mb-1 leading-tight">
              Iniciar sesión
            </h1>
            <p className="text-[13px] md:text-[14px] text-[#777] dark:text-[#999] text-center mb-8">
              Accede a tu cuenta de Diseñare Promocionales
            </p>

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-[13px] text-red-600 dark:text-red-400 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-[13px] font-semibold text-[#333] dark:text-[#ccc] uppercase tracking-wide">
                  Correo electrónico
                </label>
                <input
                  id="email" type="email" autoComplete="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com"
                  className="w-full h-[48px] px-4 rounded-lg border border-[#D8D8D8] dark:border-[#2A2D36] bg-[#FAFAFA] dark:bg-[#1A1C24] text-[14px] text-[#111] dark:text-white placeholder-[#BBBBBB] dark:placeholder-[#555] outline-none focus:border-[#14C6C9] focus:ring-2 focus:ring-[#14C6C9]/20 transition-all duration-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-[13px] font-semibold text-[#333] dark:text-[#ccc] uppercase tracking-wide">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required
                    value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full h-[48px] px-4 pr-12 rounded-lg border border-[#D8D8D8] dark:border-[#2A2D36] bg-[#FAFAFA] dark:bg-[#1A1C24] text-[14px] text-[#111] dark:text-white placeholder-[#BBBBBB] dark:placeholder-[#555] outline-none focus:border-[#14C6C9] focus:ring-2 focus:ring-[#14C6C9]/20 transition-all duration-200"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAAAAA] hover:text-[#14C6C9] transition-colors duration-200"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full h-[50px] mt-1 rounded-lg bg-[#14C6C9] hover:bg-[#0fa8ab] active:scale-[0.98] text-white font-bold text-[15px] uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Entrando...</> : "Entrar"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-7">
              <div className="flex-1 h-px bg-[#E8E8E8] dark:bg-[#2A2D36]" />
              <span className="text-[12px] text-[#AAAAAA] dark:text-[#555] uppercase tracking-wider">o</span>
              <div className="flex-1 h-px bg-[#E8E8E8] dark:bg-[#2A2D36]" />
            </div>

            <p className="text-center text-[13px] md:text-[14px] text-[#666] dark:text-[#999]">
              ¿No tienes cuenta?{" "}
              <a href="/registro" className="text-[#14C6C9] font-semibold hover:text-[#0fa8ab] transition-colors duration-200">
                Regístrate aquí
              </a>
            </p>
          </div>

          <p className="text-center mt-6 text-[13px] text-[#AAAAAA] dark:text-[#555]">
            <a href="/" className="hover:text-[#14C6C9] transition-colors duration-200">← Volver al inicio</a>
          </p>
        </div>
      </main>
      <Footer lineHeight={6} />
      <WhatsAppButton />
    </div>
  );
}
