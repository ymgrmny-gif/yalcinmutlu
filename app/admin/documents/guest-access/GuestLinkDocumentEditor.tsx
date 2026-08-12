'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPen, faXmark } from '@fortawesome/free-solid-svg-icons';
import styles from './guest-access.module.css';

type Language = 'tr' | 'de' | 'en';

type GuestDocument = {
  id: string;
  category: string;
  titleTr: string;
  titleDe: string;
  titleEn: string;
  isActive: boolean;
};

type GuestLink = {
  id: string;
  label: string;
  note: string | null;
  expiresAt: string | null;
  documentIds: string[];
};

type Props = {
  linkId: string;
  documentIds: string[];
  documents: GuestDocument[];
  language: Language;
  active: boolean;
  disabled?: boolean;
  onUpdated: () => Promise<void>;
};

const copy = {
  tr: {
    edit: 'Linki düzenle', title: 'Paylaşım linkini düzenle', name: 'Ad / Açıklama', note: 'Not', expiry: 'Bitiş tarihi', never: 'Süresiz', documents: 'Bu linkin göreceği belgeler', save: 'Kaydet', saving: 'Kaydediliyor…', cancel: 'İptal', select: 'En az bir belge seç.', error: 'Paylaşım linki güncellenemedi.', loadError: 'Link bilgileri yüklenemedi.', empty: 'Aktif belge bulunmuyor.', invalidExpiry: 'Bitiş tarihi gelecekte olmalı.',
  },
  de: {
    edit: 'Link bearbeiten', title: 'Freigabelink bearbeiten', name: 'Name / Beschreibung', note: 'Notiz', expiry: 'Ablaufdatum', never: 'Unbefristet', documents: 'Dokumente für diesen Link', save: 'Speichern', saving: 'Wird gespeichert…', cancel: 'Abbrechen', select: 'Mindestens ein Dokument auswählen.', error: 'Freigabelink konnte nicht aktualisiert werden.', loadError: 'Linkdaten konnten nicht geladen werden.', empty: 'Keine aktiven Dokumente vorhanden.', invalidExpiry: 'Das Ablaufdatum muss in der Zukunft liegen.',
  },
  en: {
    edit: 'Edit link', title: 'Edit share link', name: 'Name / Description', note: 'Note', expiry: 'Expiry date', never: 'No expiry', documents: 'Documents visible through this link', save: 'Save', saving: 'Saving…', cancel: 'Cancel', select: 'Select at least one document.', error: 'Share link could not be updated.', loadError: 'Link details could not be loaded.', empty: 'No active documents available.', invalidExpiry: 'The expiry date must be in the future.',
  },
} as const;

function documentTitle(doc: GuestDocument, language: Language) {
  if (language === 'tr') return doc.titleTr || doc.titleDe || doc.titleEn;
  if (language === 'en') return doc.titleEn || doc.titleDe || doc.titleTr;
  return doc.titleDe || doc.titleTr || doc.titleEn;
}

function localDateTime(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

async function adminRequest(action: string, payload: Record<string, unknown> = {}) {
  const response = await fetch('/api/admin-documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    cache: 'no-store',
    body: JSON.stringify({ action, ...payload }),
  });
  const body = await response.json().catch(() => ({ ok: false, code: 'INVALID_RESPONSE' }));
  if (!response.ok || !body?.ok) throw new Error(body?.code || 'REQUEST_FAILED');
  return body;
}

