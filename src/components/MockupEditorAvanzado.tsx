"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Upload, X, ZoomIn, ZoomOut, RotateCcw, Download, RotateCw, Eye } from "lucide-react";

interface Props {
  productImages: { front: string; back?: string; sleeve?: string };
  productName: string;
}

type View = "front" | "back" | "sleeve";

interface DesignState {
  x: number; y: number;   // % of container
  scale: number;
  rotation: number;       // degrees
  opacity: number;
}

const DEFAULT_STATE: DesignState = { x: 50, y: 40, scale: 0.3, rotation: 0, opacity: 1 };

export default function MockupEditorAvanzado({ productImages, productName }: Props) {
  const [activeView, setActiveView] = useState<View>("front");
  const [designSrc, setDesignSrc]   = useState<string | null>(null);
  // Each view has its own independent design state
  const [states, setStates] = useState<Record<View, DesignState>>({
    front:  { ...DEFAULT_STATE },
    back:   { ...DEFAULT_STATE },
    sleeve: { ...DEFAULT_STATE },
  });

  const [dragging, setDragging]   = useState(false);
  const dragStart                  = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  const containerRef               = useRef<HTMLDivElement>(null);
  const canvasRef                  = useRef<HTMLCanvasElement>(null);
  const fileInputRef               = useRef<HTMLInputElement>(null);
  const designImgRef               = useRef<HTMLImageElement | null>(null);

  const state = states[activeView];

  function updateState(patch: Partial<DesignState>) {
    setStates(prev => ({ ...prev, [activeView]: { ...prev[activeView], ...patch } }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setDesignSrc(url);
    const img = new window.Image();
    img.src = url;
    designImgRef.current = img;
    setStates({ front: { ...DEFAULT_STATE }, back: { ...DEFAULT_STATE }, sleeve: { ...DEFAULT_STATE } });
  }

  function removeDesign() {
    setDesignSrc(null);
    designImgRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Drag ────────────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, px: state.x, py: state.y };
  }, [state.x, state.y]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    setDragging(true);
    dragStart.current = { mx: t.clientX, my: t.clientY, px: state.x, py: state.y };
  }, [state.x, state.y]);

  useEffect(() => {
    function onMove(e: MouseEvent | TouchEvent) {
      if (!dragging || !dragStart.current || !containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      const cx = e instanceof MouseEvent ? e.clientX : (e as TouchEvent).touches[0].clientX;
      const cy = e instanceof MouseEvent ? e.clientY : (e as TouchEvent).touches[0].clientY;
      const dx = ((cx - dragStart.current.mx) / width) * 100;
      const dy = ((cy - dragStart.current.my) / height) * 100;
      updateState({
        x: Math.min(92, Math.max(8, dragStart.current.px + dx)),
        y: Math.min(92, Math.max(8, dragStart.current.py + dy)),
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, activeView]);

  // ── Export ──────────────────────────────────────────────────────────────────
  async function handleExport() {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current || !designSrc) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    canvas.width  = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const productImg = new window.Image();
    productImg.crossOrigin = "anonymous";
    productImg.src = currentProductImage;
    await new Promise(r => { productImg.onload = r; productImg.onerror = r; });

    ctx.drawImage(productImg, 0, 0, canvas.width, canvas.height);

    const designImg = new window.Image();
    designImg.src = designSrc;
    await new Promise(r => { designImg.onload = r; });

    const dw = designImg.naturalWidth  * state.scale * 2;
    const dh = designImg.naturalHeight * state.scale * 2;
    const dx = (state.x / 100) * canvas.width;
    const dy = (state.y / 100) * canvas.height;

    ctx.save();
    ctx.globalAlpha = state.opacity;
    ctx.translate(dx, dy);
    ctx.rotate((state.rotation * Math.PI) / 180);
    ctx.drawImage(designImg, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `mockup-${productName.toLowerCase().replace(/\s+/g, "-")}-${activeView}.png`;
    link.click();
  }

  const currentProductImage =
    activeView === "back"   ? (productImages.back   ?? productImages.front) :
    activeView === "sleeve" ? (productImages.sleeve ?? productImages.front) :
    productImages.front;

  const views: { id: View; label: string }[] = [
    { id: "front",  label: "Frente" },
    ...(productImages.back   ? [{ id: "back"   as View, label: "Espalda" }] : []),
    ...(productImages.sleeve ? [{ id: "sleeve" as View, label: "Manga"   }] : []),
  ];

  return (
    <div className="w-full rounded-2xl border border-[#EFEFEF] dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-[#F0F0F0] dark:border-zinc-800 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-bold text-zinc-900 dark:text-white">Visualiza tu diseño</p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">Mueve, escala y rota tu logo sobre la prenda</p>
        </div>
        <div className="flex items-center gap-2">
          {designSrc && (
            <>
              <button onClick={handleExport} className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-[#14C6C9] text-white hover:bg-[#0fa8ab] transition-colors">
                <Download className="w-3.5 h-3.5" /> Exportar
              </button>
              <button onClick={removeDesign} className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-600 transition-colors">
                <X className="w-3.5 h-3.5" /> Quitar
              </button>
            </>
          )}
        </div>
      </div>

      {/* View tabs */}
      {views.length > 1 && (
        <div className="flex border-b border-[#F0F0F0] dark:border-zinc-800">
          {views.map(v => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={`flex-1 py-2.5 text-[12px] font-semibold transition-colors ${
                activeView === v.id
                  ? "text-[#14C6C9] border-b-2 border-[#14C6C9] bg-[#F0FDFD] dark:bg-zinc-800/50"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative w-full bg-[#F8F8F8] dark:bg-zinc-950 select-none"
        style={{ aspectRatio: "1 / 1" }}
      >
        <Image
          src={currentProductImage}
          alt={`${productName} - ${activeView}`}
          fill
          className="object-contain p-6 pointer-events-none"
          sizes="600px"
        />

        {/* Design overlay */}
        {designSrc && (
          <div
            className={`absolute ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
            style={{
              left: `${state.x}%`,
              top:  `${state.y}%`,
              transform: `translate(-50%, -50%) scale(${state.scale}) rotate(${state.rotation}deg)`,
              transformOrigin: "center center",
              opacity: state.opacity,
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
              className="max-w-[280px] max-h-[280px] object-contain pointer-events-none drop-shadow-xl"
              draggable={false}
            />
          </div>
        )}

        {/* Upload prompt */}
        {!designSrc && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
          >
            <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-[#14C6C9] flex items-center justify-center group-hover:scale-105 transition-transform bg-white dark:bg-zinc-900 shadow-md">
              <Upload className="w-7 h-7 text-[#14C6C9]" />
            </div>
            <span className="text-[12px] font-semibold text-[#14C6C9]">Subir diseño</span>
            <span className="text-[10px] text-zinc-400">PNG, JPG, SVG</span>
          </button>
        )}
      </div>

      {/* Controls */}
      {designSrc && (
        <div className="px-5 py-4 border-t border-[#F0F0F0] dark:border-zinc-800 flex flex-col gap-3">

          {/* Scale */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <input type="range" min={0.05} max={1} step={0.01}
              value={state.scale}
              onChange={e => updateState({ scale: parseFloat(e.target.value) })}
              className="flex-1 accent-[#14C6C9] h-1.5"
            />
            <ZoomIn className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <span className="text-[10px] text-zinc-400 w-8 text-right">{Math.round(state.scale * 100)}%</span>
          </div>

          {/* Rotation */}
          <div className="flex items-center gap-3">
            <RotateCcw className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <input type="range" min={-180} max={180} step={1}
              value={state.rotation}
              onChange={e => updateState({ rotation: parseInt(e.target.value) })}
              className="flex-1 accent-[#14C6C9] h-1.5"
            />
            <RotateCw className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <span className="text-[10px] text-zinc-400 w-8 text-right">{state.rotation}°</span>
          </div>

          {/* Opacity */}
          <div className="flex items-center gap-3">
            <Eye className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <input type="range" min={0.1} max={1} step={0.01}
              value={state.opacity}
              onChange={e => updateState({ opacity: parseFloat(e.target.value) })}
              className="flex-1 accent-[#14C6C9] h-1.5"
            />
            <span className="text-[10px] text-zinc-400 w-8 text-right">{Math.round(state.opacity * 100)}%</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] text-zinc-400">Arrastra el diseño para moverlo · Cada vista es independiente</p>
            <button
              onClick={() => updateState({ ...DEFAULT_STATE })}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>
      )}

      {/* Hidden canvas for export */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*,.svg" className="hidden" onChange={handleFile} />
    </div>
  );
}
