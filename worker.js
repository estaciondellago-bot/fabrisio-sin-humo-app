/**
 * Fabrisio sin Humo — Cloudflare Worker proxy
 * ===========================================
 * Proxy entre el cliente (Vercel) y la API de Anthropic.
 *
 * Variables de entorno (Cloudflare → Worker → Settings → Variables and Secrets):
 *   ANTHROPIC_API_KEY    → Tu key sk-ant-... (Secret)
 *   ACCESS_PASSWORD      → La contraseña que ingresan los clientes (Secret)
 *   ALLOWED_ORIGINS      → Lista separada por comas de orígenes permitidos. Plain Text.
 *                          Ej: "https://fabrisiosinhumo.com,https://www.fabrisiosinhumo.com,https://fabrisio-sin-humo-app.vercel.app"
 *
 * Rate limit: 30 requests/min por IP, implementado con caches.default del edge.
 *             Per-colo (eventual consistency entre data centers) pero suficiente para
 *             prevenir abuso de la API key después de un eventual leak de password.
 *
 * Endpoint expuesto: POST /
 *   Headers: Content-Type: application/json, X-Access-Password: <password>
 *   Body:    { model, max_tokens, system, messages } (formato Anthropic Messages API)
 */

const RATE_LIMIT_MAX = 30;       // requests
const RATE_LIMIT_WINDOW = 60;    // segundos

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

function getCorsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  // Si el origin del request está en la lista, lo permitimos. Si no, devolvemos '' (browser bloquea).
  const allowOrigin = allowed.includes(origin) ? origin : '';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, X-Access-Password',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

function jsonError(message, status, corsHeaders) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request, env);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return jsonError('Método no permitido. Usá POST.', 405, corsHeaders);
    }

    // Rate limit por IP usando caches.default. Va ANTES de validar password para que
    // un atacante no pueda hammear con passwords inválidas. Per-colo (eventual consistency).
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const window = Math.floor(Date.now() / (RATE_LIMIT_WINDOW * 1000));
    const cacheKey = new Request(`https://rl.local/${encodeURIComponent(ip)}/${window}`);
    const cached = await caches.default.match(cacheKey);
    let count = 1;
    if (cached) {
      count = parseInt(await cached.text(), 10) + 1;
      if (count > RATE_LIMIT_MAX) {
        return jsonError(
          'Demasiadas consultas en poco tiempo. Esperá un minuto y reintentá.',
          429,
          corsHeaders
        );
      }
    }
    await caches.default.put(
      cacheKey,
      new Response(String(count), { headers: { 'Cache-Control': `public, max-age=${RATE_LIMIT_WINDOW}` } })
    );

    // Validar password
    const password = request.headers.get('X-Access-Password');
    if (!password || password !== env.ACCESS_PASSWORD) {
      // DEBUG TEMPORAL: revela longitudes y existencia, NO la password real
      const debug = `recvLen=${password ? password.length : 0} expLen=${env.ACCESS_PASSWORD ? env.ACCESS_PASSWORD.length : 0} envExists=${!!env.ACCESS_PASSWORD} headerExists=${!!password}`;
      return new Response(
        JSON.stringify({ error: 'Acceso no autorizado. Verificá tu contraseña.', debug }),
        { status: 401, headers: { 'Content-Type': 'application/json', 'X-Debug-Auth': debug, ...corsHeaders } }
      );
    }

    // Leer body
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonError('Body inválido. Esperaba JSON.', 400, corsHeaders);
    }

    // Forward a Anthropic
    let upstream;
    try {
      upstream = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      return jsonError(`Error al contactar Anthropic: ${err.message}`, 502, corsHeaders);
    }

    // Pasar respuesta tal cual + headers CORS
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
        ...corsHeaders,
      },
    });
  },
};
