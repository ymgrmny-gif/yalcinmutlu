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
    edit: 'Belgeleri düzenle',
    title: 'Bu linkin göreceği belgeler',
    save: 'Kaydet',
    saving: 'Kaydediliyor…',
    cancel: 'İptal',
    select: 'En az bir belge seç.',
    error: 'Belge izinleri güncellenemedi.',
    empty: 'Aktif belge bulunmuyor.',
  },
  de: {
    edit: 'Dokumente bearbeiten',
    title: 'Dokumente für diesen Link',
    save: 'Speichern',
    saving: 'Wird gespeichert…',
    cancel: 'Abbrechen',
    select: 'Mindestens ein Dokument auswählen.',
    error: 'Dokumentfreigaben konnten nicht aktualisiert werden.',
    empty: 'Keine aktiven Dokumente vorhanden.',
  },
  en: {
    edit: 'Edit documents',
    title: 'Documents visible through this link',
    save: 'Save',
    saving: 'Saving…',
    cancel: 'Cancel',
    select: 'Select at least one document.',
    error: 'Document access could not be updated.',
    empty: 'No active documents available.',
  },
} as const;

function documentTitle(doc: GuestDocument, language: Language) {
  if (language === 'tr') return doc.titleTr || doc.titleDe || doc.titleEn;
  if (language === 'en') return doc.titleEn || doc.titleDe || doc.titleTr;
  return doc.titleDe || doc.titleTr || doc.titleEn;
}

async function updateGuestLink(linkId: string, documentIds: string[]) {
  const response = await fetch('/api/admin-documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    cache: 'no-store',
    body: JSON.stringify({ action: 'updateGuestLink', guestLinkId: linkId, documentIds }),
  });
  const body = await response.json().catch(() => ({ ok: false, code: 'INVALID_RESPONSE' }));
  if (!response.ok || !body?.ok) throw new Error(body?.code || 'REQUEST_FAILED');
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const t = copy[language];
  const activeDocuments = documents.filter((doc) => doc.isActive);

  function openEditor() {
    const activeIds = new Set(activeDocuments.map((doc) => doc.id));
    setSelected(documentIds.filter((id) => activeIds.has(id)));
    setError('');
    setEditing(true);
  }

  function cancel() {
    if (saving) return;
    setEditing(false);
    setSelected([]);
    setError('');
  }

  async function save() {
    if (selected.length < 1) {
      setError(t.select);
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateGuestLink(linkId, selected);
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
      <button
        type="button"
        className={styles.secondary}
        style={{ marginTop: '.8rem', padding: '.5rem .7rem', fontSize: '.72rem' }}
        onClick={openEditor}
        disabled={disabled}
      >
        <FontAwesomeIcon icon={faPen}/>{t.edit}
      </button>
    );
  }

  return (
    <div style={{ marginTop: '.85rem' }}>
      <fieldset className={styles.documents}>
        <legend>{t.title}</legend>
        {activeDocuments.map((doc) => (
          <label key={doc.id} className={styles.documentOption}>
            <input
              type="checkbox"
              checked={selected.includes(doc.id)}
              disabled={saving}
              onChange={(event) => setSelected((current) => (
                event.target.checked
                  ? [...current, doc.id]
                  : current.filter((id) => id !== doc.id)
              ))}
            />
            <span><strong>{documentTitle(doc, language)}</strong><small>{doc.category}</small></span>
          </label>
        ))}
        {activeDocuments.length === 0 ? <p className={styles.empty}>{t.empty}</p> : null}
      </fieldset>

      {error ? <p className={styles.error} style={{ margin: '.7rem 0 0' }}>{error}</p> : null}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.55rem', marginTop: '.75rem' }}>
        <button
          type="button"
          className={styles.primary}
          onClick={() => void save()}
          disabled={saving || selected.length === 0}
        >
          <FontAwesomeIcon icon={faCheck}/>{saving ? t.saving : t.save}
        </button>
        <button type="button" className={styles.secondary} onClick={cancel} disabled={saving}>
          <FontAwesomeIcon icon={faXmark}/>{t.cancel}
        </button>
      </div>
    </div>
  );
}
