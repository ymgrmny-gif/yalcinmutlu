'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';

export default function AdminGuestAccessShortcut() {
  const pathname = usePathname();
  const [nav, setNav] = useState<HTMLElement | null>(null);
  const onGuestPage = pathname?.startsWith('/admin/documents/guest-access');

  useEffect(() => {
    const locateNav = () => setNav(document.querySelector<HTMLElement>('.admin-nav'));
    locateNav();

    const observer = new MutationObserver(locateNav);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  if (onGuestPage || !nav) return null;

  return createPortal(
    <button
      type="button"
      aria-label="Gastzugänge und Freigabelinks verwalten"
      onClick={() => window.location.assign('/admin/documents/guest-access/')}
    >
      <FontAwesomeIcon icon={faLink}/>
      Gastzugänge &amp; Freigabelinks
    </button>,
    nav,
  );
}
