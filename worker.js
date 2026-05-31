/**
 * Fabrisio sin Humo — Cloudflare Worker proxy
 * ===========================================
 * Proxy entre el cliente (Vercel) y la API de Anthropic + fetch de sitios + admin de passwords.
 *
 * Variables de entorno (Cloudflare → Worker → Settings → Variables and Secrets):
 *   ANTHROPIC_API_KEY    → Tu key sk-ant-... (Secret)
 *   ACCESS_PASSWORD      → Password compartida legacy — opcional, sigue funcionando como fallback (Secret)
 *   MASTER_PASSWORD      → Password maestra para el endpoint /admin (Secret, SOLO vos la sabés)
 *   ALLOWED_ORIGINS      → Lista CSV de orígenes permitidos. Plain Text.
 *                          Ej: "https://fabrisiosinhumo.com,https://www.fabrisiosinhumo.com,https://fabrisio-sin-humo-app.vercel.app"
 *
 * Bindings (Cloudflare → Worker → Bindings):
 *   PASSWORDS (KV namespace) → Almacena hash de cada password con metadata { name, createdAt, lastUsedAt, disabled, notes }
 *
 * Rate limit: 30 requests/min por IP, implementado con caches.default del edge.
 *             Per-colo (eventual consistency entre data centers) pero suficiente para
 *             prevenir abuso de la API key después de un eventual leak de password.
 *
 * Endpoints expuestos:
 *   POST /              → Proxy a Anthropic. Body: { model, max_tokens, system, messages }
 *                         Headers: X-Access-Password (chequea KV, fallback a ACCESS_PASSWORD)
 *   POST /fetch-site    → Fetch + extracción estructurada de un sitio web.
 *                         Body: { url }
 *                         Returns: { ok, blocked, title, description, ogTitle, ogType, headings, bodyText, schemas }
 *   POST /admin         → Gestión de passwords. Headers: X-Master-Password
 *                         Acciones via body:
 *                           { action: "create", name, notes?, prefix? } → genera + devuelve password ÚNICA VEZ
 *                           { action: "list" }                          → lista todos los records (sin passwords reales)
 *                           { action: "disable", hash }                 → marca disabled
 *                           { action: "enable", hash }                  → reactiva
 *                           { action: "delete", hash }                  → borra permanente
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
    'Access-Control-Allow-Headers': 'Content-Type, X-Access-Password, X-Master-Password',
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

// Structured logging. Cada llamada emite UNA línea JSON visible en
// Cloudflare → Worker fabrisio-proxy → Logs (live tail + búsqueda histórica).
// Nunca loguear password ni body completo (privacidad + costo de log).
function log(event, data) {
  try { console.log(JSON.stringify({ event, ts: Date.now(), ...data })); } catch {}
}

// ============ MULTI-PASSWORD (KV) helpers ============
// Hash SHA-256 hex de un string. Usado para no guardar la password en claro en KV.
async function sha256(str) {
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Genera password tipo "fabrisio-x7k2-m9p4" — 4 chars + 4 chars sin confusos (0/O/1/I/l).
function generatePassword(prefix = 'fshumo') {
  const safe = 'abcdefghjkmnpqrstuvwxyz23456789'; // 31 chars
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes).map(b => safe[b % safe.length]);
  return `${prefix}-${chars.slice(0, 4).join('')}-${chars.slice(4, 8).join('')}`;
}

// Valida una password contra KV (si está configurado) y como fallback contra ACCESS_PASSWORD legacy.
// Devuelve { source: 'kv'|'legacy', name } si es válida, o null si no.
// Si es kv, también actualiza lastUsedAt async (fire-and-forget via ctx.waitUntil).
async function isPasswordValid(password, env, ctx) {
  if (!password || typeof password !== 'string') return null;

  // 1) KV: buscar por hash
  if (env.PASSWORDS) {
    try {
      const hash = await sha256(password);
      const key = `pw:${hash}`;
      const record = await env.PASSWORDS.get(key, 'json');
      if (record && !record.disabled) {
        const updated = { ...record, lastUsedAt: Date.now() };
        if (ctx && typeof ctx.waitUntil === 'function') {
          ctx.waitUntil(env.PASSWORDS.put(key, JSON.stringify(updated)));
        }
        return { source: 'kv', name: record.name, hash };
      }
    } catch (err) {
      log('kv_lookup_error', { error: String(err.message || err) });
    }
  }

  // 2) Legacy: ACCESS_PASSWORD env var (compat antes de migrar todos a KV)
  if (env.ACCESS_PASSWORD && password === env.ACCESS_PASSWORD) {
    return { source: 'legacy', name: 'legacy-shared' };
  }

  return null;
}

// Endpoint admin protegido por MASTER_PASSWORD. Acciones: create, list, disable, enable, delete.
async function handleAdmin(request, env, corsHeaders, ip) {
  if (!env.PASSWORDS) {
    return jsonError('KV namespace PASSWORDS no configurado en el Worker.', 500, corsHeaders);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('Body inválido. Esperaba JSON con { action, ... }.', 400, corsHeaders);
  }
  const action = (body.action || '').toString().trim();
  if (!action) return jsonError('Falta action.', 400, corsHeaders);

  if (action === 'create') {
    const name = (body.name || '').toString().trim();
    if (!name) return jsonError('Falta name.', 400, corsHeaders);
    const prefix = (body.prefix || 'fshumo').toString().toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20) || 'fshumo';
    const password = generatePassword(prefix);
    const hash = await sha256(password);
    const key = `pw:${hash}`;
    const record = {
      name,
      createdAt: Date.now(),
      lastUsedAt: null,
      disabled: false,
      notes: (body.notes || '').toString(),
    };
    await env.PASSWORDS.put(key, JSON.stringify(record));
    log('admin_create', { ip, name, hash });
    return jsonOk({
      ok: true,
      message: 'Password creada. GUARDALA AHORA — solo se muestra una vez.',
      password,
      hash,
      ...record,
    }, corsHeaders);
  }

  if (action === 'list') {
    const list = await env.PASSWORDS.list({ prefix: 'pw:' });
    const records = await Promise.all(list.keys.map(async k => {
      const r = await env.PASSWORDS.get(k.name, 'json');
      return r ? { hash: k.name.slice(3), ...r } : null;
    }));
    const clean = records.filter(Boolean);
    return jsonOk({ ok: true, count: clean.length, records: clean }, corsHeaders);
  }

  if (action === 'disable' || action === 'enable') {
    const hash = (body.hash || '').toString().trim();
    if (!hash) return jsonError('Falta hash.', 400, corsHeaders);
    const key = `pw:${hash}`;
    const record = await env.PASSWORDS.get(key, 'json');
    if (!record) return jsonError('Hash no encontrado.', 404, corsHeaders);
    const updated = { ...record, disabled: action === 'disable' };
    await env.PASSWORDS.put(key, JSON.stringify(updated));
    log('admin_toggle', { ip, action, hash, name: record.name });
    return jsonOk({ ok: true, ...updated, hash }, corsHeaders);
  }

  if (action === 'delete') {
    const hash = (body.hash || '').toString().trim();
    if (!hash) return jsonError('Falta hash.', 400, corsHeaders);
    const key = `pw:${hash}`;
    const record = await env.PASSWORDS.get(key, 'json');
    if (!record) return jsonError('Hash no encontrado.', 404, corsHeaders);
    await env.PASSWORDS.delete(key);
    log('admin_delete', { ip, hash, name: record.name });
    return jsonOk({ ok: true, deleted: true, hash }, corsHeaders);
  }

  return jsonError('action inválida. Usá: create, list, disable, enable, delete.', 400, corsHeaders);
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
async function handleFetchSite(request, env, corsHeaders, ip) {
  const startTime = Date.now();
  let body;
  try {
    body = await request.json();
  } catch {
    log('fetch_site_bad_body', { ip });
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
    log('fetch_site_ssrf_blocked', { ip, host });
    return jsonError('No se permiten URLs privadas.', 400, corsHeaders);
  }

  log('fetch_site_start', { ip, url: parsedUrl.toString() });

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
    log('fetch_site_error', { ip, url: parsedUrl.toString(), error: String(err.message || err), latencyMs: Date.now() - startTime });
    return jsonError(`No pude acceder al sitio: ${err.message || err}`, 502, corsHeaders);
  }

  if (!res.ok) {
    log('fetch_site_http_error', { ip, url: parsedUrl.toString(), status: res.status, finalUrl: res.url, latencyMs: Date.now() - startTime });
    return jsonError(`El sitio respondió HTTP ${res.status}. URL final: ${res.url}`, 502, corsHeaders);
  }

  const contentType = res.headers.get('Content-Type') || '';
  if (!/text\/html|application\/xhtml/i.test(contentType)) {
    log('fetch_site_not_html', { ip, url: parsedUrl.toString(), contentType });
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
    log('fetch_site_read_error', { ip, url: parsedUrl.toString(), error: String(err.message || err) });
    return jsonError(`Error leyendo el sitio: ${err.message || err}`, 502, corsHeaders);
  }
  const html = new TextDecoder('utf-8', { fatal: false }).decode(
    new Uint8Array(chunks.reduce((acc, c) => acc.concat(Array.from(c)), []))
  );

  if (!html || html.length < 100) {
    log('fetch_site_empty', { ip, url: parsedUrl.toString(), bytes: html?.length || 0 });
    return jsonError('El sitio devolvió contenido vacío o muy corto.', 400, corsHeaders);
  }

  const blocked = isBlockedPage(html);
  const extract = extractContent(html);

  log('fetch_site_result', {
    ip,
    url: parsedUrl.toString(),
    finalUrl: res.url,
    bytes: received,
    blocked,
    hasTitle: !!extract.title,
    hasOgDesc: !!extract.ogDescription,
    hasSchema: !!extract.schemas,
    bodyChars: extract.bodyText.length,
    latencyMs: Date.now() - startTime,
  });

  return jsonOk({
    ok: true,
    blocked,
    finalUrl: res.url,
    ...extract,
  }, corsHeaders);
}

// Handler para POST / → proxy a Anthropic
async function handleAnthropicProxy(request, env, corsHeaders, ip) {
  const startTime = Date.now();
  let body;
  try {
    body = await request.json();
  } catch {
    log('anthropic_bad_body', { ip });
    return jsonError('Body inválido. Esperaba JSON.', 400, corsHeaders);
  }

  const model = body.model || 'unknown';
  const messageCount = Array.isArray(body.messages) ? body.messages.length : 0;
  const systemLength = typeof body.system === 'string' ? body.system.length : 0;

  log('anthropic_request', { ip, model, messageCount, systemLength });

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
    log('anthropic_network_error', { ip, error: String(err.message || err), latencyMs: Date.now() - startTime });
    return jsonError(`Error al contactar Anthropic: ${err.message}`, 502, corsHeaders);
  }

  const text = await upstream.text();
  const latencyMs = Date.now() - startTime;

  if (upstream.status >= 400) {
    log('anthropic_response_error', { ip, model, status: upstream.status, latencyMs, bytes: text.length });
  } else {
    // Intentar extraer tokens usados (Anthropic incluye `usage` en la respuesta) sin parsear el cuerpo completo.
    let inputTokens = null, outputTokens = null;
    try {
      const parsed = JSON.parse(text);
      inputTokens = parsed?.usage?.input_tokens ?? null;
      outputTokens = parsed?.usage?.output_tokens ?? null;
    } catch {}
    log('anthropic_response_ok', { ip, model, status: upstream.status, latencyMs, inputTokens, outputTokens, bytes: text.length });
  }

  return new Response(text, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      ...corsHeaders,
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = getCorsHeaders(request, env);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const endpoint = url.pathname;
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    if (request.method !== 'POST') {
      log('method_not_allowed', { ip, endpoint, method: request.method });
      return jsonError('Método no permitido. Usá POST.', 405, corsHeaders);
    }

    // Rate limit por IP usando caches.default. Va ANTES de validar password.
    const window = Math.floor(Date.now() / (RATE_LIMIT_WINDOW * 1000));
    const cacheKey = new Request(`https://rl.local/${encodeURIComponent(ip)}/${window}`);
    const cached = await caches.default.match(cacheKey);
    let count = 1;
    if (cached) {
      count = parseInt(await cached.text(), 10) + 1;
      if (count > RATE_LIMIT_MAX) {
        log('rate_limited', { ip, endpoint, count });
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

    // Admin endpoint: usa MASTER_PASSWORD (no X-Access-Password). NO requiere KV en sí — handleAdmin chequea.
    if (endpoint === '/admin') {
      const masterPass = request.headers.get('X-Master-Password');
      if (!env.MASTER_PASSWORD || !masterPass || masterPass !== env.MASTER_PASSWORD) {
        log('admin_auth_failed', { ip, hasMaster: !!masterPass });
        return jsonError('Master password incorrecta.', 401, corsHeaders);
      }
      return handleAdmin(request, env, corsHeaders, ip);
    }

    // Endpoints normales: validar password vía KV (con fallback a ACCESS_PASSWORD legacy)
    const password = request.headers.get('X-Access-Password');
    const validation = await isPasswordValid(password, env, ctx);
    if (!validation) {
      log('auth_failed', { ip, endpoint, hasPassword: !!password });
      return jsonError('Acceso no autorizado. Verificá tu contraseña.', 401, corsHeaders);
    }
    // Log quién usó la password (para métricas por cliente en KV)
    if (validation.source === 'kv') {
      log('auth_ok', { ip, endpoint, source: 'kv', name: validation.name });
    }

    // Routing
    if (endpoint === '/fetch-site') {
      return handleFetchSite(request, env, corsHeaders, ip);
    }
    return handleAnthropicProxy(request, env, corsHeaders, ip);
  },
};
