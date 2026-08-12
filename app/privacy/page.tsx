'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Language = 'tr' | 'de' | 'en';

const copy = {
  tr: {
    title: 'Gizlilik Bilgilendirmesi',
    intro: 'Bu kişisel portföy yalnızca iletişim kurmak ve başvuru belgelerini güvenli biçimde paylaşmak için gerekli verileri işler.',
    contactTitle: 'İletişim formu',
    contact: 'İletişim formunda ad, e-posta adresi, konu ve mesaj içeriği gönderilir. Bu bilgiler talebinizi yanıtlamak amacıyla saklanır ve e-posta bildirimi için kullanılan hizmet sağlayıcılara teknik olarak aktarılabilir.',
    docsTitle: 'Paylaşım bağlantıları',
    docs: 'Özel belgeler herkese açık değildir. Paylaşım bağlantıları yalnızca seçilen belgelere erişim verir, süreli veya süresiz olabilir ve yönetici tarafından her zaman iptal edilebilir.',
    securityTitle: 'Güvenlik',
    security: 'Belge dosyaları özel depoda tutulur. Görüntüleme ve indirme için kısa süreli imzalı bağlantılar kullanılır. Güvenlik amacıyla sınırlı teknik erişim kayıtları tutulabilir.',
    rightsTitle: 'İletişim',
    rights: 'Kişisel verilerinizle ilgili silme veya bilgi talebi için sitenin iletişim formunu kullanabilirsiniz.',
    back: 'Portföye dön',
  },
  de: {
    title: 'Datenschutzhinweis',
    intro: 'Dieses persönliche Portfolio verarbeitet nur Daten, die für die Kontaktaufnahme und die sichere Freigabe von Bewerbungsunterlagen erforderlich sind.',
    contactTitle: 'Kontaktformular',
    contact: 'Über das Kontaktformular werden Name, E-Mail-Adresse, Betreff und Nachricht übermittelt. Diese Daten werden zur Bearbeitung der Anfrage gespeichert und können technisch an Dienstleister für E-Mail-Benachrichtigungen übermittelt werden.',
    docsTitle: 'Freigabelinks',
    docs: 'Private Dokumente sind nicht öffentlich zugänglich. Freigabelinks erlauben nur den Zugriff auf ausdrücklich ausgewählte Dokumente, können zeitlich begrenzt werden und jederzeit administrativ deaktiviert werden.',
    securityTitle: 'Sicherheit',
    security: 'Dokumentdateien liegen in einem privaten Speicher. Für Ansicht und Download werden kurzlebige signierte URLs verwendet. Für Sicherheitszwecke können begrenzte technische Zugriffsprotokolle gespeichert werden.',
    rightsTitle: 'Kontakt',
    rights: 'Für Auskunfts- oder Löschanfragen zu personenbezogenen Daten kann das Kontaktformular der Website verwendet werden.',
    back: 'Zurück zum Portfolio',
  },
  en: {
    title: 'Privacy Notice',
    intro: 'This personal portfolio processes only the data needed for contact and for securely sharing application documents.',
    contactTitle: 'Contact form',
    contact: 'The contact form transmits your name, email address, subject and message. This information is stored to handle your request and may be technically transferred to service providers used for email notifications.',
    docsTitle: 'Share links',
    docs: 'Private documents are not public. Share links grant access only to explicitly selected documents, may be time-limited and can be revoked by the administrator at any time.',
    securityTitle: 'Security',
    security: 'Document files are kept in private storage. Short-lived signed URLs are used for viewing and downloading. Limited technical access logs may be retained for security purposes.',
    rightsTitle: 'Contact',
    rights: 'For information or deletion requests concerning personal data, you can use the website contact form.',
    back: 'Back to portfolio',
  },
} as const;

export default function PrivacyPage() {
  const [language, setLanguage] = useState<Language>('de');

  useEffect(() => {
    const saved = window.sessionStorage.getItem('ym-language');
    if (saved === 'tr' || saved === 'de' || saved === 'en') setLanguage(saved);
  }, []);

  const t = copy[language];

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', padding: '48px 20px' }}>
      <article style={{ maxWidth: 760, margin: '0 auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '32px', boxShadow: '0 18px 45px rgba(15,23,42,.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          <Link href="/" style={{ color: '#1d4ed8', textDecoration: 'none', fontWeight: 600 }}>{t.back}</Link>
          <div style={{ display: 'flex', gap: 8 }} aria-label="Language">
            {(['de', 'en', 'tr'] as Language[]).map((item) => (
              <button key={item} type="button" onClick={() => { setLanguage(item); window.sessionStorage.setItem('ym-language', item); }} style={{ border: '1px solid #cbd5e1', borderRadius: 999, padding: '6px 10px', background: language === item ? '#0f172a' : '#fff', color: language === item ? '#fff' : '#0f172a', cursor: 'pointer' }}>
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <h1 style={{ fontSize: '2rem', margin: '0 0 14px' }}>{t.title}</h1>
        <p style={{ lineHeight: 1.7, color: '#475569' }}>{t.intro}</p>
        {[
          [t.contactTitle, t.contact],
          [t.docsTitle, t.docs],
          [t.securityTitle, t.security],
          [t.rightsTitle, t.rights],
        ].map(([title, body]) => (
          <section key={title} style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: '1.15rem', marginBottom: 8 }}>{title}</h2>
            <p style={{ lineHeight: 1.7, color: '#475569', margin: 0 }}>{body}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
