/**
 * Server-side only. Never import from client components.
 * Reusable GraphQL request helper for promocionalesenlinea.net
 */

const ENDPOINT =
  process.env.PROMO_GRAPHQL_ENDPOINT ??
  "https://www.promocionalesenlinea.net/graphql";

export interface GQLResponse<T = unknown> {
  data?: T;
  errors?: { message: string; [k: string]: unknown }[];
}

export interface RichError {
  code: string;
  name: string;
  message: string;
  cause?: string;
  step: "LOGIN" | "GRAPHQL_CALL" | "DOWNLOAD_FILE";
  endpoint?: string;
  responseStatus?: number;
  responseContentType?: string;
  responseBodySnippet?: string;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  timeoutMs = 20_000,
  retries = 2,
  backoffs = [500, 1500]
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
        redirect: "follow",
        cache: "no-store",
      });
      clearTimeout(tid);
      return res;
    } catch (err) {
      clearTimeout(tid);
      lastErr = err;
      const e = err as NodeJS.ErrnoException;
      console.warn(
        `[promoonlineClient] fetch attempt ${attempt + 1}/${retries + 1} failed — ` +
          `code=${e.code} name=${e.name} msg=${e.message}`
      );
      if (attempt < retries) {
        await sleep(backoffs[attempt] ?? 1500);
      }
    }
  }
  throw lastErr;
}

export async function graphqlRequest<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {},
  token?: string,
  step: RichError["step"] = "GRAPHQL_CALL"
): Promise<GQLResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetchWithRetry(
      ENDPOINT,
      { method: "POST", headers, body: JSON.stringify({ query, variables }) },
      20_000,
      2,
      [500, 1500]
    );
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException & { cause?: unknown };
    const rich: RichError = {
      code: e.code ?? e.name ?? "NETWORK_ERROR",
      name: e.name ?? "Error",
      message: e.message ?? "Unknown network error",
      cause: e.cause != null ? String(e.cause) : undefined,
      step,
      endpoint: ENDPOINT,
    };
    console.error("[promoonlineClient] fetch failed", JSON.stringify(rich));
    throw Object.assign(new Error(rich.message), rich);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    let bodySnippet = "";
    try {
      const text = await res.text();
      bodySnippet = text.slice(0, 300);
    } catch {
      bodySnippet = "(could not read body)";
    }
    const rich: RichError = {
      code: res.status === 401 || res.status === 403 ? "TOKEN_INVALID" : "BAD_RESPONSE",
      name: "BadResponseError",
      message: `Non-JSON response from server`,
      step,
      endpoint: ENDPOINT,
      responseStatus: res.status,
      responseContentType: contentType,
      responseBodySnippet: bodySnippet,
    };
    console.error("[promoonlineClient] non-JSON response", JSON.stringify(rich));
    throw Object.assign(new Error(rich.message), rich);
  }

  const json = (await res.json()) as GQLResponse<T>;
  console.log(`[promoonlineClient] status=${res.status} errors=${json.errors?.length ?? 0}`);
  return json;
}
