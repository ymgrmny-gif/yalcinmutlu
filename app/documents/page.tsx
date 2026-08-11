'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCertificate,
  faDownload,
  faEye,
  faFilePdf,
  faGraduationCap,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import type { Language } from '@/data/siteData';

type SecureDocument = {
  document_id: string;
  category: 'cv' | 'diploma' | 'certificate' | 'reference' | 'other';
  title: string;
  description: string;
  can_download: boolean;
};

type ActionMode = 'view' | 'download';

const copy = {
  tr: {
    pageTitle: 'Güvenli Belgeler | Yalçın Mutlu',
    languageSelector: 'Dil seçimi',
    title: 'Güvenli Belge Merkezi',
    subtitle: 'Erişiminize açık CV, diploma ve diğer belgeler burada görüntülenir.',
    back: 'Portföye dön',
    cv: 'Özgeçmiş (CV)',
    diploma: 'Diplomalar',
    certificate: 'Sertifikalar',
    pending: 'Bu kategoride erişiminize açık belge bulunmuyor.',
    loading: 'Güvenli oturum doğrulanıyor…',
    view: 'Görüntüle',
    download: 'İndir',
    opening: 'Açılıyor…',
    downloading: 'Hazırlanıyor…',
    actionError: 'Belge açılamadı. Erişim iznini veya oturum süresini kontrol edin.',
  },
  en: {
    pageTitle: 'Secure Documents | Yalçın Mutlu',
    languageSelector: 'Language selector',
    title: 'Secure Document Center',
    subtitle: 'CVs, diplomas and other documents available to you are shown here.',
    back: 'Back to portfolio',
    cv: 'Curriculum Vitae (CV)',
    diploma: 'Diplomas',
    certificate: 'Certificates',
    pending: 'No document in this category is currently available to your account.',
    loading: 'Verifying secure session…',
    view: 'View',
    download: 'Download',
    opening: 'Opening…',
    downloading: 'Preparing…',
    actionError: 'The document could not be opened. Please check access permissions or session validity.',
  },
  de: {
    pageTitle: 'Sichere Dokumente | Yalçın Mutlu',
    languageSelector: 'Sprachauswahl',
    title: 'Sicheres Dokumentenzentrum',
    subtitle: 'Freigegebene Lebensläufe, Diplome und weitere Dokumente werden hier angezeigt.',
    back: 'Zurück zum Portfolio',
    cv: 'Lebenslauf (CV)',
    diploma: 'Diplome',
    certificate: 'Zertifikate',
    pending: 'Für Ihr Konto ist in dieser Kategorie derzeit kein Dokument freigegeben.',
    loading: 'Sichere Sitzung wird geprüft…',
    view: 'Ansehen',
    download: 'Herunterladen',
    opening: 'Wird geöffnet…',
    downloading: 'Wird vorbereitet…',
    actionError: 'Das Dokument konnte nicht geöffnet werden. Bitte Berechtigung oder Sitzung prüfen.',
  },
} as const;

