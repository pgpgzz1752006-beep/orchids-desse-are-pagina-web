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
  const size = Math.min(img.naturalWidth, img.naturalHeight, 64);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "gray";

  ctx.drawImage(img, 0, 0, size, size);

  // Sample pixels from all four corners
  const sampleSize = Math.max(2, Math.floor(size * 0.08));
  const positions: Array<[number, number]> = [];
  for (let dx = 0; dx < sampleSize; dx++) {
    for (let dy = 0; dy < sampleSize; dy++) {
      positions.push([dx, dy]);                         // top-left
      positions.push([size - 1 - dx, dy]);             // top-right
      positions.push([dx, size - 1 - dy]);             // bottom-left
      positions.push([size - 1 - dx, size - 1 - dy]); // bottom-right
    }
  }

  let totalR = 0, totalG = 0, totalB = 0, count = 0;
  for (const [x, y] of positions) {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    totalR += pixel[0];
    totalG += pixel[1];
    totalB += pixel[2];
    count++;
  }

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
