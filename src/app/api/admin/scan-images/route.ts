import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) })
    return res.ok
  } catch { return false }
}

export async function POST() {
  const { data: products } = await supabase
    .from('products')
    .select('sku, slug, image_url, images_json')
    .not('images_json', 'is', null)

  const singleImage = (products ?? []).filter((p: any) => {
    const imgs = p.images_json?.mainImages
    return Array.isArray(imgs) && imgs.length === 1
  })

  let updated = 0
  const found: string[] = []

  for (let i = 0 ; i < singleImage.length ; i += 20) {
    const batch = singleImage.slice(i, i + 20)
    await Promise.all(batch.map(async (p: any) => {
      const base = p.image_url?.replace('.jpg', '')
      if (!base) return
      const has1 = await checkUrl(`${base}_1.jpg`)
      if (!has1) return

      let maxIdx = 1
      for (let n = 2 ; n <= 8 ; n++) {
        const hasN = await checkUrl(`${base}_${n}.jpg`)
        if (hasN) maxIdx = n ; else break
      }

      const allImages = [p.image_url]
      for (let n = 1 ; n <= maxIdx ; n++) allImages.push(`${base}_${n}.jpg`)

      const newImagesJson = {
        ...p.images_json,
        mainImages: allImages,
      }

      await supabase
        .from('products')
        .update({ images_json: newImagesJson })
        .eq('sku', p.sku)

      updated++
      found.push(p.sku)
    }))
  }

  return NextResponse.json({
    scanned: singleImage.length,
    updated,
    found,
  })
}
