'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faChartLine,
  faCheck,
  faClipboard,
  faFile,
  faGear,
  faKey,
  faLink,
  faPowerOff,
  faRightFromBracket,
  faRotate,
  faShieldHalved,
  faUsers,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import styles from './guest-access.module.css';

type Language = 'tr' | 'de' | 'en';
type Validity = '7' | '30' | '90' | 'never';

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

const copy = {
  tr: {
    title: 'Misafir Erişimi & Paylaşım Linkleri',
    subtitle: 'Başvuru ve belge paylaşımı için şifresiz, iptal edilebilir erişim linkleri oluştur.',
    dashboard: 'Genel Bakış', documents: 'Belgeler', access: 'Erişim Yönetimi', activity: 'Erişim Kayıtları', settings: 'Güvenlik', guest: 'Misafir Linkleri',
    adminSession: 'Yönetici oturumu · 8 saat', logout: 'Çıkış yap', refresh: 'Yenile',
    newTitle: 'Yeni erişim linki oluştur', secretHint: 'Gizli token yalnızca oluşturulduğu anda gösterilir.',
    name: 'Ad / Açıklama', namePlaceholder: 'örn. Transdev başvurusu Ağustos 2026', validity: 'Geçerlilik', note: 'Not (isteğe bağlı)', notePlaceholder: 'Dahili not, misafir göremez',
    documentsTitle: 'Paylaşılacak belgeler', create: 'Erişim linki oluştur', creating: 'Oluşturuluyor…',
    created: 'Link oluşturuldu', createdHint: 'Güvenlik nedeniyle tam link yalnızca şimdi gösterilir. Ham token veritabanında saklanmaz.', copy: 'Kopyala', copied: 'Kopyalandı',
    links: 'Paylaşım linkleri', stored: 'kayıtlı link', none: 'Henüz misafir erişimi oluşturulmadı.',
    active: 'Aktif', disabled: 'Devre dışı', expired: 'Süresi doldu', disable: 'Devre dışı bırak',
    createdAt: 'Oluşturma', expiresAt: 'Bitiş', lastAccess: 'Son erişim', accesses: 'Açılış', never: 'Süresiz',
    loadError: 'Misafir erişimleri yüklenemedi.', createError: 'Erişim linki oluşturulamadı.', revokeError: 'Erişim linki devre dışı bırakılamadı.', copyError: 'Kopyalama başarısız. Linki elle seçebilirsin.', selectDoc: 'En az bir belge seç.', noDocs: 'Aktif belge bulunmuyor.',
    revokeConfirm: 'hemen devre dışı bırakılsın mı? Mevcut misafir oturumları da erişimi kaybeder.',
    days7: '7 gün', days30: '30 gün', days90: '90 gün', unlimited: 'Süresiz', loading: 'Misafir erişimleri yükleniyor…',
  },
  de: {
    title: 'Gastzugänge & Freigabelinks',
    subtitle: 'Passwortlose, widerrufbare Links für Bewerbungen und Dokumentfreigaben erstellen.',
    dashboard: 'Übersicht', documents: 'Dokumente', access: 'Zugriffsverwaltung', activity: 'Zugriffsprotokolle', settings: 'Sicherheit', guest: 'Gastzugänge',
    adminSession: 'Admin-Sitzung · 8 Stunden', logout: 'Abmelden', refresh: 'Aktualisieren',
    newTitle: 'Neuen Zugriffslink erstellen', secretHint: 'Der geheime Token wird nur direkt nach der Erstellung angezeigt.',
    name: 'Name / Beschreibung', namePlaceholder: 'z. B. Transdev Bewerbung August 2026', validity: 'Gültigkeit', note: 'Notiz (optional)', notePlaceholder: 'Interne Notiz, nicht für den Gast sichtbar',
    documentsTitle: 'Freizugebende Dokumente', create: 'Zugriffslink erstellen', creating: 'Wird erstellt…',
    created: 'Link wurde erstellt', createdHint: 'Aus Sicherheitsgründen wird der vollständige Link nur jetzt angezeigt. Der Roh-Token wird nicht in der Datenbank gespeichert.', copy: 'Kopieren', copied: 'Kopiert',
    links: 'Freigabelinks', stored: 'gespeicherte Links', none: 'Noch keine Gastzugänge erstellt.',
    active: 'Aktiv', disabled: 'Deaktiviert', expired: 'Abgelaufen', disable: 'Deaktivieren',
    createdAt: 'Erstellt', expiresAt: 'Läuft ab', lastAccess: 'Letzter Zugriff', accesses: 'Aufrufe', never: 'Unbefristet',
    loadError: 'Gastzugänge konnten nicht geladen werden.', createError: 'Zugriffslink konnte nicht erstellt werden.', revokeError: 'Zugriffslink konnte nicht deaktiviert werden.', copyError: 'Kopieren nicht möglich. Bitte den Link manuell markieren.', selectDoc: 'Mindestens ein Dokument auswählen.', noDocs: 'Keine aktiven Dokumente vorhanden.',
    revokeConfirm: 'sofort deaktivieren? Bestehende Gast-Sitzungen verlieren ebenfalls den Zugriff.',
    days7: '7 Tage', days30: '30 Tage', days90: '90 Tage', unlimited: 'Unbefristet', loading: 'Gastzugänge werden geladen…',
  },
  en: {
    title: 'Guest Access & Share Links',
    subtitle: 'Create passwordless, revocable links for applications and document sharing.',
    dashboard: 'Overview', documents: 'Documents', access: 'Access Management', activity: 'Access Logs', settings: 'Security', guest: 'Guest Access',
    adminSession: 'Admin session · 8 hours', logout: 'Sign out', refresh: 'Refresh',
    newTitle: 'Create a new access link', secretHint: 'The secret token is shown only immediately after creation.',
    name: 'Name / Description', namePlaceholder: 'e.g. Transdev application August 2026', validity: 'Validity', note: 'Note (optional)', notePlaceholder: 'Internal note, not visible to the guest',
    documentsTitle: 'Documents to share', create: 'Create access link', creating: 'Creating…',
    created: 'Link created', createdHint: 'For security, the full link is shown only now. The raw token is not stored in the database.', copy: 'Copy', copied: 'Copied',
    links: 'Share links', stored: 'saved links', none: 'No guest access links have been created yet.',
    active: 'Active', disabled: 'Disabled', expired: 'Expired', disable: 'Disable',
    createdAt: 'Created', expiresAt: 'Expires', lastAccess: 'Last access', accesses: 'Opens', never: 'No expiry',
    loadError: 'Guest access links could not be loaded.', createError: 'The access link could not be created.', revokeError: 'The access link could not be disabled.', copyError: 'Copy failed. Please select the link manually.', selectDoc: 'Select at least one document.', noDocs: 'No active documents available.',
    revokeConfirm: 'now? Existing guest sessions will also lose access.',
    days7: '7 days', days30: '30 days', days90: '90 days', unlimited: 'No expiry', loading: 'Loading guest access…',
  },
} as const;

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

