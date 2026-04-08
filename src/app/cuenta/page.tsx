"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, MapPin, Package, LogOut, Plus, Trash2, Star, Loader2, ChevronRight, Edit2, Check, X,
} from "lucide-react";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { useAddressStore, type Address } from "@/lib/addressStore";
import { useOrderStore } from "@/lib/orderStore";

type Tab = "perfil" | "direcciones" | "pedidos";

const formatPrice = (n: number) =>
  n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

const ESTADOS_MX = [
  "Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua",
  "Ciudad de México","Coahuila","Colima","Durango","Estado de México","Guanajuato","Guerrero",
  "Hidalgo","Jalisco","Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla",
  "Querétaro","Quintana Roo","San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas",
  "Tlaxcala","Veracruz","Yucatán","Zacatecas",
];

export default function CuentaPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut, updateProfile } = useAuth();
  const { addresses, addAddress, updateAddress, removeAddress, setDefault } = useAddressStore();
  const { orders } = useOrderStore();

  // Deduplicate orders on mount (fix for previously duplicated orders)
  useEffect(() => {
    const raw = localStorage.getItem("disenare-orders");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const allOrders: Array<{ id: string; items: Array<{ name: string; quantity: number }>; total: number; createdAt: string; status: string; [key: string]: unknown }> = parsed?.state?.orders ?? [];
      if (allOrders.length <= 1) return;

      // Deduplicate by matching items+total (same order placed at similar times)
      const seen = new Map<string, typeof allOrders[0]>();
      for (const order of allOrders) {
        const key = order.items.map(i => `${i.name}:${i.quantity}`).sort().join("|") + `|${order.total}`;
        const existing = seen.get(key);
        if (!existing) {
          seen.set(key, order);
        } else {
          // Keep the one with better status (approved > pending > rejected)
          const priority = { approved: 3, rejected: 1, pending: 2 } as Record<string, number>;
          if ((priority[order.status] || 0) > (priority[existing.status] || 0)) {
            seen.set(key, order);
          }
        }
      }

      const deduped = Array.from(seen.values());
      if (deduped.length < allOrders.length) {
        parsed.state.orders = deduped;
        localStorage.setItem("disenare-orders", JSON.stringify(parsed));
        window.location.reload();
      }
    } catch {}
  }, []);

  const [tab, setTab] = useState<Tab>("perfil");

  // Profile
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Address form
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState<Omit<Address, "id">>({
    label: "Casa", street: "", exterior: "", interior: "", colonia: "", city: "", state: "", zip: "", isDefault: false,
  });

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || "");
      setPhone(user.user_metadata?.phone || "");
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg(null);
    const { error } = await updateProfile({ full_name: fullName, phone });
    if (error) setProfileMsg("Error: " + error);
    else setProfileMsg("Perfil actualizado correctamente.");
    setProfileSaving(false);
    setTimeout(() => setProfileMsg(null), 3000);
  };

  const handleSaveAddress = () => {
    if (!addrForm.street || !addrForm.city || !addrForm.state || !addrForm.zip) return;
    if (editingAddrId) {
      updateAddress(editingAddrId, addrForm);
      if (addrForm.isDefault) setDefault(editingAddrId);
    } else {
      addAddress(addrForm);
    }
    setShowAddrForm(false);
    setEditingAddrId(null);
    setAddrForm({ label: "Casa", street: "", exterior: "", interior: "", colonia: "", city: "", state: "", zip: "", isDefault: false });
  };

  const startEditAddress = (a: Address) => {
    setEditingAddrId(a.id);
    setAddrForm({ label: a.label, street: a.street, exterior: a.exterior, interior: a.interior, colonia: a.colonia, city: a.city, state: a.state, zip: a.zip, isDefault: a.isDefault });
    setShowAddrForm(true);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  if (authLoading || !user) return null;

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "perfil", label: "Mi perfil", icon: User },
    { id: "direcciones", label: "Direcciones", icon: MapPin },
    { id: "pedidos", label: "Mis pedidos", icon: Package },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-[#0E0F12] font-['Montserrat'] transition-colors duration-300 flex flex-col">
      {/* Title */}
      <div className="w-full bg-white dark:bg-[#0E0F12] pt-8 pb-6 px-6 md:px-10 lg:px-16">
        <h1 className="text-[22px] md:text-[28px] font-bold text-[#111] dark:text-white">Mi cuenta</h1>
        <p className="text-[13px] text-[#888] dark:text-[#666] mt-1">
          {user.email}
        </p>
      </div>

      <main className="flex-1 w-full max-w-[1000px] mx-auto px-4 md:px-8 pb-16 pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-[240px] flex-shrink-0">
            <div className="bg-white dark:bg-[#12141A] rounded-2xl border border-[#EFEFEF] dark:border-[#1E2028] shadow-sm overflow-hidden">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`w-full flex items-center gap-3 px-5 py-4 text-left text-[13px] font-semibold transition-colors border-b border-[#F0F0F0] dark:border-[#1E2028] last:border-b-0 ${
                      active
                        ? "text-[#14C6C9] bg-[#F0FDFD] dark:bg-[#14C6C9]/10"
                        : "text-[#555] dark:text-[#999] hover:text-[#111] dark:hover:text-white hover:bg-[#FAFAFA] dark:hover:bg-[#1A1C24]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                    <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-4 text-left text-[13px] font-semibold text-[#E0007A] hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* PERFIL TAB */}
            {tab === "perfil" && (
              <div className="bg-white dark:bg-[#12141A] rounded-2xl border border-[#EFEFEF] dark:border-[#1E2028] shadow-sm p-6 md:p-8">
                <h2 className="text-[18px] font-bold text-[#111] dark:text-white mb-6">Información personal</h2>

                <div className="flex flex-col gap-5 max-w-[400px]">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#555] dark:text-[#999] uppercase tracking-wide">Nombre completo</label>
                    <input
                      value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-[44px] px-4 rounded-lg border border-[#D8D8D8] dark:border-[#2A2D36] bg-[#FAFAFA] dark:bg-[#1A1C24] text-[14px] text-[#111] dark:text-white outline-none focus:border-[#14C6C9] focus:ring-2 focus:ring-[#14C6C9]/20 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#555] dark:text-[#999] uppercase tracking-wide">Correo electrónico</label>
                    <input value={user.email || ""} disabled
                      className="w-full h-[44px] px-4 rounded-lg border border-[#E8E8E8] dark:border-[#2A2D36] bg-[#F0F0F0] dark:bg-[#1A1C24] text-[14px] text-[#888] dark:text-[#666] cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#555] dark:text-[#999] uppercase tracking-wide">Teléfono</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(000) 000-0000"
                      className="w-full h-[44px] px-4 rounded-lg border border-[#D8D8D8] dark:border-[#2A2D36] bg-[#FAFAFA] dark:bg-[#1A1C24] text-[14px] text-[#111] dark:text-white placeholder-[#BBBBBB] dark:placeholder-[#555] outline-none focus:border-[#14C6C9] focus:ring-2 focus:ring-[#14C6C9]/20 transition-all"
                    />
                  </div>

                  {profileMsg && (
                    <p className={`text-[13px] ${profileMsg.startsWith("Error") ? "text-red-500" : "text-[#7BC043]"}`}>
                      {profileMsg}
                    </p>
                  )}

                  <button onClick={handleSaveProfile} disabled={profileSaving}
                    className="w-fit px-8 py-3 rounded-lg bg-[#14C6C9] hover:bg-[#0fa8ab] text-white font-bold text-[13px] uppercase tracking-widest transition-all shadow-md disabled:opacity-60 flex items-center gap-2">
                    {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Guardar cambios
                  </button>
                </div>
              </div>
            )}

            {/* DIRECCIONES TAB */}
            {tab === "direcciones" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[18px] font-bold text-[#111] dark:text-white">Mis direcciones</h2>
                  {!showAddrForm && (
                    <button onClick={() => { setEditingAddrId(null); setAddrForm({ label: "Casa", street: "", exterior: "", interior: "", colonia: "", city: "", state: "", zip: "", isDefault: false }); setShowAddrForm(true); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#14C6C9] hover:bg-[#0fa8ab] text-white font-bold text-[12px] uppercase tracking-wider transition-all shadow-sm">
                      <Plus className="w-4 h-4" /> Agregar
                    </button>
                  )}
                </div>

                {showAddrForm && (
                  <div className="bg-white dark:bg-[#12141A] rounded-2xl border border-[#EFEFEF] dark:border-[#1E2028] shadow-sm p-6">
                    <h3 className="text-[15px] font-bold text-[#111] dark:text-white mb-4">
                      {editingAddrId ? "Editar dirección" : "Nueva dirección"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-[#555] dark:text-[#999] uppercase">Etiqueta</label>
                        <select value={addrForm.label} onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                          className="h-[42px] px-3 rounded-lg border border-[#D8D8D8] dark:border-[#2A2D36] bg-[#FAFAFA] dark:bg-[#1A1C24] text-[13px] text-[#111] dark:text-white outline-none focus:border-[#14C6C9]">
                          <option>Casa</option><option>Oficina</option><option>Otro</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-[#555] dark:text-[#999] uppercase">Código postal *</label>
                        <input value={addrForm.zip} onChange={(e) => setAddrForm({ ...addrForm, zip: e.target.value })} placeholder="00000"
                          className="h-[42px] px-3 rounded-lg border border-[#D8D8D8] dark:border-[#2A2D36] bg-[#FAFAFA] dark:bg-[#1A1C24] text-[13px] text-[#111] dark:text-white outline-none focus:border-[#14C6C9]" />
                      </div>
                      <div className="md:col-span-2 flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-[#555] dark:text-[#999] uppercase">Calle *</label>
                        <input value={addrForm.street} onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })} placeholder="Av. Ejemplo"
                          className="h-[42px] px-3 rounded-lg border border-[#D8D8D8] dark:border-[#2A2D36] bg-[#FAFAFA] dark:bg-[#1A1C24] text-[13px] text-[#111] dark:text-white outline-none focus:border-[#14C6C9]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-[#555] dark:text-[#999] uppercase">Núm. exterior</label>
                        <input value={addrForm.exterior} onChange={(e) => setAddrForm({ ...addrForm, exterior: e.target.value })} placeholder="#123"
                          className="h-[42px] px-3 rounded-lg border border-[#D8D8D8] dark:border-[#2A2D36] bg-[#FAFAFA] dark:bg-[#1A1C24] text-[13px] text-[#111] dark:text-white outline-none focus:border-[#14C6C9]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-[#555] dark:text-[#999] uppercase">Núm. interior</label>
                        <input value={addrForm.interior} onChange={(e) => setAddrForm({ ...addrForm, interior: e.target.value })} placeholder="Depto 4B"
                          className="h-[42px] px-3 rounded-lg border border-[#D8D8D8] dark:border-[#2A2D36] bg-[#FAFAFA] dark:bg-[#1A1C24] text-[13px] text-[#111] dark:text-white outline-none focus:border-[#14C6C9]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-[#555] dark:text-[#999] uppercase">Colonia</label>
                        <input value={addrForm.colonia} onChange={(e) => setAddrForm({ ...addrForm, colonia: e.target.value })} placeholder="Col. Centro"
                          className="h-[42px] px-3 rounded-lg border border-[#D8D8D8] dark:border-[#2A2D36] bg-[#FAFAFA] dark:bg-[#1A1C24] text-[13px] text-[#111] dark:text-white outline-none focus:border-[#14C6C9]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-[#555] dark:text-[#999] uppercase">Ciudad *</label>
                        <input value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} placeholder="Guadalajara"
                          className="h-[42px] px-3 rounded-lg border border-[#D8D8D8] dark:border-[#2A2D36] bg-[#FAFAFA] dark:bg-[#1A1C24] text-[13px] text-[#111] dark:text-white outline-none focus:border-[#14C6C9]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-[#555] dark:text-[#999] uppercase">Estado *</label>
                        <select value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                          className="h-[42px] px-3 rounded-lg border border-[#D8D8D8] dark:border-[#2A2D36] bg-[#FAFAFA] dark:bg-[#1A1C24] text-[13px] text-[#111] dark:text-white outline-none focus:border-[#14C6C9]">
                          <option value="">Seleccionar...</option>
                          {ESTADOS_MX.map((e) => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-2 flex items-center gap-2">
                        <input type="checkbox" id="addrDefault" checked={addrForm.isDefault} onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                          className="w-4 h-4 accent-[#14C6C9]" />
                        <label htmlFor="addrDefault" className="text-[12px] text-[#555] dark:text-[#999]">Establecer como dirección predeterminada</label>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button onClick={handleSaveAddress}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#14C6C9] hover:bg-[#0fa8ab] text-white font-bold text-[12px] uppercase tracking-wider transition-all shadow-sm">
                        <Check className="w-4 h-4" /> Guardar
                      </button>
                      <button onClick={() => { setShowAddrForm(false); setEditingAddrId(null); }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-[#D8D8D8] dark:border-[#2A2D36] text-[#555] dark:text-[#999] font-bold text-[12px] uppercase tracking-wider hover:bg-[#F5F5F5] dark:hover:bg-[#1A1C24] transition-all">
                        <X className="w-4 h-4" /> Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {addresses.length === 0 && !showAddrForm && (
                  <div className="bg-white dark:bg-[#12141A] rounded-2xl border border-[#EFEFEF] dark:border-[#1E2028] shadow-sm p-10 text-center">
                    <MapPin className="w-12 h-12 mx-auto text-[#D0D0D0] mb-3" strokeWidth={1} />
                    <p className="text-[14px] text-[#999] dark:text-[#555]">No tienes direcciones guardadas.</p>
                  </div>
                )}

                {addresses.map((a) => (
                  <div key={a.id} className="bg-white dark:bg-[#12141A] rounded-2xl border border-[#EFEFEF] dark:border-[#1E2028] shadow-sm p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#14C6C9]/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#14C6C9]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-bold text-[#111] dark:text-white">{a.label}</span>
                        {a.isDefault && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#14C6C9]/10 text-[#14C6C9] text-[10px] font-bold">
                            <Star className="w-3 h-3" /> Predeterminada
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#666] dark:text-[#999] leading-relaxed">
                        {a.street} {a.exterior}{a.interior ? `, Int. ${a.interior}` : ""}, {a.colonia && `${a.colonia}, `}{a.city}, {a.state} C.P. {a.zip}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => startEditAddress(a)} className="p-2 text-[#AAAAAA] hover:text-[#14C6C9] transition-colors" aria-label="Editar">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeAddress(a.id)} className="p-2 text-[#AAAAAA] hover:text-[#E0007A] transition-colors" aria-label="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PEDIDOS TAB */}
            {tab === "pedidos" && (
              <div className="flex flex-col gap-4">
                <h2 className="text-[18px] font-bold text-[#111] dark:text-white">Historial de pedidos</h2>

                {orders.length === 0 ? (
                  <div className="bg-white dark:bg-[#12141A] rounded-2xl border border-[#EFEFEF] dark:border-[#1E2028] shadow-sm p-10 text-center">
                    <Package className="w-12 h-12 mx-auto text-[#D0D0D0] mb-3" strokeWidth={1} />
                    <p className="text-[14px] text-[#999] dark:text-[#555]">Aún no tienes pedidos.</p>
                    <a href="/productos" className="inline-block mt-4 px-6 py-2.5 rounded-lg bg-[#14C6C9] hover:bg-[#0fa8ab] text-white font-bold text-[12px] uppercase tracking-wider transition-all shadow-sm">
                      Ver productos
                    </a>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="bg-white dark:bg-[#12141A] rounded-2xl border border-[#EFEFEF] dark:border-[#1E2028] shadow-sm p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-[11px] text-[#AAAAAA] dark:text-[#666] font-medium uppercase tracking-wider">
                            Pedido #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-[11px] text-[#888] dark:text-[#666]">
                            {new Date(order.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${
                          order.status === "approved"
                            ? "bg-[#7BC043]/10 text-[#7BC043]"
                            : order.status === "rejected"
                            ? "bg-[#E0007A]/10 text-[#E0007A]"
                            : "bg-[#F3E300]/10 text-[#B8A800]"
                        }`}>
                          {order.status === "approved" ? "Aprobado" : order.status === "rejected" ? "Rechazado" : "Pendiente"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-[12px]">
                            <span className="text-[#555] dark:text-[#999]">{item.quantity}x {item.name}</span>
                            <span className="font-semibold text-[#111] dark:text-white">
                              {item.price != null ? formatPrice(item.price * item.quantity) : "Consultar"}
                            </span>
                          </div>
                        ))}
                        {order.tecnica && (
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="text-[#14C6C9]">{order.tecnica.label}</span>
                            <span className="font-semibold text-[#111] dark:text-white">+ {formatPrice(order.tecnica.price)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#F0F0F0] dark:border-[#1E2028]">
                        <span className="text-[13px] font-bold text-[#111] dark:text-white">Total</span>
                        <span className="text-[16px] font-bold text-[#14C6C9]">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer lineHeight={6} />
      <WhatsAppButton />
    </div>
  );
}
