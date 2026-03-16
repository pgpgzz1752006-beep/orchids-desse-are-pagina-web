import Link from "next/link";
import Footer from "@/components/Footer";

export default function PendientePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0E0F12] font-['Montserrat'] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
        <div className="w-20 h-20 rounded-full bg-[#F3E300]/10 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-[#F3E300]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#111] dark:text-white mb-3">
          Pago pendiente
        </h1>
        <p className="text-[15px] text-[#666] dark:text-[#999] max-w-[500px] mb-2 leading-relaxed">
          Tu pago está siendo procesado. Esto puede tomar unos minutos dependiendo del método de pago seleccionado.
        </p>
        <p className="text-[13px] text-[#AAA] dark:text-[#555] mb-8">
          Te notificaremos por correo cuando se confirme.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="px-8 py-3.5 bg-[#14C6C9] hover:bg-[#0fa8ab] text-white font-bold text-[13px] uppercase tracking-widest rounded-xl transition-colors shadow-md"
          >
            Volver al inicio
          </Link>
          <a
            href="https://wa.me/529512424333?text=Hola%2C%20mi%20pago%20aparece%20como%20pendiente"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5 font-bold text-[13px] uppercase tracking-widest rounded-xl transition-colors"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </div>
      <Footer lineHeight={6} />
    </div>
  );
}
