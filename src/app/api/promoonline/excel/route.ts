import { NextResponse } from "next/server";
import { authedRequest } from "@/lib/promoonlineAuth";

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

export async function POST() {
  try {
    const res = await authedRequest<ExcelData>(EXCEL_QUERY);

    if (res.errors?.length) {
      const msg = res.errors[0].message;
      console.error("[api/excel] GraphQL error:", msg);
      const code =
        msg.toLowerCase().includes("no authentication token") ||
        msg.toLowerCase().includes("token expired") ||
        msg.toLowerCase().includes("unauthenticated")
          ? "TOKEN_INVALID"
          : "GRAPHQL_ERROR";
      return NextResponse.json(
        {
          ok: false,
          error: code,
          message:
            code === "TOKEN_INVALID"
              ? "Token inválido o expirado."
              : `Error GraphQL: ${msg}`,
        },
        { status: 400 }
      );
    }

    const payload = res.data?.generateProductsExcel;
    if (!payload?.file) {
      return NextResponse.json(
        {
          ok: false,
          error: "NO_FILE",
          message: "La API respondió pero no devolvió un archivo.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      file: payload.file,
      message: payload.message ?? "Excel generado correctamente.",
    });
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    const code = e.code ?? "UNKNOWN_ERROR";
    console.error("[api/excel] error:", code, e.message);

    const userMessage =
      code === "CREDENTIALS_MISSING"
        ? "Faltan las credenciales (PROMO_EMAIL / PROMO_PASSWORD)."
        : code === "CREDENTIALS_INVALID"
        ? "Credenciales inválidas."
        : code === "NETWORK_ERROR"
        ? "No se pudo conectar al endpoint GraphQL (network/TLS/DNS)."
        : `Error interno: ${e.message ?? code}`;

    return NextResponse.json({ ok: false, error: code, message: userMessage }, { status: 500 });
  }
}
