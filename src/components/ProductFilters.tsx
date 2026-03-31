"use client";

import { useState, useEffect } from "react";
import { ChevronDown, X, Filter } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FacetValue {
  value: string;
  count: number;
}

interface CategoryFacet {
  id: string;
  name: string;
  count: number;
}

interface Facets {
  color: FacetValue[];
  brand: FacetValue[];
  productType: FacetValue[];
  categories: CategoryFacet[];
  capacity: FacetValue[];
}

interface ProductFiltersProps {
  selectedFilters: {
    color: string[];
    brand: string[];
    type: string[];
    cat: string[];
    cap: string[];
  };
  onChange: (filters: any) => void;
  onClear: () => void;
  category?: string;
  className?: string;
}

export default function ProductFilters({
  selectedFilters,
  onChange,
  onClear,
  category,
  className
}: ProductFiltersProps) {
  const [facets, setFacets] = useState<Facets | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFacets() {
      try {
        const res = await fetch(`/api/products/facets${category ? `?category=${category}` : ""}`);
        const data = await res.json();
        setFacets(data);
      } catch (error) {
        console.error("Error fetching facets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFacets();
  }, [category]);

  const toggleFilter = (key: keyof typeof selectedFilters, value: string) => {
    const current = selectedFilters[key];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    
    onChange({ ...selectedFilters, [key]: next });
  };

  if (loading) {
    return (
      <div className={cn("space-y-4 animate-pulse", className)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!facets) return null;

  const sections = [
    { id: "color", label: "COLOR", data: facets.color, key: "color" as const },
    { id: "brand", label: "MARCA", data: facets.brand, key: "brand" as const },
    { id: "type", label: "TIPO DE PRODUCTO", data: facets.productType, key: "type" as const },
    { id: "cat", label: "CATEGORÍAS", data: facets.categories, key: "cat" as const },
    { id: "cap", label: "CAPACIDAD", data: facets.capacity, key: "cap" as const },
  ];

  const hasActiveFilters = Object.values(selectedFilters).some(arr => arr.length > 0);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Filter className="w-4 h-4" />
          FILTROS
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-xs text-[#14C6C9] hover:underline flex items-center gap-1"
          >
            Limpiar todo
          </button>
        )}
      </div>

      <Accordion.Root type="multiple" className="space-y-2" defaultValue={["color", "brand"]}>
        {sections.map((section) => {
          if (section.data.length === 0) return null;

          return (
            <Accordion.Item
              key={section.id}
              value={section.id}
              className="border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              <Accordion.Header className="flex">
                <Accordion.Trigger className="group flex flex-1 items-center justify-between py-4 text-sm font-semibold hover:text-[#14C6C9] transition-colors uppercase tracking-wider">
                  {section.label}
                  <ChevronDown className="h-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180 text-gray-400" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="pb-4 space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {section.data.map((item: any) => {
                    const value = section.id === "cat" ? item.id : item.value;
                    const rawLabel = section.id === "cat" ? item.name : item.value;
                    const label = rawLabel.replace(/_/g, " ");
                    const isSelected = selectedFilters[section.key].includes(value);

                    return (
                      <label
                        key={value}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFilter(section.key, value)}
                            className="peer sr-only"
                          />
                          <div className="w-5 h-5 border-2 border-gray-200 dark:border-gray-700 rounded-md peer-checked:border-[#14C6C9] peer-checked:bg-[#14C6C9] transition-all" />
                          <motion.div
                            initial={false}
                            animate={{ scale: isSelected ? 1 : 0 }}
                            className="absolute inset-0 flex items-center justify-center text-white pointer-events-none"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        </div>
                        <span className={cn(
                          "text-sm transition-colors",
                          isSelected ? "text-[#14C6C9] font-medium" : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200"
                        )}>
                          {label}
                        </span>
                        <span className="ml-auto text-[10px] text-gray-400 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                          {item.count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>

      {/* Footer Apply Button (Mobile could use this fixed, desktop uses instant) */}
      <div className="mt-auto pt-6 lg:hidden">
        <button
          onClick={() => onChange(selectedFilters)}
          className="w-full bg-[#14C6C9] text-white py-3 rounded-xl font-bold hover:bg-[#11b3b6] transition-colors"
        >
          APLICAR FILTROS
        </button>
      </div>
    </div>
  );
}
