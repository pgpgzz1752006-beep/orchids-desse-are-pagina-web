import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  price: number | null;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  tecnica: { label: string; price: number } | null;
  subtotal: number;
  total: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  shippingAddress?: string;
}

interface OrderStore {
  orders: Order[];
  addOrder: (o: Omit<Order, "id" | "createdAt">) => string;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (o) => {
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        set((s) => ({ orders: [{ ...o, id, createdAt }, ...s.orders] }));
        return id;
      },
      updateOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),
      clearOrders: () => set({ orders: [] }),
    }),
    { name: "disenare-orders" }
  )
);
