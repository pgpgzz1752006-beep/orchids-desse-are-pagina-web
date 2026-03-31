"use client";

import { useState, useEffect } from "react";

/**
 * Samples corner pixels of an image to detect whether its background is
 * white (#FFFFFF-ish) or grayish, and returns the appropriate CSS background.
 *
 * Uses Next.js /_next/image proxy to bypass CORS restrictions on external CDNs.
 * Returns "white" | "gray" after analysis, or null while loading.
 */

const cache = new Map<string, "white" | "gray">();

/** Convert external URL to Next.js image proxy URL (same-origin, CORS-safe) */
function toProxyUrl(src: string): string {
  if (src.startsWith("/")) return src; // already local
  return `/_next/image?url=${encodeURIComponent(src)}&w=64&q=50`;
}

function analyzeImage(img: HTMLImageElement): "white" | "gray" {
  const canvas = document.createElement("canvas");
  const size = Math.min(img.naturalWidth, img.naturalHeight, 50);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "gray";

  ctx.drawImage(img, 0, 0, size, size);

  // Sample ALL border pixels (top row, bottom row, left col, right col)
  const borderWidth = Math.max(2, Math.floor(size * 0.06));
  let totalR = 0, totalG = 0, totalB = 0, count = 0;

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      // Only sample pixels within the border band
      if (x < borderWidth || x >= size - borderWidth || y < borderWidth || y >= size - borderWidth) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        totalR += pixel[0];
        totalG += pixel[1];
        totalB += pixel[2];
        count++;
      }
    }
  }

  if (count === 0) return "gray";
  const lightness = (totalR / count + totalG / count + totalB / count) / 3;
  return lightness > 235 ? "white" : "gray";
}

export function useImageBgColor(src: string | null | undefined): "white" | "gray" | null {
  const [bg, setBg] = useState<"white" | "gray" | null>(() => {
    if (src && cache.has(src)) return cache.get(src)!;
    return null;
  });

  useEffect(() => {
    if (!src) return;
    if (cache.has(src)) {
      setBg(cache.get(src)!);
      return;
    }

    const img = new Image();
    // No crossOrigin needed — proxied URL is same-origin

    img.onload = () => {
      try {
        const result = analyzeImage(img);
        cache.set(src, result);
        setBg(result);
      } catch {
        cache.set(src, "gray");
        setBg("gray");
      }
    };

    img.onerror = () => {
      cache.set(src, "gray");
      setBg("gray");
    };

    img.src = toProxyUrl(src);
  }, [src]);

  return bg;
}
