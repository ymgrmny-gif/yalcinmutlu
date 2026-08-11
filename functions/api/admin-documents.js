const ADMIN_EDGE_URL = 'https://fxpcmlkmkwiwocvrhpvj.supabase.co/functions/v1/yalcinmutlu-admin';
const GUEST_EDGE_URL = 'https://fxpcmlkmkwiwocvrhpvj.supabase.co/functions/v1/yalcinmutlu-guest-access';
const COOKIE_NAME = 'ym_admin_documents_session';

function json(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
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
  return `${COOKIE_NAME}=; Path=/api/admin-documents; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

async function callJson(url, origin, body, token = '') {
  const headers = { 'Content-Type': 'application/json', Origin: origin };
  if (token) headers['x-admin-session'] = token;
  return fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
}

export async function onRequestPost({ request }) {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');
  if (!origin || origin !== url.origin) return json(403, { ok:false, code:'ORIGIN_REJECTED' });

  const token = cookieValue(request.headers.get('Cookie'), COOKIE_NAME);
  const contentType = request.headers.get('Content-Type') || '';

  if (contentType.toLowerCase().includes('multipart/form-data')) {
    if (!token) return json(401, { ok:false, code:'ADMIN_SESSION_REQUIRED' });
    const contentLength = Number(request.headers.get('Content-Length') || '0');
    if (contentLength > 22 * 1024 * 1024) return json(413, { ok:false, code:'PAYLOAD_TOO_LARGE' });
    const form = await request.formData();
    const upstream = await fetch(ADMIN_EDGE_URL, {
      method:'POST', headers:{ Origin:origin, 'x-admin-session':token }, body:form,
    });
    const body = await upstream.json().catch(() => ({ ok:false, code:'UPSTREAM_ERROR' }));
    return json(upstream.status, body);
  }

  if (!contentType.toLowerCase().includes('application/json')) return json(415, { ok:false, code:'INVALID_CONTENT_TYPE' });
  let input;
  try { input = await request.json(); } catch { return json(400, { ok:false, code:'INVALID_JSON' }); }
  const action = String(input.action || '');

  if (action === 'login') {
    const password = typeof input.password === 'string' ? input.password : '';
    if (!password || password.length > 200) return json(422, { ok:false, code:'INVALID_CREDENTIALS' });
    const upstream = await callJson(ADMIN_EDGE_URL, origin, { action:'login', password });
    const body = await upstream.json().catch(() => ({ ok:false, code:'UPSTREAM_ERROR' }));
    if (!upstream.ok || !body?.sessionToken) return json(401, { ok:false, code:'INVALID_CREDENTIALS' });
    const expiresAt = Date.parse(body.expiresAt || '');
    const maxAge = Number.isFinite(expiresAt) ? Math.max(60, Math.min(28800, Math.floor((expiresAt-Date.now())/1000))) : 28800;
    return json(200, { ok:true, displayName:body.displayName || null, expiresAt:body.expiresAt || null }, {
      'Set-Cookie': `${COOKIE_NAME}=${encodeURIComponent(body.sessionToken)}; Path=/api/admin-documents; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`,
    });
  }

  if (!token) {
    if (action === 'logout') return json(200, { ok:true }, { 'Set-Cookie':clearCookie() });
    return json(401, { ok:false, code:'ADMIN_SESSION_REQUIRED' });
  }

  const guestActions = new Set(['guestLinks','createGuestLink','revokeGuestLink']);
  if (guestActions.has(action)) {
    const upstream = await callJson(GUEST_EDGE_URL, origin, input, token);
    const body = await upstream.json().catch(() => ({ ok:false, code:'UPSTREAM_ERROR' }));
    if (upstream.status === 401) return json(401, body, { 'Set-Cookie':clearCookie() });
    return json(upstream.status, body);
  }

  const allowed = new Set(['session','dashboard','changePassword','createUser','toggleUser','resetUserPassword','setPermission','toggleDocument','documentUrl','deleteDocument','logout']);
  if (!allowed.has(action)) return json(400, { ok:false, code:'UNKNOWN_ACTION' });

  const upstream = await callJson(ADMIN_EDGE_URL, origin, input, token);
  const body = await upstream.json().catch(() => ({ ok:false, code:'UPSTREAM_ERROR' }));
  if (action === 'logout') return json(200, { ok:true }, { 'Set-Cookie':clearCookie() });
  if (upstream.status === 401) return json(401, body, { 'Set-Cookie':clearCookie() });
  return json(upstream.status, body);
}

export function onRequest() {
  return json(405, { ok:false, code:'METHOD_NOT_ALLOWED' });
}
