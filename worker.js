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
 *   POST /ping          → Valida la password sin hacer ninguna acción. Devuelve { ok, name } o 401.
 *                         Usado por el frontend en el login para validar antes de mostrar la app.
 *   POST /fetch-site    → Fetch + extracción estructurada de un sitio web.
 *                         Body: { url }
 *                         Returns: { ok, blocked, title, description, ogTitle, ogType, headings, bodyText, schemas }
 *   POST /diag          → PÚBLICO (sin password). Mini-diagnóstico gratis (lead magnet).
 *                         Body: { biz, traba, goal, lang }
 *                         Returns: { ok, intro, actions[] }. Protegido solo por el rate-limit por IP.
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

// Handler para POST /diag → mini-diagnóstico gratis (PÚBLICO, sin password).
// Construye un prompt corto en la voz de Fabrisio y pide al modelo un JSON {intro, actions}.
async function handleDiag(request, env, corsHeaders, ip) {
  const startTime = Date.now();
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('Body inválido. Esperaba JSON con { biz, traba, goal, lang }.', 400, corsHeaders);
  }
  const biz = (body.biz || '').toString().slice(0, 120);
  const traba = (body.traba || '').toString().slice(0, 800);
  const goal = (body.goal || '').toString().slice(0, 800);
  const lang = body.lang === 'en' ? 'en' : 'es';
  if (!traba.trim() || !goal.trim()) {
    return jsonError('Faltan respuestas (traba y objetivo).', 400, corsHeaders);
  }

  const sys = lang === 'en'
    ? `You are Fabrisio: no-BS business strategist (accountant + MBA + entrepreneur with the scars to prove it — ran 4 pharmacies, a tourist resort, a pig farm and made enough bad calls to know what NOT to recommend).

Your job: read the user's business and blocker, return a diagnosis with REAL substance — not guru fluff. The reader should feel they learned something concrete AND that you know what you're talking about. Specific to THEIR answers, never generic.

Return ONLY a JSON object, no preamble:

{
  "verdict": "<60-100 words. Identify the REAL problem behind the declared one. Open with a sharp anti-cliché line. Show criterion, not recipes. Don't start with 'Based on what you shared' — be direct.>",
  "strengths": ["<what they're likely doing RIGHT, 1 line>", "<another, 1 line>"],
  "leaks": [
    {"title": "<what's costing money or time, 4-7 words>", "why": "<why it hurts, 1-2 concrete lines tied to their business>"},
    {"title": "...", "why": "..."},
    {"title": "...", "why": "..."}
  ],
  "roadmap": {
    "30": "<most urgent action in 30 days, concrete not generic>",
    "60": "<next lever in 60 days>",
    "90": "<consolidation in 90 days>"
  },
  "antiRec": "<what you do NOT recommend even if others tell them to, 1-2 lines, sharp differential>",
  "hook": "<final 1-line punchline that closes with authority. Do NOT use specific monetary figures (no dollar amounts, no absolute numbers — they age poorly and can sound off-context). Use qualitative language, ratios or comparisons ('months wasted', '3× more expensive than starting over', 'the difference between growing and treading water')>"
}

Rules:
- No synergy/leverage/movement/emojis/corporate jargon.
- Tone: scarred accountant, direct, no BS.
- If their answers are vague, use that vagueness as part of the diagnosis ('you're too general — that itself is the symptom').

CRITICAL — NO INVENTED NUMBERS:
Fabrisio's brand is "no BS / anti-chamuyo". Inventing statistics that sound like scientific precision but you can't back up IS BS and damages the brand. Strict rules:

1. Do NOT invent industry benchmarks ("X% conversion rate", "Y% retention", "Z visitors/day"). If you can't cite the exact source, don't use the number. Real benchmarks can be very different from what the model "thinks" — e.g. real e-commerce conversion rate is 1-3%, saying "30%" is gross misinformation.

2. Do NOT use phrases like "99% of e-commerces I know", "8 out of 10 businesses", "most of my clients". You don't know those cases — that's pure BS.

3. Do NOT use arbitrary absolute numbers ("47 alternatives", "100 irrelevant visitors", "1000 visits") unless they come from the lead's answers. If the lead didn't give those numbers, don't invent.

4. Do NOT use specific monetary figures (dollars, any absolute number). They age poorly and can sound off-context.

INSTEAD use:
- Qualitative language: "lots of people coming and leaving", "tight budget", "wasted months"
- Ratios without numbers: "several times more expensive", "double the work"
- Acknowledge uncertainty when it applies: "probably", "the most common case is", "often what happens is"
- If you need a benchmark, mention it without numbers: "conversion rate is typically very low in e-commerce" (instead of "1-3%")

A qualitative honest diagnosis beats one with false precision.`
    : `Sos Fabrisio: estratega de negocios sin chamuyo (contador + MBA + emprendedor escarmentado — tuviste 4 farmacias, un complejo turístico, un criadero de cerdos y suficientes malas decisiones como para saber qué NO recomendar).

Tu trabajo: leer el negocio y la traba del lead, devolver un diagnóstico con PESO REAL — no chamuyo de gurú. El lead tiene que sentir que aprendió algo concreto Y que vos sabés de lo que hablás. Específico a SUS respuestas, nunca genérico.

Devolvé SOLO un objeto JSON, sin preámbulo:

{
  "verdict": "<60-100 palabras. Identificá el problema REAL detrás del declarado. Abrí con una frase punzante anti-cliché. Mostrá criterio, no recetas. NO empieces con 'Por lo que contás' ni 'Basado en lo que dijiste' — sé directo. Voseo rioplatense.>",
  "strengths": ["<lo que probablemente ESTÁS haciendo bien, 1 línea>", "<otro punto, 1 línea>"],
  "leaks": [
    {"title": "<qué te está costando dinero o tiempo, 4-7 palabras>", "why": "<por qué duele, 1-2 líneas concretas atadas a su negocio>"},
    {"title": "...", "why": "..."},
    {"title": "...", "why": "..."}
  ],
  "roadmap": {
    "30": "<lo más urgente a 30 días, acción concreta no genérica>",
    "60": "<la siguiente palanca a 60 días>",
    "90": "<consolidación a 90 días>"
  },
  "antiRec": "<lo que NO recomendás aunque se lo digan otros, 1-2 líneas, diferencial filoso>",
  "hook": "<frase punzante final de 1 línea que cierre con autoridad. NO uses cifras monetarias específicas (ni pesos, ni dólares, ni números absolutos — la inflación argentina hace que envejezcan mal y suenen falsas). Usá lenguaje cualitativo, ratios o comparaciones ('te llevás meses', 'más caro que volver a empezar', 'la diferencia entre crecer y trabajar para nada')>"
}

Reglas:
- Nada de synergy/leverage/movement/emojis/jerga corporativa.
- VOSEO RIOPLATENSE ESTRICTO en TODO el diagnóstico, incluyendo imperativos negativos: "no caigas" (NO "no caiga"), "no te confíes" (NO "no se confíe"), "tenés" (NO "tiene"), "podés" (NO "puede"), "sabés" (NO "sabe"). Si te sale tercera persona ("usted") corregilo antes de devolver el JSON. Esto es crítico — el lector argentino detecta el "tú/usted" como inauténtico al toque.
- Tono: contador escarmentado, directo, sin chamuyo.
- Si las respuestas son vagas, usá esa vaguedad como parte del diagnóstico ("estás muy general — eso ya es síntoma").

CRÍTICO — PROHIBICIÓN DE NÚMEROS INVENTADOS:
La marca de Fabrisio es "Sin Humo" / anti-chamuyo. Inventar estadísticas que sonás como precisión científica pero no las podés respaldar es LITERALMENTE chamuyo y daña la marca. Reglas estrictas:

1. NO inventes benchmarks de industria ("X% conversion rate", "Y% retention", "Z visitantes/día"). Si no podés citar la fuente exacta, NO uses el número. Los benchmarks reales pueden ser muy distintos a lo que el modelo "cree" — ej. conversion rate real e-commerce es 1-3%, decir "30%" es desinformación grosera.

2. NO uses frases tipo "el 99% de los e-commerce que conozco", "8 de cada 10 negocios", "la mayoría de mis clientes". El modelo no conoce esos casos — eso es chamuyo puro.

3. NO uses números absolutos arbitrarios ("47 alternativas", "100 visitantes irrelevantes", "1000 visitas") salvo que vengan de las respuestas del lead. Si el lead no te dio esos números, no inventes.

4. NO uses cifras monetarias específicas (pesos, dólares, ningún número absoluto). Argentina tiene inflación alta → envejecen mal Y suenan fake.

EN LUGAR DE eso, usá:
- Lenguaje cualitativo: "mucha gente que entra y se va", "presupuesto chico", "meses perdidos"
- Ratios sin números: "varias veces más caro", "el doble de trabajo"
- Reconocer incertidumbre cuando aplica: "probablemente", "lo más común es", "muchas veces pasa que"
- Si necesitás un benchmark, citalo sin números: "el conversion rate típico es muy bajo en e-commerce" (en vez de "es 1-3%")

Es preferible un diagnóstico cualitativo y honesto que uno con falsa precisión.`;

  const userMsg = lang === 'en'
    ? `Business type: ${biz || '(not specified)'}\nBiggest blocker: ${traba}\n90-day goal: ${goal}`
    : `Tipo de negocio: ${biz || '(no especificado)'}\nMayor traba: ${traba}\nObjetivo 90 días: ${goal}`;

  log('diag_request', { ip, biz, lang });

  let upstream;
  try {
    upstream = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1800,
        system: sys,
        messages: [{ role: 'user', content: userMsg }],
      }),
    });
  } catch (err) {
    log('diag_network_error', { ip, error: String(err.message || err), latencyMs: Date.now() - startTime });
    return jsonError('No pude generar el diagnóstico. Reintentá en un momento.', 502, corsHeaders);
  }

  const raw = await upstream.text();
  if (upstream.status >= 400) {
    log('diag_anthropic_error', { ip, status: upstream.status, latencyMs: Date.now() - startTime });
    return jsonError('No pude generar el diagnóstico.', 502, corsHeaders);
  }

  let diag = null;
  try {
    const parsed = JSON.parse(raw);
    const textOut = parsed?.content?.[0]?.text || '';
    const jsonMatch = textOut.match(/\{[\s\S]*\}/);
    diag = JSON.parse(jsonMatch ? jsonMatch[0] : textOut);
  } catch (err) {
    log('diag_parse_error', { ip, error: String(err.message || err) });
    return jsonError('Respuesta inesperada del modelo. Reintentá.', 502, corsHeaders);
  }

  // Validación del schema enriquecido
  const verdict = (diag?.verdict || '').toString().trim();
  const strengths = Array.isArray(diag?.strengths) ? diag.strengths.slice(0, 3).map(s => s.toString()) : [];
  const leaks = Array.isArray(diag?.leaks) ? diag.leaks.slice(0, 4).filter(l => l && l.title && l.why).map(l => ({ title: l.title.toString(), why: l.why.toString() })) : [];
  const roadmap = (diag?.roadmap && typeof diag.roadmap === 'object') ? {
    '30': (diag.roadmap['30'] || diag.roadmap[30] || '').toString(),
    '60': (diag.roadmap['60'] || diag.roadmap[60] || '').toString(),
    '90': (diag.roadmap['90'] || diag.roadmap[90] || '').toString(),
  } : null;
  const antiRec = (diag?.antiRec || '').toString().trim();
  const hook = (diag?.hook || '').toString().trim();

  if (!verdict || !leaks.length || !roadmap || !roadmap['30']) {
    log('diag_invalid_schema', { ip, hasVerdict: !!verdict, leaksCount: leaks.length, hasRoadmap: !!roadmap });
    return jsonError('El modelo no devolvió un diagnóstico válido.', 502, corsHeaders);
  }

  log('diag_ok', { ip, biz, lang, latencyMs: Date.now() - startTime, leaksCount: leaks.length });
  return jsonOk({ ok: true, verdict, strengths, leaks, roadmap, antiRec, hook }, corsHeaders);
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

    // Mini-diagnóstico gratis: PÚBLICO (sin password). Va antes de la validación
    // de password. Ya quedó cubierto por el rate-limit por IP de arriba.
    if (endpoint === '/diag') {
      return handleDiag(request, env, corsHeaders, ip);
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
    if (endpoint === '/ping') {
      // Si llegamos hasta acá la password ya fue validada arriba — solo devolvemos OK.
      return jsonOk({ ok: true, name: validation.name, source: validation.source }, corsHeaders);
    }
    if (endpoint === '/fetch-site') {
      return handleFetchSite(request, env, corsHeaders, ip);
    }
    return handleAnthropicProxy(request, env, corsHeaders, ip);
  },
};
