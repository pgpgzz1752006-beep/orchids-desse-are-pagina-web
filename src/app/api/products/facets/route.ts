import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || ''

  try {
    let apiCategoryIds: string[] = []

    if (category) {
      const { data: mapping } = await supabaseAdmin
        .from('category_mapping')
        .select('api_category_ids')
        .eq('site_slug', category)
        .single()
      
      if (mapping?.api_category_ids) {
        apiCategoryIds = mapping.api_category_ids as string[]
      }
    }

    // Define the base filter
    const applyBaseFilter = (q: any) => {
      let query = q.gt('stock', 0)
      if (apiCategoryIds.length > 0) {
        query = query.in('api_category_id', apiCategoryIds)
      }
      return query
    }

    // 1. Colors Facets
    let colorsQuery = supabaseAdmin
      .from('products')
      .select('colors')
      .gt('stock', 0)
      .not('colors', 'is', null)
    if (apiCategoryIds.length > 0) colorsQuery = colorsQuery.in('api_category_id', apiCategoryIds)
    const colorsPromise = colorsQuery

    // 2. Brands Facets
    let brandsQuery = supabaseAdmin
      .from('products')
      .select('brand')
      .gt('stock', 0)
    if (apiCategoryIds.length > 0) brandsQuery = brandsQuery.in('api_category_id', apiCategoryIds)
    const brandsPromise = brandsQuery

    // 3. Product Type Facets
    let typesQuery = supabaseAdmin
      .from('products')
      .select('product_type')
      .gt('stock', 0)
    if (apiCategoryIds.length > 0) typesQuery = typesQuery.in('api_category_id', apiCategoryIds)
    const typesPromise = typesQuery

    // 4. Categories Facets (Real ones)
    let categoriesQuery = supabaseAdmin
      .from('products')
      .select('api_category_id, api_category_name')
      .gt('stock', 0)
      .not('api_category_id', 'is', null)
    if (apiCategoryIds.length > 0) categoriesQuery = categoriesQuery.in('api_category_id', apiCategoryIds)
    const categoriesPromise = categoriesQuery

    // 5. Capacity Facets
    let capacityQuery = supabaseAdmin
      .from('products')
      .select('capacity')
      .gt('stock', 0)
      .not('capacity', 'eq', '')
    if (apiCategoryIds.length > 0) capacityQuery = capacityQuery.in('api_category_id', apiCategoryIds)
    const capacityPromise = capacityQuery

    const [
      { data: colorsData },
      { data: brandsData },
      { data: typesData },
      { data: categoriesData },
      { data: capacityData }
    ] = await Promise.all([
      colorsPromise,
      brandsPromise,
      typesPromise,
      categoriesPromise,
      capacityPromise
    ])

    // Helper to count occurrences
    const countOccurrences = (arr: any[], key: string) => {
      const counts: Record<string, number> = {}
      arr?.forEach(item => {
        const val = item[key]
        if (val) {
          counts[val] = (counts[val] || 0) + 1
        }
      })
      return Object.entries(counts)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
    }

    // Special handling for colors since it's an array RPC or we can use the same logic if we fetch it
    // Let's actually use a simpler approach for all if RPC is not ready
    
    const facets = {
      color: (() => {
        const counts: Record<string, number> = {}
        colorsData?.forEach(item => {
          if (Array.isArray(item.colors)) {
            item.colors.forEach((c: string) => {
              const val = c.trim().toUpperCase()
              counts[val] = (counts[val] || 0) + 1
            })
          }
        })
        return Object.entries(counts)
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count)
      })(),
      brand: countOccurrences(brandsData || [], 'brand'),
      productType: countOccurrences(typesData || [], 'product_type'),
      categories: (() => {
        const counts: Record<string, { id: string, name: string, count: number }> = {}
        categoriesData?.forEach(item => {
          if (item.api_category_id) {
            if (!counts[item.api_category_id]) {
              counts[item.api_category_id] = { id: item.api_category_id, name: item.api_category_name || item.api_category_id, count: 0 }
            }
            counts[item.api_category_id].count++
          }
        })
        return Object.values(counts).sort((a, b) => b.count - a.count)
      })(),
      capacity: countOccurrences(capacityData || [], 'capacity')
    }

    return NextResponse.json(facets)

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
