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
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'access-control-max-age': '600',
      ...(corsOrigin ? { 'access-control-allow-origin': corsOrigin, vary: 'Origin' } : {}),
    });
    response.end();
    return;
  }

  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

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
