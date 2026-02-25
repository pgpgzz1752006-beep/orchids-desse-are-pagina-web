'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

// ── Helpers ──────────────────────────────────────────────────────────────────

function cleanImages(arr: string[] | undefined | null): string[] {
  if (!arr) return []
  const seen = new Set<string>()
  return arr
    .map((s) => s?.trim())
    .filter((s): s is string => !!s && !seen.has(s) && (seen.add(s), true))
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Thumbnail button with broken-image self-removal */
function ThumbBtn({
  src,
  alt,
  active,
  onClick,
  onBroken,
  thumbSize,
}: {
  src: string
  alt: string
  active: boolean
  onClick: () => void
  onBroken: () => void
  thumbSize: number
}) {
  const [broken, setBroken] = useState(false)

  useEffect(() => {
    setBroken(false)
  }, [src])

  if (broken) return null

  return (
    <button
      onClick={onClick}
      style={{ width: thumbSize, height: thumbSize, flexShrink: 0 }}
      className={[
        'rounded-xl overflow-hidden border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14C6C9]',
        active
          ? 'border-[#14C6C9] shadow-md scale-[1.04]'
          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 hover:scale-[1.03] hover:opacity-90',
      ].join(' ')}
      aria-label={alt}
      aria-selected={active}
      role="option"
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain bg-[#F2F2F2] dark:bg-zinc-800 p-1.5"
        onError={() => { setBroken(true); onBroken() }}
        loading="lazy"
        draggable={false}
      />
    </button>
  )
}

/** Main image with 180ms fade on src change */
function MainImage({ src, alt }: { src: string; alt: string }) {
  const [visible, setVisible] = useState(true)
  const [displaySrc, setDisplaySrc] = useState(src)
  const [broken, setBroken] = useState(false)
  const prev = useRef(src)

  useEffect(() => {
    if (src === prev.current) return
    prev.current = src
    setBroken(false)
    setVisible(false)
    const t = setTimeout(() => {
      setDisplaySrc(src)
      setVisible(true)
    }, 110)
    return () => clearTimeout(t)
  }, [src])

  if (broken) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-600 text-5xl font-bold select-none">
        ?
      </div>
    )
  }

  return (
    <img
      src={displaySrc}
      alt={alt}
      className="w-full h-full object-contain p-6 select-none"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 180ms ease' }}
      onError={() => setBroken(true)}
      draggable={false}
    />
  )
}

