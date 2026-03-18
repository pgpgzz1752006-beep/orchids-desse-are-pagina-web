import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Address {
  id: string;
  label: string;
  street: string;
  exterior: string;
  interior: string;
  colonia: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

interface AddressStore {
  addresses: Address[];
  addAddress: (a: Omit<Address, "id">) => void;
  updateAddress: (id: string, a: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
  getDefault: () => Address | undefined;
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: [],
      addAddress: (a) =>
        set((s) => {
          const id = crypto.randomUUID();
          const isFirst = s.addresses.length === 0;
          return {
            addresses: [
              ...s.addresses.map((x) => (a.isDefault || isFirst ? { ...x, isDefault: false } : x)),
              { ...a, id, isDefault: a.isDefault || isFirst },
            ],
          };
        }),
      updateAddress: (id, a) =>
        set((s) => ({
          addresses: s.addresses.map((x) => (x.id === id ? { ...x, ...a } : x)),
        })),
      removeAddress: (id) =>
        set((s) => {
          const remaining = s.addresses.filter((x) => x.id !== id);
          if (remaining.length > 0 && !remaining.some((x) => x.isDefault)) {
            remaining[0].isDefault = true;
          }
          return { addresses: remaining };
        }),
      setDefault: (id) =>
        set((s) => ({
          addresses: s.addresses.map((x) => ({ ...x, isDefault: x.id === id })),
        })),
      getDefault: () => get().addresses.find((a) => a.isDefault),
    }),
    { name: "disenare-addresses" }
  )
);