function expiryFrom(validity: Validity) {
  if (validity === 'never') return null;
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + Number(validity));
  return date.toISOString();
}

function documentTitle(doc: GuestDocument, language: Language) {
  if (language === 'tr') return doc.titleTr || doc.titleDe || doc.titleEn;
  if (language === 'en') return doc.titleEn || doc.titleDe || doc.titleTr;
  return doc.titleDe || doc.titleTr || doc.titleEn;
}

export default function GuestAccessAdminPage() {
  const [ready, setReady] = useState(false);
  const [displayName, setDisplayName] = useState('Yalçın Mutlu');
  const [language, setLanguage] = useState<Language>('tr');
  const [data, setData] = useState<GuestData>({ links: [], documents: [] });
  const [selected, setSelected] = useState<string[]>([]);
  const [validity, setValidity] = useState<Validity>('30');
  const [busy, setBusy] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [error, setError] = useState('');
  const [createdUrl, setCreatedUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const t = copy[language];
  const locale = language === 'tr' ? 'tr-TR' : language === 'de' ? 'de-DE' : 'en-GB';
  const activeDocuments = useMemo(() => data.documents.filter((doc) => doc.isActive), [data.documents]);
  const documentNames = useMemo(() => new Map(data.documents.map((doc) => [doc.id, documentTitle(doc, language)])), [data.documents, language]);

  function fmtDate(value: string | null | undefined) {
    if (!value) return '—';
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  }

  function linkState(link: GuestLink) {
    if (link.revokedAt) return { label: t.disabled, className: styles.off };
    if (link.expiresAt && Date.parse(link.expiresAt) <= Date.now()) return { label: t.expired, className: styles.expired };
    return { label: t.active, className: styles.active };
  }

  async function load() {
    const result = await adminApi('guestLinks');
    const next = result.data || { links: [], documents: [] };
    setData({
      links: Array.isArray(next.links) ? next.links : [],
      documents: Array.isArray(next.documents) ? next.documents : [],
    });
  }

  useEffect(() => {
    const saved = window.sessionStorage.getItem('ym-language') as Language | null;
    if (saved === 'tr' || saved === 'de' || saved === 'en') setLanguage(saved);

    let active = true;
    (async () => {
      try {
        const session = await adminApi('session');
        if (active) setDisplayName(session.displayName || 'Yalçın Mutlu');
        await load();
      } catch (cause) {
        const status = cause instanceof Error && 'status' in cause ? Number((cause as Error & { status?: number }).status) : 0;
        if (status === 401) {
          window.location.replace('/admin/documents/');
          return;
        }
        if (active) setError(copy[saved === 'tr' || saved === 'de' || saved === 'en' ? saved : 'tr'].loadError);
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => { active = false; };
  }, []);

  function changeLanguage(next: Language) {
    setLanguage(next);
    window.sessionStorage.setItem('ym-language', next);
    setError('');
  }

  function go(section: 'dashboard' | 'documents' | 'access' | 'activity' | 'settings') {
    window.location.assign(`/admin/documents/#${section}`);
  }

  async function logout() {
    try { await adminApi('logout'); } catch {}
    window.location.replace('/admin/documents/');
  }

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
      setError(code === 'DOCUMENT_REQUIRED' ? t.selectDoc : t.createError);
    } finally {
      setBusy(false);
    }
  }

  async function revoke(link: GuestLink) {
    if (link.revokedAt || (link.expiresAt && Date.parse(link.expiresAt) <= Date.now())) return;
    if (!window.confirm(`“${link.label}” ${t.revokeConfirm}`)) return;
    setBusy(true);
    setError('');
    try {
      await adminApi('revokeGuestLink', { guestLinkId: link.id });
      await load();
    } catch {
      setError(t.revokeError);
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
      setError(t.copyError);
    }
  }

  if (!ready) {
    return <main className="admin-root admin-login-shell"><div className="admin-login-card"><div className="admin-login-mark"><FontAwesomeIcon icon={faShieldHalved}/></div><h1>{t.title}</h1><p>{t.loading}</p></div></main>;
  }

  return (
    <main className="admin-root">
      <div className="admin-app">
        <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
          <div className="admin-brand">
            <div className="admin-brand-mark"><FontAwesomeIcon icon={faShieldHalved}/></div>
            <div><strong>Yalçın Mutlu</strong><span>Secure Documents</span></div>
          </div>
          <nav className="admin-nav">
            <button onClick={() => go('dashboard')}><FontAwesomeIcon icon={faChartLine}/>{t.dashboard}</button>
            <button onClick={() => go('documents')}><FontAwesomeIcon icon={faFile}/>{t.documents}</button>
            <button onClick={() => go('access')}><FontAwesomeIcon icon={faUsers}/>{t.access}</button>
            <button onClick={() => go('activity')}><FontAwesomeIcon icon={faRotate}/>{t.activity}</button>
            <button className="active"><FontAwesomeIcon icon={faLink}/>{t.guest}</button>
            <button onClick={() => go('settings')}><FontAwesomeIcon icon={faGear}/>{t.settings}</button>
          </nav>
          <div className="admin-sidebar-footer">
            <div className="admin-user-chip"><strong>{displayName}</strong><span>{t.adminSession}</span></div>
            <button className="admin-ghost" onClick={() => void logout()}><FontAwesomeIcon icon={faRightFromBracket}/>{t.logout}</button>
          </div>
        </aside>

        <section className="admin-main">
          <header className="admin-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="admin-mobile-menu" onClick={() => setMobileOpen(!mobileOpen)}><FontAwesomeIcon icon={mobileOpen ? faXmark : faBars}/></button>
              <div><h1>{t.title}</h1><p>{t.subtitle}</p></div>
            </div>
            <div className="admin-top-actions" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {(['tr', 'de', 'en'] as Language[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={language === item ? 'admin-primary' : 'admin-secondary'}
                  onClick={() => changeLanguage(item)}
                  style={{ minHeight: '38px', padding: '0 11px' }}
                >
                  {item.toUpperCase()}
                </button>
              ))}
              <button className="admin-secondary" disabled={busy} onClick={() => void load()}><FontAwesomeIcon icon={faRotate}/>{t.refresh}</button>
            </div>
          </header>

          <div className="admin-content">
            {error ? <div className={styles.error} role="alert">{error}</div> : null}
            <div className={styles.columns}>
              <section className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.icon}><FontAwesomeIcon icon={faKey}/></div>
                  <div><h2>{t.newTitle}</h2><p>{t.secretHint}</p></div>
                </div>
                <form className={styles.form} onSubmit={createLink}>
                  <label className={styles.field}>
                    <span>{t.name}</span>
                    <input name="label" required maxLength={160} placeholder={t.namePlaceholder}/>
                  </label>

                  <label className={styles.field}>
                    <span>{t.validity}</span>
                    <select value={validity} onChange={(event) => setValidity(event.target.value as Validity)}>
                      <option value="7">{t.days7}</option>
                      <option value="30">{t.days30}</option>
                      <option value="90">{t.days90}</option>
                      <option value="never">{t.unlimited}</option>
                    </select>
                  </label>

                  <label className={styles.field}>
                    <span>{t.note}</span>
                    <textarea name="note" maxLength={1000} rows={3} placeholder={t.notePlaceholder}/>
                  </label>

                  <fieldset className={styles.documents}>
                    <legend>{t.documentsTitle}</legend>
                    {activeDocuments.map((doc) => (
                      <label key={doc.id} className={styles.documentOption}>
                        <input
                          type="checkbox"
                          checked={selected.includes(doc.id)}
                          onChange={(event) => setSelected((current) => event.target.checked ? [...current, doc.id] : current.filter((id) => id !== doc.id))}
                        />
                        <span><strong>{documentTitle(doc, language)}</strong><small>{doc.category}</small></span>
                      </label>
                    ))}
                    {activeDocuments.length === 0 ? <p className={styles.empty}>{t.noDocs}</p> : null}
                  </fieldset>

                  <button className={styles.primary} disabled={busy || selected.length === 0}>
                    <FontAwesomeIcon icon={faLink}/>{busy ? t.creating : t.create}
                  </button>
                </form>

                {createdUrl ? (
                  <div className={styles.created} role="status">
                    <div><FontAwesomeIcon icon={faShieldHalved}/><strong>{t.created}</strong></div>
                    <p>{t.createdHint}</p>
                    <div className={styles.copyRow}>
                      <input value={createdUrl} readOnly onFocus={(event) => event.currentTarget.select()}/>
                      <button type="button" onClick={() => void copyCreatedLink()}><FontAwesomeIcon icon={copied ? faCheck : faClipboard}/>{copied ? t.copied : t.copy}</button>
                    </div>
                  </div>
                ) : null}
              </section>

              <section className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.icon}><FontAwesomeIcon icon={faLink}/></div>
                  <div><h2>{t.links}</h2><p>{data.links.length} {t.stored}</p></div>
                </div>
                <div className={styles.linkList}>
                  {data.links.map((link) => {
                    const state = linkState(link);
                    return (
                      <article key={link.id} className={styles.linkItem}>
                        <div className={styles.linkTop}>
                          <div><strong>{link.label}</strong><span className={`${styles.status} ${state.className}`}>{state.label}</span></div>
                          {!link.revokedAt && state.label === t.active ? (
                            <button type="button" className={styles.revoke} onClick={() => void revoke(link)} disabled={busy}><FontAwesomeIcon icon={faPowerOff}/>{t.disable}</button>
                          ) : null}
                        </div>
                        {link.note ? <p className={styles.note}>{link.note}</p> : null}
                        <dl className={styles.meta}>
                          <div><dt>{t.createdAt}</dt><dd>{fmtDate(link.createdAt)}</dd></div>
                          <div><dt>{t.expiresAt}</dt><dd>{link.expiresAt ? fmtDate(link.expiresAt) : t.never}</dd></div>
                          <div><dt>{t.lastAccess}</dt><dd>{fmtDate(link.lastAccessAt)}</dd></div>
                          <div><dt>{t.accesses}</dt><dd>{Number(link.accessCount) || 0}</dd></div>
                        </dl>
                        <div className={styles.allowedDocs}>
                          {link.documentIds.map((id) => <span key={id}>{documentNames.get(id) || t.documents}</span>)}
                        </div>
                      </article>
                    );
                  })}
                  {data.links.length === 0 ? <div className={styles.empty}>{t.none}</div> : null}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
