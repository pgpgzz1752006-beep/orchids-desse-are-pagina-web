import { NextResponse } from "next/server";
import { authedRequest } from "@/lib/promoonlineAuth";
import type { RichError } from "@/lib/promoonlineClient";

export const runtime = "nodejs";

const EXCEL_QUERY = `
  query GenerateProductsExcel {
    generateProductsExcel {
      file
      message
    }
  }
`;

interface ExcelData {
  generateProductsExcel: {
    file: string;
    message: string;
  };
}

function serializeError(err: unknown): RichError {
  const e = err as Partial<RichError> & { name?: string; message?: string; cause?: unknown };
  return {
    code: e.code ?? "UNKNOWN_ERROR",
    name: e.name ?? "Error",
    message: e.message ?? "Unknown error",
    cause: e.cause != null ? String(e.cause) : undefined,
    step: (e.step as RichError["step"]) ?? "GRAPHQL_CALL",
    endpoint: e.endpoint,
    responseStatus: e.responseStatus,
    responseContentType: e.responseContentType,
    responseBodySnippet: e.responseBodySnippet,
  };
}

export async function POST() {
  // ── STEP: GRAPHQL_CALL ──────────────────────────────────────────────────────
  let payload: { file: string; message: string };
  try {
    const res = await authedRequest<ExcelData>(EXCEL_QUERY);

    if (res.errors?.length) {
      const msg = res.errors[0].message;
      console.error("[api/excel] GraphQL errors:", JSON.stringify(res.errors));
      const isAuth =
        msg.toLowerCase().includes("no authentication token") ||
        msg.toLowerCase().includes("token expired") ||
        msg.toLowerCase().includes("unauthenticated") ||
        msg.toLowerCase().includes("invalid token");
      const code = isAuth ? "TOKEN_INVALID" : "GRAPHQL_ERROR";
      return NextResponse.json(
        {
          ok: false,
          error: code,
          step: "GRAPHQL_CALL",
          message: isAuth ? "Token inválido o expirado." : `Error GraphQL: ${msg}`,
          detail: { code, step: "GRAPHQL_CALL", message: msg },
        },
        { status: 400 }
      );
    }

    const data = res.data?.generateProductsExcel;
    if (!data?.file) {
      return NextResponse.json(
        {
          ok: false,
          error: "NO_FILE",
          step: "GRAPHQL_CALL",
          message: "La API respondió pero no devolvió un archivo.",
          detail: { code: "NO_FILE", step: "GRAPHQL_CALL", message: "generateProductsExcel.file is empty" },
        },
        { status: 502 }
      );
    }

    payload = data;
  } catch (err: unknown) {
    const rich = serializeError(err);
    console.error("[api/excel] GRAPHQL_CALL failed", JSON.stringify(rich));
    const userMessage =
      rich.code === "CREDENTIALS_MISSING"
        ? "Faltan las credenciales (PROMO_EMAIL / PROMO_PASSWORD)."
        : rich.code === "CREDENTIALS_INVALID"
        ? "Credenciales inválidas."
        : rich.code === "TOKEN_INVALID"
        ? "Token inválido o expirado."
        : rich.responseBodySnippet
        ? `Respuesta inesperada del servidor (${rich.responseStatus}): ${rich.responseBodySnippet.slice(0, 120)}`
        : `Falló en: ${rich.step} — ${rich.code} — ${rich.message}`;

    return NextResponse.json(
      {
        ok: false,
        error: rich.code,
        step: rich.step,
        message: userMessage,
        detail: rich,
      },
      { status: 500 }
    );
  }

  // ── STEP: DOWNLOAD_FILE (probe only — HEAD to check reachability) ──────────
  const fileUrl = payload.file;
  let downloadProbe: {
    status?: number;
    contentType?: string;
    ok: boolean;
    error?: string;
  } = { ok: true };

  if (fileUrl) {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 10_000);
      const headRes = await fetch(fileUrl, {
        method: "HEAD",
        signal: controller.signal,
        redirect: "follow",
        cache: "no-store",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        },
      });
      clearTimeout(tid);
      downloadProbe = {
        ok: headRes.ok,
        status: headRes.status,
        contentType: headRes.headers.get("content-type") ?? undefined,
      };
      console.log(`[api/excel] DOWNLOAD_FILE HEAD probe — url=${fileUrl} status=${headRes.status}`);
    } catch (err: unknown) {
      const e = err as NodeJS.ErrnoException & { cause?: unknown };
      const errCode = e.code ?? e.name ?? "NETWORK_ERROR";
      console.warn(`[api/excel] DOWNLOAD_FILE HEAD probe failed — url=${fileUrl} code=${errCode} msg=${e.message}`);
      downloadProbe = {
        ok: false,
        error: `${errCode}: ${e.message}`,
      };
    }
  }

  return NextResponse.json({
    ok: true,
    file: fileUrl,
    message: payload.message ?? "Excel generado correctamente.",
    downloadProbe,
  });
}
