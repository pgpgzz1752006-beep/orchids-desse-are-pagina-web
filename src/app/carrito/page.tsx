"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingCart, Zap, Droplets, Printer, Stamp, Flame, Pen } from "lucide-react";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";
import { useCartStore } from "@/lib/cartStore";

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

const formatPrice = (n: number) =>
  n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

export default function CarritoPage() {
  const { items, removeItem, updateQuantity } = useCartStore();

  const subtotal = items.reduce((acc, item) => acc + (item.price ?? 0) * item.quantity, 0);
  const FREE_SHIPPING_THRESHOLD = 5000;
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const total = subtotal;
  const totalItems = items.reduce((a, i) => a + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-[#0E0F12] font-['Montserrat'] transition-colors duration-300 flex flex-col">

      {/* Multicolor top bar */}
      <div className="flex w-full h-[10px]">
        {colorBarSegments.map((seg, i) => (
          <div key={i} style={{ backgroundColor: seg.color, width: seg.width }} />
        ))}
      </div>



      {/* Page title */}
      <div className="w-full bg-white dark:bg-[#0E0F12] pt-8 pb-6 px-6 md:px-10 lg:px-16">
        <h1 className="text-[22px] md:text-[28px] font-bold text-[#111] dark:text-white">Mi carrito</h1>
        <div className="flex w-full h-[4px] rounded-full overflow-hidden mt-3 max-w-[120px]">
          {colorBarSegments.map((seg, i) => (
            <div key={i} style={{ backgroundColor: seg.color, width: seg.width }} />
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 lg:px-10 pb-16 pt-6">

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <ShoppingCart className="w-20 h-20 text-[#D0D0D0]" strokeWidth={1} />
            <p className="text-[18px] font-semibold text-[#999] dark:text-[#555]">Tu carrito está vacío</p>
            <Link href="/productos" className="px-8 py-3 rounded-lg bg-[#14C6C9] text-white font-bold text-[14px] uppercase tracking-widest hover:bg-[#0fa8ab] transition-colors duration-200 shadow-md">
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Items list */}
            <div className="flex-1 flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white dark:bg-[#12141A] rounded-2xl border border-[#EFEFEF] dark:border-[#1E2028] shadow-sm p-4 md:p-5 flex gap-4 items-start transition-all duration-200 hover:shadow-md">

                  <Link href={`/producto/${item.slug}`} className="w-[90px] h-[90px] md:w-[110px] md:h-[110px] flex-shrink-0 rounded-xl overflow-hidden bg-[#F8F8F8] dark:bg-[#1A1C24] border border-[#EFEFEF] dark:border-[#2A2D36] flex items-center justify-center">
                    <Image src={item.image || "/placeholder-product.png"} alt={item.name} width={110} height={110} className="w-full h-full object-contain p-2" />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#AAAAAA] dark:text-[#666] font-medium uppercase tracking-wider mb-1">{item.sku}</p>
                    <Link href={`/producto/${item.slug}`}>
                      <h3 className="text-[13px] md:text-[14px] font-bold text-[#111] dark:text-white leading-tight mb-3 hover:text-[#14C6C9] transition-colors truncate">
                        {item.name}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center border border-[#E0E0E0] dark:border-[#2A2D36] rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-[#555] dark:text-[#aaa] hover:bg-[#F0F0F0] dark:hover:bg-[#1E2028] transition-colors duration-150" aria-label="Disminuir">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 h-8 flex items-center justify-center text-[14px] font-bold text-[#111] dark:text-white border-x border-[#E0E0E0] dark:border-[#2A2D36]">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-[#555] dark:text-[#aaa] hover:bg-[#F0F0F0] dark:hover:bg-[#1E2028] transition-colors duration-150" aria-label="Aumentar">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-[15px] md:text-[16px] font-bold text-[#111] dark:text-white">
                          {item.price != null
                            ? formatPrice(item.price * item.quantity)
                            : <span className="text-[#AAA] text-[13px] font-medium">Consultar</span>}
                        </span>
                        <button onClick={() => removeItem(item.id)} className="text-[#CCCCCC] hover:text-[#E0007A] transition-colors duration-200" aria-label="Eliminar">
                          <Trash2 className="w-[18px] h-[18px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Técnicas de grabado */}
            <div className="w-full bg-white dark:bg-[#12141A] rounded-2xl border border-[#EFEFEF] dark:border-[#1E2028] shadow-sm p-5 mt-2">
              <h3 className="text-[13px] font-bold text-[#111] dark:text-white uppercase tracking-wider mb-4">Técnicas de personalización disponibles</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FFFE] dark:bg-[#0E1A1A] border border-[#D0F5F5] dark:border-[#1A2E2E]">
                  <div className="w-8 h-8 rounded-lg bg-[#14C6C9]/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-[#14C6C9]" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[#111] dark:text-white leading-tight">Grabado Láser</p>
                    <p className="text-[10px] text-[#888] dark:text-[#666] mt-0.5 leading-snug">Grabado permanente de alta precisión en metal, madera, cuero y acrílico.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FFF8FE] dark:bg-[#1A0E1A] border border-[#F0D0F5] dark:border-[#2E1A2E]">
                  <div className="w-8 h-8 rounded-lg bg-[#E0007A]/10 flex items-center justify-center flex-shrink-0">
                    <Printer className="w-4 h-4 text-[#E0007A]" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[#111] dark:text-white leading-tight">Serigrafía</p>
                    <p className="text-[10px] text-[#888] dark:text-[#666] mt-0.5 leading-snug">Impresión con tinta de alta durabilidad ideal para textiles y plásticos.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FFFFF5] dark:bg-[#1A1A0E] border border-[#F0F0C0] dark:border-[#2E2E1A]">
                  <div className="w-8 h-8 rounded-lg bg-[#F3E300]/20 flex items-center justify-center flex-shrink-0">
                    <Stamp className="w-4 h-4 text-[#B8A800]" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[#111] dark:text-white leading-tight">Tampografía</p>
                    <p className="text-[10px] text-[#888] dark:text-[#666] mt-0.5 leading-snug">Transferencia de tinta en superficies irregulares, curvas o de difícil acceso.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F5FFF8] dark:bg-[#0E1A12] border border-[#C0F0D0] dark:border-[#1A2E20]">
                  <div className="w-8 h-8 rounded-lg bg-[#7BC043]/10 flex items-center justify-center flex-shrink-0">
                    <Pen className="w-4 h-4 text-[#7BC043]" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[#111] dark:text-white leading-tight">Bordado</p>
                    <p className="text-[10px] text-[#888] dark:text-[#666] mt-0.5 leading-snug">Diseño en hilo de alta calidad sobre gorras, playeras y mochilas.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F5F8FF] dark:bg-[#0E1018] border border-[#C0D0F5] dark:border-[#1A202E]">
                  <div className="w-8 h-8 rounded-lg bg-[#1A3D8F]/10 flex items-center justify-center flex-shrink-0">
                    <Droplets className="w-4 h-4 text-[#1A3D8F]" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[#111] dark:text-white leading-tight">Sublimación</p>
                    <p className="text-[10px] text-[#888] dark:text-[#666] mt-0.5 leading-snug">Impresión a todo color y a todo lo ancho en telas y materiales poliéster.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FFF5F5] dark:bg-[#1A0E0E] border border-[#F5C0C0] dark:border-[#2E1A1A]">
                  <div className="w-8 h-8 rounded-lg bg-[#FF4500]/10 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-4 h-4 text-[#FF4500]" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[#111] dark:text-white leading-tight">Transfer Digital</p>
                    <p className="text-[10px] text-[#888] dark:text-[#666] mt-0.5 leading-snug">Impresión en vinil o calcomanía aplicada con calor sobre distintas superficies.</p>
                  </div>
                </div>

              </div>
              <p className="text-[10px] text-[#AAAAAA] dark:text-[#555] mt-4 text-center">
                La técnica disponible depende del producto. Nuestro equipo te asesorará al confirmar tu pedido.
              </p>
            </div>

            {/* Order summary */}
            <div className="w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 sticky top-6">
              <div className="bg-white dark:bg-[#12141A] rounded-2xl border border-[#EFEFEF] dark:border-[#1E2028] shadow-sm p-6 flex flex-col gap-5">

                  <h2 className="text-[17px] font-bold text-[#111] dark:text-white">Resumen del pedido</h2>

                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-[13px] text-[#666] dark:text-[#999]">
                      <span>Subtotal ({totalItems} artículo{totalItems !== 1 ? "s" : ""})</span>
                      <span className="font-semibold text-[#111] dark:text-white">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[13px] text-[#666] dark:text-[#999]">
                      <span>Envío</span>
                      {freeShipping
                        ? <span className="font-bold text-[#7BC043]">¡Gratis!</span>
                        : <span className="font-semibold text-[#7BC043]">A cotizar</span>
                      }
                    </div>

                    {/* Barra de progreso hacia envío gratis */}
                    {!freeShipping && (
                      <div className="flex flex-col gap-1.5 pt-1">
                        <div className="w-full h-[6px] rounded-full bg-[#F0F0F0] dark:bg-[#1E2028] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#14C6C9] transition-all duration-500"
                          style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-[#999] dark:text-[#555]">
                            Te faltan <span className="font-bold text-[#111] dark:text-white">{formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}</span> para envío gratis
                        </p>
                      </div>
                    )}

                    {freeShipping && (
                      <p className="text-[11px] font-semibold text-[#7BC043]">
                        ¡Tu pedido califica para envío gratuito!
                      </p>
                    )}
                  </div>

                <div className="h-px bg-[#F0F0F0] dark:bg-[#1E2028]" />

                <div className="flex justify-between items-center">
                  <span className="text-[15px] font-bold text-[#111] dark:text-white">Total</span>
                  <span className="text-[20px] font-bold text-[#14C6C9]">{formatPrice(total)}</span>
                </div>

                <a
                  href="https://link.mercadopago.com.mx/disenarepromocionale"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-[52px] rounded-xl bg-[#14C6C9] hover:bg-[#0fa8ab] active:scale-[0.98] text-white font-bold text-[14px] uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  Proceder al pago
                </a>

                <Link href="/productos" className="text-center text-[12px] text-[#AAAAAA] dark:text-[#555] hover:text-[#14C6C9] transition-colors duration-200">
                  ← Seguir comprando
                </Link>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer lineHeight={6} />
      <WhatsAppButton />
    </div>
  );
}
