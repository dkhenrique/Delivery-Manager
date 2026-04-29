import { cookies } from "next/headers";

export interface AuthUser {
  sub: string;
  email: string;
  role: "ADMIN" | "RESIDENT";
  status: "PENDING" | "APPROVED" | "REJECTED";
  iat: number;
  exp: number;
}

/**
 * Reads the JWT cookie and decodes its payload for display purposes in Server Components.
 * NOTE: This does NOT verify the signature — route protection is handled by middleware.ts.
 * Only use this for non-security-critical UI decisions (e.g. showing/hiding nav links).
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("jwt")?.value;

    if (!token) return null;

    // JWT structure: header.payload.signature — we only need the payload
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // Base64url → Base64 → JSON
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(base64, "base64").toString("utf8");

    return JSON.parse(decoded) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Returns just the raw JWT string from the cookie, for use in Authorization headers.
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("jwt")?.value ?? null;
  } catch {
    return null;
  }
}
