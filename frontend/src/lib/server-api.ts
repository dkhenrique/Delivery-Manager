import { getAuthToken } from "@/lib/auth";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

/**
 * Authenticated server-side fetch helper for use in Server Components and Server Actions.
 * Reads the JWT from the httpOnly cookie and attaches it as a Bearer token.
 */
export async function serverFetch<T = unknown>(path: string): Promise<T> {
  const token = await getAuthToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    // Never cache authenticated responses
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `API request failed: ${res.status} ${res.statusText}${body ? ` — ${body}` : ""}`,
    );
  }

  return res.json() as Promise<T>;
}
