const GUEST_EDGE_URL = 'https://fxpcmlkmkwiwocvrhpvj.supabase.co/functions/v1/yalcinmutlu-guest-access';
const GUEST_COOKIE = 'ym_guest_documents_session';

function json(status, body, extraHeaders = {}, cookies = []) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, max-age=0',
    Pragma: 'no-cache',
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

function clearCookie() {
  return `${GUEST_COOKIE}=; Path=/api/documents; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

async function callEdge(origin, body) {
  return fetch(GUEST_EDGE_URL, {
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
    return json(410, { ok: false, code: 'PASSWORD_ACCESS_RETIRED' });
  }

  const token = cookieValue(request.headers.get('Cookie'), GUEST_COOKIE);
  if (!token) {
    if (action === 'logout') return json(200, { ok: true }, {}, [clearCookie()]);
    return json(401, { ok: false, code: 'SESSION_REQUIRED' });
  }

  if (action === 'session') {
    const upstream = await callEdge(origin, { action: 'session', token });
    const body = await upstream.json().catch(() => ({ ok: false }));
    if (!upstream.ok || !body?.ok) {
      return json(401, { ok: false, code: 'SESSION_EXPIRED' }, {}, [clearCookie()]);
    }
    return json(200, {
      ok: true,
      displayName: body.label || null,
      expiresAt: body.expiresAt || null,
      sessionType: 'guest',
    });
  }

  if (action === 'list') {
    const language = ['tr', 'en', 'de'].includes(String(input.language)) ? String(input.language) : 'de';
    const upstream = await callEdge(origin, { action: 'list', token, language });
    const body = await upstream.json().catch(() => ({ ok: false, documents: [] }));
    if (!upstream.ok || !body?.ok) {
      return json(401, { ok: false, code: 'SESSION_EXPIRED' }, {}, [clearCookie()]);
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
        return json(401, { ok: false, code: 'SESSION_EXPIRED' }, {}, [clearCookie()]);
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
      console.error('Guest document logout failed', error);
    }
    return json(200, { ok: true }, {}, [clearCookie()]);
  }

  return json(400, { ok: false, code: 'UNKNOWN_ACTION' });
}

export function onRequest() {
  return json(405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
}
