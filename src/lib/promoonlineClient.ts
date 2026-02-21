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

export async function graphqlRequest<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {},
  token?: string
): Promise<GQLResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "Mozilla/5.0",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException;
    const code = e.code ?? e.name ?? "NETWORK_ERROR";
    console.error(`[promoonlineClient] fetch failed — code=${code} cause=${String((e as { cause?: unknown }).cause)}`);
    throw Object.assign(new Error("NETWORK_ERROR"), { code });
  } finally {
    clearTimeout(timeout);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    console.error(
      `[promoonlineClient] non-JSON response status=${res.status} body(500)=${text.slice(0, 500)}`
    );
    throw Object.assign(
      new Error(`Non-JSON response (status ${res.status}): ${text.slice(0, 300)}`),
      { code: res.status === 401 || res.status === 403 ? "TOKEN_INVALID" : "BAD_RESPONSE", status: res.status }
    );
  }

  const json = (await res.json()) as GQLResponse<T>;
  console.log(`[promoonlineClient] status=${res.status} errors=${json.errors?.length ?? 0}`);
  return json;
}
