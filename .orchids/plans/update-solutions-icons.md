# Actualizar Íconos de Nuestras Soluciones

## Resumen
Reemplazar los íconos de Lucide en la sección "Nuestras Soluciones" por imágenes PNG personalizadas, manteniendo el estilo visual actual.

## Contexto Actual

### Sección Actual
- **Archivo**: `src/components/SolutionsSection.tsx`
- **4 cards** con íconos Lucide:
  1. Productos → `Droplet`
  2. Personalización → `Wand2`
  3. Proyectos especiales → `Award`
  4. Distribución → `Package`

### Íconos Disponibles en `public/icons/`
- `icon-design.png` - Lápiz/diseño (círculo con lápiz)
- `icon-email.png` - Sobre de correo
- `icon-facebook.png` - Logo Facebook
- `icon-whatsapp.png` - Logo WhatsApp

### Problema
Solo hay 1 ícono relevante para soluciones (`icon-design.png`). Los otros 3 son para redes sociales del footer.

## Requerimientos

### Necesito que el usuario proporcione:
1. **3 íconos adicionales** para completar las 4 soluciones:
   - Ícono para "Productos" (botella/catálogo)
   - Ícono para "Proyectos especiales" (medalla/estrella)
   - Ícono para "Distribución" (caja/envío)

2. **O reducir a 3 soluciones** si solo hay 3 íconos disponibles

## Plan de Implementación

### Fase 1: Preparar Assets
- [ ] Usuario sube los íconos faltantes a Supabase o `public/icons/`
- [ ] Descargar/guardar en `public/icons/` con nombres:
  - `icon-productos.png`
  - `icon-personalizacion.png` (ya existe como `icon-design.png`)
  - `icon-proyectos.png`
  - `icon-distribucion.png`

### Fase 2: Actualizar SolutionsSection.tsx
- [ ] Eliminar imports de Lucide (`Droplet, Wand2, Award, Package`)
- [ ] Cambiar estructura de `solutions` array para usar rutas de imagen en lugar de componentes
- [ ] Reemplazar `<solution.icon>` por `<img>` con:
  - `src="/icons/icon-xxx.png"`
  - `width={22}` `height={22}`
  - `className="w-[22px] h-[22px] object-contain"`
  - `alt` descriptivo

### Fase 3: Estilos
- [ ] Mantener contenedor blanco `w-10 h-10 bg-white rounded-[10px]`
- [ ] Centrar imagen con `flex items-center justify-center`
- [ ] Tamaño ícono: 22px (mismo que actual)

## Código Propuesto

```tsx
const solutions = [
  {
    icon: "/icons/icon-productos.png",
    title: "Productos",
    description: "..."
  },
  {
    icon: "/icons/icon-personalizacion.png", // o icon-design.png
    title: "Personalización",
    description: "..."
  },
  // ...
];

// En el render:
<div className="w-10 h-10 bg-white rounded-[10px] flex items-center justify-center mb-4">
  <img
    src={solution.icon}
    alt={solution.title}
    width={22}
    height={22}
    className="w-[22px] h-[22px] object-contain"
  />
</div>
```

## Archivos a Modificar
- `src/components/SolutionsSection.tsx`

## Dependencias
- Assets PNG de íconos (pendiente del usuario)

## Notas
- Los íconos actuales en `public/icons/` son principalmente para redes sociales (footer)
- Solo `icon-design.png` parece relevante para la sección de soluciones
- Se requiere confirmación del usuario sobre qué íconos usar
