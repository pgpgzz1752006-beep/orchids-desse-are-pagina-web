"use client";

import Link from "next/link";
import {
  Zap, Printer, Stamp, Pen, Droplets,
  Truck, Package, Palette, ShieldCheck, Headphones,
  CheckCircle2, ArrowRight, Phone, Megaphone,
  Flag, CreditCard, RectangleHorizontal, FileText, Shirt,
} from "lucide-react";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

/* ── Colores de la barra multicolor ──────────────────────────────────────── */
const colorBarSegments = [
  { color: "#F3E300", width: "12%" },
  { color: "#7BC043", width: "14%" },
  { color: "#1FB6FF", width: "16%" },
  { color: "#198FD6", width: "14%" },
  { color: "#1A3D8F", width: "14%" },
  { color: "#E0007A", width: "12%" },
  { color: "#6A1B9A", width: "12%" },
  { color: "#3E2A84", width: "6%" },
];

/* ── Técnicas de personalización ─────────────────────────────────────────── */
const tecnicas = [
  {
    icon: Zap,
    color: "#14C6C9",
    title: "Grabado Láser",
    price: 60,
    desc: "Grabado permanente de alta precisión sobre metal, madera, cuero, acrílico y vidrio. Ideal para artículos ejecutivos, termos, plumas y reconocimientos con un acabado elegante y duradero.",
    materiales: ["Metal", "Madera", "Cuero", "Acrílico", "Vidrio"],
  },
  {
    icon: Printer,
    color: "#E0007A",
    title: "Serigrafía",
    price: 50,
    desc: "Impresión con tinta de alta durabilidad directamente sobre el producto. Perfecta para grandes tirajes en textiles, plásticos, vidrio y papel con colores vibrantes y resistencia al lavado.",
    materiales: ["Textiles", "Plásticos", "Vidrio", "Papel"],
  },
  {
    icon: Stamp,
    color: "#B8A800",
    title: "Tampografía",
    price: 40,
    desc: "Transferencia de tinta mediante un tampón de silicón, ideal para superficies irregulares, curvas o de difícil acceso. La técnica más versátil para plumas, encendedores y artículos pequeños.",
    materiales: ["Superficies curvas", "Plásticos", "Cerámica", "Metal"],
  },
  {
    icon: Pen,
    color: "#7BC043",
    title: "Bordado",
    price: 100,
    desc: "Diseño en hilo de alta calidad cosido directamente sobre la prenda. Otorga un acabado premium y profesional con excelente durabilidad. Ideal para uniformes, gorras y mochilas corporativas.",
    materiales: ["Gorras", "Playeras", "Sudaderas", "Mochilas"],
  },
  {
    icon: Droplets,
    color: "#1A3D8F",
    title: "Sublimación",
    price: 35,
    desc: "Impresión fotográfica a todo color directamente en la fibra del material. Permite diseños complejos, degradados y fotografías sin límite de colores sobre materiales de poliéster y cerámica.",
    materiales: ["Poliéster", "Cerámica", "Telas blancas", "Mouse pads"],
  },
];

/* ── Servicios principales ───────────────────────────────────────────────── */
const servicios = [
  {
    icon: Package,
    color: "#14C6C9",
    title: "Catálogo de +2,000 Productos",
    desc: "Artículos promocionales importados y nacionales: termos, libretas, bolsas, gorras, playeras, electrónicos, artículos deportivos, de bar, hogar y mucho más.",
  },
  {
    icon: Palette,
    color: "#E0007A",
    title: "Personalización Integral",
    desc: "Todos nuestros productos son 100% personalizables con tu logotipo. Ofrecemos 5 técnicas de impresión y un visualizador en línea para que veas el resultado antes de ordenar.",
  },
  {
    icon: Truck,
    color: "#7BC043",
    title: "Distribución Nacional",
    desc: "Entregamos en cualquier rincón de México con logística confiable y eficiente. Envío gratis en pedidos mayores a $5,000 MXN. Cotización personalizada para volumen.",
  },
  {
    icon: ShieldCheck,
    color: "#1A3D8F",
    title: "Proyectos Especiales",
    desc: "¿No encontraste lo que buscabas? Creamos artículos a tu medida: lonas, flyers, notas de remisión, carpetas, empaques personalizados y un sin fin de artículos impresos.",
  },
  {
    icon: Headphones,
    color: "#6A1B9A",
    title: "Asesoría Personalizada",
    desc: "Nuestro equipo te acompaña en todo el proceso: desde la selección del producto hasta la aprobación del diseño final. Cotiza sin compromiso por WhatsApp o correo.",
  },
  {
    icon: CheckCircle2,
    color: "#F3E300",
    title: "Garantía de Calidad",
    desc: "Revisamos cada pieza antes del envío. Si algo no cumple con tus expectativas, lo resolvemos de inmediato. Tu satisfacción es nuestra prioridad.",
  },
];

