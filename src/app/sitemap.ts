import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://diseñarepromocionales.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/productos`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/nuevos`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/categorias`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/servicios`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/carrito`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/registro`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // Fetch all product slugs for dynamic product pages
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .not("slug", "is", null);

    if (products) {
      productRoutes = products.map((product) => ({
        url: `${SITE_URL}/producto/${product.slug}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch {
    // If DB fetch fails, return static routes only
  }

  return [...staticRoutes, ...productRoutes];
}
