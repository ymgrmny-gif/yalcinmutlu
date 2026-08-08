'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCertificate, faFilePdf, faGraduationCap, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import type { Language } from '@/data/siteData';

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
    pending: 'Belge henüz eklenmedi',
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
    pending: 'No document added yet',
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
    pending: 'Noch kein Dokument hinterlegt',
  },
} as const;

export default function DocumentsPage() {
  const [allowed, setAllowed] = useState(false);
  const [language, setLanguage] = useState<Language>('tr');

  useEffect(() => {
    const saved = window.sessionStorage.getItem('ym-language') as Language | null;
    if (saved === 'de' || saved === 'en' || saved === 'tr') setLanguage(saved);
    if (window.sessionStorage.getItem('ym-doc-preview') === '1') {
      setAllowed(true);
      return;
    }
    window.location.replace('/#profile');
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy[language].pageTitle;
    window.sessionStorage.setItem('ym-language', language);
  }, [language]);

  if (!allowed) return <main className="documents-loading" aria-live="polite">...</main>;

  const t = copy[language];
  const cards = [
    { title: t.cv, icon: faFilePdf },
    { title: t.diploma, icon: faGraduationCap },
    { title: t.certificate, icon: faCertificate },
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
        {cards.map((card) => (
          <article className="document-placeholder" key={card.title}>
            <FontAwesomeIcon icon={card.icon} />
            <h2>{card.title}</h2>
            <p>{t.pending}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
