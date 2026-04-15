"use client";

import { useAuth } from "./AuthProvider";
import { isAdminEmail } from "@/lib/adminEmails";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?redirect=/admin");
      return;
    }
    if (!isAdminEmail(user.email)) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0E0F12]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#14C6C9] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-['Montserrat'] text-sm">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdminEmail(user.email)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0E0F12]">
        <div className="text-center">
          <p className="text-red-400 font-['Montserrat'] text-lg font-bold mb-2">Acceso denegado</p>
          <p className="text-gray-400 font-['Montserrat'] text-sm">No tienes permisos de administrador.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