/** Skeleton placeholder shown before client hydration */
function GallerySkeleton({ vertical }: { vertical: boolean }) {
  return (
    <div className={`animate-pulse ${vertical ? 'flex gap-3' : 'flex flex-col gap-3'}`}>
      {vertical ? (
        <>
          {/* thumb rail */}
          <div className="flex flex-col gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-[76px] h-[76px] rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
          {/* main */}
          <div className="flex-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800 aspect-square" />
        </>
      ) : (
        <>
          {/* main */}
          <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-800 aspect-square w-full" />
          {/* thumb rail */}
          <div className="flex gap-2 overflow-hidden">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 w-[72px] h-[72px] rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Arrow button ──────────────────────────────────────────────────────────────

function ArrowBtn({
  direction,
  disabled,
  onClick,
}: {
  direction: 'up' | 'down' | 'left' | 'right'
  disabled: boolean
  onClick: () => void
}) {
  const Icon =
    direction === 'up'
      ? ChevronUp
      : direction === 'down'
      ? ChevronDown
      : direction === 'left'
      ? ChevronLeft
      : ChevronRight

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`Ver ${direction === 'up' || direction === 'left' ? 'anteriores' : 'siguientes'}`}
      className={[
        'flex items-center justify-center rounded-lg border transition-all duration-150 bg-white dark:bg-zinc-900',
        'w-8 h-8 flex-shrink-0',
        disabled
          ? 'border-zinc-100 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700 cursor-default opacity-40'
          : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-white shadow-sm hover:shadow',
      ].join(' ')}
    >
      <Icon size={15} />
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export interface ProductGalleryProps {
  name: string
  mainImages: string[]
  vectorImages: string[]
}

const THUMB_SIZE = 76     // px — thumb square
const THUMB_GAP = 10      // px — gap between thumbs
const RAIL_HEIGHT = 480   // px — visible rail window (desktop)

export default function ProductGallery({ name, mainImages, vectorImages }: ProductGalleryProps) {
  const clean = useCallback(cleanImages, [])
  const photos = clean(mainImages)
  const vectors = clean(vectorImages)

  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState<'photos' | 'vectors'>('photos')
  const [activeIdx, setActiveIdx] = useState(0)
  const [brokenSet, setBrokenSet] = useState<Set<number>>(new Set())

  // Track scroll state for arrow enable/disable
  const [canScrollBack, setCanScrollBack] = useState(false)
  const [canScrollFwd, setCanScrollFwd] = useState(false)

  const railRef = useRef<HTMLDivElement>(null)

  const displayImages = tab === 'vectors' && vectors.length > 0 ? vectors : photos
  // filter out broken
  const visibleImages = displayImages.filter((_, i) => !brokenSet.has(i))

  const showRail = visibleImages.length > 1
  const STEP = THUMB_SIZE + THUMB_GAP   // px per scroll step

  // Reset on tab switch
  useEffect(() => {
    setActiveIdx(0)
    setBrokenSet(new Set())
    if (railRef.current) {
      railRef.current.scrollTop = 0
      railRef.current.scrollLeft = 0
    }
  }, [tab])

  // Mark ready after mount (avoids SSR hydration mismatch)
  useEffect(() => { setReady(true) }, [])

  // Sync scroll indicator
  const syncScrollState = useCallback(() => {
    const el = railRef.current
    if (!el) return
    // desktop = vertical; mobile = horizontal (we check which axis has overflow)
    const isVertical = el.scrollHeight > el.clientHeight + 2
    if (isVertical) {
      setCanScrollBack(el.scrollTop > 4)
      setCanScrollFwd(el.scrollTop < el.scrollHeight - el.clientHeight - 4)
    } else {
      setCanScrollBack(el.scrollLeft > 4)
      setCanScrollFwd(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
    }
  }, [])

  useEffect(() => {
    const el = railRef.current
    if (!el) return
    el.addEventListener('scroll', syncScrollState, { passive: true })
    // initial check after paint
    const raf = requestAnimationFrame(syncScrollState)
    return () => {
      el.removeEventListener('scroll', syncScrollState)
      cancelAnimationFrame(raf)
    }
  }, [syncScrollState, ready, tab])

  // Recheck whenever images list changes
  useEffect(() => {
    requestAnimationFrame(syncScrollState)
  }, [visibleImages.length, syncScrollState])

  function scrollRail(dir: 'back' | 'fwd') {
    const el = railRef.current
    if (!el) return
    const isVertical = el.scrollHeight > el.clientHeight + 2
    const delta = dir === 'back' ? -(STEP * 2) : STEP * 2
    if (isVertical) {
      el.scrollBy({ top: delta, behavior: 'smooth' })
    } else {
      el.scrollBy({ left: delta, behavior: 'smooth' })
    }
    // update after animation
    setTimeout(syncScrollState, 350)
  }

  function handleBroken(originalIdx: number) {
    setBrokenSet((prev) => {
      const next = new Set(prev)
      next.add(originalIdx)
      return next
    })
  }

  // Keyboard navigation on rail
  function handleRailKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, visibleImages.length - 1))
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  if (!ready) {
    return (
      <>
        {/* Desktop skeleton */}
        <div className="hidden md:block">
          <GallerySkeleton vertical={true} />
        </div>
        {/* Mobile skeleton */}
        <div className="md:hidden">
          <GallerySkeleton vertical={false} />
        </div>
      </>
    )
  }

  const activeImg = visibleImages[activeIdx] ?? visibleImages[0] ?? ''

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* ── Tab bar (Fotos / Vector) ─────────────────────────────────── */}
      {vectors.length > 0 && (
        <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 w-fit">
          {(['photos', 'vectors'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                tab === t
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200',
              ].join(' ')}
            >
              {t === 'photos' ? 'Fotos' : 'Vector'}
            </button>
          ))}
        </div>
      )}

      {/* ── Desktop layout: rail | main ─────────────────────────────── */}
      <div
        className="hidden md:grid gap-3"
        style={{ gridTemplateColumns: showRail ? `${THUMB_SIZE + 2}px 1fr` : '1fr' }}
      >
        {/* Vertical rail (desktop) */}
        {showRail && (
          <div className="flex flex-col items-center gap-1.5" style={{ height: RAIL_HEIGHT }}>
            {/* Up arrow */}
            <ArrowBtn
              direction="up"
              disabled={!canScrollBack}
              onClick={() => scrollRail('back')}
            />

            {/* Scrollable thumb list */}
            <div
              ref={railRef}
              role="listbox"
              aria-label="Miniaturas del producto"
              onKeyDown={handleRailKeyDown}
              tabIndex={0}
              className="flex-1 flex flex-col gap-[10px] overflow-y-auto overflow-x-hidden focus:outline-none"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                width: THUMB_SIZE + 2,
              }}
            >
              {/* Hide scrollbar in Webkit */}
              <style>{`.no-scroll-bar::-webkit-scrollbar{display:none}`}</style>
              {displayImages.map((img, i) => (
                <ThumbBtn
                  key={`${tab}-${i}-${img}`}
                  src={img}
                  alt={`${name} — ángulo ${i + 1}`}
                  active={activeIdx === i && !brokenSet.has(i)}
                  onClick={() => setActiveIdx(i)}
                  onBroken={() => handleBroken(i)}
                  thumbSize={THUMB_SIZE}
                />
              ))}
            </div>

            {/* Down arrow */}
            <ArrowBtn
              direction="down"
              disabled={!canScrollFwd}
              onClick={() => scrollRail('fwd')}
            />
          </div>
        )}

        {/* Main image */}
        <div
          className="relative bg-[#F2F2F2] dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 flex items-center justify-center"
          style={{ height: RAIL_HEIGHT, minHeight: 320 }}
        >
          {activeImg ? (
            <>
              <MainImage src={activeImg} alt={`${name} — imagen ${activeIdx + 1}`} />
              {/* Counter badge */}
              {visibleImages.length > 1 && (
                <span className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded-full pointer-events-none select-none">
                  {activeIdx + 1} / {visibleImages.length}
                </span>
              )}
              {/* Open in new tab */}
              <a
                href={activeImg}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 right-3 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-lg p-1.5 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity shadow"
                aria-label="Ver imagen completa"
              >
                <ExternalLink size={15} className="text-zinc-600 dark:text-zinc-300" />
              </a>
            </>
          ) : (
            <div className="text-zinc-300 dark:text-zinc-600 text-5xl font-bold select-none">?</div>
          )}
        </div>
      </div>

      {/* ── Mobile layout: main → horizontal rail ───────────────────── */}
      <div className="flex flex-col gap-3 md:hidden">
        {/* Main image */}
        <div
          className="relative bg-[#F2F2F2] dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 flex items-center justify-center aspect-square w-full"
        >
          {activeImg ? (
            <>
              <MainImage src={activeImg} alt={`${name} — imagen ${activeIdx + 1}`} />
              {visibleImages.length > 1 && (
                <span className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded-full pointer-events-none select-none">
                  {activeIdx + 1} / {visibleImages.length}
                </span>
              )}
              <a
                href={activeImg}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 right-3 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-lg p-1.5 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity shadow"
                aria-label="Ver imagen completa"
              >
                <ExternalLink size={15} className="text-zinc-600 dark:text-zinc-300" />
              </a>
            </>
          ) : (
            <div className="text-zinc-300 dark:text-zinc-600 text-5xl font-bold select-none">?</div>
          )}
        </div>

        {/* Horizontal rail (mobile) */}
        {showRail && (
          <div className="flex items-center gap-1.5">
            <ArrowBtn
              direction="left"
              disabled={!canScrollBack}
              onClick={() => scrollRail('back')}
            />
            <div
              ref={railRef}
              role="listbox"
              aria-label="Miniaturas del producto"
              onKeyDown={handleRailKeyDown}
              tabIndex={0}
              className="flex gap-[10px] overflow-x-auto overflow-y-hidden flex-1 focus:outline-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {displayImages.map((img, i) => (
                <ThumbBtn
                  key={`m-${tab}-${i}-${img}`}
                  src={img}
                  alt={`${name} — ángulo ${i + 1}`}
                  active={activeIdx === i && !brokenSet.has(i)}
                  onClick={() => setActiveIdx(i)}
                  onBroken={() => handleBroken(i)}
                  thumbSize={68}
                />
              ))}
            </div>
            <ArrowBtn
              direction="right"
              disabled={!canScrollFwd}
              onClick={() => scrollRail('fwd')}
            />
          </div>
        )}
      </div>

      {/* Vector hint link */}
      {tab === 'vectors' && activeImg && (
        <a
          href={activeImg}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:underline self-start"
        >
          <ExternalLink size={12} />
          Abrir imagen vectorial
        </a>
      )}
    </div>
  )
}
