import { neon } from "@neondatabase/serverless";

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
          "access-control-allow-headers": "content-type",
          "access-control-max-age": "600",
        },
      });
    }

    const url = new URL(request.url);

    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405, corsHeaders);
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
