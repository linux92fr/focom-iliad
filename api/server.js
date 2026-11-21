import { createServer } from 'node:http';
import { neon } from '@neondatabase/serverless';

const port = Number.parseInt(process.env.PORT ?? '3001', 10);
const databaseUrl = process.env.DATABASE_URL;
const allowedOrigin = process.env.CORS_ORIGIN;

const sendJson = (response, statusCode, payload, origin) => {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    ...(origin ? { 'access-control-allow-origin': origin, vary: 'Origin' } : {}),
  });
  response.end(JSON.stringify(payload));
};

const server = createServer(async (request, response) => {
  const origin = request.headers.origin;
  const corsOrigin = allowedOrigin && origin === allowedOrigin ? origin : undefined;

  if (request.method === 'OPTIONS') {
    if (origin && !corsOrigin) {
      sendJson(response, 403, { error: 'Origin not allowed' });
      return;
    }

    response.writeHead(204, {
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'access-control-max-age': '600',
      ...(corsOrigin ? { 'access-control-allow-origin': corsOrigin, vary: 'Origin' } : {}),
    });
    response.end();
    return;
  }

  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

  if (url.pathname === '/public/contact' && request.method === 'POST') {
    if (!databaseUrl) {
      sendJson(response, 503, { error: 'Base de données non configurée' }, corsOrigin);
      return;
    }
    let input;
    try {
      const chunks = [];
      let size = 0;
      for await (const chunk of request) {
        size += chunk.length;
        if (size > 64 * 1024) throw new Error('Payload too large');
        chunks.push(chunk);
      }
      input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      sendJson(response, 400, { error: 'Corps JSON invalide' }, corsOrigin);
      return;
    }
    if (typeof input.website === 'string' && input.website.trim()) {
      sendJson(response, 200, { ok: true }, corsOrigin);
      return;
    }
    const name = typeof input.name === 'string' ? input.name.trim().slice(0, 100) : '';
    const email = typeof input.email === 'string' ? input.email.trim().slice(0, 254) : '';
    const company = typeof input.company === 'string' ? input.company.trim().slice(0, 120) : '';
    const establishment = typeof input.establishment === 'string' ? input.establishment.trim().slice(0, 120) : '';
    const subject = typeof input.subject === 'string' ? input.subject.trim().slice(0, 40) : '';
    const message = typeof input.message === 'string' ? input.message.trim().slice(0, 3000) : '';
    const consent = input.consent === true;
    const subjects = ['rights', 'representation', 'campaign', 'membership', 'other'];
    if (!name || !email || !subjects.includes(subject) || message.length < 20 || !consent) {
      sendJson(response, 400, { error: 'Veuillez compléter tous les champs requis et accepter l’utilisation de vos données.' }, corsOrigin);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      sendJson(response, 400, { error: 'Veuillez saisir une adresse e-mail valide.' }, corsOrigin);
      return;
    }
    try {
      const sql = neon(databaseUrl);
      await sql`
        INSERT INTO contact_messages
          (name, email, company, establishment, subject, message, consent_given)
        VALUES (${name}, ${email}, ${company || null}, ${establishment || null}, ${subject}, ${message}, TRUE)
      `;
      sendJson(response, 201, { ok: true }, corsOrigin);
    } catch {
      sendJson(response, 503, { error: 'Votre demande n’a pas pu être enregistrée. Réessayez plus tard.' }, corsOrigin);
    }
    return;
  }

  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method not allowed' }, corsOrigin);
    return;
  }

  if (url.pathname === '/health') {
    sendJson(response, 200, { status: 'ok', service: 'focom-iliad-api' }, corsOrigin);
    return;
  }

  if (url.pathname === '/health/db') {
    if (!databaseUrl) {
      sendJson(response, 503, { status: 'unavailable', database: 'not_configured' }, corsOrigin);
      return;
    }

    try {
      const sql = neon(databaseUrl);
      await sql`SELECT 1 AS connected`;
      sendJson(response, 200, { status: 'ok', database: 'connected' }, corsOrigin);
    } catch {
      // Do not expose database URLs, credentials, or provider error details.
      sendJson(response, 503, { status: 'error', database: 'unavailable' }, corsOrigin);
    }
    return;
  }

  sendJson(response, 404, { error: 'Not found' }, corsOrigin);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`FOCOM ILIAD API listening on port ${port}`);
});

const shutdown = () => {
  server.close(() => process.exit(0));
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
