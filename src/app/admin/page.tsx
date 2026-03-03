"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface HealthResult {
  endpoint_used: string;
  token_ok: boolean;
  dns_ok: boolean;
  excel_query_ok: boolean;
  status: number | null;
  details: { excelResponseKeys: string[] };
  error: string | null;
  error_code: string | null;
}

function errorLabel(code: string | null, message: string | null): string {
  if (code === "TOKEN_MISSING" || message === "TOKEN_MISSING")
    return "Falta configurar el token de la API.";
  if (code === "TOKEN_INVALID" || message === "TOKEN_INVALID")
    return "Token inválido o expirado.";
  if (code === "NETWORK_ERROR" || message === "NETWORK_ERROR")
    return "No se pudo conectar al endpoint GraphQL (network/TLS/DNS). Revisa logs del servidor.";
  return message ?? "Error desconocido.";
}

export default function AdminPage() {
  const [health, setHealth] = useState<HealthResult | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  async function checkHealth() {
    setHealthLoading(true);
    setHealth(null);
    try {
      const res = await fetch("/api/promoonline/health");
      const data = await res.json();
      setHealth(data as HealthResult);
    } catch (e) {
      setHealth({
        endpoint_used: "—",
        token_ok: false,
        dns_ok: false,
        excel_query_ok: false,
        status: null,
        details: { excelResponseKeys: [] },
        error: e instanceof Error ? e.message : "Error de red al llamar /health",
        error_code: "NETWORK_ERROR",
      });
    } finally {
      setHealthLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0E0F12] font-['Montserrat'] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-1.5 rounded-full bg-gradient-to-r from-[#14C6C9] to-[#9B59B6] mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-white uppercase tracking-widest">Admin</h1>
          <p className="text-[#888] text-sm mt-1">Sincronización del catálogo</p>
        </div>

        {/* Token config */}
        <TokenCard />

        {/* Health check */}
        <HealthCard health={health} loading={healthLoading} onCheck={checkHealth} />

          {/* Auth test */}
          <AuthTestCard />

          {/* Excel generation test */}
          <ExcelTestCard />

          {/* Auto sync from API */}
          <AutoSyncCard
            tokenOk={health?.token_ok ?? null}
            excelOk={health?.excel_query_ok ?? null}
            dnsOk={health?.dns_ok ?? null}
            healthChecked={health !== null}
          />

          {/* Manual Excel upload */}
          <ManualUploadCard />

          {/* DB cleanup */}
          <CleanupCard />

          {/* Stock management */}
          <StockCard />

            {/* Price audit */}
            <PriceAuditCard />
  
            {/* Category mapping */}
            <CategoryMappingCard />
  
          {/* Image diagnosis */}
          <ImageDiagnosisCard />

          {/* Banner management */}
          <BannerManagerCard />

          <div className="text-center pt-2">
          <Link href="/" className="text-[#14C6C9] text-xs hover:underline">
            ← Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Token config card ──────────────────────────────────────────── */
function TokenCard() {
  const [masked, setMasked] = useState<string | null>(null);
  const [source, setSource] = useState<"env" | "db" | null>(null);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/token")
      .then((r) => r.json())
      .then((d) => {
        setMasked(d.set ? d.masked : null);
        setSource(d.source);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function saveToken() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/admin/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: input.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveMsg("Error: " + (data.error || "desconocido"));
      } else {
        setSaveMsg(input.trim() ? "Token guardado correctamente." : "Token eliminado.");
        setMasked(input.trim() ? "••••••••" + input.trim().slice(-4) : null);
        setSource("db");
        setInput("");
      }
    } catch {
      setSaveMsg("Error de red al guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-[#1A1D24] border border-[#2A2D34] rounded-2xl p-6 shadow-xl">
      <p className="text-[#888] text-xs uppercase tracking-widest mb-1">Token API</p>
      <p className="text-[#555] text-xs mb-4">
        Esta API requiere token. Configúralo aquí para sincronizar. Se guarda solo del lado servidor y nunca se expone al cliente.
      </p>

      {loading ? (
        <p className="text-[#555] text-xs">Cargando...</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#555] text-xs shrink-0">Estado</span>
            {masked ? (
              <span className="text-emerald-400 text-xs font-semibold">
                ✅ Configurado{source === "env" ? " (env var)" : " (BD)"} — {masked}
              </span>
            ) : (
              <span className="text-yellow-500 text-xs">⚠ Sin token — sincronización deshabilitada</span>
            )}
          </div>

          {source === "env" ? (
            <p className="text-[#555] text-xs italic">
              El token proviene de la variable de entorno{" "}
              <code className="text-[#888]">PROMO_GRAPHQL_TOKEN</code>. Para cambiarlo, edita las env vars.
            </p>
          ) : (
            <div className="flex gap-2">
              <input
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={masked ? "Reemplazar token..." : "Pegar token aquí..."}
                className="flex-1 bg-[#0E0F12] border border-[#333] rounded-xl px-3 py-2 text-white text-xs placeholder-[#444] focus:outline-none focus:border-[#14C6C9] transition-colors"
              />
              <button
                onClick={saveToken}
                disabled={saving || input.trim() === ""}
                className="bg-[#14C6C9]/20 hover:bg-[#14C6C9]/30 border border-[#14C6C9]/40 text-[#14C6C9] text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {saving ? "Guardando..." : "Guardar token"}
              </button>
            </div>
          )}

          {saveMsg && (
            <p className={`text-xs ${saveMsg.startsWith("Error") ? "text-red-400" : "text-emerald-400"}`}>
              {saveMsg}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Health card ────────────────────────────────────────────────── */
function HealthCard({
  health,
  loading,
  onCheck,
}: {
  health: HealthResult | null;
  loading: boolean;
  onCheck: () => void;
}) {
  function badge(ok: boolean | null, labelOk: string, labelFail: string) {
    if (ok === null) return <span className="text-[#555] text-xs">—</span>;
    return ok ? (
      <span className="text-emerald-400 font-semibold text-xs">✅ {labelOk}</span>
    ) : (
      <span className="text-red-400 font-semibold text-xs">❌ {labelFail}</span>
    );
  }

  function resolvedError(h: HealthResult): string | null {
    if (!h.token_ok) return "Falta configurar el token de la API.";
    if (!h.dns_ok) {
      const code = h.error_code ? ` (${h.error_code})` : "";
      return `No se pudo conectar al endpoint GraphQL (network/TLS/DNS)${code}.${h.error ? " Detalle: " + h.error : ""}`;
    }
    if (h.status === 401 || h.status === 403 || h.error_code === "TOKEN_INVALID" || h.error === "TOKEN_INVALID") {
      return "Token inválido o expirado. Actualiza el token en la sección anterior.";
    }
    if (!h.excel_query_ok && h.error) {
      return errorLabel(h.error_code, h.error);
    }
    return null;
  }

  return (
    <div className="bg-[#1A1D24] border border-[#2A2D34] rounded-2xl p-6 shadow-xl">
      <p className="text-[#888] text-xs uppercase tracking-widest mb-4">Estado de conexión API</p>

      {health && (
        <div className="mb-4 space-y-2">
          <Row label="Endpoint" value={<span className="text-[#AAA] text-xs break-all">{health.endpoint_used}</span>} />
          <Row label="Token" value={badge(health.token_ok, "Configurado", "Falta")} />
          <Row label="Conectividad DNS/Red" value={badge(health.dns_ok, "OK", "Sin conexión")} />
          <Row
            label="generateProductsExcel"
            value={badge(health.excel_query_ok, "Disponible", "No disponible")}
          />
          {health.details.excelResponseKeys.length > 0 && (
            <Row
              label="Claves respuesta"
              value={<span className="text-[#AAA] text-xs">{health.details.excelResponseKeys.join(", ")}</span>}
            />
          )}

          {resolvedError(health) && (
            <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-300 text-xs break-words">{resolvedError(health)}</p>
            </div>
          )}

          {health.token_ok && health.dns_ok && health.excel_query_ok && (
            <div className="mt-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
              <p className="text-emerald-300 text-xs">
                Conexión verificada. Puedes sincronizar el catálogo.
              </p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onCheck}
        disabled={loading}
        className="w-full border border-[#333] hover:border-[#14C6C9] text-[#888] hover:text-[#14C6C9] text-xs py-2.5 rounded-xl transition-colors uppercase tracking-wider disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Comprobando conexión...
          </>
        ) : (
          "Comprobar conexión"
        )}
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#555] text-xs shrink-0">{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* ─── Auto sync card ─────────────────────────────────────────────── */
function AutoSyncCard({
  tokenOk,
  dnsOk,
  excelOk,
  healthChecked,
}: {
  tokenOk: boolean | null;
  dnsOk: boolean | null;
  excelOk: boolean | null;
  healthChecked: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync button enabled only when token + dns + excel all OK
  const canSync = tokenOk === true && dnsOk === true && excelOk === true;

  function disabledReason(): string | null {
    if (!healthChecked) return "Comprueba la conexión antes de sincronizar.";
    if (tokenOk === false) return "Falta configurar el token de la API.";
    if (dnsOk === false) return "No se pudo conectar al endpoint GraphQL (network/TLS/DNS).";
      if (excelOk === false) return "generateProductsExcel no está disponible. Comprueba la conexión.";
    return null;
  }

  async function handleSync() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/promoonline/sync-products", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        const code = data.error as string | undefined;
        setError(errorLabel(code ?? null, data.message ?? data.error ?? "Error desconocido"));
      } else {
        setResult(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setLoading(false);
    }
  }

  const reason = disabledReason();

  return (
    <div className="bg-[#1A1D24] border border-[#2A2D34] rounded-2xl p-6 shadow-xl">
      <p className="text-[#888] text-xs uppercase tracking-widest mb-2">Sincronizar desde API</p>
      <p className="text-[#555] text-xs mb-4">
        Presiona el botón para generar y cargar el Excel automáticamente desde la API de Promocionales en Línea.
      </p>

      <button
        onClick={handleSync}
        disabled={loading || !canSync}
        title={reason ?? undefined}
        className="w-full bg-[#14C6C9] hover:bg-[#11b3b6] disabled:bg-[#14C6C9]/30 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors duration-200 uppercase tracking-widest text-sm"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Sincronizando...
          </span>
        ) : (
          "Sincronizar catálogo desde API"
        )}
      </button>

      {reason && !loading && (
        <p className="mt-2 text-center text-[#555] text-[10px]">{reason}</p>
      )}

          {result && (
            <div className="mt-4 bg-[#14C6C9]/10 border border-[#14C6C9]/30 rounded-xl p-4 text-sm">
              <p className="text-[#14C6C9] font-bold mb-3 uppercase tracking-wider text-xs">Resultado</p>
              <div className="grid grid-cols-2 gap-y-2 text-[#CCC]">
                <span className="text-[#888]">Filas en Excel</span>
                <span className="font-semibold text-white">{String(result.total_rows_excel ?? result.total ?? 0)}</span>
                <span className="text-[#888]">Filas válidas</span>
                <span className="font-semibold text-white">{String(result.valid_rows ?? 0)}</span>
                <span className="text-[#888]">Duplicados removidos</span>
                <span className="font-semibold text-yellow-300">{String(result.duplicates_removed ?? 0)}</span>
                <span className="text-[#888]">Sin SKU (omitidos)</span>
                <span className="font-semibold text-[#AAA]">{String(result.skipped_missing_sku ?? result.skipped ?? 0)}</span>
                <span className="text-[#888]">Insertados / actualizados</span>
                <span className="font-semibold text-emerald-300">{String(result.inserted_or_updated ?? result.imported ?? 0)}</span>
              </div>
              <Link
                href="/productos"
                className="mt-4 block text-center text-[#14C6C9] text-xs underline hover:text-white transition-colors"
              >
                Ver productos →
              </Link>
            </div>
          )}

          {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm">
            <p className="text-red-400 font-bold mb-1 uppercase tracking-wider text-xs">Error</p>
            <p className="text-red-300 break-words">{error}</p>
          </div>
        )}
      </div>
    );
  }

/* ─── Category mapping card ───────────────────────────────────────── */
interface ApiCategory {
  id: string
  name: string
  slug: string
  parent_id: string | null
}

interface CategoryMapping {
  site_slug: string
  api_category_ids: string[]
  label: string
}

function CategoryMappingCard() {
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [mappings, setMappings] = useState<CategoryMapping[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadConfig() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/categories-config')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cargar configuración')
      setCategories(data.categories)
      setMappings(data.mappings)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function syncCategories() {
    setSyncing(true)
    setError(null)
    try {
      const res = await fetch('/api/api-categories')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al sincronizar categorías')
      loadConfig()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSyncing(false)
    }
  }

  async function updateMapping(siteSlug: string, ids: string[]) {
    setSaving(siteSlug)
    try {
      const res = await fetch('/api/admin/categories-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_slug: siteSlug, api_category_ids: ids })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al guardar')
      }
      setMappings(prev => prev.map(m => m.site_slug === siteSlug ? { ...m, api_category_ids: ids } : m))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(null)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  return (
    <div className="bg-[#1A1D24] border border-[#2A2D34] rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[#888] text-xs uppercase tracking-widest mb-1">Mapeo de Categorías</p>
          <p className="text-[#555] text-xs">Asigna categorías reales del API a las secciones del sitio.</p>
        </div>
        <button
          onClick={syncCategories}
          disabled={syncing}
          className="text-[10px] bg-[#14C6C9]/10 border border-[#14C6C9]/30 text-[#14C6C9] px-2 py-1 rounded-lg uppercase tracking-wider hover:bg-[#14C6C9]/20 transition-colors disabled:opacity-40"
        >
          {syncing ? 'Sincronizando...' : 'Sync Categorías'}
        </button>
      </div>

      {loading && <p className="text-[#555] text-xs">Cargando categorías...</p>}
      {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

      <div className="space-y-4">
        {mappings.map(m => (
          <div key={m.site_slug} className="bg-[#0E0F12] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white text-xs font-bold uppercase tracking-wider">{m.label}</span>
              <span className="text-[#555] text-[10px] font-mono">{m.site_slug}</span>
            </div>
            
            <div className="space-y-2">
              <select
                multiple
                value={m.api_category_ids}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions).map(o => o.value)
                  updateMapping(m.site_slug, options)
                }}
                disabled={saving === m.site_slug}
                className="w-full bg-[#1A1D24] border border-[#333] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#14C6C9] h-32"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.id})
                  </option>
                ))}
              </select>
              <p className="text-[#555] text-[10px]">Mantén pulsado Ctrl (o Cmd) para seleccionar múltiples categorías.</p>
              {saving === m.site_slug && <p className="text-emerald-400 text-[10px] animate-pulse">Guardando...</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Image diagnosis card ───────────────────────────────────────── */
interface ImageDiagResult {
  sku: string
  slug: string | null
  found_in_db: boolean
  found_in_api: boolean
  api_pages_scanned: number
  api_error: string | null
  db: {
    main_images_count: number
    vector_images_count: number
    main_images: string[]
    vector_images: string[]
    synced_at: string | null
  }
  api: {
    main_images_count: number
    vector_images_count: number
    main_images: string[]
    vector_images: string[]
  }
}

function ImageDiagnosisCard() {
  const [sku, setSku] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImageDiagResult | null>(null)
  const [diagError, setDiagError] = useState<string | null>(null)

  async function handleDiag() {
    if (!sku.trim()) return
    setLoading(true)
    setResult(null)
    setDiagError(null)
    try {
      const res = await fetch(`/api/admin/image-diagnosis?sku=${encodeURIComponent(sku.trim().toUpperCase())}`)
      const data = await res.json()
      if (!res.ok) setDiagError(data.error ?? 'Error desconocido')
      else setResult(data as ImageDiagResult)
    } catch (e) {
      setDiagError(e instanceof Error ? e.message : 'Error de red')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1A1D24] border border-[#2A2D34] rounded-2xl p-6 shadow-xl">
      <p className="text-[#888] text-xs uppercase tracking-widest mb-2">Diagnóstico de imágenes</p>
      <p className="text-[#555] text-xs mb-4">
        Compara las imágenes almacenadas en BD con las que devuelve el API en vivo para un SKU.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleDiag()}
          placeholder="Ej: TMPS 62"
          className="flex-1 bg-[#0E0F12] border border-[#333] rounded-xl px-3 py-2 text-white text-xs placeholder-[#444] focus:outline-none focus:border-[#14C6C9] uppercase"
        />
        <button
          onClick={handleDiag}
          disabled={loading || !sku.trim()}
          className="bg-[#14C6C9]/20 hover:bg-[#14C6C9]/30 border border-[#14C6C9]/40 text-[#14C6C9] text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
        >
          {loading ? 'Consultando...' : 'Diagnóstico'}
        </button>
      </div>

      {diagError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-3">
          <p className="text-red-300 text-xs">{diagError}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Status */}
          <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
            <span className={`px-2.5 py-1 rounded-full ${result.found_in_db ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/15 text-red-300 border border-red-500/30'}`}>
              {result.found_in_db ? '✅ En BD' : '❌ No en BD'}
            </span>
            <span className={`px-2.5 py-1 rounded-full ${result.found_in_api ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/15 text-red-300 border border-red-500/30'}`}>
              {result.found_in_api ? '✅ En API' : '❌ No en API'}
            </span>
            {result.slug && (
              <a
                href={`/producto/${result.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-full bg-[#14C6C9]/15 text-[#14C6C9] border border-[#14C6C9]/30 hover:bg-[#14C6C9]/25 transition-colors"
              >
                Ver producto →
              </a>
            )}
          </div>

          {result.api_error && (
            <p className="text-yellow-400 text-xs">⚠ API: {result.api_error}</p>
          )}

          {/* Side-by-side comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* DB */}
            <div className="bg-[#0E0F12] rounded-xl p-4 space-y-3">
              <p className="text-[#888] text-[10px] uppercase tracking-widest">
                Base de datos
                {result.db.synced_at && (
                  <span className="text-[#555] ml-2 normal-case">
                    {new Date(result.db.synced_at).toLocaleDateString('es-MX')}
                  </span>
                )}
              </p>
              <Row
                label="Fotos (mainImages)"
                value={
                  <span className={`font-mono font-bold ${result.db.main_images_count > 1 ? 'text-emerald-300' : 'text-[#AAA]'}`}>
                    {result.db.main_images_count}
                  </span>
                }
              />
              <Row
                label="Vectores"
                value={<span className="font-mono text-[#AAA] font-bold">{result.db.vector_images_count}</span>}
              />
              {result.db.main_images.length > 0 && (
                <div>
                  <p className="text-[#555] text-[10px] uppercase tracking-wider mb-1.5">URLs (Fotos)</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {result.db.main_images.slice(0, 4).map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={url}
                          alt={`main-${i}`}
                          className="w-12 h-12 object-contain rounded-lg bg-[#1A1D24] border border-[#2A2D34] hover:border-[#14C6C9] transition-colors"
                          onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.2' }}
                        />
                      </a>
                    ))}
                    {result.db.main_images.length > 4 && (
                      <div className="w-12 h-12 rounded-lg bg-[#1A1D24] border border-[#2A2D34] flex items-center justify-center text-[10px] text-[#555] font-bold">
                        +{result.db.main_images.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* API live */}
            <div className="bg-[#0E0F12] rounded-xl p-4 space-y-3">
              <p className="text-[#888] text-[10px] uppercase tracking-widest">
                API en vivo
                <span className="text-[#555] ml-2 normal-case">(pág. escaneadas: {result.api_pages_scanned})</span>
              </p>
              <Row
                label="Fotos (mainImages)"
                value={
                  <span className={`font-mono font-bold ${result.api.main_images_count > 1 ? 'text-emerald-300' : 'text-[#AAA]'}`}>
                    {result.api.main_images_count}
                  </span>
                }
              />
              <Row
                label="Vectores"
                value={<span className="font-mono text-[#AAA] font-bold">{result.api.vector_images_count}</span>}
              />
              {result.api.main_images.length > 0 && (
                <div>
                  <p className="text-[#555] text-[10px] uppercase tracking-wider mb-1.5">URLs (Fotos)</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {result.api.main_images.slice(0, 4).map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={url}
                          alt={`api-main-${i}`}
                          className="w-12 h-12 object-contain rounded-lg bg-[#1A1D24] border border-[#2A2D34] hover:border-[#14C6C9] transition-colors"
                          onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.2' }}
                        />
                      </a>
                    ))}
                    {result.api.main_images.length > 4 && (
                      <div className="w-12 h-12 rounded-lg bg-[#1A1D24] border border-[#2A2D34] flex items-center justify-center text-[10px] text-[#555] font-bold">
                        +{result.api.main_images.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {result.api.main_images_count === 1 && (
                <p className="text-yellow-400 text-[10px]">
                  ℹ Este producto solo tiene 1 imagen en el API.
                </p>
              )}
            </div>
          </div>

          {/* Mismatch warning */}
          {result.found_in_db && result.found_in_api &&
            result.db.main_images_count !== result.api.main_images_count && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
              <p className="text-yellow-300 text-xs">
                ⚠ Desincronización: BD tiene {result.db.main_images_count} fotos, API tiene {result.api.main_images_count}.
                Ejecuta una sincronización completa para actualizar.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Stock management card ──────────────────────────────────────── */
interface StockStats {
  total: number
  with_stock: number
  out_of_stock: number
  unknown: number
}

function StockCard() {
  const [stats, setStats] = useState<StockStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)

  async function loadStats() {
    setLoading(true)
    setStatsError(null)
    try {
      const res = await fetch('/api/admin/stock-stats')
      const data = await res.json()
      if (!res.ok) setStatsError(data.error ?? 'Error')
      else setStats(data as StockStats)
    } catch {
      setStatsError('Error de red')
    } finally {
      setLoading(false)
    }
  }

  async function handleSync() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/promoonline/sync-graphql', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setSyncResult({ ok: false, message: data.error ?? 'Error desconocido' })
      } else {
        setSyncResult({
          ok: true,
          message: `Stock actualizado: ${data.in_stock ?? 0} con stock, ${data.out_of_stock ?? 0} sin stock (${data.total ?? 0} total)`,
        })
        // Refresh stats
        loadStats()
      }
    } catch {
      setSyncResult({ ok: false, message: 'Error de red' })
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return (
    <div className="bg-[#1A1D24] border border-[#2A2D34] rounded-2xl p-6 shadow-xl">
      <p className="text-[#888] text-xs uppercase tracking-widest mb-2">Stock de productos</p>
      <p className="text-[#555] text-xs mb-4">
        Solo productos con stock &gt; 0 aparecen en el catálogo. Productos sin stock se ocultan automáticamente.
      </p>

      {/* Stats grid */}
      {loading && <p className="text-[#555] text-xs mb-4">Cargando estadísticas...</p>}
      {statsError && <p className="text-red-400 text-xs mb-4">{statsError}</p>}
      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#0E0F12] rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-[#555] text-[10px] uppercase tracking-wider mt-0.5">Total productos</p>
          </div>
          <div className="bg-[#0E0F12] rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.with_stock}</p>
            <p className="text-[#555] text-[10px] uppercase tracking-wider mt-0.5">Con stock</p>
          </div>
          <div className="bg-[#0E0F12] rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.out_of_stock}</p>
            <p className="text-[#555] text-[10px] uppercase tracking-wider mt-0.5">Sin stock</p>
          </div>
          <div className="bg-[#0E0F12] rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.unknown}</p>
            <p className="text-[#555] text-[10px] uppercase tracking-wider mt-0.5">Sin datos</p>
          </div>
        </div>
      )}

      <button
        onClick={handleSync}
        disabled={syncing}
        className="w-full border border-[#333] hover:border-emerald-500 text-[#888] hover:text-emerald-400 text-xs py-2.5 rounded-xl transition-colors uppercase tracking-wider disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {syncing ? (
          <>
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Actualizando stock...
          </>
        ) : (
          'Actualizar stock ahora'
        )}
      </button>

      {syncResult && (
        <div className={`mt-3 rounded-xl px-4 py-3 text-xs ${syncResult.ok ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
          <span className={syncResult.ok ? 'text-emerald-300' : 'text-red-300'}>
            {syncResult.ok ? '✅ ' : '❌ '}{syncResult.message}
          </span>
        </div>
      )}
    </div>
  )
}

/* ─── Price audit card ───────────────────────────────────────────── */
interface AuditResult {
  sku: string
  found_in_db: boolean
  found_in_api: boolean
  db: {
    price_mx: number | null
    currency_mx: string
    price_raw: string | null
    price_source: string | null
    price_updated_at: string | null
    is_stale: boolean
  }
  api: {
    price_mx: number | null
    currency: string
    price_raw: string | null
    field_used: string
    variants: Array<{ sku: string; amount: string; parsed: number | null; sentinel: boolean }>
  }
  difference: number | null
  match: boolean
}

function PriceAuditCard() {
  const [sku, setSku] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AuditResult | null>(null)
  const [auditError, setAuditError] = useState<string | null>(null)

  async function handleAudit() {
    if (!sku.trim()) return
    setLoading(true)
    setResult(null)
    setAuditError(null)
    try {
      const res = await fetch(`/api/admin/price-audit?sku=${encodeURIComponent(sku.trim().toUpperCase())}`)
      const data = await res.json()
      if (!res.ok) setAuditError(data.error ?? 'Error desconocido')
      else setResult(data as AuditResult)
    } catch (e) {
      setAuditError(e instanceof Error ? e.message : 'Error de red')
    } finally {
      setLoading(false)
    }
  }

  function fmtPrice(p: number | null, currency = 'MXN') {
    if (p === null) return <span className="text-[#555] italic">Consultar / sin precio</span>
    return <span className="text-emerald-300 font-mono">{`$${p.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${currency}`}</span>
  }

  return (
    <div className="bg-[#1A1D24] border border-[#2A2D34] rounded-2xl p-6 shadow-xl">
      <p className="text-[#888] text-xs uppercase tracking-widest mb-2">Auditar precio por SKU</p>
      <p className="text-[#555] text-xs mb-4">
        Compara el precio almacenado en BD con el precio en vivo del API (<code className="text-[#AAA]">priceMx.amount</code>).
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAudit()}
          placeholder="Ej: ABA 001"
          className="flex-1 bg-[#0E0F12] border border-[#333] rounded-xl px-3 py-2 text-white text-xs placeholder-[#444] focus:outline-none focus:border-[#14C6C9] uppercase"
        />
        <button
          onClick={handleAudit}
          disabled={loading || !sku.trim()}
          className="bg-[#14C6C9]/20 hover:bg-[#14C6C9]/30 border border-[#14C6C9]/40 text-[#14C6C9] text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
        >
          {loading ? 'Auditando...' : 'Auditar precio'}
        </button>
      </div>

      {auditError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-3">
          <p className="text-red-300 text-xs">{auditError}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Status banner */}
          <div className={`rounded-xl p-3 flex items-center gap-2 text-xs font-semibold ${result.match ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : result.difference !== null ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-300' : 'bg-[#333]/50 border border-[#444] text-[#888]'}`}>
            {result.match
              ? '✅ Precio en BD coincide con API'
              : result.difference !== null
              ? `⚠ Diferencia: $${result.difference.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
              : 'ℹ No se puede comparar (precio null en uno de los lados)'}
          </div>

          {/* DB values */}
          <div className="bg-[#0E0F12] rounded-xl p-4 space-y-2">
            <p className="text-[#888] text-[10px] uppercase tracking-widest mb-2">
              Base de datos {result.db.is_stale && <span className="text-yellow-400 ml-1">⚠ STALE (&gt;24h)</span>}
            </p>
            <Row label="price_mx (BD)" value={fmtPrice(result.db.price_mx, result.db.currency_mx)} />
            <Row label="price_raw" value={<span className="text-[#AAA] font-mono">{result.db.price_raw ?? '—'}</span>} />
            <Row label="price_source" value={<span className="text-[#AAA]">{result.db.price_source ?? '—'}</span>} />
            <Row label="price_updated_at" value={<span className="text-[#AAA] text-[10px]">{result.db.price_updated_at ? new Date(result.db.price_updated_at).toLocaleString('es-MX') : '—'}</span>} />
          </div>

          {/* API live values */}
          <div className="bg-[#0E0F12] rounded-xl p-4 space-y-2">
            <p className="text-[#888] text-[10px] uppercase tracking-widest mb-2">API en vivo</p>
            <Row label={result.api.field_used} value={fmtPrice(result.api.price_mx, result.api.currency)} />
            <Row label="price_raw (API)" value={<span className="text-[#AAA] font-mono">{result.api.price_raw ?? '—'}</span>} />
            {result.api.variants.length > 0 && (
              <div className="mt-2">
                <p className="text-[#555] text-[10px] uppercase tracking-wider mb-1">Variantes ({result.api.variants.length})</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {result.api.variants.map((v) => (
                    <div key={v.sku} className="flex justify-between text-[10px]">
                      <span className="text-[#AAA] font-mono truncate max-w-[140px]">{v.sku}</span>
                      <span className={v.sentinel ? 'text-red-400' : v.parsed !== null ? 'text-emerald-400' : 'text-[#555]'}>
                        {v.sentinel
                          ? `${v.amount} ⚠ sentinel`
                          : v.parsed !== null
                          ? `$${v.parsed.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                          : 'null'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!result.found_in_db && (
            <p className="text-yellow-400 text-xs">⚠ SKU no encontrado en BD. Ejecuta la sincronización primero.</p>
          )}
          {!result.found_in_api && (
            <p className="text-red-400 text-xs">⚠ SKU no encontrado en el API. El producto puede no estar disponible para este distribuidor.</p>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Auth test card ─────────────────────────────────────────────── */
function AuthTestCard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message?: string; error?: string } | null>(null);

  async function testLogin() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/promoonline/auth/login", { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ ok: false, error: "NETWORK_ERROR", message: e instanceof Error ? e.message : "Error de red" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#1A1D24] border border-[#2A2D34] rounded-2xl p-6 shadow-xl">
      <p className="text-[#888] text-xs uppercase tracking-widest mb-2">Probar Login (token)</p>
      <p className="text-[#555] text-xs mb-4">
        Prueba las credenciales configuradas y obtiene un access token del servidor.
      </p>

      <button
        onClick={testLogin}
        disabled={loading}
        className="w-full border border-[#333] hover:border-[#9B59B6] text-[#888] hover:text-[#9B59B6] text-xs py-2.5 rounded-xl transition-colors uppercase tracking-wider disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Probando login...
          </>
        ) : (
          "Probar login (token)"
        )}
      </button>

      {result && (
        <div className={`mt-3 rounded-xl px-4 py-3 text-xs ${result.ok ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
          <span className={result.ok ? "text-emerald-300" : "text-red-300"}>
            {result.ok ? "✅ " : "❌ "}{result.message ?? result.error ?? "Sin respuesta"}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Excel test card ────────────────────────────────────────────── */
interface ExcelResult {
  ok: boolean;
  file?: string;
  message?: string;
  error?: string;
  step?: string;
  detail?: Record<string, unknown>;
  downloadProbe?: { ok: boolean; status?: number; contentType?: string; error?: string };
}

function ExcelTestCard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExcelResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function generateExcel() {
    setLoading(true);
    setResult(null);
    setCopied(false);
    try {
      const res = await fetch("/api/promoonline/excel", { method: "POST" });
      const data = await res.json() as ExcelResult;
      setResult(data);
    } catch (e) {
      setResult({ ok: false, error: "NETWORK_ERROR", message: e instanceof Error ? e.message : "Error de red" });
    } finally {
      setLoading(false);
    }
  }

  function copyDetail() {
    if (!result) return;
    const text = JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function richErrorMsg(r: ExcelResult): string {
    if (r.detail) {
      const d = r.detail as { step?: string; code?: string; message?: string };
      const parts: string[] = [];
      if (d.step) parts.push(`Falló en: ${d.step}`);
      if (d.code) parts.push(d.code);
      if (d.message) parts.push(d.message);
      return parts.length ? parts.join(" — ") : r.message ?? r.error ?? "Error desconocido";
    }
    return r.message ?? r.error ?? "Error desconocido";
  }

  return (
    <div className="bg-[#1A1D24] border border-[#2A2D34] rounded-2xl p-6 shadow-xl">
      <p className="text-[#888] text-xs uppercase tracking-widest mb-2">Generar Excel (API)</p>
      <p className="text-[#555] text-xs mb-4">
        Ejecuta <code className="text-[#AAA]">generateProductsExcel</code> con token automático y muestra la URL del archivo.
      </p>

      <button
        onClick={generateExcel}
        disabled={loading}
        className="w-full border border-[#333] hover:border-[#14C6C9] text-[#888] hover:text-[#14C6C9] text-xs py-2.5 rounded-xl transition-colors uppercase tracking-wider disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Generando Excel...
          </>
        ) : (
          "Generar Excel (API)"
        )}
      </button>

      {result && (
        <div className={`mt-3 rounded-xl px-4 py-3 text-xs space-y-2 ${result.ok ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
          {result.ok ? (
            <>
              <p className="text-emerald-300 font-semibold">✅ {result.message}</p>
              {result.file && (
                <a
                  href={result.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#14C6C9] underline break-all block"
                >
                  {result.file}
                </a>
              )}
              {result.downloadProbe && !result.downloadProbe.ok && (
                <p className="text-yellow-400">
                  ⚠ Probe de descarga falló: {result.downloadProbe.error ?? `status ${result.downloadProbe.status}`}
                </p>
              )}
              {result.downloadProbe?.ok && (
                <p className="text-emerald-400 text-[10px]">
                  Probe descarga: ✅ status {result.downloadProbe.status} — {result.downloadProbe.contentType}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-red-300 font-semibold break-words">❌ {richErrorMsg(result)}</p>
              <button
                onClick={copyDetail}
                className="mt-1 text-[10px] border border-red-400/40 text-red-300 hover:text-white hover:border-red-300 px-3 py-1 rounded-lg transition-colors uppercase tracking-wider"
              >
                {copied ? "✅ Copiado" : "Copiar detalle"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Cleanup duplicates card ────────────────────────────────────── */
interface CleanupResult {
  ok: boolean
  duplicates_removed: number
  products_missing_price: number
  top_dupes: { sku: string; count: number }[]
}

function CleanupCard() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CleanupResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCleanup() {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch('/api/admin/cleanup-duplicates', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? 'Error desconocido')
      else setResult(data as CleanupResult)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de red')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1A1D24] border border-[#2A2D34] rounded-2xl p-6 shadow-xl">
      <p className="text-[#888] text-xs uppercase tracking-widest mb-2">Limpiar duplicados en BD</p>
      <p className="text-[#555] text-xs mb-4">
        Detecta SKUs duplicados en Supabase, conserva el mejor registro (con precio e imagen) y elimina el resto.
      </p>

      <button
        onClick={handleCleanup}
        disabled={loading}
        className="w-full border border-[#333] hover:border-yellow-500 text-[#888] hover:text-yellow-400 text-xs py-2.5 rounded-xl transition-colors uppercase tracking-wider disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Limpiando...
          </>
        ) : (
          'Limpiar duplicados'
        )}
      </button>

      {result && (
        <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-sm space-y-3">
          <p className="text-yellow-300 font-bold uppercase tracking-wider text-xs">Resultado limpieza</p>
          <div className="grid grid-cols-2 gap-y-2 text-[#CCC]">
            <span className="text-[#888]">Duplicados eliminados</span>
            <span className="font-semibold text-yellow-300">{result.duplicates_removed}</span>
            <span className="text-[#888]">Sin precio</span>
            <span className="font-semibold text-[#AAA]">{result.products_missing_price}</span>
          </div>
          {result.top_dupes.length > 0 && (
            <div>
              <p className="text-[#555] text-[10px] uppercase tracking-wider mb-1">Top SKUs duplicados</p>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {result.top_dupes.map((d) => (
                  <div key={d.sku} className="flex justify-between text-[10px]">
                    <span className="text-[#AAA] font-mono">{d.sku}</span>
                    <span className="text-yellow-400">{d.count} copias</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {result.duplicates_removed === 0 && (
            <p className="text-emerald-300 text-xs">✅ No se encontraron duplicados.</p>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <p className="text-red-300 text-xs break-words">{error}</p>
        </div>
      )}
    </div>
  )
}

/* ─── Banner manager card ────────────────────────────────────────── */
interface Banner {
  id: string
  title: string
  subtitle: string | null
  cta_label: string | null
  cta_href: string | null
  image_url: string
  alt_text: string
  link_url: string | null
  sort_order: number
  is_active: boolean
}

function BannerManagerCard() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  // New banner form
  const [form, setForm] = useState({ title: '', subtitle: '', cta_label: 'Ver catálogo', cta_href: '/productos', image_url: '', alt_text: '', link_url: '' })
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/banners')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBanners(data.banners)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function flash(text: string) {
    setMsg(text)
    setTimeout(() => setMsg(null), 3000)
  }

  async function toggleActive(banner: Banner) {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: banner.id, is_active: !banner.is_active }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, is_active: !b.is_active } : b))
      flash(banner.is_active ? 'Banner desactivado' : 'Banner activado')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteBanner(id: string) {
    if (!confirm('¿Eliminar este banner?')) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setBanners(prev => prev.filter(b => b.id !== id))
      flash('Banner eliminado')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function moveOrder(banner: Banner, direction: 'up' | 'down') {
    const sorted = [...banners].sort((a, b) => a.sort_order - b.sort_order)
    const idx = sorted.findIndex(b => b.id === banner.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const a = sorted[idx]
    const b = sorted[swapIdx]
    const newOrderA = b.sort_order
    const newOrderB = a.sort_order

    setSaving(true)
    try {
      await Promise.all([
        fetch('/api/admin/banners', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: a.id, sort_order: newOrderA }),
        }),
        fetch('/api/admin/banners', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: b.id, sort_order: newOrderB }),
        }),
      ])
      setBanners(prev => prev.map(bn => {
        if (bn.id === a.id) return { ...bn, sort_order: newOrderA }
        if (bn.id === b.id) return { ...bn, sort_order: newOrderB }
        return bn
      }))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      // Upload to Supabase Storage via the existing project-uploads bucket
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'project-uploads')
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: formData })
      if (!res.ok) {
        // Fallback: use object URL for preview only (user can paste URL manually)
        const url = URL.createObjectURL(file)
        setForm(f => ({ ...f, image_url: url }))
        flash('No se pudo subir. Usa la URL directa del proveedor.')
        return
      }
      const data = await res.json()
      setForm(f => ({ ...f, image_url: data.url }))
      flash('Imagen subida correctamente')
    } catch {
      flash('Error al subir imagen. Usa la URL directamente.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function addBanner() {
    if (!form.image_url.trim()) { setError('La URL de imagen es requerida'); return }
    setAdding(true)
    setError(null)
    try {
      const maxOrder = banners.length ? Math.max(...banners.map(b => b.sort_order)) : 0
        const res = await fetch('/api/admin/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            subtitle: form.subtitle || null,
            cta_label: form.cta_label || null,
            cta_href: form.cta_href || '/productos',
            image_url: form.image_url.trim(),
            alt_text: form.alt_text,
            link_url: form.link_url.trim() || null,
            sort_order: maxOrder + 1,
            is_active: true,
          }),
        })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBanners(prev => [...prev, data.banner])
      setForm({ title: '', subtitle: '', cta_label: 'Ver catálogo', cta_href: '/productos', image_url: '', alt_text: '', link_url: '' })
      setShowForm(false)
      flash('Banner agregado correctamente')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setAdding(false)
    }
  }

  const sorted = [...banners].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="bg-[#1A1D24] border border-[#2A2D34] rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[#888] text-xs uppercase tracking-widest mb-1">Banners de Inicio</p>
          <p className="text-[#555] text-xs">Administra los banners del hero de la página principal.</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="text-[10px] bg-[#14C6C9]/10 border border-[#14C6C9]/30 text-[#14C6C9] px-3 py-1.5 rounded-lg uppercase tracking-wider hover:bg-[#14C6C9]/20 transition-colors"
        >
          + Nuevo banner
        </button>
      </div>

      {/* Feedback messages */}
      {msg && (
        <div className="mb-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2">
          <p className="text-emerald-300 text-xs">✅ {msg}</p>
        </div>
      )}
      {error && (
        <div className="mb-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2 flex justify-between items-start">
          <p className="text-red-300 text-xs">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 text-xs ml-2">✕</button>
        </div>
      )}

      {/* Add banner form */}
      {showForm && (
        <div className="mb-4 bg-[#0E0F12] rounded-xl p-4 space-y-3 border border-[#2A2D34]">
          <p className="text-[#888] text-[10px] uppercase tracking-widest mb-2">Nuevo banner</p>

          {/* Image URL + file upload */}
          <div className="space-y-2">
            <label className="text-[#555] text-[10px] uppercase tracking-wider block">Imagen</label>
            <input
              type="url"
              value={form.image_url}
              onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              placeholder="https://... (URL de la imagen)"
              className="w-full bg-[#1A1D24] border border-[#333] rounded-xl px-3 py-2 text-white text-xs placeholder-[#444] focus:outline-none focus:border-[#14C6C9]"
            />
            <div className="flex items-center gap-2">
              <span className="text-[#555] text-[10px]">— o —</span>
              <label className={`text-[10px] border border-[#333] rounded-lg px-3 py-1.5 cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed text-[#555]' : 'text-[#14C6C9] hover:border-[#14C6C9]'}`}>
                {uploading ? 'Subiendo...' : 'Subir desde PC'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            {form.image_url && (
              <div className="relative w-full h-24 rounded-xl overflow-hidden border border-[#2A2D34] bg-[#0E0F12]">
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.opacity = '0.2' }}
                />
              </div>
            )}
          </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[#555] text-[10px] uppercase tracking-wider block mb-1">Título (visible en banner)</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ej: Nuevos Productos 2026"
                  className="w-full bg-[#1A1D24] border border-[#333] rounded-xl px-3 py-2 text-white text-xs placeholder-[#444] focus:outline-none focus:border-[#14C6C9]"
                />
              </div>
              <div>
                <label className="text-[#555] text-[10px] uppercase tracking-wider block mb-1">Subtítulo</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                  placeholder="Ej: Diseña tu marca con nosotros"
                  className="w-full bg-[#1A1D24] border border-[#333] rounded-xl px-3 py-2 text-white text-xs placeholder-[#444] focus:outline-none focus:border-[#14C6C9]"
                />
              </div>
              <div>
                <label className="text-[#555] text-[10px] uppercase tracking-wider block mb-1">Botón CTA (texto)</label>
                <input
                  type="text"
                  value={form.cta_label}
                  onChange={e => setForm(f => ({ ...f, cta_label: e.target.value }))}
                  placeholder="Ver catálogo"
                  className="w-full bg-[#1A1D24] border border-[#333] rounded-xl px-3 py-2 text-white text-xs placeholder-[#444] focus:outline-none focus:border-[#14C6C9]"
                />
              </div>
              <div>
                <label className="text-[#555] text-[10px] uppercase tracking-wider block mb-1">Botón CTA (enlace)</label>
                <input
                  type="text"
                  value={form.cta_href}
                  onChange={e => setForm(f => ({ ...f, cta_href: e.target.value }))}
                  placeholder="/productos"
                  className="w-full bg-[#1A1D24] border border-[#333] rounded-xl px-3 py-2 text-white text-xs placeholder-[#444] focus:outline-none focus:border-[#14C6C9]"
                />
              </div>
              <div>
                <label className="text-[#555] text-[10px] uppercase tracking-wider block mb-1">Texto alternativo (SEO)</label>
                <input
                  type="text"
                  value={form.alt_text}
                  onChange={e => setForm(f => ({ ...f, alt_text: e.target.value }))}
                  placeholder="Descripción de la imagen"
                  className="w-full bg-[#1A1D24] border border-[#333] rounded-xl px-3 py-2 text-white text-xs placeholder-[#444] focus:outline-none focus:border-[#14C6C9]"
                />
              </div>
              <div>
                <label className="text-[#555] text-[10px] uppercase tracking-wider block mb-1">Enlace del banner (todo)</label>
                <input
                  type="url"
                  value={form.link_url}
                  onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))}
                  placeholder="https://... (opcional)"
                  className="w-full bg-[#1A1D24] border border-[#333] rounded-xl px-3 py-2 text-white text-xs placeholder-[#444] focus:outline-none focus:border-[#14C6C9]"
                />
              </div>
            </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={addBanner}
              disabled={adding || !form.image_url.trim()}
              className="flex-1 bg-[#14C6C9] hover:bg-[#11b3b6] disabled:bg-[#14C6C9]/30 disabled:cursor-not-allowed text-white font-bold py-2 rounded-xl transition-colors text-xs uppercase tracking-wider"
            >
              {adding ? 'Guardando...' : 'Guardar banner'}
            </button>
            <button
              onClick={() => { setShowForm(false); setForm({ title: '', subtitle: '', cta_label: 'Ver catálogo', cta_href: '/productos', image_url: '', alt_text: '', link_url: '' }) }}
              className="border border-[#333] text-[#555] hover:text-[#888] hover:border-[#555] text-xs px-4 py-2 rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Banner list */}
      {loading ? (
        <p className="text-[#555] text-xs">Cargando banners...</p>
      ) : sorted.length === 0 ? (
        <p className="text-[#555] text-xs text-center py-4">No hay banners. Agrega uno nuevo.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((banner, idx) => (
            <div
              key={banner.id}
              className={`flex gap-3 items-start bg-[#0E0F12] rounded-xl p-3 border transition-colors ${banner.is_active ? 'border-[#2A2D34]' : 'border-[#1A1D24] opacity-50'}`}
            >
              {/* Preview */}
              <div className="relative w-24 h-14 rounded-lg overflow-hidden shrink-0 bg-[#1A1D24] border border-[#2A2D34]">
                <img
                  src={banner.image_url}
                  alt={banner.alt_text || banner.title}
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.opacity = '0.2' }}
                />
                {!banner.is_active && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-[#888] text-[9px] uppercase tracking-wider">Inactivo</span>
                  </div>
                )}
              </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{banner.title || <span className="text-[#555] italic">Sin título</span>}</p>
                  {banner.subtitle && (
                    <p className="text-[#888] text-[10px] truncate mt-0.5 italic">{banner.subtitle}</p>
                  )}
                  <p className="text-[#555] text-[10px] truncate mt-0.5">{banner.image_url}</p>
                  {(banner.cta_label || banner.cta_href) && (
                    <p className="text-[#14C6C9] text-[10px] truncate mt-0.5">
                      CTA: {banner.cta_label || 'Ver catálogo'} → {banner.cta_href || '/productos'}
                    </p>
                  )}
                  {banner.link_url && (
                    <p className="text-[#9B59B6] text-[10px] truncate mt-0.5">Enlace: {banner.link_url}</p>
                  )}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {/* Toggle active */}
                  <button
                    onClick={() => toggleActive(banner)}
                    disabled={saving}
                    className={`text-[10px] px-2 py-1 rounded-lg border transition-colors disabled:opacity-40 ${
                      banner.is_active
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300'
                        : 'bg-[#333]/50 border-[#333] text-[#555] hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-300'
                    }`}
                  >
                    {banner.is_active ? '● Activo' : '○ Inactivo'}
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => deleteBanner(banner.id)}
                    disabled={saving}
                    className="text-[10px] px-2 py-1 rounded-lg border border-[#333] text-[#555] hover:border-red-500/50 hover:text-red-400 transition-colors disabled:opacity-40"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Order controls */}
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => moveOrder(banner, 'up')}
                  disabled={saving || idx === 0}
                  className="w-7 h-7 rounded-lg border border-[#333] text-[#555] hover:border-[#14C6C9] hover:text-[#14C6C9] transition-colors disabled:opacity-20 flex items-center justify-center"
                  title="Subir"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => moveOrder(banner, 'down')}
                  disabled={saving || idx === sorted.length - 1}
                  className="w-7 h-7 rounded-lg border border-[#333] text-[#555] hover:border-[#14C6C9] hover:text-[#14C6C9] transition-colors disabled:opacity-20 flex items-center justify-center"
                  title="Bajar"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[#555] text-[10px] mt-3 text-center">
        Los cambios se reflejan en tiempo real en la página de inicio.
      </p>
    </div>
  )
}

/* ─── Manual Excel upload card ───────────────────────────────────── */
function ManualUploadCard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/promoonline/sync-products", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Error desconocido");
      else setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="bg-[#1A1D24] border border-[#2A2D34] rounded-2xl p-6 shadow-xl">
      <p className="text-[#888] text-xs uppercase tracking-widest mb-2">Carga manual de Excel</p>
      <p className="text-[#555] text-xs mb-4">
        Alternativa opcional: si tienes el archivo <code>.xlsx</code> descargado, puedes subirlo directamente aquí.
      </p>

      <label
        className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl py-6 cursor-pointer transition-colors
          ${loading ? "border-[#333] opacity-50 cursor-not-allowed" : "border-[#333] hover:border-[#14C6C9]"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleFile}
          disabled={loading}
        />
        {loading ? (
          <span className="flex items-center gap-2 text-[#14C6C9] text-sm">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Procesando {fileName}...
          </span>
        ) : (
          <>
            <svg className="w-8 h-8 text-[#444] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[#666] text-sm">Haz clic para seleccionar un archivo .xlsx / .xls / .csv</span>
            {fileName && <span className="text-[#14C6C9] text-xs mt-1">{fileName}</span>}
          </>
        )}
      </label>

          {result && (
            <div className="mt-4 bg-[#14C6C9]/10 border border-[#14C6C9]/30 rounded-xl p-4 text-sm">
              <p className="text-[#14C6C9] font-bold mb-3 uppercase tracking-wider text-xs">Resultado</p>
              <div className="grid grid-cols-2 gap-y-2 text-[#CCC]">
                <span className="text-[#888]">Filas en Excel</span>
                <span className="font-semibold text-white">{String(result.total_rows_excel ?? result.total ?? 0)}</span>
                <span className="text-[#888]">Filas válidas</span>
                <span className="font-semibold text-white">{String(result.valid_rows ?? 0)}</span>
                <span className="text-[#888]">Duplicados removidos</span>
                <span className="font-semibold text-yellow-300">{String(result.duplicates_removed ?? 0)}</span>
                <span className="text-[#888]">Sin SKU (omitidos)</span>
                <span className="font-semibold text-[#AAA]">{String(result.skipped_missing_sku ?? result.skipped ?? 0)}</span>
                <span className="text-[#888]">Insertados / actualizados</span>
                <span className="font-semibold text-emerald-300">{String(result.inserted_or_updated ?? result.imported ?? 0)}</span>
              </div>
              <Link
                href="/productos"
                className="mt-4 block text-center text-[#14C6C9] text-xs underline hover:text-white transition-colors"
              >
                Ver productos →
              </Link>
            </div>
          )}

        {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm">
          <p className="text-red-400 font-bold mb-1 uppercase tracking-wider text-xs">Error</p>
          <p className="text-red-300 break-words">{error}</p>
        </div>
      )}
    </div>
  );
}
