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

async function requireAdmin(request, env) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return { response: json({ error: "Authentification requise" }, 401) };
  }
  if (!env.NEON_AUTH_BASE_URL || !env.DATABASE_URL) {
    return { response: json({ error: "Configuration serveur incomplète" }, 503) };
  }
  let payload;
  try {
    const issuer = new URL(env.NEON_AUTH_BASE_URL).origin;
    ({ payload } = await jwtVerify(authorization.slice(7), getJwks(env), { issuer }));
  } catch {
    return { response: json({ error: "Jeton non valide", stage: "jwt_verification" }, 401) };
  }
  if (typeof payload.sub !== "string" || !payload.sub) {
    return { response: json({ error: "Identifiant utilisateur absent du jeton" }, 401) };
  }
  try {
    const sql = neon(env.DATABASE_URL);
    const rows = await sql`
      SELECT id, display_name, global_role, is_active
      FROM editorial_profiles WHERE auth_user_id = ${payload.sub} LIMIT 1
    `;
    const profile = rows[0];
    if (!profile || !profile.is_active || profile.global_role !== "admin") {
      return { response: json({ error: "Accès administrateur refusé" }, 403) };
    }
    return { sql, profile };
  } catch {
    return { response: json({ error: "Vérification du profil indisponible" }, 503) };
  }
}

