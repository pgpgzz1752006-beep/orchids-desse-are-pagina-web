export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  termos: ['termo', 'cilindro', 'botella', 'tumbler', 'vaso termico', 'vaso térmico', 'hidroflask'],
  bolsas: ['bolsa', 'mochila', 'maleta', 'morral', 'tote', 'backpack'],
  libretas: ['libreta', 'cuaderno', 'carpeta', 'agenda', 'bloc', 'notebook'],
  bar: ['bar', 'coctel', 'cóctel', 'shot', 'hielera', 'destapador', 'vino', 'copa', 'corkscrew', 'sacacorchos'],
  regalos: ['set', 'kit', 'regalo', 'gift', 'pack', 'combo'],
  deportes: ['balón', 'balon', 'soccer', 'sport', 'gym', 'fitness', 'futbol', 'fútbol', 'pelota', 'deporte'],
  hogar: ['hogar', 'cocina', 'taza', 'recipiente', 'caja', 'organizador', 'colador', 'plato', 'bowl'],
  gorras: ['gorra', 'playera', 'camiseta', 'polo', 'cap', 'sombrero', 'bucket hat'],
}

export function mapToSlug(name: string, rawCategory: string): string {
  const haystack = `${rawCategory} ${name}`.toLowerCase()

  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (haystack.includes(kw)) return slug
    }
  }
  return 'regalos' // fallback
}

export function detectColumn(headers: string[], candidates: string[]): string | null {
  const lower = headers.map(h => h?.toString().toLowerCase().trim())
  for (const c of candidates) {
    const idx = lower.findIndex(h => h?.includes(c.toLowerCase()))
    if (idx !== -1) return headers[idx]
  }
  return null
}
