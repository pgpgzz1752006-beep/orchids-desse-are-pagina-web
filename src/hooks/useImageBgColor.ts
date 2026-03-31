"use client";

import { useState, useEffect } from "react";

/**
 * Analyzes the 4 corners of a product image (10x10 px each) to detect
 * the real background color, then returns a CSS color string for the card.
 *
 * Rules:
 *  - brightness > 248 & neutral → white bg (#FFFFFF)
 *  - brightness 200–248 & neutral → use the exact detected gray as card bg
 *  - non-neutral (colorful) → white bg (#FFFFFF)
 *  - dark / error → light fallback (#F2F2F2)
 */

interface BgResult {
  /** CSS color for the card background */
  cardBg: string;
  /** CSS color for the image area background */
  imageBg: string;
}

const cache = new Map<string, BgResult>();

const DEFAULT_RESULT: BgResult = { cardBg: "#F7F7F7", imageBg: "#F2F2F2" };
const WHITE_RESULT: BgResult = { cardBg: "#FFFFFF", imageBg: "#FFFFFF" };

/** Convert external URL to Next.js image proxy URL (same-origin, CORS-safe) */
function toProxyUrl(src: string): string {
  if (src.startsWith("/")) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=64&q=50`;
}

function analyzeImage(img: HTMLImageElement): BgResult {
  const canvas = document.createElement("canvas");
  const size = Math.min(img.naturalWidth, img.naturalHeight, 64);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return DEFAULT_RESULT;

  ctx.drawImage(img, 0, 0, size, size);

  // Sample the 4 corner pixels
  const corners: Array<[number, number]> = [
    [0, 0],
    [size - 1, 0],
    [0, size - 1],
    [size - 1, size - 1],
  ];

  let totalR = 0, totalG = 0, totalB = 0, count = 0;

  for (const [x, y] of corners) {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    totalR += pixel[0];
    totalG += pixel[1];
    totalB += pixel[2];
    count++;
  }

  if (count === 0) return DEFAULT_RESULT;

  const avgR = Math.round(totalR / count);
  const avgG = Math.round(totalG / count);
  const avgB = Math.round(totalB / count);
  const brightness = (avgR + avgG + avgB) / 3;

  // Check if the color is neutral (R, G, B are all close to each other)
  const maxDiff = Math.max(
    Math.abs(avgR - avgG),
    Math.abs(avgR - avgB),
    Math.abs(avgG - avgB)
  );
  const isNeutral = maxDiff < 10;

  // White pure background
  if (brightness > 248 && isNeutral) {
    return WHITE_RESULT;
  }

  // Gray background — use the detected gray as the card color
  if (brightness >= 200 && brightness <= 248 && isNeutral) {
    const color = `rgb(${avgR}, ${avgG}, ${avgB})`;
    return { cardBg: color, imageBg: color };
  }

  // Colorful background or non-neutral → white card
  if (!isNeutral && brightness > 180) {
    return WHITE_RESULT;
  }

  // Dark or anything else → light fallback
  return DEFAULT_RESULT;
}

export function useImageBgColor(src: string | null | undefined): BgResult | null {
  const [bg, setBg] = useState<BgResult | null>(() => {
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

    img.onload = () => {
      try {
        const result = analyzeImage(img);
        cache.set(src, result);
        setBg(result);
      } catch {
        cache.set(src, DEFAULT_RESULT);
        setBg(DEFAULT_RESULT);
      }
    };

    img.onerror = () => {
      cache.set(src, DEFAULT_RESULT);
      setBg(DEFAULT_RESULT);
    };

    img.src = toProxyUrl(src);
  }, [src]);

  return bg;
}
