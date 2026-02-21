/**
 * Server-side only. Token cache with auto-renewal.
 * Token lifetime: 24h — we renew proactively after 23h.
 */

import { graphqlRequest } from "./promoonlineClient";

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      message
      accessToken
    }
  }
`;

interface TokenCache {
  accessToken: string;
  obtainedAt: number;
}

// Module-level cache (server singleton)
let cache: TokenCache | null = null;
const TOKEN_TTL_MS = 23 * 60 * 60 * 1000; // 23 hours

/** Perform login and store token in memory. Never returns raw credentials. */
async function login(): Promise<string> {
  const email = process.env.PROMO_EMAIL;
  const password = process.env.PROMO_PASSWORD;

  if (!email || !password) {
    throw Object.assign(new Error("CREDENTIALS_MISSING"), { code: "CREDENTIALS_MISSING" });
  }

  console.log("[promoonlineAuth] logging in (credentials withheld from log)");

  const res = await graphqlRequest<{ login: { message: string; accessToken: string } }>(
    LOGIN_MUTATION,
    { email, password },
    undefined, // no token on login
    "LOGIN"
  );

  if (res.errors?.length) {
    const msg = res.errors[0].message;
    console.error(`[promoonlineAuth] login error: ${msg}`);
    const code =
      msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("credentials")
        ? "CREDENTIALS_INVALID"
        : "LOGIN_FAILED";
    throw Object.assign(new Error(msg), { code });
  }

  const token = res.data?.login?.accessToken;
  if (!token) {
    throw Object.assign(new Error("LOGIN_FAILED: no accessToken in response"), { code: "LOGIN_FAILED" });
  }

  cache = { accessToken: token, obtainedAt: Date.now() };
  console.log("[promoonlineAuth] login ok — token cached");
  return token;
}

function isCacheValid(): boolean {
  if (!cache) return false;
  return Date.now() - cache.obtainedAt < TOKEN_TTL_MS;
}

/** Returns a valid access token, logging in/renewing as needed. */
export async function getAccessToken(): Promise<string> {
  if (isCacheValid()) {
    return cache!.accessToken;
  }
  return login();
}

/** Invalidate cache (call when a request returns auth error). */
export function invalidateToken(): void {
  cache = null;
  console.log("[promoonlineAuth] token cache invalidated");
}

/**
 * Run a GraphQL request with automatic token management.
 * On auth errors, invalidates cache and retries once.
 */
export async function authedRequest<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<import("./promoonlineClient").GQLResponse<T>> {
  const token = await getAccessToken();
  const res = await graphqlRequest<T>(query, variables, token);

  // Check for auth errors in GraphQL errors array
  const authError = res.errors?.find(
    (e) =>
      e.message.toLowerCase().includes("no authentication token") ||
      e.message.toLowerCase().includes("token expired") ||
      e.message.toLowerCase().includes("invalid token") ||
      e.message.toLowerCase().includes("unauthenticated")
  );

  if (authError) {
    console.warn("[promoonlineAuth] auth error detected, renewing token and retrying...");
    invalidateToken();
    const freshToken = await getAccessToken();
    return graphqlRequest<T>(query, variables, freshToken);
  }

  return res;
}
