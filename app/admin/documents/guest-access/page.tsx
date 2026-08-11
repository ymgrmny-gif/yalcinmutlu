'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCheck,
  faClipboard,
  faKey,
  faLink,
  faPowerOff,
  faRotate,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import styles from './guest-access.module.css';

type GuestLink = {
  id: string;
  label: string;
  note: string | null;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  lastAccessAt: string | null;
  accessCount: number;
  documentIds: string[];
};

type GuestDocument = {
  id: string;
  category: string;
  titleTr: string;
  titleDe: string;
  titleEn: string;
  isActive: boolean;
};

type GuestData = { links: GuestLink[]; documents: GuestDocument[] };
type Validity = '7' | '30' | '90' | 'never';

async function adminApi(action: string, payload: Record<string, unknown> = {}) {
  const response = await fetch('/api/admin-documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    cache: 'no-store',
    body: JSON.stringify({ action, ...payload }),
  });
  const body = await response.json().catch(() => ({ ok: false, code: 'INVALID_RESPONSE' }));
  if (!response.ok || !body?.ok) {
    const error = new Error(body?.code || 'REQUEST_FAILED') as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return body;
}

function fmtDate(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function expiryFrom(validity: Validity) {
  if (validity === 'never') return null;
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + Number(validity));
  return date.toISOString();
}

function linkState(link: GuestLink) {
  if (link.revokedAt) return { label: 'Deaktiviert', className: styles.off };
  if (link.expiresAt && Date.parse(link.expiresAt) <= Date.now()) return { label: 'Abgelaufen', className: styles.expired };
  return { label: 'Aktiv', className: styles.active };
}

