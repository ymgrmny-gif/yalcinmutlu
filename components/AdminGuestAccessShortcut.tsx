'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';

type Language = 'tr' | 'de' | 'en';

const labels: Record<Language, string> = {
  tr: 'Misafir Erişimi & Paylaşım Linkleri',
  de: 'Gastzugänge & Freigabelinks',
  en: 'Guest Access & Share Links',
};

const hashTargets: Record<string, string> = {
  dashboard: 'Genel Bakış',
  documents: 'Belgeler',
  access: 'Erişim Yönetimi',
  activity: 'Erişim Kayıtları',
  settings: 'Güvenlik',
};

export default function AdminGuestAccessShortcut() {
  const pathname = usePathname();
  const [nav, setNav] = useState<HTMLElement | null>(null);
  const [language, setLanguage] = useState<Language>('tr');
  const onGuestPage = pathname?.startsWith('/admin/documents/guest-access');

  useEffect(() => {
    const saved = window.sessionStorage.getItem('ym-language') as Language | null;
    if (saved === 'tr' || saved === 'de' || saved === 'en') setLanguage(saved);

    const locateNav = () => setNav(document.querySelector<HTMLElement>('.admin-nav'));
    locateNav();
    const observer = new MutationObserver(locateNav);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (onGuestPage || !nav || !window.location.hash) return;
    const target = hashTargets[window.location.hash.slice(1)];
    if (!target) return;
    const button = Array.from(nav.querySelectorAll<HTMLButtonElement>('button')).find((item) => item.textContent?.trim() === target);
    if (button) {
      button.click();
      window.history.replaceState(null, '', '/admin/documents/');
    }
  }, [nav, onGuestPage]);

  if (onGuestPage || !nav) return null;

  return createPortal(
    <button
      type="button"
      aria-label={labels[language]}
      onClick={() => window.location.assign('/admin/documents/guest-access/')}
    >
      <FontAwesomeIcon icon={faLink}/>
      {labels[language]}
    </button>,
    nav,
  );
}
