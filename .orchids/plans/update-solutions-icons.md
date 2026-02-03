# Actualizar Íconos de Nuestras Soluciones

## Resumen
Reemplazar los íconos de Lucide en la sección "Nuestras Soluciones" por las 4 imágenes PNG proporcionadas por el usuario, manteniendo el diseño actual intacto.

## Contexto Actual

### Archivo a Modificar
- `src/components/SolutionsSection.tsx`

### Estado Actual
- 4 cards con íconos Lucide: `Droplet`, `Wand2`, `Award`, `Package`
- Contenedor blanco 40x40px con border-radius 10px
- Íconos turquesa 22x22px centrados

## Mapeo EXACTO de Íconos (proporcionado por usuario)

| Card | Título | Archivo Imagen |
|------|--------|----------------|
| 1 | Productos | `disenare-maqueta-13.png` (CAJA/PAQUETE) |
| 2 | Personalización | `disenare-maqueta-11.png` (TARGET + PLUMA) |
| 3 | Proyectos especiales | `disenare-maqueta-12.png` (MEDALLA/ESTRELLA) |
| 4 | Distribución | `disenare-maqueta-10.png` (BOTELLA) |

## Plan de Implementación

### Fase 1: Descargar Assets
- [ ] Descargar los 4 íconos desde Supabase project-uploads
- [ ] Guardar en `public/icons/` con nombres descriptivos:
  - `icon-productos.png` ← disenare-maqueta-13
  - `icon-personalizacion.png` ← disenare-maqueta-11
  - `icon-proyectos.png` ← disenare-maqueta-12
  - `icon-distribucion.png` ← disenare-maqueta-10

### Fase 2: Actualizar SolutionsSection.tsx
- [ ] Eliminar import de Lucide: `import { Droplet, Wand2, Award, Package } from "lucide-react";`
- [ ] Cambiar array `solutions` para usar rutas de imagen en lugar de componentes
- [ ] Reemplazar `<solution.icon className="..." strokeWidth={2} />` por `<img>`

### Fase 3: Especificaciones de Imagen

**Contenedor (NO CAMBIAR):**
```css
w-10 h-10 bg-white rounded-[10px] flex items-center justify-center mb-4
```

**Imagen `<img>`:**
```jsx
<img
  src={solution.icon}
  alt={solution.title}
  width={24}
  height={24}
  className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] lg:w-[22px] lg:h-[22px] object-contain block"
/>
```

**Tamaños responsive:**
- Mobile: 18-20px
- Tablet: 20-22px  
- Desktop: 22-24px

## Código Final Propuesto

```tsx
"use client";

const solutions = [
  {
    icon: "/icons/icon-productos.png",
    title: "Productos",
    description: "Innovamos en productos, colores y materiales. Tenemos uno de los catálogos más amplios de la industria.",
  },
  {
    icon: "/icons/icon-personalizacion.png",
    title: "Personalización",
    description: "Todos nuestros productos son totalmente personalizables. Puedes utilizar nuestro visualizador con tu logotipo.",
  },
  {
    icon: "/icons/icon-proyectos.png",
    title: "Proyectos especiales",
    description: "¿No encontraste lo que buscabas? Podemos crear artículos a tu medida: lonas, flyers, notas de remisión y un sin fin de artículos impresos.",
  },
  {
    icon: "/icons/icon-distribucion.png",
    title: "Distribución",
    description: "Entregamos tus productos en cualquier rincón de México, con una logística confiable y eficiente.",
  },
];

export default function SolutionsSection() {
  return (
    <section className="w-full bg-white py-16 md:py-20 lg:py-16">
      <div className="w-full max-w-[1280px] mx-auto px-5 md:px-8 lg:px-8">
        {/* Title - SIN CAMBIOS */}
        <h2 className="text-center font-['Montserrat'] text-[30px] md:text-[38px] lg:text-[44px] tracking-[0.03em] text-[#111111] mb-5">
          <span className="font-normal">NUESTRAS </span>
          <span className="font-extrabold">SOLUCIONES</span>
        </h2>

        {/* Description - SIN CAMBIOS */}
        <p className="text-center font-['Montserrat'] text-[14px] md:text-[15px] lg:text-[15px] leading-[1.7] text-[#2F2F2F] max-w-[880px] mx-auto mb-10 md:mb-12 lg:mb-14">
          Importamos, personalizamos y distribuimos los mejores productos promocionales para que tu
          negocio crezca. Con un catálogo exclusivo, precios competitivos y soluciones a la medida, somos
          el aliado estratégico que necesitas para ofrecer más y mejor a tus clientes.
        </p>

        {/* Cards Grid - SIN CAMBIOS en estructura */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {solutions.map((solution) => (
            <div
              key={solution.title}
              className="bg-[#F2F2F2] rounded-xl p-5 lg:p-[22px] flex flex-col transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-sm"
            >
              {/* Icon Container - MISMO TAMAÑO, solo cambio interno */}
              <div className="w-10 h-10 bg-white rounded-[10px] flex items-center justify-center mb-4">
                <img
                  src={solution.icon}
                  alt={solution.title}
                  width={24}
                  height={24}
                  className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] lg:w-[22px] lg:h-[22px] object-contain block"
                />
              </div>

              {/* Title - SIN CAMBIOS */}
              <h3 className="font-['Montserrat'] text-[16px] lg:text-[17px] font-bold text-[#111111] mb-2">
                {solution.title}
              </h3>

              {/* Description - SIN CAMBIOS */}
              <p className="font-['Montserrat'] text-[13px] lg:text-[13.5px] leading-[1.6] text-[#4A4A4A] min-h-[72px]">
                {solution.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

## Reglas Estrictas

### NO CAMBIAR:
- Título y párrafo de la sección
- Grid layout (4 cols desktop, 2x2 tablet, 1 col mobile)
- Fondo de cards (#F2F2F2)
- Paddings, margins, border-radius
- Tipografías y colores de texto
- Hover existente (translate + shadow)

### CAMBIAR SOLO:
- Eliminar imports de Lucide
- Cambiar `icon: LucideComponent` → `icon: "/path/to/image.png"`
- Cambiar `<solution.icon />` → `<img src={solution.icon} />`

## Archivos Involucrados
1. `src/components/SolutionsSection.tsx` - Modificar
2. `public/icons/` - Agregar 4 nuevos PNGs

## URLs de Assets (Supabase)
Los archivos deben descargarse de las URLs del proyecto:
- `disenare-maqueta-10.png` → Botella
- `disenare-maqueta-11.png` → Target + Pluma  
- `disenare-maqueta-12.png` → Medalla
- `disenare-maqueta-13.png` → Caja/Paquete

## Notas de Accesibilidad
- Cada `<img>` tiene `alt` con el nombre de la solución
- No se agregan animaciones nuevas
- Tamaños fijos evitan CLS (Cumulative Layout Shift)
