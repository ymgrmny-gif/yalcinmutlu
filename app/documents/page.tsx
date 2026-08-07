'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCertificate, faFilePdf, faGraduationCap, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import type { Language } from '@/data/siteData';

const copy = {
  tr: {
    title: 'Güvenli Belge Merkezi',
    subtitle: 'CV, diploma ve diğer belgeler yönetici paneli ve güvenli erişim altyapısı tamamlandığında burada yayınlanacak.',
    back: 'Portföye dön',
    cv: 'Özgeçmiş (CV)',
    diploma: 'Diplomalar',
    certificate: 'Sertifikalar',
    pending: 'Belge henüz eklenmedi',
    security: 'Bu ekran statik önizlemedir. Gerçek erişim doğrulaması, IP/ülke bilgisi, belge görüntüleme ve indirme olayları Supabase bağlantısından sonra sunucu tarafında kaydedilecektir.',
  },
  en: {
    title: 'Secure Document Center',
    subtitle: 'CVs, diplomas and other documents will appear here after the admin panel and secure access backend are connected.',
    back: 'Back to portfolio',
    cv: 'Curriculum Vitae (CV)',
    diploma: 'Diplomas',
    certificate: 'Certificates',
    pending: 'No document added yet',
    security: 'This is a static preview. Real access validation plus IP/country, document-view and download events will be recorded server-side after the Supabase integration.',
  },
  de: {
    title: 'Sicheres Dokumentenzentrum',
    subtitle: 'Lebenslauf, Diplome und weitere Dokumente werden hier nach Anbindung des Admin-Panels und der sicheren Zugriffslogik veröffentlicht.',
    back: 'Zurück zum Portfolio',
    cv: 'Lebenslauf (CV)',
    diploma: 'Diplome',
    certificate: 'Zertifikate',
    pending: 'Noch kein Dokument hinterlegt',
    security: 'Dies ist eine statische Vorschau. Echte Zugriffsprüfung sowie IP/Land-, Ansichts- und Download-Ereignisse werden nach der Supabase-Integration serverseitig protokolliert.',
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
        <div className="language-switcher documents-languages" aria-label="Language selector">
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

      <p className="documents-security-note">{t.security}</p>
    </main>
  );
}
