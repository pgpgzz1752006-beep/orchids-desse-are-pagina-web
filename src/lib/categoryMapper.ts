export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  agendas: ['agenda'],
  antiestres: ['anti-stress', 'antiestrés', 'antiestres', 'anti stress', 'stress'],
  viaje: ['viaje', 'cangurera', 'neceser', 'organizador de viaje', 'porta documento', 'lentes'],
  bar: ['destapador', 'licorera', 'sacacorcho', 'bar ', 'hielera para vino', 'set de vino', 'vino'],
  bebidas: ['termo', 'cilindro', 'taza', 'vaso', 'botella', 'jarra', 'infusor', 'café', 'coffee', 'mug', 'tumbler', 'cup'],
  belleza: ['cosmetiquera', 'maquillaje', 'brocha', 'espejo', 'manicure', 'costurero', 'joyería', 'joyero', 'belleza', 'dama'],
  textiles: ['playera', 'gorra', 'chamarra', 'chaleco', 'sudadera', 'polo', 'camisa', 'camiseta', 'hoodie', 'jersey', 'blusa', 'franela', 'sombrero', 'cachucha', 'buff', 'pañuelo', 'mandil'],
  tecnologia: ['usb', 'power bank', 'bocina', 'audifonos', 'audífonos', 'cargador', 'cable', 'hub', 'bluetooth', 'wireless', 'mouse', 'teclado', 'speaker', 'earbuds', 'smartwatch', 'powerbank'],
  'sets-regalo': ['set ', 'kit ', 'estuche'],
  salud: ['gel antibacterial', 'sanitizante', 'pastillero', 'cubreboca', 'tapaboca', 'termómetro', 'botiquín', 'salud'],
  ninos: ['niño', 'niña', 'infantil', 'escolar', 'juguete', 'alcancía', 'kids'],
  oficina: ['calculadora', 'portagafete', 'gafete', 'reconocimiento', 'reloj', 'porta notas', 'oficina', 'ejecutivo'],
  paraguas: ['paraguas', 'impermeable', 'sombrilla'],
  portafolios: ['portafolio', 'portalaptop', 'porta laptop'],
  escritura: ['bolígrafo', 'boligrafo', 'pluma', 'lápiz', 'lapiz', 'marcador', 'resaltador', 'stylus', 'pen '],
  hieleras: ['hielera', 'lonchera', 'portavianda', 'lunch', 'cooler'],
  mochilas: ['mochila'],
  maletas: ['maleta', 'trolley'],
  llaveros: ['llavero'],
  libretas: ['libreta', 'cuaderno', 'carpeta', 'folder', 'block'],
  herramientas: ['herramienta', 'navaja', 'lámpara', 'lampara', 'linterna', 'flexómetro', 'desarmador', 'pinza'],
  deportes: ['balón', 'balon', 'deporti', 'yoga', 'gym', 'fitness', 'fútbol', 'futbol', 'sport'],
  hogar: ['bbq', 'parrilla', 'cesto', 'cocina', 'decoración', 'jardín', 'maceta', 'mascota', 'tabla', 'queso', 'portarretrato'],
  complementos: ['popsocket', 'cordón', 'lanyard', 'pin ', 'broche', 'clip', 'sujetador'],
  bolsas: ['bolsa', 'tote', 'ecológica', 'reutilizable'],
}

export function mapToSlug(name: string, rawCategory: string): string {
  const haystack = `${rawCategory} ${name}`.toLowerCase()

  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (haystack.includes(kw)) return slug
    }
  }
  return 'complementos' // fallback
}

/** Generate a URL-safe slug from name + sku */
export function makeProductSlug(name: string, sku: string): string {
  const raw = `${name}-${sku}`
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')         // trim leading/trailing dashes
}

export function detectColumn(headers: string[], candidates: string[]): string | null {
  const lower = headers.map(h => h?.toString().toLowerCase().trim())
  for (const c of candidates) {
    const idx = lower.findIndex(h => h?.includes(c.toLowerCase()))
    if (idx !== -1) return headers[idx]
  }
  return null
}
