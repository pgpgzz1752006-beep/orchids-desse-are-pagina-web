import { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://diseñarepromocionales.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/checkout/", "/cuenta"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
