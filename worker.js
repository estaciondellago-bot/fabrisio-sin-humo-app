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
 * Bindings requeridos (Cloudflare → Worker → Settings → Bindings):
 *   RATE_LIMITER         → Rate Limiter binding. Variable name: RATE_LIMITER
 *                          Namespace ID: 1001 (cualquier número único)
 *                          Limit: 30 requests / 60 seconds
 *
 * Endpoint expuesto: POST /
 *   Headers: Content-Type: application/json, X-Access-Password: <password>
 *   Body:    { model, max_tokens, system, messages } (formato Anthropic Messages API)
 */

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

    // Validar password
    const password = request.headers.get('X-Access-Password');
    if (!password || password !== env.ACCESS_PASSWORD) {
      return jsonError('Acceso no autorizado. Verificá tu contraseña.', 401, corsHeaders);
    }

    // Rate limit por IP (30 req/min). El binding RATE_LIMITER se configura en el dashboard.
    // Si el binding no existe (ej. en testing local), se saltea sin error.
    if (env.RATE_LIMITER) {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const { success } = await env.RATE_LIMITER.limit({ key: ip });
      if (!success) {
        return jsonError(
          'Demasiadas consultas en poco tiempo. Esperá un minuto y reintentá.',
          429,
          corsHeaders
        );
      }
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
