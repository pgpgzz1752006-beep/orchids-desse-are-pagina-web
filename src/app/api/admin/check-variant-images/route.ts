import { NextResponse } from 'next/server'
import { promoGQL } from '@/lib/promoClient'

const QUERY = `
  query($page: Int!) {
    distribuitorProductCatalog(page: $page) {
      hasNextPage totalPages
      data {
        productModel { sku nameProductModel media { mainImages vectorImages } }
        variants {
          sku name color
          mediaAssets { variantImages }
        }
      }
    }
  }
`

export async function POST() {
  const withVariantImgs: any[] = []
  let scanned = 0

  for (let page = 1 ; page <= 3 ; page++) {
    const data: any = await promoGQL(QUERY, { page })
    const products = data?.distribuitorProductCatalog?.data ?? []
    scanned += products.length

    for (const p of products) {
      const variantsWithImgs = (p.variants ?? []).filter(
        (v: any) => (v.mediaAssets?.variantImages?.length ?? 0) > 0
      )
      if (variantsWithImgs.length > 0) {
        withVariantImgs.push({
          sku: p.productModel.sku,
          name: p.productModel.nameProductModel,
          mainImages: p.productModel.media?.mainImages,
          variantsWithImages: variantsWithImgs.map((v: any) => ({
            sku: v.sku,
            color: v.color,
            variantImages: v.mediaAssets.variantImages,
          })),
        })
      }
    }

    if (!data?.distribuitorProductCatalog?.hasNextPage) break
  }

  return NextResponse.json({ scanned, found: withVariantImgs.length, examples: withVariantImgs.slice(0, 5) })
}
