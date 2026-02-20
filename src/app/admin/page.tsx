"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#0E0F12] font-['Montserrat'] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-1.5 rounded-full bg-gradient-to-r from-[#14C6C9] to-[#9B59B6] mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-white uppercase tracking-widest">Admin</h1>
          <p className="text-[#888] text-sm mt-1">Sincronización del catálogo</p>
        </div>

        {/* Auto sync from API */}
        <AutoSyncCard />

        {/* Manual Excel upload */}
        <ManualUploadCard />

        {/* GraphQL tester */}
        <GraphQLTester />

        <div className="text-center pt-2">
          <Link href="/" className="text-[#14C6C9] text-xs hover:underline">
            ← Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Auto sync card ─────────────────────────────────────────── */
function AutoSyncCard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          Presiona el botón para generar y cargar el Excel automáticamente desde la API de Promocionales Online.
        </p>
        <button
          onClick={handleSync}
          disabled={loading}
          className="w-full bg-[#14C6C9] hover:bg-[#11b3b6] disabled:bg-[#14C6C9]/40 text-white font-bold py-3 rounded-xl transition-colors duration-200 uppercase tracking-widest text-sm"
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
          <p className="text-[#666] text-xs mt-2">
            Este error puede ocurrir en entornos locales/sandbox donde el dominio externo no es accesible.
            Prueba usar la carga manual de Excel, o ejecuta desde el servidor de producción.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Manual Excel upload card ────────────────────────────────── */
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

      const res = await fetch("/api/promoonline/sync-products", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Error desconocido");
      else setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setLoading(false);
      // reset input so same file can be re-uploaded
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="bg-[#1A1D24] border border-[#2A2D34] rounded-2xl p-6 shadow-xl">
      <p className="text-[#888] text-xs uppercase tracking-widest mb-4">Carga manual de Excel</p>
      <p className="text-[#666] text-xs mb-4">
        Descarga el Excel de tu proveedor y súbelo aquí para importar el catálogo sin depender de la API.
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

/* ─── GraphQL tester ─────────────────────────────────────────── */
function GraphQLTester() {
  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState<string | null>(null);

  async function testGraphQL() {
    setLoading(true);
    setRaw(null);
    try {
      const res = await fetch("/api/promoonline/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "query GenerateProductsExcel { generateProductsExcel }" }),
      });
      const data = await res.json();
      const result = data?.data?.generateProductsExcel;
      if (data.errors?.length) {
        setRaw("GraphQL error:\n" + JSON.stringify(data.errors, null, 2));
      } else if (result === null || result === undefined) {
        setRaw("Respuesta: null / undefined\n\n" + JSON.stringify(data, null, 2).slice(0, 500));
      } else if (typeof result === "string") {
        setRaw(`Tipo: string\nLongitud: ${result.length} chars\nInicio: ${result.slice(0, 120)}...`);
      } else {
        setRaw(`Tipo: object\nClaves: ${Object.keys(result).join(", ")}\n\n${JSON.stringify(result, null, 2).slice(0, 600)}`);
      }
    } catch (e) {
      setRaw("Error: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#1A1D24] border border-[#2A2D34] rounded-2xl p-6 shadow-xl">
      <p className="text-[#888] text-xs uppercase tracking-widest mb-4">Herramientas</p>
      <button
        onClick={testGraphQL}
        disabled={loading}
        className="w-full border border-[#333] hover:border-[#14C6C9] text-[#888] hover:text-[#14C6C9] text-xs py-2 rounded-lg transition-colors uppercase tracking-wider disabled:opacity-40"
      >
        {loading ? "Probando GraphQL..." : "Probar endpoint GraphQL"}
      </button>
      {raw && (
        <pre className="mt-3 bg-[#111] text-[#AAA] text-[10px] p-3 rounded-lg overflow-auto max-h-48 whitespace-pre-wrap break-all">
          {raw}
        </pre>
      )}
    </div>
  );
}
