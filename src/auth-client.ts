import { createAuthClient } from '@neondatabase/auth';
import { BetterAuthReactAdapter } from '@neondatabase/auth/react/adapters';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim();

export const authClient = authUrl
  ? createAuthClient(authUrl, {
      adapter: BetterAuthReactAdapter(),
    })
  : null;

export const isAuthConfigured = Boolean(authUrl);

/**
 * Get the short-lived Neon Managed Auth JWT.
 * Prefer the SDK method, then use the documented /token endpoint as a
 * compatibility fallback when the installed beta adapter returns no token.
 */
export async function getNeonAccessToken(): Promise<string | null> {
  if (!authUrl || !authClient) return null;

  try {
    const result = await authClient.token();
    const token = result.data?.token;
    if (typeof token === 'string' && token.length > 0) return token;
  } catch {
    // Fall through to the Managed Auth token endpoint.
  }

  const baseUrl = authUrl.endsWith('/') ? authUrl.slice(0, -1) : authUrl;
  const response = await fetch(`${baseUrl}/token`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return null;

  const payload: unknown = await response.json().catch(() => null);
  if (!payload || typeof payload !== 'object') return null;
  const body = payload as { token?: unknown; data?: { token?: unknown } };
  if (typeof body.data?.token === 'string' && body.data.token.length > 0) return body.data.token;
  if (typeof body.token === 'string' && body.token.length > 0) return body.token;
  return null;
}
