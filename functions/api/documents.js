const DOCUMENTS_EDGE_URL = 'https://fxpcmlkmkwiwocvrhpvj.supabase.co/functions/v1/yalcinmutlu-documents';
const COOKIE_NAME = 'ym_secure_documents_session';

function json(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
}

function cookieValue(cookieHeader, name) {
  if (!cookieHeader) return '';
  const prefix = `${name}=`;
  for (const part of cookieHeader.split(';')) {
    const item = part.trim();
    if (item.startsWith(prefix)) return decodeURIComponent(item.slice(prefix.length));
  }
  return '';
}

function clearCookie() {
  return `${COOKIE_NAME}=; Path=/api/documents; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

async function callEdge(origin, body) {
  return fetch(DOCUMENTS_EDGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: origin,
    },
    body: JSON.stringify(body),
  });
}

function freshSignedUrl(value) {
  try {
    const url = new URL(value);
    url.searchParams.set('cacheNonce', `${Date.now()}-${crypto.randomUUID()}`);
    return url.toString();
  } catch {
    return value;
  }
}

export async function onRequestPost({ request }) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get('Origin');
  if (!origin || origin !== requestUrl.origin) {
    return json(403, { ok: false, code: 'ORIGIN_REJECTED' });
  }

  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return json(415, { ok: false, code: 'INVALID_CONTENT_TYPE' });
  }

  const contentLength = Number(request.headers.get('Content-Length') || '0');
  if (contentLength > 8_000) {
    return json(413, { ok: false, code: 'PAYLOAD_TOO_LARGE' });
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return json(400, { ok: false, code: 'INVALID_JSON' });
  }

  const action = String(input.action || '');

  if (action === 'login') {
    const password = typeof input.password === 'string' ? input.password : '';
    if (!password || password.length > 200) {
      return json(422, { ok: false, code: 'INVALID_CREDENTIALS' });
    }

    const upstream = await callEdge(origin, { action: 'login', password });
    const body = await upstream.json().catch(() => ({ ok: false, code: 'UPSTREAM_ERROR' }));
    if (!upstream.ok || !body?.ok || !body?.sessionToken) {
      return json(upstream.status === 401 ? 401 : 502, {
        ok: false,
        code: upstream.status === 401 ? 'INVALID_CREDENTIALS' : 'AUTH_BACKEND_ERROR',
      });
    }

    const expiresAt = Date.parse(body.expiresAt || '');
    const maxAge = Number.isFinite(expiresAt)
      ? Math.max(60, Math.min(7200, Math.floor((expiresAt - Date.now()) / 1000)))
      : 7200;

    return json(200, {
      ok: true,
      displayName: body.displayName || null,
      expiresAt: body.expiresAt || null,
    }, {
      'Set-Cookie': `${COOKIE_NAME}=${encodeURIComponent(body.sessionToken)}; Path=/api/documents; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`,
    });
  }

  const token = cookieValue(request.headers.get('Cookie'), COOKIE_NAME);
  if (!token) {
    if (action === 'logout') {
      return json(200, { ok: true }, { 'Set-Cookie': clearCookie() });
    }
    return json(401, { ok: false, code: 'SESSION_REQUIRED' });
  }

  if (action === 'session') {
    const upstream = await callEdge(origin, { action: 'session', token });
    const body = await upstream.json().catch(() => ({ ok: false }));
    if (!upstream.ok || !body?.ok) {
      return json(401, { ok: false, code: 'SESSION_EXPIRED' }, { 'Set-Cookie': clearCookie() });
    }
    return json(200, {
      ok: true,
      displayName: body.displayName || null,
      expiresAt: body.expiresAt || null,
    });
  }

  if (action === 'list') {
    const language = ['tr', 'en', 'de'].includes(String(input.language)) ? String(input.language) : 'tr';
    const upstream = await callEdge(origin, { action: 'list', token, language });
    const body = await upstream.json().catch(() => ({ ok: false, documents: [] }));
    if (!upstream.ok || !body?.ok) {
      return json(401, { ok: false, code: 'SESSION_EXPIRED' }, { 'Set-Cookie': clearCookie() });
    }
    return json(200, { ok: true, documents: Array.isArray(body.documents) ? body.documents : [] });
  }

  if (action === 'url') {
    const documentId = typeof input.documentId === 'string' ? input.documentId : '';
    const mode = input.mode === 'download' ? 'download' : 'view';
    if (!/^[0-9a-f-]{36}$/i.test(documentId)) {
      return json(422, { ok: false, code: 'INVALID_DOCUMENT' });
    }

    const upstream = await callEdge(origin, { action: 'url', token, documentId, mode });
    const body = await upstream.json().catch(() => ({ ok: false, code: 'UPSTREAM_ERROR' }));

    if (!upstream.ok || !body?.ok || typeof body?.url !== 'string') {
      if (upstream.status === 401) {
        return json(401, { ok: false, code: 'SESSION_EXPIRED' }, { 'Set-Cookie': clearCookie() });
      }
      if (upstream.status === 403) {
        return json(403, { ok: false, code: 'DOCUMENT_FORBIDDEN' });
      }
      return json(502, { ok: false, code: 'DOCUMENT_URL_ERROR' });
    }

    return json(200, {
      ok: true,
      url: freshSignedUrl(body.url),
      expiresIn: Number(body.expiresIn) || 90,
      canDownload: Boolean(body.canDownload),
    });
  }

  if (action === 'logout') {
    try {
      await callEdge(origin, { action: 'logout', token });
    } catch (error) {
      console.error('Secure documents logout failed', error);
    }
    return json(200, { ok: true }, { 'Set-Cookie': clearCookie() });
  }

  return json(400, { ok: false, code: 'UNKNOWN_ACTION' });
}

export function onRequest() {
  return json(405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
}
