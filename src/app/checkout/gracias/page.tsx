import Link from "next/link";
import Footer from "@/components/Footer";

export default function GraciasPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0E0F12] font-['Montserrat'] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
        <div className="w-20 h-20 rounded-full bg-[#7BC043]/10 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-[#7BC043]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#111] dark:text-white mb-3">
          ¡Pago exitoso!
        </h1>
        <p className="text-[15px] text-[#666] dark:text-[#999] max-w-[500px] mb-2 leading-relaxed">
          Tu pago fue procesado correctamente. Nuestro equipo se pondrá en contacto contigo para confirmar los detalles de personalización y envío.
        </p>
        <p className="text-[13px] text-[#AAA] dark:text-[#555] mb-8">
          Recibirás un correo de confirmación de Mercado Pago.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="px-8 py-3.5 bg-[#14C6C9] hover:bg-[#0fa8ab] text-white font-bold text-[13px] uppercase tracking-widest rounded-xl transition-colors shadow-md"
          >
            Volver al inicio
          </Link>
          <a
            href="https://wa.me/529512424333?text=Hola%2C%20acabo%20de%20realizar%20un%20pago%20y%20quiero%20confirmar%20mi%20pedido"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5 font-bold text-[13px] uppercase tracking-widest rounded-xl transition-colors"
          >
            Confirmar por WhatsApp
          </a>
        </div>
      </div>
      <Footer lineHeight={6} />
    </div>
  );
}