export default function DocumentsPage() {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<SecureDocument[]>([]);
  const [language, setLanguage] = useState<Language>('de');
  const [actionState, setActionState] = useState<Record<string, ActionMode | undefined>>({});
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const saved = window.sessionStorage.getItem('ym-language') as Language | null;
    if (saved === 'de' || saved === 'en' || saved === 'tr') setLanguage(saved);

    let active = true;
    const verify = async () => {
      try {
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          cache: 'no-store',
          body: JSON.stringify({ action: 'session' }),
        });
        const body = await response.json().catch(() => ({}));
        if (!active) return;
        if (!response.ok || !body?.ok) {
          window.location.replace('/#profile');
          return;
        }
        setAllowed(true);
      } catch {
        if (active) window.location.replace('/#profile');
      } finally {
        if (active) setLoading(false);
      }
    };

    void verify();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy[language].pageTitle;
    window.sessionStorage.setItem('ym-language', language);
    setActionError('');
  }, [language]);

  useEffect(() => {
    if (!allowed) return;
    let active = true;

    const loadDocuments = async () => {
      try {
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          cache: 'no-store',
          body: JSON.stringify({ action: 'list', language }),
        });
        const body = await response.json().catch(() => ({}));
        if (!active) return;
        if (!response.ok || !body?.ok) {
          window.location.replace('/#profile');
          return;
        }
        setDocuments(Array.isArray(body.documents) ? body.documents : []);
      } catch {
        if (active) window.location.replace('/#profile');
      }
    };

    void loadDocuments();
    return () => {
      active = false;
    };
  }, [allowed, language]);

  const grouped = useMemo(() => ({
    cv: documents.filter((item) => item.category === 'cv'),
    diploma: documents.filter((item) => item.category === 'diploma'),
    certificate: documents.filter((item) => item.category === 'certificate'),
  }), [documents]);

  const t = copy[language];

  async function openDocument(item: SecureDocument, mode: ActionMode) {
    if (mode === 'download' && !item.can_download) return;

    setActionError('');
    setActionState((current) => ({ ...current, [item.document_id]: mode }));

    const previewWindow = mode === 'view' ? window.open('about:blank', '_blank') : null;
    if (previewWindow) {
      previewWindow.document.title = t.opening;
      previewWindow.opener = null;
    }

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store',
        body: JSON.stringify({ action: 'url', documentId: item.document_id, mode }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok || !body?.ok || typeof body?.url !== 'string') {
        if (response.status === 401) {
          previewWindow?.close();
          window.location.replace('/#profile');
          return;
        }
        throw new Error(body?.code || 'DOCUMENT_URL_ERROR');
      }

      if (mode === 'view') {
        if (previewWindow) {
          previewWindow.location.replace(body.url);
        } else {
          window.open(body.url, '_blank', 'noopener,noreferrer');
        }
      } else {
        const anchor = document.createElement('a');
        anchor.href = body.url;
        anchor.rel = 'noopener noreferrer';
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      }
    } catch {
      previewWindow?.close();
      setActionError(t.actionError);
    } finally {
      setActionState((current) => ({ ...current, [item.document_id]: undefined }));
    }
  }

  if (loading || !allowed) {
    return <main className="documents-loading" aria-live="polite">{t.loading}</main>;
  }

  const cards = [
    { key: 'cv' as const, title: t.cv, icon: faFilePdf },
    { key: 'diploma' as const, title: t.diploma, icon: faGraduationCap },
    { key: 'certificate' as const, title: t.certificate, icon: faCertificate },
  ];

  return (
    <main className="documents-page">
      <header className="documents-topbar">
        <Link href="/" className="documents-back"><FontAwesomeIcon icon={faArrowLeft} /> {t.back}</Link>
        <div className="language-switcher documents-languages" aria-label={t.languageSelector}>
          {(['de', 'en', 'tr'] as Language[]).map((item) => (
            <button key={item} type="button" className={language === item ? 'active' : ''} onClick={() => setLanguage(item)}>
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <section className="documents-hero">
        <div className="documents-shield"><FontAwesomeIcon icon={faShieldHalved} /></div>
        <div>
          <p className="eyebrow">Yalçın Mutlu</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </section>

      {actionError ? <div className="secure-document-error" role="alert">{actionError}</div> : null}

      <section className="documents-grid" aria-label={t.title}>
        {cards.map((card) => {
          const items = grouped[card.key];
          return (
            <article className="document-placeholder secure-document-card" key={card.key}>
              <FontAwesomeIcon icon={card.icon} />
              <h2>{card.title}</h2>
              {items.length === 0 ? (
                <p>{t.pending}</p>
              ) : (
                <div className="secure-document-list">
                  {items.map((item) => {
                    const busyMode = actionState[item.document_id];
                    return (
                      <div className="secure-document-item" key={item.document_id}>
                        <strong>{item.title}</strong>
                        {item.description ? <p>{item.description}</p> : null}
                        <div className="secure-document-actions">
                          <button
                            type="button"
                            className="secure-document-action primary"
                            disabled={Boolean(busyMode)}
                            aria-busy={busyMode === 'view'}
                            onClick={() => void openDocument(item, 'view')}
                          >
                            <FontAwesomeIcon icon={faEye} />
                            {busyMode === 'view' ? t.opening : t.view}
                          </button>
                          {item.can_download ? (
                            <button
                              type="button"
                              className="secure-document-action secondary"
                              disabled={Boolean(busyMode)}
                              aria-busy={busyMode === 'download'}
                              onClick={() => void openDocument(item, 'download')}
                            >
                              <FontAwesomeIcon icon={faDownload} />
                              {busyMode === 'download' ? t.downloading : t.download}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
