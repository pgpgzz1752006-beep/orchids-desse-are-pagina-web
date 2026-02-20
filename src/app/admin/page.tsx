"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface HealthResult {
  endpoint_used: string;
  dns_ok: boolean;
  graphql_ok: boolean;
  excel_query_ok: boolean;
  token_configured: boolean;
  status: number | null;
  details: { typename: string | null; excelResponseKeys: string[] };
  error: string | null;
  error_code: string | null;
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
      setHealth(data);
    } catch (e) {
        setHealth({
          endpoint_used: "—",
          dns_ok: false,
          graphql_ok: false,
          excel_query_ok: false,
          token_configured: false,
          status: null,
          details: { typename: null, excelResponseKeys: [] },
          error: e instanceof Error ? e.message : "Error de red al llamar /health",
          error_code: "FETCH_FAILED",
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
        <HealthCard
          health={health}
          loading={healthLoading}
          onCheck={checkHealth}
        />

        {/* Auto sync from API */}
        <AutoSyncCard graphqlOk={health?.graphql_ok ?? null} excelOk={health?.excel_query_ok ?? null} />

        {/* Manual Excel upload */}
        <ManualUploadCard />

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
      <p className="text-[#888] text-xs uppercase tracking-widest mb-1">Token de autenticación</p>
      <p className="text-[#555] text-xs mb-4">
        Solo necesario si la API requiere autenticación. Se guarda en la base de datos y se usa server-side.
        No se expone al cliente.
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
              <span className="text-yellow-500 text-xs">⚠ Sin token</span>
            )}
          </div>

          {source === "env" ? (
            <p className="text-[#555] text-xs italic">
              El token proviene de la variable de entorno <code className="text-[#888]">PROMO_GRAPHQL_TOKEN</code>. Para cambiarlo edita las env vars.
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
                {saving ? "Guardando..." : "Guardar"}
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
  function statusBadge(ok: boolean | null, labelOk: string, labelFail: string) {
    if (ok === null) return <span className="text-[#555] text-xs">—</span>;
    return ok ? (
      <span className="text-emerald-400 font-semibold text-xs">✅ {labelOk}</span>
    ) : (
      <span className="text-red-400 font-semibold text-xs">❌ {labelFail}</span>
    );
  }

  function errorMessage(h: HealthResult): string | null {
    if (!h.dns_ok) {
      const code = h.error_code ? ` (${h.error_code})` : "";
      return `No se pudo conectar al endpoint GraphQL (network/TLS/DNS)${code}. Revisa logs del servidor.${h.error ? " Detalle: " + h.error : ""}`;
    }
    if (h.status === 401 || h.status === 403) {
      return "Autenticación requerida (token). El servidor devolvió " + h.status + ".";
    }
    if (!h.graphql_ok && h.error) {
      return "Error GraphQL: " + h.error;
    }
    if (h.graphql_ok && !h.excel_query_ok) {
      return "La API responde, pero no permite generateProductsExcel / falta permiso / query no existe. " + (h.error ?? "");
    }
    return null;
  }

  return (
    <div className="bg-[#1A1D24] border border-[#2A2D34] rounded-2xl p-6 shadow-xl">
      <p className="text-[#888] text-xs uppercase tracking-widest mb-4">Estado de conexión API</p>

      {health && (
        <div className="mb-4 space-y-2">
          <Row label="Endpoint" value={<span className="text-[#AAA] text-xs break-all">{health.endpoint_used}</span>} />
          <Row label="Conectividad DNS/Red" value={statusBadge(health.dns_ok, "OK", "Sin conexión")} />
          <Row label="GraphQL válido" value={statusBadge(health.graphql_ok, "OK", "Fallo")} />
          <Row
            label="generateProductsExcel"
            value={statusBadge(health.excel_query_ok, "Disponible", "No disponible")}
          />
          {health.details.typename && (
            <Row label="__typename" value={<span className="text-[#AAA] text-xs">{health.details.typename}</span>} />
          )}
          {health.details.excelResponseKeys.length > 0 && (
            <Row
              label="Claves respuesta"
              value={<span className="text-[#AAA] text-xs">{health.details.excelResponseKeys.join(", ")}</span>}
            />
          )}

          {errorMessage(health) && (
            <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-300 text-xs break-words">{errorMessage(health)}</p>
            </div>
          )}

          {health.dns_ok && health.graphql_ok && health.excel_query_ok && (
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
  graphqlOk,
  excelOk,
}: {
  graphqlOk: boolean | null;
  excelOk: boolean | null;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSync = graphqlOk === true;
  const excelFailed = graphqlOk === true && excelOk === false;

  async function handleSync() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/promoonline/sync-products", { method: "POST" });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Error desconocido");
      else setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#1A1D24] border border-[#2A2D34] rounded-2xl p-6 shadow-xl">
      <p className="text-[#888] text-xs uppercase tracking-widest mb-2">Sincronizar desde API</p>
      <p className="text-[#555] text-xs mb-4">
        Presiona el botón para generar y cargar el Excel automáticamente desde la API de Promocionales en Línea.
        {graphqlOk === null && (
          <span className="text-yellow-500/80"> Comprueba la conexión primero.</span>
        )}
      </p>

      {excelFailed && (
        <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
          <p className="text-yellow-300 text-xs">
            La API responde, pero no permite <code>generateProductsExcel</code> / falta permiso / query no existe.
          </p>
        </div>
      )}

      <button
        onClick={handleSync}
        disabled={loading || !canSync}
        title={!canSync ? "Comprueba la conexión antes de sincronizar" : undefined}
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

      {!canSync && graphqlOk === null && (
        <p className="mt-2 text-center text-[#555] text-[10px]">
          Botón habilitado después de comprobar conexión exitosa.
        </p>
      )}
      {!canSync && graphqlOk === false && (
        <p className="mt-2 text-center text-red-400/70 text-[10px]">
          No disponible: la conexión GraphQL falló.
        </p>
      )}

      {result && (
        <div className="mt-4 bg-[#14C6C9]/10 border border-[#14C6C9]/30 rounded-xl p-4 text-sm">
          <p className="text-[#14C6C9] font-bold mb-3 uppercase tracking-wider text-xs">Resultado</p>
          <div className="grid grid-cols-2 gap-y-2 text-[#CCC]">
            <span className="text-[#888]">Total parseados</span>
            <span className="font-semibold text-white">{String(result.total ?? 0)}</span>
            <span className="text-[#888]">Importados / Actualizados</span>
            <span className="font-semibold text-white">{String(result.imported ?? 0)}</span>
            <span className="text-[#888]">Omitidos</span>
            <span className="font-semibold text-white">{String(result.skipped ?? 0)}</span>
          </div>
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
            <span className="text-[#888]">Total parseados</span>
            <span className="font-semibold text-white">{String(result.total ?? 0)}</span>
            <span className="text-[#888]">Importados / Actualizados</span>
            <span className="font-semibold text-white">{String(result.imported ?? 0)}</span>
            <span className="text-[#888]">Omitidos</span>
            <span className="font-semibold text-white">{String(result.skipped ?? 0)}</span>
          </div>
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
