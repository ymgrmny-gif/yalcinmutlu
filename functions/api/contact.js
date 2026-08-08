const CONTACT_EDGE_URL = 'https://fxpcmlkmkwiwocvrhpvj.supabase.co/functions/v1/yalcinmutlu-contact';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
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
  if (contentLength > 16_000) {
    return json(413, { ok: false, code: 'PAYLOAD_TOO_LARGE' });
  }

  const body = await request.text();

  let upstream;
  try {
    upstream = await fetch(CONTACT_EDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
      },
      body,
    });
  } catch (error) {
    console.error('Contact Edge Function unavailable', error);
    return json(502, { ok: false, code: 'UPSTREAM_ERROR' });
  }

  const responseBody = await upstream.text();
  return new Response(responseBody, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') || 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export function onRequest() {
  return json(405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
}
