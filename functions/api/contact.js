const CONTACT_EDGE_URL = 'https://fxpcmlkmkwiwocvrhpvj.supabase.co/functions/v1/yalcinmutlu-contact';
const RATE_BUCKETS = new Map();

function json(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
}

function clientAddress(request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() || 'unknown';
}

function isRateLimited(request, limit, windowMs) {
  const now = Date.now();
  const key = clientAddress(request);
  const current = RATE_BUCKETS.get(key);
  if (!current || current.resetAt <= now) {
    RATE_BUCKETS.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  current.count += 1;
  if (RATE_BUCKETS.size > 1000) {
    for (const [bucketKey, bucket] of RATE_BUCKETS) {
      if (bucket.resetAt <= now) RATE_BUCKETS.delete(bucketKey);
    }
  }
  return current.count > limit;
}

export async function onRequestPost({ request }) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get('Origin');

  if (!origin || origin !== requestUrl.origin) {
    return json(403, { ok: false, code: 'ORIGIN_REJECTED' });
  }

  if (isRateLimited(request, 5, 10 * 60 * 1000)) {
    return json(429, { ok: false, code: 'RATE_LIMITED' }, { 'Retry-After': '600' });
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
