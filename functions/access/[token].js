const GUEST_EDGE_URL = 'https://fxpcmlkmkwiwocvrhpvj.supabase.co/functions/v1/yalcinmutlu-guest-access';
const VIEWER_COOKIE = 'ym_secure_documents_session';
const GUEST_COOKIE = 'ym_guest_documents_session';

function genericError(status = 404) {
  return new Response(`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Zugriff nicht verfügbar</title><style>body{font-family:system-ui,-apple-system,sans-serif;margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f8fa;color:#172033}main{max-width:34rem;margin:2rem;padding:2rem;border:1px solid #e5e7eb;border-radius:18px;background:#fff;box-shadow:0 14px 40px rgba(15,23,42,.08)}h1{font-size:1.35rem;margin:0 0 .75rem}p{line-height:1.6;margin:0;color:#526174}a{display:inline-block;margin-top:1.25rem;color:#1d4ed8;text-decoration:none}</style></head><body><main><h1>Zugriff nicht verfügbar</h1><p>Dieser Zugriffslink ist ungültig oder nicht mehr aktiv.</p><a href="/">Zur Website</a></main></body></html>`, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Referrer-Policy': 'no-referrer',
      'X-Frame-Options': 'DENY',
    },
  });
}

function clearCookie(name, sameSite = 'Strict') {
  return `${name}=; Path=/api/documents; HttpOnly; Secure; SameSite=${sameSite}; Max-Age=0`;
}

export async function onRequestGet({ request, params }) {
  const rawToken = typeof params?.token === 'string' ? params.token : '';
  if (!/^[A-Za-z0-9_-]{43}$/.test(rawToken)) return genericError();

  const requestUrl = new URL(request.url);
  let upstream;
  try {
    upstream = await fetch(GUEST_EDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: requestUrl.origin,
      },
      body: JSON.stringify({ action: 'exchange', token: rawToken }),
    });
  } catch {
    return genericError(503);
  }

  const body = await upstream.json().catch(() => null);
  if (!upstream.ok || !body?.ok || typeof body?.sessionToken !== 'string') {
    return genericError(upstream.status >= 500 ? 503 : 404);
  }

  const expiresAt = Date.parse(body.expiresAt || '');
  const maxAge = Number.isFinite(expiresAt)
    ? Math.max(60, Math.min(7200, Math.floor((expiresAt - Date.now()) / 1000)))
    : 7200;

  const headers = new Headers({
    Location: '/documents/',
    'Cache-Control': 'no-store, max-age=0',
    Pragma: 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    'Referrer-Policy': 'no-referrer',
  });
  headers.append('Set-Cookie', `${GUEST_COOKIE}=${encodeURIComponent(body.sessionToken)}; Path=/api/documents; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`);
  headers.append('Set-Cookie', clearCookie(VIEWER_COOKIE, 'Strict'));

  return new Response(null, { status: 302, headers });
}

export function onRequest() {
  return genericError(405);
}
