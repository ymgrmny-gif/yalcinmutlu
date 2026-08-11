'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminGuestAccessShortcut() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const onGuestPage = pathname?.startsWith('/admin/documents/guest-access');

  useEffect(() => {
    let active = true;
    fetch('/api/admin-documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      cache: 'no-store',
      body: JSON.stringify({ action: 'session' }),
    }).then((response) => {
      if (active) setVisible(response.ok);
    }).catch(() => {
      if (active) setVisible(false);
    });
    return () => { active = false; };
  }, [pathname]);

  if (!visible) return null;

  return (
    <Link
      href={onGuestPage ? '/admin/documents/' : '/admin/documents/guest-access/'}
      aria-label={onGuestPage ? 'Zur Dokumentverwaltung' : 'Gastzugänge verwalten'}
      style={{
        position: 'fixed',
        right: '1rem',
        bottom: '1rem',
        zIndex: 80,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '.45rem',
        padding: '.7rem .9rem',
        borderRadius: '999px',
        background: '#173f5f',
        color: '#fff',
        textDecoration: 'none',
        fontSize: '.78rem',
        fontWeight: 800,
        boxShadow: '0 12px 30px rgba(15,23,42,.22)',
      }}
    >
      {onGuestPage ? '← Belge yönetimi' : '🔗 Gastzugänge'}
    </Link>
  );
}
