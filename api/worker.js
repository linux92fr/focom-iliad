import { neon } from "@neondatabase/serverless";
import { createRemoteJWKSet, jwtVerify } from "jose";

let cachedJwks;
function getJwks(env) {
  if (!env.NEON_AUTH_JWKS_URL) throw new Error("NEON_AUTH_JWKS_URL is not configured");
  if (!cachedJwks) cachedJwks = createRemoteJWKSet(new URL(env.NEON_AUTH_JWKS_URL));
  return cachedJwks;
}

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...headers,
    },
  });

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const allowedOrigin = env.CORS_ORIGIN;
    const corsHeaders = {};

    if (origin && allowedOrigin && origin === allowedOrigin) {
      corsHeaders["access-control-allow-origin"] = allowedOrigin;
      corsHeaders["vary"] = "Origin";
    } else if (origin && allowedOrigin && origin !== allowedOrigin) {
      return json({ error: "Origin not allowed" }, 403);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...corsHeaders,
          "access-control-allow-methods": "GET, OPTIONS",
          "access-control-allow-headers": "authorization, content-type",
          "access-control-max-age": "600",
        },
      });
    }

    const url = new URL(request.url);

    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405, corsHeaders);
    }

    if (url.pathname === "/admin/me") {
      if (request.method !== "GET") return json({ error: "Method not allowed" }, 405, corsHeaders);
      const authorization = request.headers.get("authorization") || "";
      if (!authorization.toLowerCase().startsWith("bearer ")) {
        return json({ error: "Authentification requise" }, 401, corsHeaders);
      }
      if (!env.NEON_AUTH_BASE_URL || !env.DATABASE_URL) {
        return json({ error: "Configuration serveur incomplète" }, 503, corsHeaders);
      }
      let payload;
      try {
        const issuer = new URL(env.NEON_AUTH_BASE_URL).origin;
        ({ payload } = await jwtVerify(authorization.slice(7), getJwks(env), { issuer }));
      } catch {
        return json({ error: "Jeton non valide", stage: "jwt_verification" }, 401, corsHeaders);
      }
      if (typeof payload.sub !== "string" || !payload.sub) {
        return json({ error: "Identifiant utilisateur absent du jeton", stage: "jwt_subject" }, 401, corsHeaders);
      }
      try {
        const sql = neon(env.DATABASE_URL);
        const rows = await sql`
          SELECT id, display_name, global_role, is_active
          FROM editorial_profiles
          WHERE auth_user_id = ${payload.sub}
          LIMIT 1
        `;
        const profile = rows[0];
        if (!profile || !profile.is_active || profile.global_role !== "admin") {
          return json({ error: "Accès administrateur refusé", stage: "profile_or_role" }, 403, corsHeaders);
        }
        return json({ authorized: true, profile: {
          id: profile.id,
          displayName: profile.display_name,
          role: profile.global_role
        } }, 200, corsHeaders);
      } catch {
        return json({ error: "Vérification du profil indisponible", stage: "database_lookup" }, 503, corsHeaders);
      }
    }

    if (url.pathname === "/health") {
      return json({ status: "ok", service: "focom-iliad-api" }, 200, corsHeaders);
    }

    if (url.pathname === "/health/db") {
      if (!env.DATABASE_URL) {
        return json(
          { status: "unavailable", database: "not_configured" },
          503,
          corsHeaders,
        );
      }

      try {
        const sql = neon(env.DATABASE_URL);
        await sql`SELECT 1 AS connected`;
        return json({ status: "ok", database: "connected" }, 200, corsHeaders);
      } catch {
        // Never expose connection strings, credentials, or raw provider errors.
        return json(
          { status: "error", database: "unavailable" },
          503,
          corsHeaders,
        );
      }
    }

    return json({ error: "Not found" }, 404, corsHeaders);
  },
};
