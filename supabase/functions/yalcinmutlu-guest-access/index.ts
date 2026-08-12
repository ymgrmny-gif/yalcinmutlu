import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set([
  'https://yalcinmutlu.pages.dev',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

function cors(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://yalcinmutlu.pages.dev';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, x-admin-session',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(status: number, body: unknown, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      ...cors(origin),
    },
  });
}

function serviceKey() {
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (legacy) return legacy;
  const raw = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed.default || Object.values(parsed)[0] || '';
  } catch {
    return '';
  }
}

function config() {
  return {
    baseUrl: Deno.env.get('SUPABASE_URL')?.replace(/\/$/u, '') || '',
    key: serviceKey(),
  };
}

async function rpc(name: string, payload: Record<string, unknown>) {
  const { baseUrl, key } = config();
  if (!baseUrl || !key) throw new Error('CONFIGURATION_ERROR');
  return fetch(`${baseUrl}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(payload),
  });
}

async function rpcJson(name: string, payload: Record<string, unknown>) {
  const response = await rpc(name, payload);
  const body = await response.json().catch(() => null);
  return { response, body };
}

function safeText(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function documentIds(value: unknown) {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === 'string' && isUuid(item)))]
    : [];
}

function randomAccessToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function validateAdmin(token: string) {
  if (!token) return false;
  const result = await rpcJson('yalcinmutlu_admin_session', { p_token: token });
  const row = Array.isArray(result.body) ? result.body[0] : null;
  return Boolean(result.response.ok && row?.valid);
}

async function validateGuestSession(token: string) {
  if (!/^[0-9a-f]{64}$/i.test(token)) return null;
  const result = await rpcJson('yalcinmutlu_guest_session', { p_token: token });
  const row = Array.isArray(result.body) ? result.body[0] : null;
  return result.response.ok && row?.valid ? row : null;
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('Origin');
  if (request.method === 'OPTIONS') {
    if (!origin || !ALLOWED_ORIGINS.has(origin)) return json(403, { ok: false, code: 'ORIGIN_REJECTED' }, origin);
    return new Response(null, { status: 204, headers: cors(origin) });
  }
  if (request.method !== 'POST') return json(405, { ok: false, code: 'METHOD_NOT_ALLOWED' }, origin);
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return json(403, { ok: false, code: 'ORIGIN_REJECTED' }, origin);

  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.toLowerCase().includes('application/json')) return json(415, { ok: false, code: 'INVALID_CONTENT_TYPE' }, origin);
  const contentLength = Number(request.headers.get('Content-Length') || '0');
  if (contentLength > 24_000) return json(413, { ok: false, code: 'PAYLOAD_TOO_LARGE' }, origin);

  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return json(400, { ok: false, code: 'INVALID_JSON' }, origin); }
  const action = String(input.action || '');

  try {
    if (action === 'exchange') {
      const rawToken = typeof input.token === 'string' ? input.token : '';
      if (!/^[A-Za-z0-9_-]{43}$/.test(rawToken)) return json(404, { ok: false, code: 'ACCESS_LINK_INVALID' }, origin);
      const tokenHash = await sha256Hex(rawToken);
      const result = await rpcJson('yalcinmutlu_guest_exchange', { p_token_hash: tokenHash });
      const row = Array.isArray(result.body) ? result.body[0] : null;
      if (!result.response.ok || !row?.session_token) return json(404, { ok: false, code: 'ACCESS_LINK_INVALID' }, origin);
      return json(200, { ok: true, sessionToken: row.session_token, expiresAt: row.session_expires_at, label: row.label }, origin);
    }

    if (action === 'guestLinks' || action === 'createGuestLink' || action === 'revokeGuestLink' || action === 'updateGuestLink') {
      const adminToken = request.headers.get('x-admin-session') || '';
      if (!await validateAdmin(adminToken)) return json(401, { ok: false, code: 'ADMIN_SESSION_REQUIRED' }, origin);

      if (action === 'guestLinks') {
        const result = await rpcJson('yalcinmutlu_admin_guest_links', { p_token: adminToken });
        if (!result.response.ok) return json(502, { ok: false, code: 'GUEST_LINK_LIST_FAILED' }, origin);
        return json(200, { ok: true, data: result.body || { links: [], documents: [] } }, origin);
      }

      if (action === 'createGuestLink') {
        const label = safeText(input.label, 160);
        const note = safeText(input.note, 1000);
        const expiresAt = typeof input.expiresAt === 'string' && input.expiresAt ? input.expiresAt : null;
        const parsedExpiry = expiresAt ? Date.parse(expiresAt) : NaN;
        const ids = documentIds(input.documentIds);
        if (!label || ids.length < 1 || ids.length > 100) return json(422, { ok: false, code: 'INVALID_GUEST_LINK' }, origin);
        if (expiresAt && (!Number.isFinite(parsedExpiry) || parsedExpiry <= Date.now())) return json(422, { ok: false, code: 'INVALID_EXPIRY' }, origin);

        const rawToken = randomAccessToken();
        const tokenHash = await sha256Hex(rawToken);
        const result = await rpcJson('yalcinmutlu_admin_create_guest_link', {
          p_token: adminToken,
          p_label: label,
          p_note: note || null,
          p_expires_at: expiresAt,
          p_token_hash: tokenHash,
          p_document_ids: ids,
        });
        if (!result.response.ok || typeof result.body !== 'string') return json(422, { ok: false, code: 'GUEST_LINK_CREATE_FAILED' }, origin);
        return json(200, { ok: true, linkId: result.body, token: rawToken }, origin);
      }

      const guestLinkId = typeof input.guestLinkId === 'string' ? input.guestLinkId : '';
      if (!isUuid(guestLinkId)) return json(422, { ok: false, code: 'INVALID_GUEST_LINK' }, origin);

      if (action === 'updateGuestLink') {
        const ids = documentIds(input.documentIds);
        if (ids.length < 1 || ids.length > 100) return json(422, { ok: false, code: 'DOCUMENT_REQUIRED' }, origin);

        if (typeof input.label !== 'string') {
          const legacyResult = await rpcJson('yalcinmutlu_admin_update_guest_link_documents', {
            p_token: adminToken,
            p_guest_link_id: guestLinkId,
            p_document_ids: ids,
          });
          if (!legacyResult.response.ok) return json(422, { ok: false, code: 'GUEST_LINK_UPDATE_FAILED' }, origin);
          if (legacyResult.body !== true) return json(404, { ok: false, code: 'GUEST_LINK_NOT_FOUND' }, origin);
          return json(200, { ok: true }, origin);
        }

        const label = safeText(input.label, 160);
        const note = safeText(input.note, 1000);
        const expiresAt = typeof input.expiresAt === 'string' && input.expiresAt ? input.expiresAt : null;
        const parsedExpiry = expiresAt ? Date.parse(expiresAt) : NaN;
        if (!label) return json(422, { ok: false, code: 'INVALID_GUEST_LINK' }, origin);
        if (expiresAt && (!Number.isFinite(parsedExpiry) || parsedExpiry <= Date.now())) return json(422, { ok: false, code: 'INVALID_EXPIRY' }, origin);

        const result = await rpcJson('yalcinmutlu_admin_update_guest_link', {
          p_token: adminToken,
          p_guest_link_id: guestLinkId,
          p_label: label,
          p_note: note || null,
          p_expires_at: expiresAt,
          p_document_ids: ids,
        });
        if (!result.response.ok) return json(422, { ok: false, code: 'GUEST_LINK_UPDATE_FAILED' }, origin);
        if (result.body !== true) return json(404, { ok: false, code: 'GUEST_LINK_NOT_FOUND' }, origin);
        return json(200, { ok: true }, origin);
      }

      const result = await rpcJson('yalcinmutlu_admin_revoke_guest_link', { p_token: adminToken, p_guest_link_id: guestLinkId });
      if (!result.response.ok || result.body !== true) return json(404, { ok: false, code: 'GUEST_LINK_NOT_FOUND' }, origin);
      return json(200, { ok: true }, origin);
    }

    const token = typeof input.token === 'string' ? input.token : '';

    if (action === 'session') {
      const row = await validateGuestSession(token);
      if (!row) return json(401, { ok: false, code: 'SESSION_EXPIRED' }, origin);
      return json(200, { ok: true, label: row.label || null, expiresAt: row.session_expires_at || null }, origin);
    }

    if (action === 'list') {
      const session = await validateGuestSession(token);
      if (!session) return json(401, { ok: false, code: 'SESSION_EXPIRED' }, origin);
      const language = ['tr', 'en', 'de'].includes(String(input.language)) ? String(input.language) : 'de';
      const result = await rpcJson('yalcinmutlu_guest_document_list', { p_token: token, p_language: language });
      if (!result.response.ok) return json(502, { ok: false, code: 'LIST_BACKEND_ERROR' }, origin);
      return json(200, { ok: true, documents: Array.isArray(result.body) ? result.body : [] }, origin);
    }

    if (action === 'url') {
      const session = await validateGuestSession(token);
      if (!session) return json(401, { ok: false, code: 'SESSION_EXPIRED' }, origin);
      const documentId = typeof input.documentId === 'string' ? input.documentId : '';
      const mode = input.mode === 'download' ? 'download' : 'view';
      if (!isUuid(documentId)) return json(422, { ok: false, code: 'INVALID_DOCUMENT' }, origin);

      const access = await rpcJson('yalcinmutlu_guest_document_access', {
        p_token: token,
        p_document_id: documentId,
        p_action: mode,
      });
      const rows = Array.isArray(access.body) ? access.body : [];
      const row = rows[0] || null;
      if (!access.response.ok) return json(502, { ok: false, code: 'ACCESS_BACKEND_ERROR' }, origin);
      if (!row?.storage_bucket || !row?.storage_path) return json(403, { ok: false, code: 'DOCUMENT_FORBIDDEN' }, origin);

      const { baseUrl, key } = config();
      const supabase = createClient(baseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
      const signed = await supabase.storage.from(row.storage_bucket).createSignedUrl(row.storage_path, 90, {
        download: mode === 'download',
      });
      if (signed.error || !signed.data?.signedUrl) return json(502, { ok: false, code: 'SIGNED_URL_ERROR' }, origin);

      return json(200, {
        ok: true,
        url: signed.data.signedUrl,
        expiresIn: 90,
        canDownload: Boolean(row.can_download),
      }, origin);
    }

    if (action === 'logout') {
      if (/^[0-9a-f]{64}$/i.test(token)) await rpcJson('yalcinmutlu_guest_logout', { p_token: token });
      return json(200, { ok: true }, origin);
    }

    return json(400, { ok: false, code: 'UNKNOWN_ACTION' }, origin);
  } catch (error) {
    console.error('Yalcin guest access function error', error instanceof Error ? error.message : 'unknown');
    return json(500, { ok: false, code: 'INTERNAL_ERROR' }, origin);
  }
});
