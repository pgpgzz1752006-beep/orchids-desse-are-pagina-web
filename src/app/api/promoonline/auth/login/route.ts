import { NextResponse } from "next/server";
import { getAccessToken, invalidateToken } from "@/lib/promoonlineAuth";

export const runtime = "nodejs";

export async function POST() {
  // Force fresh login by invalidating existing cache
  invalidateToken();

  try {
    await getAccessToken();
    return NextResponse.json({ ok: true, message: "Login correcto." });
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    console.error("[api/auth/login] failed:", e.code, e.message);

    const code = e.code ?? "LOGIN_FAILED";
    const userMessage =
      code === "CREDENTIALS_MISSING"
        ? "Faltan las credenciales. Configura PROMO_EMAIL y PROMO_PASSWORD en las variables de entorno."
        : code === "CREDENTIALS_INVALID"
        ? "Credenciales inválidas. Verifica email y contraseña."
        : code === "NETWORK_ERROR"
        ? "No se pudo conectar al endpoint GraphQL (network/TLS/DNS)."
        : `Error de login: ${e.message ?? code}`;

    return NextResponse.json({ ok: false, error: code, message: userMessage }, { status: 401 });
  }
}
