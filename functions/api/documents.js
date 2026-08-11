const DOCUMENTS_EDGE_URL = 'https://fxpcmlkmkwiwocvrhpvj.supabase.co/functions/v1/yalcinmutlu-documents';
const GUEST_EDGE_URL = 'https://fxpcmlkmkwiwocvrhpvj.supabase.co/functions/v1/yalcinmutlu-guest-access';
const VIEWER_COOKIE = 'ym_secure_documents_session';
const GUEST_COOKIE = 'ym_guest_documents_session';

function json(status, body, extraHeaders = {}, cookies = []) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, max-age=0',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    ...extraHeaders,
  });
  for (const cookie of cookies) headers.append('Set-Cookie', cookie);
  return new Response(JSON.stringify(body), { status, headers });
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

function clearCookie(name, sameSite = 'Strict') {
  return `${name}=; Path=/api/documents; HttpOnly; Secure; SameSite=${sameSite}; Max-Age=0`;
}

function sessionCookie(name, token, maxAge, sameSite) {
  return `${name}=${encodeURIComponent(token)}; Path=/api/documents; HttpOnly; Secure; SameSite=${sameSite}; Max-Age=${maxAge}`;
}

async function callEdge(url, origin, body) {
  return fetch(url, {
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

    const upstream = await callEdge(DOCUMENTS_EDGE_URL, origin, { action: 'login', password });
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
      sessionType: 'viewer',
    }, {}, [
      sessionCookie(VIEWER_COOKIE, body.sessionToken, maxAge, 'Strict'),
      clearCookie(GUEST_COOKIE, 'Lax'),
    ]);
  }

  const cookieHeader = request.headers.get('Cookie');
  const guestToken = cookieValue(cookieHeader, GUEST_COOKIE);
  const viewerToken = cookieValue(cookieHeader, VIEWER_COOKIE);
  const sessionType = guestToken ? 'guest' : viewerToken ? 'viewer' : '';
  const token = guestToken || viewerToken;
  const edgeUrl = sessionType === 'guest' ? GUEST_EDGE_URL : DOCUMENTS_EDGE_URL;
  const clearCurrentCookie = sessionType === 'guest'
    ? clearCookie(GUEST_COOKIE, 'Lax')
    : clearCookie(VIEWER_COOKIE, 'Strict');

  if (!token) {
    if (action === 'logout') {
      return json(200, { ok: true }, {}, [clearCookie(VIEWER_COOKIE), clearCookie(GUEST_COOKIE, 'Lax')]);
    }
    return json(401, { ok: false, code: 'SESSION_REQUIRED' });
  }

  if (action === 'session') {
    const upstream = await callEdge(edgeUrl, origin, { action: 'session', token });
    const body = await upstream.json().catch(() => ({ ok: false }));
    if (!upstream.ok || !body?.ok) {
      return json(401, { ok: false, code: 'SESSION_EXPIRED' }, {}, [clearCurrentCookie]);
    }
    return json(200, {
      ok: true,
      displayName: body.displayName || body.label || null,
      expiresAt: body.expiresAt || null,
      sessionType,
    });
  }

  if (action === 'list') {
    const language = ['tr', 'en', 'de'].includes(String(input.language)) ? String(input.language) : 'tr';
    const upstream = await callEdge(edgeUrl, origin, { action: 'list', token, language });
    const body = await upstream.json().catch(() => ({ ok: false, documents: [] }));
    if (!upstream.ok || !body?.ok) {
      return json(401, { ok: false, code: 'SESSION_EXPIRED' }, {}, [clearCurrentCookie]);
    }
    return json(200, { ok: true, documents: Array.isArray(body.documents) ? body.documents : [] });
  }

  if (action === 'url') {
    const documentId = typeof input.documentId === 'string' ? input.documentId : '';
    const mode = input.mode === 'download' ? 'download' : 'view';
    if (!/^[0-9a-f-]{36}$/i.test(documentId)) {
      return json(422, { ok: false, code: 'INVALID_DOCUMENT' });
    }

    const upstream = await callEdge(edgeUrl, origin, { action: 'url', token, documentId, mode });
    const body = await upstream.json().catch(() => ({ ok: false, code: 'UPSTREAM_ERROR' }));

    if (!upstream.ok || !body?.ok || typeof body?.url !== 'string') {
      if (upstream.status === 401) {
        return json(401, { ok: false, code: 'SESSION_EXPIRED' }, {}, [clearCurrentCookie]);
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
      await callEdge(edgeUrl, origin, { action: 'logout', token });
    } catch (error) {
      console.error('Secure documents logout failed', error);
    }
    return json(200, { ok: true }, {}, [clearCookie(VIEWER_COOKIE), clearCookie(GUEST_COOKIE, 'Lax')]);
  }

  return json(400, { ok: false, code: 'UNKNOWN_ACTION' });
}

export function onRequest() {
  return json(405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
}
