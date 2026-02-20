"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminPage() {
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
      if (!res.ok) {
        setError(data.error || "Error desconocido");
      } else {
        setResult(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0E0F12] font-['Montserrat'] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1A1D24] border border-[#2A2D34] rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-12 h-1.5 rounded-full bg-gradient-to-r from-[#14C6C9] to-[#9B59B6] mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-white uppercase tracking-widest">
            Admin
          </h1>
          <p className="text-[#888] text-sm mt-1">Sincronización del catálogo</p>
        </div>

        {/* Sync button */}
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
            "Sincronizar catálogo"
          )}
        </button>

        {/* Result */}
        {result && (
          <div className="mt-6 bg-[#14C6C9]/10 border border-[#14C6C9]/30 rounded-xl p-5 text-sm">
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

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-sm">
            <p className="text-red-400 font-bold mb-1 uppercase tracking-wider text-xs">Error</p>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* GraphQL test */}
        <div className="mt-8 border-t border-[#2A2D34] pt-6">
          <p className="text-[#555] text-xs text-center mb-3 uppercase tracking-wider">Herramientas</p>
          <GraphQLTester />
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-[#14C6C9] text-xs hover:underline">← Volver al sitio</Link>
        </div>
      </div>
    </div>
  );
}

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
      // Show only the type/keys of result to avoid dumping huge base64
      const result = data?.data?.generateProductsExcel;
      if (result === null || result === undefined) {
        setRaw("Respuesta: null / undefined\n\n" + JSON.stringify(data, null, 2).slice(0, 500));
      } else if (typeof result === "string") {
        setRaw(`Tipo: string\nLongitud: ${result.length} chars\nInicio: ${result.slice(0, 80)}...`);
      } else {
        setRaw(`Tipo: object\nClaves: ${Object.keys(result).join(", ")}\n\n${JSON.stringify(result, null, 2).slice(0, 400)}`);
      }
    } catch (e) {
      setRaw("Error: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={testGraphQL}
        disabled={loading}
        className="w-full border border-[#333] hover:border-[#14C6C9] text-[#888] hover:text-[#14C6C9] text-xs py-2 rounded-lg transition-colors uppercase tracking-wider disabled:opacity-40"
      >
        {loading ? "Probando GraphQL..." : "Probar endpoint GraphQL"}
      </button>
      {raw && (
        <pre className="mt-3 bg-[#111] text-[#AAA] text-[10px] p-3 rounded-lg overflow-auto max-h-40 whitespace-pre-wrap break-all">
          {raw}
        </pre>
      )}
    </div>
  );
}
