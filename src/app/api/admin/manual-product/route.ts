import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      sku,
      price,
      category_slug,
      description_mx,
      stock,
      brand,
      material,
      capacity,
      measure,
      colors,
      image_url,
    } = body;

    if (!name || !sku) {
      return NextResponse.json({ error: "Nombre y SKU son requeridos" }, { status: 400 });
    }

    // Check if SKU already exists
    const { data: existing } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("sku", sku.trim().toUpperCase())
      .single();

    if (existing) {
      return NextResponse.json({ error: `Ya existe un producto con SKU: ${sku}` }, { status: 409 });
    }

    const slug = slugify(name);

    const productData = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      slug,
      price: price ? parseFloat(price) : null,
      category_slug: category_slug || null,
      description_mx: description_mx || null,
      stock: stock != null ? parseInt(stock) : null,
      brand: brand || null,
      material: material || null,
      capacity: capacity || null,
      measure: measure || null,
      image_url: image_url || null,
      images_json: image_url ? { mainImages: [image_url], vectorImages: [], variantImages: [] } : null,
      variants_json: colors?.length
        ? colors.map((c: string) => ({ sku: `${sku}-${c}`, name: `${name} - ${c}`, color: c }))
        : null,
      source: "manual",
      synced_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert(productData)
      .select("id, name, sku, slug")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, product: data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