export default function GuestAccessAdminPage() {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<GuestData>({ links: [], documents: [] });
  const [selected, setSelected] = useState<string[]>([]);
  const [validity, setValidity] = useState<Validity>('30');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [createdUrl, setCreatedUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const activeDocuments = useMemo(() => data.documents.filter((doc) => doc.isActive), [data.documents]);
  const documentNames = useMemo(() => new Map(data.documents.map((doc) => [doc.id, doc.titleDe || doc.titleTr || doc.titleEn])), [data.documents]);

  async function load() {
    const result = await adminApi('guestLinks');
    const next = result.data || { links: [], documents: [] };
    setData({
      links: Array.isArray(next.links) ? next.links : [],
      documents: Array.isArray(next.documents) ? next.documents : [],
    });
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await adminApi('session');
        await load();
      } catch (cause) {
        const status = cause instanceof Error && 'status' in cause ? Number((cause as Error & { status?: number }).status) : 0;
        if (status === 401) {
          window.location.replace('/admin/documents/');
          return;
        }
        if (active) setError('Gastzugänge konnten nicht geladen werden.');
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => { active = false; };
  }, []);

  async function createLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setCreatedUrl('');
    setCopied(false);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      if (selected.length < 1) throw new Error('DOCUMENT_REQUIRED');
      const result = await adminApi('createGuestLink', {
        label: String(form.get('label') || '').trim(),
        note: String(form.get('note') || '').trim(),
        expiresAt: expiryFrom(validity),
        documentIds: selected,
      });
      if (typeof result.token !== 'string') throw new Error('TOKEN_MISSING');
      setCreatedUrl(`${window.location.origin}/access/${result.token}`);
      formElement.reset();
      setSelected([]);
      setValidity('30');
      await load();
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : '';
      setError(code === 'DOCUMENT_REQUIRED' ? 'Mindestens ein Dokument auswählen.' : 'Zugriffslink konnte nicht erstellt werden.');
    } finally {
      setBusy(false);
    }
  }

  async function revoke(link: GuestLink) {
    if (link.revokedAt || (link.expiresAt && Date.parse(link.expiresAt) <= Date.now())) return;
    if (!window.confirm(`„${link.label}“ sofort deaktivieren? Bestehende Gast-Sitzungen verlieren ebenfalls den Zugriff.`)) return;
    setBusy(true);
    setError('');
    try {
      await adminApi('revokeGuestLink', { guestLinkId: link.id });
      await load();
    } catch {
      setError('Zugriffslink konnte nicht deaktiviert werden.');
    } finally {
      setBusy(false);
    }
  }

  async function copyCreatedLink() {
    if (!createdUrl) return;
    try {
      await navigator.clipboard.writeText(createdUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Kopieren nicht möglich. Bitte den Link manuell markieren.');
    }
  }

  if (!ready) {
    return <main className={styles.loading}>Gastzugänge werden geladen…</main>;
  }

  return (
    <main className={styles.root}>
      <header className={styles.header}>
        <div>
          <Link href="/admin/documents/" className={styles.back}><FontAwesomeIcon icon={faArrowLeft}/> Zur Dokumentverwaltung</Link>
          <p className={styles.eyebrow}>Secure Documents</p>
          <h1>Gastzugänge & Freigabelinks</h1>
          <p>Passwortlose, widerrufbare Links für Bewerbungen. Jeder Link sieht ausschließlich die hier ausgewählten Dokumente.</p>
        </div>
        <button type="button" className={styles.secondary} onClick={() => void load()} disabled={busy}><FontAwesomeIcon icon={faRotate}/> Aktualisieren</button>
      </header>

      {error ? <div className={styles.error} role="alert">{error}</div> : null}

      <div className={styles.columns}>
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.icon}><FontAwesomeIcon icon={faKey}/></div>
            <div><h2>Neuen Zugriffslink erstellen</h2><p>Der geheime Token wird nur direkt nach der Erstellung angezeigt.</p></div>
          </div>
          <form className={styles.form} onSubmit={createLink}>
            <label className={styles.field}>
              <span>Name / Beschreibung</span>
              <input name="label" required maxLength={160} placeholder="z. B. Transdev Bewerbung August 2026"/>
            </label>

            <label className={styles.field}>
              <span>Gültigkeit</span>
              <select value={validity} onChange={(event) => setValidity(event.target.value as Validity)}>
                <option value="7">7 Tage</option>
                <option value="30">30 Tage</option>
                <option value="90">90 Tage</option>
                <option value="never">Unbefristet</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Notiz (optional)</span>
              <textarea name="note" maxLength={1000} rows={3} placeholder="Interne Notiz, nicht für den Gast sichtbar"/>
            </label>

            <fieldset className={styles.documents}>
              <legend>Freizugebende Dokumente</legend>
              {activeDocuments.map((doc) => (
                <label key={doc.id} className={styles.documentOption}>
                  <input
                    type="checkbox"
                    checked={selected.includes(doc.id)}
                    onChange={(event) => setSelected((current) => event.target.checked ? [...current, doc.id] : current.filter((id) => id !== doc.id))}
                  />
                  <span><strong>{doc.titleDe || doc.titleTr || doc.titleEn}</strong><small>{doc.category}</small></span>
                </label>
              ))}
              {activeDocuments.length === 0 ? <p className={styles.empty}>Keine aktiven Dokumente vorhanden.</p> : null}
            </fieldset>

            <button className={styles.primary} disabled={busy || selected.length === 0}>
              <FontAwesomeIcon icon={faLink}/>{busy ? 'Wird erstellt…' : 'Zugriffslink erstellen'}
            </button>
          </form>

          {createdUrl ? (
            <div className={styles.created} role="status">
              <div><FontAwesomeIcon icon={faShieldHalved}/><strong>Link wurde erstellt</strong></div>
              <p>Aus Sicherheitsgründen wird der vollständige Link nur jetzt angezeigt. Der Roh-Token wird nicht in der Datenbank gespeichert.</p>
              <div className={styles.copyRow}>
                <input value={createdUrl} readOnly onFocus={(event) => event.currentTarget.select()}/>
                <button type="button" onClick={() => void copyCreatedLink()}><FontAwesomeIcon icon={copied ? faCheck : faClipboard}/>{copied ? 'Kopiert' : 'Kopieren'}</button>
              </div>
            </div>
          ) : null}
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.icon}><FontAwesomeIcon icon={faLink}/></div>
            <div><h2>Freigabelinks</h2><p>{data.links.length} Link{data.links.length === 1 ? '' : 's'} gespeichert</p></div>
          </div>
          <div className={styles.linkList}>
            {data.links.map((link) => {
              const state = linkState(link);
              return (
                <article key={link.id} className={styles.linkItem}>
                  <div className={styles.linkTop}>
                    <div><strong>{link.label}</strong><span className={`${styles.status} ${state.className}`}>{state.label}</span></div>
                    {!link.revokedAt && state.label === 'Aktiv' ? (
                      <button type="button" className={styles.revoke} onClick={() => void revoke(link)} disabled={busy}><FontAwesomeIcon icon={faPowerOff}/> Deaktivieren</button>
                    ) : null}
                  </div>
                  {link.note ? <p className={styles.note}>{link.note}</p> : null}
                  <dl className={styles.meta}>
                    <div><dt>Erstellt</dt><dd>{fmtDate(link.createdAt)}</dd></div>
                    <div><dt>Läuft ab</dt><dd>{link.expiresAt ? fmtDate(link.expiresAt) : 'Unbefristet'}</dd></div>
                    <div><dt>Letzter Zugriff</dt><dd>{fmtDate(link.lastAccessAt)}</dd></div>
                    <div><dt>Aufrufe</dt><dd>{Number(link.accessCount) || 0}</dd></div>
                  </dl>
                  <div className={styles.allowedDocs}>
                    {link.documentIds.map((id) => <span key={id}>{documentNames.get(id) || 'Dokument'}</span>)}
                  </div>
                </article>
              );
            })}
            {data.links.length === 0 ? <div className={styles.empty}>Noch keine Gastzugänge erstellt.</div> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
