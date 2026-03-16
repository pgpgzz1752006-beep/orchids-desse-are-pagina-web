"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface Props {
  productImage: string;
  productName: string;
}

interface Position { x: number; y: number }

export default function MockupEditor({ productImage, productName }: Props) {
  const [designSrc, setDesignSrc]     = useState<string | null>(null);
  const [pos, setPos]                 = useState<Position>({ x: 50, y: 50 }); // % of container
  const [scale, setScale]             = useState(0.35);
  const [dragging, setDragging]       = useState(false);
  const dragStart                     = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  const containerRef                  = useRef<HTMLDivElement>(null);
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setDesignSrc(URL.createObjectURL(file));
    setPos({ x: 50, y: 40 });
    setScale(0.35);
  }

  function removeDesign() {
    setDesignSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Drag logic ──────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
  }, [pos]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    setDragging(true);
    dragStart.current = { mx: t.clientX, my: t.clientY, px: pos.x, py: pos.y };
  }, [pos]);

  useEffect(() => {
    function onMove(e: MouseEvent | TouchEvent) {
      if (!dragging || !dragStart.current || !containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      const cx = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
      const cy = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
      const dx = ((cx - dragStart.current.mx) / width) * 100;
      const dy = ((cy - dragStart.current.my) / height) * 100;
      setPos({
        x: Math.min(90, Math.max(10, dragStart.current.px + dx)),
        y: Math.min(90, Math.max(10, dragStart.current.py + dy)),
      });
    }
    function onUp() { setDragging(false); dragStart.current = null; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging]);

  return (
    <div className="w-full rounded-2xl border border-[#EFEFEF] dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#F0F0F0] dark:border-zinc-800 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-bold text-zinc-900 dark:text-white">Visualiza tu diseño</p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">Sube tu logo o arte y muévelo sobre el producto</p>
        </div>
        {designSrc && (
          <button onClick={removeDesign} className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-600 transition-colors">
            <X className="w-3.5 h-3.5" /> Quitar
          </button>
        )}
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative w-full bg-[#F8F8F8] dark:bg-zinc-950 select-none"
        style={{ aspectRatio: "1 / 1" }}
      >
        {/* Product image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={productImage}
          alt={productName}
          className="absolute inset-0 w-full h-full object-contain p-6 pointer-events-none"
        />

        {/* Design overlay */}
        {designSrc && (
          <div
            className={`absolute ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              transformOrigin: "center center",
              touchAction: "none",
              zIndex: 10,
            }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={designSrc}
              alt="Tu diseño"
              className="max-w-[300px] max-h-[300px] object-contain pointer-events-none drop-shadow-lg grayscale"
              draggable={false}
            />
          </div>
        )}

        {/* Upload prompt when no design */}
        {!designSrc && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
          >
            <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-[#14C6C9] flex items-center justify-center group-hover:scale-105 transition-transform bg-white dark:bg-zinc-900">
              <Upload className="w-6 h-6 text-[#14C6C9]" />
            </div>
            <span className="text-[12px] font-semibold text-[#14C6C9]">Subir diseño</span>
          </button>
        )}
      </div>

      {/* Controls */}
      {designSrc && (
        <div className="px-5 py-4 border-t border-[#F0F0F0] dark:border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <input
              type="range" min={0.1} max={1} step={0.01}
              value={scale}
              onChange={e => setScale(parseFloat(e.target.value))}
              className="flex-1 accent-[#14C6C9] h-1.5 rounded-full"
            />
            <ZoomIn className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-zinc-400">Arrastra el diseño para reposicionarlo</p>
            <button
              onClick={() => { setPos({ x: 50, y: 40 }); setScale(0.35); }}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*,.svg,.pdf" className="hidden" onChange={handleFile} />
    </div>
  );
}