function slugify(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
}

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
      return new Response(null, { status: 204, headers: {
        ...corsHeaders,
        "access-control-allow-methods": "GET, POST, PUT, OPTIONS",
        "access-control-allow-headers": "authorization, content-type",
        "access-control-max-age": "600",
      }});
    }

    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") {
      return json({ status: "ok", service: "focom-iliad-api" }, 200, corsHeaders);
    }
    if (url.pathname === "/health/db" && request.method === "GET") {
      if (!env.DATABASE_URL) return json({ status: "unavailable", database: "not_configured" }, 503, corsHeaders);
      try {
        await neon(env.DATABASE_URL)`SELECT 1 AS connected`;
        return json({ status: "ok", database: "connected" }, 200, corsHeaders);
      } catch {
        return json({ status: "error", database: "unavailable" }, 503, corsHeaders);
      }
    }

    // Public editorial API: only published, public articles are exposed.
    if (url.pathname === "/public/articles" && request.method === "GET") {
      try {
        const rows = await neon(env.DATABASE_URL)`
          SELECT id, title, slug, summary, cover_image_url, cover_image_alt, published_at
          FROM articles
          WHERE status = 'published' AND visibility = 'public' AND published_at <= NOW()
          ORDER BY published_at DESC
          LIMIT 50
        `;
        return json({ articles: rows }, 200, { ...corsHeaders, "access-control-allow-origin": allowedOrigin || "*" });
      } catch {
        return json({ error: "Impossible de charger les actualités" }, 503, corsHeaders);
      }
    }
    const publicArticleMatch = url.pathname.match(/^\\/public\\/articles\\/([^/]+)$/);
    if (publicArticleMatch && request.method === "GET") {
      try {
        const slug = decodeURIComponent(publicArticleMatch[1]);
        const rows = await neon(env.DATABASE_URL)`
          SELECT a.id, a.title, a.slug, a.summary, a.body, a.cover_image_url, a.cover_image_alt,
                 a.published_at, p.display_name AS author_name
          FROM articles a
          LEFT JOIN editorial_profiles p ON p.id = a.author_profile_id
          WHERE a.slug = ${slug} AND a.status = 'published'
            AND a.visibility = 'public' AND a.published_at <= NOW()
          LIMIT 1
        `;
        if (!rows.length) return json({ error: "Article introuvable" }, 404, corsHeaders);
        return json({ article: rows[0] }, 200, corsHeaders);
      } catch {
        return json({ error: "Impossible de charger cet article" }, 503, corsHeaders);
      }
    }

    if (url.pathname === "/admin/me" || url.pathname.startsWith("/admin/")) {
      const auth = await requireAdmin(request, env);
      if (auth.response) return json(await auth.response.json(), auth.response.status, corsHeaders);
      const { sql, profile } = auth;

      if (url.pathname === "/admin/me" && request.method === "GET") {
        return json({ authorized: true, profile: {
          id: profile.id, displayName: profile.display_name, role: profile.global_role
        }}, 200, corsHeaders);
      }

      if (url.pathname === "/admin/dashboard" && request.method === "GET") {
        try {
          const [articles, published, drafts, entities, profiles] = await Promise.all([
            sql`SELECT COUNT(*)::int AS count FROM articles`,
            sql`SELECT COUNT(*)::int AS count FROM articles WHERE status = 'published'`,
            sql`SELECT COUNT(*)::int AS count FROM articles WHERE status = 'draft'`,
            sql`SELECT COUNT(*)::int AS count FROM entities WHERE is_active = TRUE`,
            sql`SELECT COUNT(*)::int AS count FROM editorial_profiles WHERE is_active = TRUE`,
          ]);
          return json({ stats: {
            articles: articles[0].count, published: published[0].count,
            drafts: drafts[0].count, entities: entities[0].count, profiles: profiles[0].count
          }}, 200, corsHeaders);
        } catch {
          return json({ error: "Impossible de charger les indicateurs" }, 503, corsHeaders);
        }
      }

      if (url.pathname === "/admin/articles" && request.method === "GET") {
        try {
          const rows = await sql`
            SELECT a.id, a.title, a.slug, a.summary, a.body, a.cover_image_url, a.cover_image_alt,
                   a.status, a.visibility, a.published_at, a.updated_at, p.display_name AS author_name
            FROM articles a
            LEFT JOIN editorial_profiles p ON p.id = a.author_profile_id
            ORDER BY a.updated_at DESC LIMIT 100
          `;
          return json({ articles: rows }, 200, corsHeaders);
        } catch {
          return json({ error: "Impossible de charger les articles" }, 503, corsHeaders);
        }
      }

      if (url.pathname === "/admin/articles" && request.method === "POST") {
        let input;
        try { input = await request.json(); } catch { return json({ error: "Corps JSON invalide" }, 400, corsHeaders); }
        const title = typeof input.title === "string" ? input.title.trim().slice(0, 180) : "";
        const body = typeof input.body === "string" ? input.body : "";
        const summary = typeof input.summary === "string" ? input.summary.trim().slice(0, 500) : "";
        const coverImageUrl = typeof input.cover_image_url === "string" ? input.cover_image_url.trim().slice(0, 2048) : "";
        const coverImageAlt = typeof input.cover_image_alt === "string" ? input.cover_image_alt.trim().slice(0, 250) : "";
        if (coverImageUrl && !/^https:\/\//i.test(coverImageUrl)) return json({ error: "L’image de couverture doit utiliser une adresse HTTPS." }, 400, corsHeaders);
        const slug = slugify(typeof input.slug === "string" && input.slug.trim() ? input.slug : title);
        if (!title || !slug) return json({ error: "Le titre est obligatoire" }, 400, corsHeaders);
        try {
          const rows = await sql`
            INSERT INTO articles (title, slug, summary, body, cover_image_url, cover_image_alt, author_profile_id, status, visibility, published_at)
            VALUES (${title}, ${slug}, ${summary}, ${body}, ${coverImageUrl || null}, ${coverImageAlt || null}, ${profile.id}, 'draft', 'public', NULL)
            RETURNING id, title, slug, summary, body, cover_image_url, cover_image_alt, status, visibility, published_at, updated_at
          `;
          return json({ article: rows[0] }, 201, corsHeaders);
        } catch (error) {
          const message = String(error?.message || "");
          return json({ error: message.includes("articles_slug_key") ? "Ce lien existe déjà. Modifiez le slug." : "Création impossible. Vérifiez les informations saisies." }, 400, corsHeaders);
        }
      }

      const articleMatch = url.pathname.match(/^\/admin\/articles\/(\d+)$/);
      if (articleMatch && request.method === "PUT") {
        let input;
        try { input = await request.json(); } catch { return json({ error: "Corps JSON invalide" }, 400, corsHeaders); }
        const id = Number(articleMatch[1]);
        const title = typeof input.title === "string" ? input.title.trim().slice(0, 180) : "";
        const summary = typeof input.summary === "string" ? input.summary.trim().slice(0, 500) : "";
        const body = typeof input.body === "string" ? input.body : "";
        const coverImageUrl = typeof input.cover_image_url === "string" ? input.cover_image_url.trim().slice(0, 2048) : "";
        const coverImageAlt = typeof input.cover_image_alt === "string" ? input.cover_image_alt.trim().slice(0, 250) : "";
        if (coverImageUrl && !/^https:\/\//i.test(coverImageUrl)) return json({ error: "L’image de couverture doit utiliser une adresse HTTPS." }, 400, corsHeaders);
        const slug = slugify(typeof input.slug === "string" && input.slug.trim() ? input.slug : title);
        const status = ["draft", "review", "published", "archived"].includes(input.status) ? input.status : "draft";
        if (!title || !slug) return json({ error: "Le titre est obligatoire" }, 400, corsHeaders);
        try {
          const rows = await sql`
            UPDATE articles SET title = ${title}, slug = ${slug}, summary = ${summary}, body = ${body},
              cover_image_url = ${coverImageUrl || null}, cover_image_alt = ${coverImageAlt || null},
              status = ${status}, published_at = CASE WHEN ${status} = 'published'
                THEN COALESCE(published_at, NOW()) ELSE NULL END
            WHERE id = ${id}
            RETURNING id, title, slug, summary, body, cover_image_url, cover_image_alt, status, visibility, published_at, updated_at
          `;
          if (!rows.length) return json({ error: "Article introuvable" }, 404, corsHeaders);
          return json({ article: rows[0] }, 200, corsHeaders);
        } catch {
          return json({ error: "Enregistrement impossible. Vérifiez notamment que le slug est unique." }, 400, corsHeaders);
        }
      }
      return json({ error: "Route ou méthode inconnue" }, 404, corsHeaders);
    }

    return json({ error: "Not found" }, 404, corsHeaders);
  },
};
