const LANGUAGES = new Set(['tr', 'en', 'de']);

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

function value(input, maxLength) {
  return typeof input === 'string' ? input.trim().slice(0, maxLength) : '';
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email) && email.length <= 254;
}

function escapeHtml(input) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function sendNotification(env, record) {
  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) {
    return false;
  }

  const textBody = [
    'Yeni portföy iletişim mesajı',
    '',
    `Ad: ${record.name}`,
    `E-posta: ${record.email}`,
    `Konu: ${record.subject}`,
    `Dil: ${record.language}`,
    '',
    record.message,
  ].join('\n');

  const htmlBody = `
    <h2>Yeni portföy iletişim mesajı</h2>
    <p><strong>Ad:</strong> ${escapeHtml(record.name)}</p>
    <p><strong>E-posta:</strong> ${escapeHtml(record.email)}</p>
    <p><strong>Konu:</strong> ${escapeHtml(record.subject)}</p>
    <p><strong>Dil:</strong> ${escapeHtml(record.language)}</p>
    <hr />
    <p style="white-space:pre-wrap">${escapeHtml(record.message)}</p>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      ...(record.id ? { 'Idempotency-Key': `portfolio-contact-${record.id}` } : {}),
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL,
      to: [env.CONTACT_TO_EMAIL],
      reply_to: record.email,
      subject: `Portföy iletişim: ${record.subject}`,
      text: textBody,
      html: htmlBody,
    }),
  });

  return response.ok;
}

async function markNotification(env, id) {
  if (!id) return;
  const baseUrl = env.SUPABASE_URL.replace(/\/$/u, '');
  await fetch(`${baseUrl}/rest/v1/contact_messages?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ email_notified: true }),
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return json(503, { ok: false, code: 'CONFIGURATION_ERROR' });
  }

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

  let input;
  try {
    input = await request.json();
  } catch {
    return json(400, { ok: false, code: 'INVALID_JSON' });
  }

  if (value(input.companyWebsite, 200)) {
    return json(200, { ok: true });
  }

  const startedAt = Number(input.startedAt || 0);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 900) {
    return json(400, { ok: false, code: 'INVALID_SUBMISSION' });
  }

  const name = value(input.name, 120);
  const email = value(input.email, 254).toLowerCase();
  const subject = value(input.subject, 180);
  const message = value(input.message, 5000);
  const language = LANGUAGES.has(input.language) ? input.language : 'tr';

  if (name.length < 2 || !validEmail(email) || subject.length < 2 || message.length < 10) {
    return json(422, { ok: false, code: 'VALIDATION_ERROR' });
  }

  const baseUrl = env.SUPABASE_URL.replace(/\/$/u, '');
  const record = { name, email, subject, message, language, status: 'new', email_notified: false };

  const insertResponse = await fetch(`${baseUrl}/rest/v1/contact_messages?select=id`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(record),
  });

  if (!insertResponse.ok) {
    console.error('Contact insert failed', insertResponse.status, await insertResponse.text());
    return json(502, { ok: false, code: 'DATABASE_ERROR' });
  }

  const rows = await insertResponse.json().catch(() => []);
  const id = Array.isArray(rows) ? rows[0]?.id : undefined;
  const savedRecord = { ...record, id };

  try {
    const notified = await sendNotification(env, savedRecord);
    if (notified && id) {
      context.waitUntil(markNotification(env, id));
    }
  } catch (error) {
    console.error('Contact notification failed', error);
  }

  return json(201, { ok: true });
}

export function onRequest() {
  return json(405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
}