export default function GuestLinkDocumentEditor({
  linkId,
  documentIds,
  documents,
  language,
  active,
  disabled = false,
  onUpdated,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [label, setLabel] = useState('');
  const [note, setNote] = useState('');
  const [noExpiry, setNoExpiry] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const t = copy[language];
  const activeDocuments = documents.filter((doc) => doc.isActive);

  async function openEditor() {
    setLoading(true);
    setError('');
    try {
      const result = await adminRequest('guestLinks');
      const links = Array.isArray(result?.data?.links) ? result.data.links as GuestLink[] : [];
      const current = links.find((item) => item.id === linkId);
      if (!current) throw new Error('NOT_FOUND');
      const activeIds = new Set(activeDocuments.map((doc) => doc.id));
      setSelected((current.documentIds || documentIds).filter((id) => activeIds.has(id)));
      setLabel(current.label || '');
      setNote(current.note || '');
      setNoExpiry(!current.expiresAt);
      setExpiresAt(localDateTime(current.expiresAt));
      setEditing(true);
    } catch {
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  }

  function cancel() {
    if (saving) return;
    setEditing(false);
    setSelected([]);
    setError('');
  }

  async function save() {
    if (!label.trim()) return;
    if (selected.length < 1) {
      setError(t.select);
      return;
    }

    let expiry: string | null = null;
    if (!noExpiry) {
      const parsed = Date.parse(expiresAt);
      if (!expiresAt || !Number.isFinite(parsed) || parsed <= Date.now()) {
        setError(t.invalidExpiry);
        return;
      }
      expiry = new Date(parsed).toISOString();
    }

    setSaving(true);
    setError('');
    try {
      await adminRequest('updateGuestLink', {
        guestLinkId: linkId,
        label: label.trim(),
        note: note.trim(),
        expiresAt: expiry,
        documentIds: selected,
      });
      await onUpdated();
      setEditing(false);
      setSelected([]);
    } catch {
      setError(t.error);
    } finally {
      setSaving(false);
    }
  }

  if (!active) return null;

  if (!editing) {
    return (
      <div style={{ marginTop: '.8rem' }}>
        <button type="button" className={styles.secondary} style={{ padding: '.5rem .7rem', fontSize: '.72rem' }} onClick={() => void openEditor()} disabled={disabled || loading}>
          <FontAwesomeIcon icon={faPen}/>{loading ? '…' : t.edit}
        </button>
        {error ? <p className={styles.error} style={{ margin: '.6rem 0 0' }}>{error}</p> : null}
      </div>
    );
  }

  return (
    <div style={{ marginTop: '.85rem' }}>
      <div className={styles.form}>
        <label className={styles.field}>
          <span>{t.name}</span>
          <input value={label} maxLength={160} disabled={saving} onChange={(event) => setLabel(event.target.value)} />
        </label>
        <label className={styles.field}>
          <span>{t.note}</span>
          <textarea value={note} maxLength={1000} rows={2} disabled={saving} onChange={(event) => setNote(event.target.value)} />
        </label>
        <label className={styles.documentOption}>
          <input type="checkbox" checked={noExpiry} disabled={saving} onChange={(event) => setNoExpiry(event.target.checked)} />
          <span><strong>{t.never}</strong></span>
        </label>
        {!noExpiry ? (
          <label className={styles.field}>
            <span>{t.expiry}</span>
            <input type="datetime-local" value={expiresAt} disabled={saving} onChange={(event) => setExpiresAt(event.target.value)} />
          </label>
        ) : null}
      </div>

      <fieldset className={styles.documents} style={{ marginTop: '.8rem' }}>
        <legend>{t.documents}</legend>
        {activeDocuments.map((doc) => (
          <label key={doc.id} className={styles.documentOption}>
            <input
              type="checkbox"
              checked={selected.includes(doc.id)}
              disabled={saving}
              onChange={(event) => setSelected((current) => event.target.checked ? [...current, doc.id] : current.filter((id) => id !== doc.id))}
            />
            <span><strong>{documentTitle(doc, language)}</strong><small>{doc.category}</small></span>
          </label>
        ))}
        {activeDocuments.length === 0 ? <p className={styles.empty}>{t.empty}</p> : null}
      </fieldset>

      {error ? <p className={styles.error} style={{ margin: '.7rem 0 0' }}>{error}</p> : null}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.55rem', marginTop: '.75rem' }}>
        <button type="button" className={styles.primary} onClick={() => void save()} disabled={saving || selected.length === 0 || !label.trim()}>
          <FontAwesomeIcon icon={faCheck}/>{saving ? t.saving : t.save}
        </button>
        <button type="button" className={styles.secondary} onClick={cancel} disabled={saving}>
          <FontAwesomeIcon icon={faXmark}/>{t.cancel}
        </button>
      </div>
    </div>
  );
}
