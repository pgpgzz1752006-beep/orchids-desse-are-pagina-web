import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string        // product id (uuid)
  sku: string
  name: string
  slug: string
  image: string
  price: number | null
  quantity: number
  color?: string | null
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, delta: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

        addItem: (incoming, qty = 1) =>
          set((state) => {
            const existing = state.items.find((i) => i.id === incoming.id && (i.color ?? null) === (incoming.color ?? null))
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.id === incoming.id && (i.color ?? null) === (incoming.color ?? null) ? { ...i, quantity: i.quantity + qty } : i
                ),
              }
            }
            return { items: [...state.items, { ...incoming, quantity: qty }] }
          }),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, delta) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
            .filter((i) => i.quantity > 0),
        })),

      clearCart: () => set({ items: [] }),
    }),
    { name: 'disenare-cart' }
  )
)
