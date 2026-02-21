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
