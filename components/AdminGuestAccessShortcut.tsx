'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';

type Language = 'tr' | 'de' | 'en';

const labels: Record<Language, string> = {
  tr: 'Paylaşım Linkleri',
  de: 'Freigabelinks',
  en: 'Share Links',
};

const hashTargets: Record<string, string> = {
  dashboard: 'Genel Bakış',
  documents: 'Belgeler',
  activity: 'Erişim Kayıtları',
  settings: 'Güvenlik',
};

function hideLegacyAccess(nav: HTMLElement) {
  for (const button of Array.from(nav.querySelectorAll<HTMLButtonElement>('button'))) {
    if (button.textContent?.trim() === 'Erişim Yönetimi') {
      button.hidden = true;
      button.setAttribute('aria-hidden', 'true');
      button.tabIndex = -1;
    }
  }
}

export default function AdminGuestAccessShortcut() {
  const pathname = usePathname();
  const [nav, setNav] = useState<HTMLElement | null>(null);
  const [language, setLanguage] = useState<Language>('tr');
  const onGuestPage = pathname?.startsWith('/admin/documents/guest-access');

  useEffect(() => {
    const saved = window.sessionStorage.getItem('ym-language') as Language | null;
    if (saved === 'tr' || saved === 'de' || saved === 'en') setLanguage(saved);

    const locateNav = () => {
      const nextNav = document.querySelector<HTMLElement>('.admin-nav');
      if (nextNav) hideLegacyAccess(nextNav);
      setNav(nextNav);
    };

    locateNav();
    const observer = new MutationObserver(locateNav);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (onGuestPage || !nav || !window.location.hash) return;
    const hash = window.location.hash.slice(1);
    if (hash === 'access') {
      window.location.replace('/admin/documents/guest-access/');
      return;
    }
    const target = hashTargets[hash];
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