/* ── Proceso paso a paso ─────────────────────────────────────────────────── */
const pasos = [
  { step: "01", title: "Cotiza", desc: "Elige tus productos y solicita cotización por WhatsApp, correo o directamente desde el carrito." },
  { step: "02", title: "Diseña", desc: "Envíanos tu logotipo y nuestro equipo prepara la maqueta digital para tu aprobación." },
  { step: "03", title: "Aprueba", desc: "Revisas la maqueta, das tu visto bueno y realizas el pago del pedido." },
  { step: "04", title: "Recibe", desc: "Personalizamos y enviamos tu pedido directamente a la puerta de tu negocio." },
];

export default function ServiciosContent() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0E0F12] font-['Montserrat'] transition-colors duration-300 flex flex-col">

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full bg-gradient-to-br from-[#0A1628] via-[#0E1F3D] to-[#0A1628] overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-[#14C6C9]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-80px] left-[-80px] w-[300px] h-[300px] bg-[#E0007A]/8 rounded-full blur-[100px]" />

        <div className="relative max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28 lg:py-32 text-center">
          <h1 className="text-[32px] md:text-[44px] lg:text-[52px] font-extrabold text-white leading-[1.1] tracking-tight mb-5">
            Nuestros <span className="text-[#14C6C9]">Servicios</span>
          </h1>
          <p className="text-[15px] md:text-[17px] lg:text-[18px] text-[#B0BEC5] max-w-[700px] mx-auto leading-relaxed mb-8">
            Importamos, personalizamos y distribuimos los mejores productos promocionales
            para que tu marca destaque. Conoce todo lo que podemos hacer por ti.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/productos"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#14C6C9] hover:bg-[#0fa8ab] text-white font-bold text-[13px] uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-[#14C6C9]/20"
            >
              <Package className="w-4 h-4" /> Ver catálogo
            </Link>
            <a
              href="https://wa.me/529512424333?text=Hola%2C%20quiero%20cotizar%20productos%20personalizados"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/20 hover:border-white/50 text-white font-bold text-[13px] uppercase tracking-widest rounded-xl transition-colors"
            >
              <Phone className="w-4 h-4" /> Cotizar ahora
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SERVICIOS PRINCIPALES
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#F5F6FA] dark:bg-[#0E0F12] py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
          <h2 className="text-[24px] md:text-[32px] font-extrabold text-[#111] dark:text-white text-center mb-3 tracking-tight">
            ¿Qué hacemos por ti?
          </h2>
          <p className="text-[14px] md:text-[15px] text-[#888] dark:text-[#999] text-center max-w-[600px] mx-auto mb-12">
            Desde la selección del producto hasta la entrega en tu puerta, cubrimos todo el proceso.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {servicios.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="bg-white dark:bg-[#12141A] rounded-2xl border border-[#EFEFEF] dark:border-[#1E2028] p-6 md:p-7 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: s.color + "15" }}
                  >
                    <Icon className="w-6 h-6" style={{ color: s.color }} />
                  </div>
                  <h3 className="text-[15px] font-bold text-[#111] dark:text-white">{s.title}</h3>
                  <p className="text-[13px] text-[#666] dark:text-[#999] leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TÉCNICAS DE PERSONALIZACIÓN
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-white dark:bg-[#0A0B0E] py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
          <h2 className="text-[24px] md:text-[32px] font-extrabold text-[#111] dark:text-white text-center mb-3 tracking-tight">
            Técnicas de <span className="text-[#14C6C9]">Personalización</span>
          </h2>
          <p className="text-[14px] md:text-[15px] text-[#888] dark:text-[#999] text-center max-w-[600px] mx-auto mb-12">
            Contamos con 5 técnicas profesionales para que tu logotipo quede perfecto en cualquier superficie.
          </p>

          <div className="flex flex-col gap-6">
            {tecnicas.map((t, idx) => {
              const Icon = t.icon;
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={t.title}
                  className={`flex flex-col md:flex-row items-start gap-5 bg-[#FAFAFA] dark:bg-[#12141A] rounded-2xl border border-[#EFEFEF] dark:border-[#1E2028] p-6 md:p-8 hover:shadow-lg transition-shadow duration-200 ${
                    !isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Icon + title */}
                  <div className="flex items-center gap-4 md:min-w-[240px] flex-shrink-0">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: t.color + "15" }}
                    >
                      <Icon className="w-7 h-7" style={{ color: t.color }} />
                    </div>
                    <div>
                      <h3 className="text-[16px] md:text-[18px] font-bold text-[#111] dark:text-white">{t.title}</h3>
                      <p className="text-[11px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: t.color }}>
                        Desde ${t.price} MXN / pieza
                      </p>
                    </div>
                  </div>

                  {/* Description + materials */}
                  <div className="flex-1">
                    <p className="text-[13px] md:text-[14px] text-[#555] dark:text-[#AAAAAA] leading-relaxed mb-3">{t.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {t.materiales.map((m) => (
                        <span
                          key={m}
                          className="px-3 py-1 rounded-full text-[11px] font-medium border border-[#E0E0E0] dark:border-[#2A2D36] text-[#555] dark:text-[#999] bg-white dark:bg-[#0E0F12]"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          PROCESO PASO A PASO
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#F5F6FA] dark:bg-[#0E0F12] py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
          <h2 className="text-[24px] md:text-[32px] font-extrabold text-[#111] dark:text-white text-center mb-3 tracking-tight">
            ¿Cómo funciona?
          </h2>
          <p className="text-[14px] md:text-[15px] text-[#888] dark:text-[#999] text-center max-w-[500px] mx-auto mb-12">
            En 4 sencillos pasos tienes tus productos personalizados.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {pasos.map((p, idx) => (
              <div key={p.step} className="relative bg-white dark:bg-[#12141A] rounded-2xl border border-[#EFEFEF] dark:border-[#1E2028] p-6 text-center">
                <div className="text-[42px] font-black text-[#14C6C9]/15 leading-none mb-2">{p.step}</div>
                <h3 className="text-[16px] font-bold text-[#111] dark:text-white mb-2">{p.title}</h3>
                <p className="text-[13px] text-[#666] dark:text-[#999] leading-relaxed">{p.desc}</p>

                {/* Arrow connector */}
                {idx < pasos.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#14C6C9] items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SERVICIOS ADICIONALES DE PUBLICIDAD
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-white dark:bg-[#0A0B0E] py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
          <div className="flex items-center gap-3 justify-center mb-3">
            <Megaphone className="w-7 h-7 text-[#E0007A]" />
            <h2 className="text-[24px] md:text-[32px] font-extrabold text-[#111] dark:text-white tracking-tight">
              Servicios de <span className="text-[#E0007A]">Publicidad</span>
            </h2>
          </div>
          <p className="text-[14px] md:text-[15px] text-[#888] dark:text-[#999] text-center max-w-[650px] mx-auto mb-12">
            Además de productos promocionales, ofrecemos una gama completa de servicios de publicidad e impresión para llevar tu marca a otro nivel.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: RectangleHorizontal,
                color: "#1A3D8F",
                title: "Lonas y Banners",
                desc: "Impresión en gran formato de lonas publicitarias, banners, pendones y vinil para interiores y exteriores con tintas de alta resolución y durabilidad.",
              },
              {
                icon: FileText,
                color: "#14C6C9",
                title: "Flyers y Papelería",
                desc: "Diseño e impresión de volantes, trípticos, tarjetas de presentación, notas de remisión, hojas membretadas y todo tipo de papelería corporativa.",
              },
              {
                icon: CreditCard,
                color: "#7BC043",
                title: "Credenciales y Gafetes",
                desc: "Credenciales personalizadas con fotografía, código QR o código de barras. Incluimos porta gafetes, cintas y accesorios para identificación corporativa.",
              },
              {
                icon: Flag,
                color: "#E0007A",
                title: "Toldos y Banderas",
                desc: "Toldos publicitarios, banderas tipo pluma, fly banners y estructuras portátiles para eventos, ferias, puntos de venta y activaciones de marca.",
              },
              {
                icon: Shirt,
                color: "#6A1B9A",
                title: "Diseño de Botargas",
                desc: "Creación y fabricación de botargas personalizadas con tu mascota o personaje de marca. Diseño a medida con materiales de alta calidad y comodidad.",
              },
              {
                icon: Palette,
                color: "#B8A800",
                title: "Diseño Gráfico",
                desc: "Servicio profesional de diseño de logotipos, identidad corporativa, diseño de empaques, catálogos, y material publicitario digital e impreso.",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="bg-[#FAFAFA] dark:bg-[#12141A] rounded-2xl border border-[#EFEFEF] dark:border-[#1E2028] p-6 md:p-7 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: s.color + "15" }}
                  >
                    <Icon className="w-6 h-6" style={{ color: s.color }} />
                  </div>
                  <h3 className="text-[15px] font-bold text-[#111] dark:text-white">{s.title}</h3>
                  <p className="text-[13px] text-[#666] dark:text-[#999] leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <p className="text-[13px] text-[#888] dark:text-[#999] mb-4">
              ¿Necesitas un servicio que no aparece aquí? Contáctanos y lo hacemos realidad.
            </p>
            <a
              href="https://wa.me/529512424333?text=Hola%2C%20me%20interesan%20sus%20servicios%20de%20publicidad"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E0007A] hover:bg-[#c4006b] text-white font-bold text-[12px] uppercase tracking-widest rounded-xl transition-colors"
            >
              <Phone className="w-4 h-4" /> Consultar servicios
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-gradient-to-br from-[#0A1628] via-[#0E1F3D] to-[#0A1628] py-16 md:py-20 relative overflow-hidden">
        <div className="absolute top-[-60px] left-1/2 w-[500px] h-[500px] bg-[#14C6C9]/8 rounded-full blur-[150px] -translate-x-1/2" />

        <div className="relative max-w-[700px] mx-auto px-6 text-center">
          <h2 className="text-[24px] md:text-[32px] font-extrabold text-white mb-4 tracking-tight">
            ¿Listo para impulsar tu marca?
          </h2>
          <p className="text-[14px] md:text-[15px] text-[#B0BEC5] mb-8 leading-relaxed">
            Cotiza sin compromiso. Nuestro equipo te asesorará para elegir los mejores productos
            y la técnica de personalización perfecta para tu empresa.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/529512424333?text=Hola%2C%20quiero%20cotizar%20productos%20personalizados"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] hover:bg-[#1fb855] text-white font-bold text-[13px] uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-[#25D366]/20"
            >
              <Phone className="w-4 h-4" /> Escríbenos por WhatsApp
            </a>
            <a
              href="mailto:disenarepromocionales@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 hover:border-white/50 text-white font-bold text-[13px] uppercase tracking-widest rounded-xl transition-colors"
            >
              Enviar correo
            </a>
          </div>

          <p className="text-[12px] text-[#607D8B] mt-6">
            Horario de atención: Lunes a Viernes de 9:00 a 18:00 hrs · disenarepromocionales@gmail.com
          </p>
        </div>
      </section>

      <Footer lineHeight={6} />
      <WhatsAppButton />
    </div>
  );
}
