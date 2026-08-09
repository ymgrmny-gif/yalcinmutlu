'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCertificate, faFilePdf, faGraduationCap, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import type { Language } from '@/data/siteData';

type SecureDocument = {
  document_id: string;
  category: 'cv' | 'diploma' | 'certificate' | 'other';
  title: string;
  description: string;
  can_download: boolean;
};

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
  },
} as const;

export default function DocumentsPage() {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<SecureDocument[]>([]);
  const [language, setLanguage] = useState<Language>('de');

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
    cv: documents.filter((document) => document.category === 'cv'),
    diploma: documents.filter((document) => document.category === 'diploma'),
    certificate: documents.filter((document) => document.category === 'certificate'),
  }), [documents]);

  const t = copy[language];
  if (loading || !allowed) return <main className="documents-loading" aria-live="polite">{t.loading}</main>;

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

      <section className="documents-grid" aria-label={t.title}>
        {cards.map((card) => {
          const items = grouped[card.key];
          return (
            <article className="document-placeholder" key={card.key}>
              <FontAwesomeIcon icon={card.icon} />
              <h2>{card.title}</h2>
              {items.length === 0 ? (
                <p>{t.pending}</p>
              ) : (
                <div>
                  {items.map((document) => (
                    <div key={document.document_id}>
                      <strong>{document.title}</strong>
                      {document.description ? <p>{document.description}</p> : null}
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
