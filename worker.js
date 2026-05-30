/**
 * Fabrisio sin Humo — Cloudflare Worker proxy
 * ===========================================
 * Proxy entre el cliente (Vercel) y la API de Anthropic + endpoint para fetch de sitios.
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
 * Endpoints expuestos:
 *   POST /              → Proxy a Anthropic. Body: { model, max_tokens, system, messages }
 *   POST /fetch-site    → Fetch + extracción estructurada de un sitio web.
 *                         Body: { url }
 *                         Returns: { ok, blocked, title, description, ogTitle, ogType, headings, bodyText, schemas }
 */

const RATE_LIMIT_MAX = 30;       // requests
const RATE_LIMIT_WINDOW = 60;    // segundos

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

const SITE_FETCH_TIMEOUT_MS = 15000;
const SITE_FETCH_MAX_BYTES = 3_000_000; // 3MB cap
const SITE_BODY_MAX_CHARS = 10000;       // texto plano cap
const SITE_HEADINGS_MAX_CHARS = 2000;
const SITE_SCHEMAS_MAX_CHARS = 3000;

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

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

function jsonOk(data, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// Detecta páginas típicas de anti-bot / challenge / acceso denegado
function isBlockedPage(html) {
  if (!html) return true;
  const lower = html.toLowerCase().slice(0, 5000);
  const hits = [
    'just a moment',
    'checking your browser',
    'vercel security checkpoint',
    'attention required | cloudflare',
    'cf-browser-verification',
    'access denied',
    'captcha',
    'are you human',
    '__cf_chl_jschl_tk__',
  ];
  return hits.some(p => lower.includes(p)) ||
    (html.length < 600 && (lower.includes('blocked') || lower.includes('forbidden')));
}

// Extrae contenido estructurado de un HTML
function extractContent(html) {
  const m = (re) => {
    const x = html.match(re);
    return x ? (x[1] || '').trim() : '';
  };

  const title = m(/<title[^>]*>([^<]+)<\/title>/i);
  const description = m(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
    || m(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
  const ogTitle = m(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)
    || m(/<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i);
  const ogDescription = m(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)
    || m(/<meta\s+content=["']([^"']+)["']\s+property=["']og:description["']/i);
  const ogType = m(/<meta\s+property=["']og:type["']\s+content=["']([^"']+)["']/i);
  const ogSiteName = m(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i);

  // Schema.org JSON-LD (puede haber varios — los concatenamos)
  let schemas = '';
  const ldRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let ldMatch;
  while ((ldMatch = ldRegex.exec(html)) !== null) {
    schemas += ldMatch[1].trim() + '\n';
    if (schemas.length > SITE_SCHEMAS_MAX_CHARS) break;
  }
  schemas = schemas.slice(0, SITE_SCHEMAS_MAX_CHARS).trim();

  // Headings h1-h3 (orden de aparición)
  const headings = [];
  const hRegex = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
  let hMatch;
  while ((hMatch = hRegex.exec(html)) !== null) {
    const clean = hMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (clean && clean.length < 200) headings.push(clean);
    if (headings.length >= 40) break;
  }
  const headingsText = headings.join('\n').slice(0, SITE_HEADINGS_MAX_CHARS);

  // Body text limpio (sin scripts/styles/svg/comments)
  const cleanBody = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  const bodyText = cleanBody.slice(0, SITE_BODY_MAX_CHARS);

  return { title, description, ogTitle, ogDescription, ogType, ogSiteName, schemas, headings: headingsText, bodyText };
}

// Handler para POST /fetch-site
async function handleFetchSite(request, env, corsHeaders) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('Body inválido. Esperaba JSON con { url }.', 400, corsHeaders);
  }
  let rawUrl = (body.url || '').toString().trim();
  if (!rawUrl) return jsonError('Falta el parámetro url.', 400, corsHeaders);
  if (!/^https?:\/\//i.test(rawUrl)) rawUrl = 'https://' + rawUrl;

  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return jsonError('URL inválida.', 400, corsHeaders);
  }
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return jsonError('Solo HTTP/HTTPS.', 400, corsHeaders);
  }
  // Bloquear IPs privadas (defensa básica contra SSRF)
  const host = parsedUrl.hostname;
  if (/^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|::1|\[::1\])/i.test(host)) {
    return jsonError('No se permiten URLs privadas.', 400, corsHeaders);
  }

  let res;
  try {
    res = await fetch(parsedUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': BROWSER_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(SITE_FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    return jsonError(`No pude acceder al sitio: ${err.message || err}`, 502, corsHeaders);
  }

  if (!res.ok) {
    return jsonError(`El sitio respondió HTTP ${res.status}. URL final: ${res.url}`, 502, corsHeaders);
  }

  const contentType = res.headers.get('Content-Type') || '';
  if (!/text\/html|application\/xhtml/i.test(contentType)) {
    return jsonError(`El sitio no devolvió HTML (Content-Type: ${contentType}).`, 400, corsHeaders);
  }

  // Lectura con cap de bytes
  const reader = res.body.getReader();
  const chunks = [];
  let received = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.length;
      if (received > SITE_FETCH_MAX_BYTES) {
        reader.cancel();
        break;
      }
      chunks.push(value);
    }
  } catch (err) {
    return jsonError(`Error leyendo el sitio: ${err.message || err}`, 502, corsHeaders);
  }
  const html = new TextDecoder('utf-8', { fatal: false }).decode(
    new Uint8Array(chunks.reduce((acc, c) => acc.concat(Array.from(c)), []))
  );

  if (!html || html.length < 100) {
    return jsonError('El sitio devolvió contenido vacío o muy corto.', 400, corsHeaders);
  }

  const blocked = isBlockedPage(html);
  const extract = extractContent(html);

  return jsonOk({
    ok: true,
    blocked,
    finalUrl: res.url,
    ...extract,
  }, corsHeaders);
}

// Handler para POST / → proxy a Anthropic
async function handleAnthropicProxy(request, env, corsHeaders) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('Body inválido. Esperaba JSON.', 400, corsHeaders);
  }

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

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      ...corsHeaders,
    },
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

    // Rate limit por IP usando caches.default. Va ANTES de validar password.
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
      return jsonError('Acceso no autorizado. Verificá tu contraseña.', 401, corsHeaders);
    }

    // Routing
    const url = new URL(request.url);
    if (url.pathname === '/fetch-site') {
      return handleFetchSite(request, env, corsHeaders);
    }
    return handleAnthropicProxy(request, env, corsHeaders);
  },
};
