import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

test('access route exchanges a strong URL token and removes it by redirect', () => {
  const source = read('functions/access/[token].js');
  assert.match(source, /\^\[A-Za-z0-9_-\]\{43\}\$/);
  assert.match(source, /action:\s*'exchange'/);
  assert.match(source, /Location:\s*'\/documents\/'/);
  assert.match(source, /HttpOnly; Secure; SameSite=Lax/);
  assert.match(source, /Referrer-Policy': 'no-referrer'/);
  assert.match(source, /RATE_BUCKETS/);
});

test('document API accepts only guest sessions and retires password login', () => {
  const source = read('functions/api/documents.js');
  assert.match(source, /PASSWORD_ACCESS_RETIRED/);
  assert.doesNotMatch(source, /yalcinmutlu-documents/);
  assert.match(source, /ym_guest_documents_session/);
  assert.match(source, /sessionType:\s*'guest'/);
  assert.match(source, /DOCUMENT_FORBIDDEN/);
  assert.doesNotMatch(source, /ym_secure_documents_session/);
});

test('admin API accepts guest-link actions only with the admin cookie path', () => {
  const source = read('functions/api/admin-documents.js');
  assert.match(source, /ym_admin_documents_session/);
  assert.match(source, /guestLinks/);
  assert.match(source, /createGuestLink/);
  assert.match(source, /revokeGuestLink/);
  assert.match(source, /updateGuestLink/);
  assert.match(source, /x-admin-session/);
  assert.match(source, /LEGACY_ACCESS_RETIRED/);
  assert.doesNotMatch(source, /ym_guest_documents_session/);
});

test('guest Edge function generates random tokens, hashes them and revalidates sessions', () => {
  const source = read('supabase/functions/yalcinmutlu-guest-access/index.ts');
  assert.match(source, /new Uint8Array\(32\)/);
  assert.match(source, /crypto\.getRandomValues/);
  assert.match(source, /crypto\.subtle\.digest\('SHA-256'/);
  assert.match(source, /yalcinmutlu_guest_session/);
  assert.match(source, /yalcinmutlu_guest_document_access/);
  assert.match(source, /yalcinmutlu_admin_update_guest_link/);
  assert.match(source, /validateAdmin/);
});

test('migration stores only token hashes and revokes active guest sessions', () => {
  const source = read('supabase/migrations/20260811205814_guest_access_links.sql');
  assert.match(source, /token_hash text not null unique/);
  assert.doesNotMatch(source, /\braw_token\b/);
  assert.doesNotMatch(source, /\btoken text\b/);
  assert.match(source, /guest_access_documents/);
  assert.match(source, /guest_sessions[\s\S]*revoked_at/);
  assert.match(source, /update yalcinmutlu\.guest_sessions[\s\S]*revoked_at = coalesce/);
  assert.match(source, /l\.revoked_at is null/);
  assert.match(source, /grant execute[\s\S]*to service_role/);
  assert.match(source, /revoke all[\s\S]*from public, anon, authenticated/);
});

test('guest-link updates change metadata and permissions without rotating the link token', () => {
  const source = read('supabase/migrations/20260812102000_update_guest_link_metadata.sql');
  assert.match(source, /yalcinmutlu_admin_update_guest_link/);
  assert.match(source, /set label = trim\(p_label\)/);
  assert.match(source, /expires_at = p_expires_at/);
  assert.match(source, /delete from yalcinmutlu\.guest_access_documents/);
  assert.match(source, /insert into yalcinmutlu\.guest_access_documents/);
  assert.doesNotMatch(source, /token_hash\s*=/);
});

test('guest document UI is read-only and covers all document categories', () => {
  const source = read('app/documents/page.tsx');
  assert.match(source, /body\.sessionType === 'guest'/);
  assert.match(source, /guestNotice/);
  assert.match(source, /reference:/);
  assert.match(source, /other:/);
  assert.doesNotMatch(source, /deleteDocument|toggleDocument|updateDocument|upload/);
});
