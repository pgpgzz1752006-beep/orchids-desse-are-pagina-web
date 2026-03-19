/**
 * Server-side image background color analyzer using sharp.
 * Resizes to a tiny thumbnail and checks corner pixels.
 */
import sharp from "sharp";

const cache = new Map<string, "white" | "gray">();

export async function analyzeImageBg(imageUrl: string): Promise<"white" | "gray"> {
  if (cache.has(imageUrl)) return cache.get(imageUrl)!;

  try {
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return "gray";

    const buffer = Buffer.from(await res.arrayBuffer());

    // Resize to 20x20 and get raw pixel data (RGB)
    const { data, info } = await sharp(buffer)
      .resize(20, 20, { fit: "cover" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const w = info.width;
    const h = info.height;

    // Sample corner pixels (top-left, top-right, bottom-left, bottom-right)
    const corners = [
      [0, 0], [1, 0], [0, 1],                         // top-left area
      [w - 1, 0], [w - 2, 0], [w - 1, 1],             // top-right area
      [0, h - 1], [1, h - 1], [0, h - 2],             // bottom-left area
      [w - 1, h - 1], [w - 2, h - 1], [w - 1, h - 2], // bottom-right area
    ];

    let totalBrightness = 0;
    let count = 0;

    for (const [x, y] of corners) {
      const idx = (y * w + x) * 3;
      if (idx + 2 < data.length) {
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        totalBrightness += (r + g + b) / 3;
        count++;
      }
    }

    const avgBrightness = count > 0 ? totalBrightness / count : 0;

    // White bg: brightness > 225 (covers near-white product backgrounds)
    const result: "white" | "gray" = avgBrightness > 225 ? "white" : "gray";
    cache.set(imageUrl, result);
    return result;
  } catch {
    return "gray";
  }
}

/**
 * Filter products to keep only those with white image backgrounds.
 * If not enough white-bg products, returns all products.
 */
export async function filterWhiteBgProducts<T extends { image: string }>(
  products: T[],
  minCount: number = 12
): Promise<T[]> {
  const results = await Promise.all(
    products.map(async (p) => {
      const bg = await analyzeImageBg(p.image);
      return { product: p, bg };
    })
  );

  const whiteBg = results.filter((r) => r.bg === "white").map((r) => r.product);

  // If not enough white-bg products, return all
  if (whiteBg.length < minCount) return products;
  return whiteBg;
}
